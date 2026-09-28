---
title: "Debugging"
description: "DebugAllocator, ASan/UBSan builds, and how the test suite isolates crash-prone tests."
order: 0
---

# Debugging

PylsRun's raw-pointer APIs can produce the exact bugs C programmers know
well: buffer overflows, double-frees, use-after-free. This page covers
the tools built for finding them.

## `DebugAllocator`

```python
from pylsrun import memory

dbg = memory.DebugAllocator()
p = dbg.alloc(16)
dbg.free(p)              # validates guard canaries, poisons, then frees
dbg.check_leaks()         # -> list of (address, size, allocation_serial)
print(memory.format_debug_report(dbg))
```

Every allocation is wrapped in front/back guard canaries; `free()` raises
`pylsrun.errors.PylsAllocationError` if either canary was overwritten
(buffer overflow/underflow) or if the pointer wasn't one this allocator
handed out (double-free or foreign pointer). Freed memory is poisoned (filled with a fixed byte pattern) before the
underlying `free`. A use-after-free is still invalid/undefined; the poison is
a debugging aid that makes stale data less likely to look valid before release.

## Guard pages

```python
from pylsrun import vmem

usable, base, total = vmem.alloc_with_guard_pages(64)
# writing past `usable`'s end traps immediately — a real page fault,
# not a polled check
vmem.vmem_free(base, total)
```

See [Virtual Memory](/docs/0.1.0/core-concepts/virtual-memory).

## AddressSanitizer / UndefinedBehaviorSanitizer builds

For bugs `DebugAllocator` doesn't catch (or to double-check one it does),
build the extension itself with ASan/UBSan instead of the optimized
release build:

```bash
PYLSRUN_DEBUG=1 pip install . --no-build-isolation
```

This is the right tool when you suspect the bug might be inside PylsRun's
own native code, not just in how your Python code is using it. See
[Packaging & Builds](/docs/0.1.0/advanced/packaging-and-builds).

## How the test suite handles tests that are *supposed* to crash

A few tests exist specifically to prove a safety mechanism behaves as
documented — writing to a read-only `mprotect`'d page, or past the end of
a guard-paged region, really does raise `SIGSEGV`. Those run in an
isolated subprocess and assert on the resulting exit code, so a genuine
crash in one test can't take down the rest of the suite:

```python
import subprocess, sys

def _run_in_subprocess(code: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, "-c", code], capture_output=True, text=True)

class TestCrashIsolation:
    def test_write_to_readonly_page_segfaults(self):
        code = (
            "import pylsrun as pr\n"
            "r = pr.vmem.vmem_alloc(4096, prot='rw')\n"
            "pr.vmem.vmem_protect(r, 4096, 'r')\n"
            "r.write_i32(1, offset=0)\n"
        )
        result = _run_in_subprocess(code)
        assert result.returncode != 0
```

## Capability errors, not crashes

Anywhere PylsRun can check a CPU feature or an architecture before
issuing an instruction, it does — an unsupported feature raises
`pylsrun.errors.PylsUnsupportedError` with a message naming exactly what
was missing, rather than the process dying with no explanation. If you
hit a bare `SIGILL`/`SIGSEGV` instead of that exception, that's the
signal you've found a real gap in the capability checks — worth reporting.
