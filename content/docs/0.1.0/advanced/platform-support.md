---
title: "Platform Support"
description: "What's built and tested versus written-but-unverified, feature by feature."
order: 1
---

# Platform Support

PylsRun is architected as a **portable core with clearly-scoped native
extras**: every OS-specific primitive (dynamic library loading, virtual
memory, aligned allocation) goes through `csrc/platform_compat.{hpp,cpp}`
with POSIX and Win32 code paths, and x86-specific primitives (SIMD, CPUID,
selected intrinsics, the hand-written SysV call, and register snapshots)
use architecture guards. Those guards are intended to keep unsupported
paths from being compiled or executed on other architectures, while
individual features either fall back to portable code where implemented or
raise `pylsrun.errors.PylsUnsupportedError`.

**What was actually built and tested: Linux, x86-64, GCC 13.** That's the
only environment this library has been compiled and run in so far.
Everything else below is written against documented APIs/ABIs and
structured to compile conditionally, but has not been compiled or run
anywhere else yet.

## Support matrix

| Feature area | Linux x86-64 | macOS (Intel/AS) | Windows x86-64 | Linux/other AArch64 |
|---|---|---|---|---|
| Memory, pointers, allocators, MemBlock | **Tested** | Untested, POSIX path present | Untested, Win32 path present | Untested, POSIX path present |
| Structs/unions (compiler oracle) | **Tested** | Untested, needs any C++20 compiler | Untested, needs any C++20 compiler | Untested, needs any C++20 compiler |
| SIMD | **Tested**, AVX-512/AVX2/SSE2 dispatch | Untested: x86 path on Intel; scalar path exists on non-x86 | Untested | **Scalar implementation exists**, untested |
| CPU info/intrinsics | **Tested** | Untested (x86) / bit-ops portable | Untested (x86) | bit-ops portable; CPUID-based info unsupported |
| Register snapshot / `call_sysv6` | **Tested** (SysV AMD64) | Untested (x86) | Untested (x86) | **Untested, written for AAPCS64** |
| JIT (`pylsrun.jit`) | **Tested** (GNU `as`/`objcopy`, x86-64 source) | Untested; assembler path is written for x86-64 source | Untested; no MSVC/MASM assembler path | `Executable` raw-code path is host-native; `assemble()` is x86-64-specific and unverified |
| ABI (`call_native`, `Library`, callbacks) | **Tested** (libffi) | Untested; libffi supports this target | Untested; libffi supports an MS-ABI CIF | Untested; libffi supports this target |
| Atomics, Concurrency | **Tested** (implemented with standard C++ primitives) | Untested | Untested | Untested |
| Virtual memory | **Tested** (`mmap`/`mprotect`) | Untested, POSIX path present | Untested, Win32 (`VirtualAlloc`) path present | Untested, POSIX path present |
| `memory_regions()` | **Tested** (`/proc/self/maps`) | **Unsupported** (needs mach `vm_region`) | **Unsupported** (needs `VirtualQuery`) | Same Linux-only code, not arch-gated |

"Untested" means: written against documented APIs/ABIs, guarded so it
compiles conditionally, but not actually compiled or run in this
project's own environment. Treat those code paths as a real starting
point, not a verified port.

## What is implemented without an OS-specific dependency

These areas avoid direct OS-specific calls in their core implementation,
but their non-Linux targets are still unverified in this repository:

- **Atomics** — implemented with `std::atomic_ref` over raw memory.
- **Concurrency** — implemented with `std::mutex`, `std::shared_mutex`,
  `std::condition_variable_any`, `std::counting_semaphore`, and `std::barrier`.
- **Struct/union layout** — derived by compiling the requested C++ layout with
  the selected host compiler. The implementation is compiler-derived, but
  non-Linux targets remain unverified in this repository.
- **`call_native`/`Library`/`make_callback`** — implemented through libffi;
  the PylsRun source provides the integration, but those non-Linux builds are
  still unverified here.

## Packaging

Only a Linux x86-64 wheel is built by the tooling in this repository —
there is no CI matrix here producing Windows/macOS/ARM wheels. The source
contains POSIX, Win32, and AArch64-specific paths, but those targets have
not been compiled and run in this project, so they remain unverified.
