---
title: "Virtual Memory"
description: "Anonymous mappings, page protection, guard pages, and /proc/self/maps introspection."
order: 6
---

# Virtual Memory

Module: `pylsrun.vmem`. The allocation/protection APIs use the portable POSIX/Win32
backend; `memory_regions()` is Linux-only because it parses `/proc/self/maps`.

```python
from pylsrun import vmem

region = vmem.vmem_alloc(4096, prot="rw")   # anonymous mmap
vmem.vmem_protect(region, 4096, "r")          # mprotect -- now read-only
vmem.vmem_free(region, 4096)                   # munmap
```

`prot` strings are made of the letters `r`/`w`/`x` in any combination
(`"rw"`, `"rx"`, `"r"`, ...), or `"none"` for `PROT_NONE`.

## Guard pages

```python
usable, free_base, free_total = vmem.alloc_with_guard_pages(100)
usable.write_bytes(b"...")          # fine, within the usable region
# usable.write_i8(1, offset=5000)   # would SIGSEGV immediately -- that IS the point
vmem.vmem_free(free_base, free_total)
```

Layout: `[PROT_NONE guard page][usable region, page-rounded][PROT_NONE guard page]`.
Touching either guard page traps at the exact instant of the invalid
access — catching a buffer overflow/underflow immediately rather than
letting it silently corrupt a neighboring allocation. This is intentional,
documented, and covered by a subprocess-isolated crash test in
`tests/test_pylsrun.py` (`TestCrashIsolation`).

## Region introspection

```python
regions = vmem.memory_regions()
# list[dict]: start/end/perms/path; parses /proc/self/maps
mapped = vmem.is_mapped(address)              # -> bool
perms = vmem.permissions_at(address)           # -> str | None
```

## Page size

```python
vmem.page_size()   # sysconf(_SC_PAGESIZE)
```

## Instruction-cache synchronization

```python
vmem.flush_icache(address=None, length=None)
```

A documented, deliberate no-op on x86-64 (the instruction cache is kept
coherent with the data cache by hardware after an ordinary write +
`mprotect`) — present for API symmetry with architectures like ARM where an
explicit flush instruction sequence would be required after writing
executable code. See `pylsrun.jit` for where this matters.
