---
title: "Package Layout"
description: "How the pylsrun package is organized, and where the native extension lives."
order: 4
---

# Package Layout

PylsRun is two layers: a native C++ extension (`pylsrun._native`), and a
pure-Python package on top of it that gives each subsystem a small,
documented, importable surface.

```text
pylsrun/
├── __init__.py       # top-level re-exports: Pointer, malloc, free, errors, ...
├── memory.py          # pointers, malloc family, allocators, ownership wrappers
├── structs.py          # define_struct / define_union, the layout engine
├── buffers.py            # MemBlock, BinaryReader/Writer, varints, CRC
├── simd.py                # SIMD wrappers (raw buffer API + list convenience)
├── cpu.py                   # CPU identification, registers, intrinsics
├── jit.py                     # assemble(), Executable
├── abi.py                      # call_sysv6, call_native, Library, make_callback
├── atomics.py                   # atomic_* functions over raw addresses
├── concurrency.py                 # Mutex, Semaphore, ThreadLocal, NativeThread, ...
├── vmem.py                         # vmem_alloc/protect/free, guard pages
├── ctime.py                         # the compile-time oracle (dynamic half)
├── platform_info.py                   # platform_summary(), feature checks
├── errors.py                            # the PylsRunError hierarchy
└── _native.*.so                           # the compiled C++ extension
```

Import the whole package (`import pylsrun as pr`) or just the submodule
you need (`from pylsrun import simd`) — each one is meant to work as a
standalone, smaller surface.

## Where the native source lives

The C++ source that builds `pylsrun._native` lives in `csrc/` in the
repository — one or two files per subsystem (`pointer_type.cpp`,
`allocators.cpp`, `simd_ops.cpp`, `jit_exec.cpp`, `abi_call.cpp`,
`atomics_ops.cpp`, `concurrency.cpp`, `ctime_native.cpp`, and so on), plus
`platform_compat.{hpp,cpp}`, which is the one file every OS-specific
primitive (dynamic library loading, virtual memory, aligned allocation)
goes through — see
[Platform Support](/docs/0.1.0/advanced/platform-support).

## Tests and examples

- `tests/test_pylsrun.py` — the full test suite, organized by subsystem,
  with a dedicated class for crash-prone tests that run in an isolated
  subprocess (see [Debugging](/docs/0.1.0/debugging/index)).
- `examples/` — seven runnable walkthrough scripts covering the library's
  major subsystems; they are the concrete examples used throughout the docs.
