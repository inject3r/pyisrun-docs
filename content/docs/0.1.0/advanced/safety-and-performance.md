---
title: "Safety & Performance"
description: "Raw-memory safety boundaries, capability checks, and where the native work happens."
order: 2
---

# Safety & Performance

## Safety conventions

PylsRun does not attach a source-level `[SAFE]` or `[EXPERIMENTAL]` marker to
every API. Treat raw-pointer operations as unsafe by default: there is no
implicit ownership or lifetime check, and an invalid native access can crash
the process just as it can in C.

The useful safety mechanisms are concrete rather than labels: `DebugAllocator`
adds canaries, poisoning and leak tracking; `PoolAllocator` detects foreign,
misaligned and double frees; `MemBlock` provides bounds-aware Python-side
buffer operations; and guard pages deliberately turn certain out-of-bounds
accesses into a protection fault.

## Capability checks instead of crashes

Every CPUID-gated function in `pylsrun.cpu`/`pylsrun.simd` checks the real
CPU feature flag before issuing the instruction, and raises
`pylsrun.errors.PylsUnsupportedError` on a CPU that lacks it — never
`SIGILL`. Architecture-gated functions (see
[Platform Support](/docs/0.1.0/advanced/platform-support)) do the same for
"this isn't implemented on this architecture at all."

```python
from pylsrun import platform_info

platform_info.has_feature("avx512f")          # bool
platform_info.require_feature("avx2")           # raises PylsUnsupportedError if absent
```

## Validation where it's cheap and meaningful

- `pylsrun.memory.is_aligned(ptr, n)` — alignment check
- `pylsrun.memory.is_valid_range(addr, length, need_write=False)` —
  best-effort check against `/proc/self/maps` (a diagnostic aid, not a
  safety guarantee — the mapping can change after the check)
- `PoolAllocator`'s used-bitmap rejects foreign/misaligned pointers on
  `free()`
- `DebugAllocator`'s guard canaries catch buffer overflow/underflow, and
  poison freed memory before releasing it
- Guard pages (`vmem.alloc_with_guard_pages`) catch an overflow
  immediately, via a real page fault, with no polling required

## Performance notes

- **A native C++ backend**, compiled with `-O3 -DNDEBUG` by default
  (`PYLSRUN_DEBUG=1` switches to `-O0 -g` with ASan/UBSan for debugging
  instead — see [Packaging & Builds](/docs/0.1.0/advanced/packaging-and-builds)).
- **Minimal Python/C++ boundary crossings** — SIMD, `memcpy`/`memset`,
  and struct field access all operate on whole buffers/structs per call,
  not per element.
- **Zero-copy by construction** in several places: `MemBlock`'s buffer
  protocol, `addressof()`, and struct field access (reads/writes go
  straight to the bound address, no staging copy).
- **GIL released** for every blocking concurrency primitive wait/acquire,
  so a long-blocking native call doesn't stall the rest of the
  interpreter — see
  [Concurrency & Atomics](/docs/0.1.0/core-concepts/concurrency-and-atomics).
- **SIMD dispatch performs CPU-feature detection at call time**; there is no
  global CPUID-result cache in the current implementation. `pylsrun.simd.best_tier()`
  tells you the generic x86-64 tier selected by that detection.
- `pylsrun.cpu.benchmark(fn, iterations)` gives you an RDTSC-based (or
  `CNTVCT_EL0`-based, on AArch64) cycle-count timer for microbenchmarks
  without pulling in a separate profiling library.
