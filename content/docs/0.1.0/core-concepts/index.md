---
title: "Core Concepts"
description: "The eight subsystems PylsRun is built from, and how they fit together."
order: 0
---

# Core Concepts

PylsRun is built from a small number of genuinely independent subsystems.
Each one is documented on its own page below, but they share a design
philosophy worth stating up front: **every primitive is real**. A
`Pointer` is a real address with real arithmetic. A struct's field offset
comes from actually compiling that struct. SIMD dispatch checks the real
CPU at the real call time. None of it is simulated for the sake of a nice
API.

## The eight subsystems

- **[Memory & Pointers](/docs/0.1.0/core-concepts/memory-and-pointers)** —
  `malloc`/`free`, real pointer arithmetic, native typecodes, and three
  allocator strategies (arena, pool, debug).
- **[Structs & Binary Data](/docs/0.1.0/core-concepts/structs-and-binary)**
  — struct/union layouts verified by actually compiling them, plus binary
  reading/writing and checksums.
- **[SIMD & CPU Intrinsics](/docs/0.1.0/core-concepts/simd-and-intrinsics)**
  — on x86-64, SSE2 up to AVX-512 is chosen at runtime by CPUID; non-x86
  builds use scalar fallbacks for the general SIMD operations, with
  architecture-specific intrinsics reporting unsupported.
- **[Assembly, JIT & ABI](/docs/0.1.0/core-concepts/assembly-and-abi)** —
  real x86-64 assembly executed at runtime, and every way to cross the
  native call boundary in both directions.
- **[Concurrency & Atomics](/docs/0.1.0/core-concepts/concurrency-and-atomics)**
  — `std::atomic_ref` on raw memory, real C++ synchronization primitives,
  thread-local storage, native threads.
- **[Virtual Memory](/docs/0.1.0/core-concepts/virtual-memory)** — mmap,
  page protection, and guard pages that trap an overflow at the exact
  instruction that caused it.
- **[The Buffer System](/docs/0.1.0/core-concepts/buffers)** — zero-copy
  `MemBlock`, the Python buffer protocol, memoryview/NumPy interop.
- **[Compile-Time C++](/docs/0.1.0/core-concepts/compile-time-cpp)** — both
  halves of PylsRun's compile-time story: values baked in at the
  extension's own build time, and a dynamic oracle that compiles your C++
  on demand.

## How they compose

The struct system is the clearest example of how these pieces fit
together: `pylsrun.structs.define_struct()` generates a real C++
definition, hands it to the compile-time oracle (`pylsrun.ctime`) to get
an authoritative layout, and then reads and writes that struct's fields
directly through the same raw-pointer machinery described in
[Memory & Pointers](/docs/0.1.0/core-concepts/memory-and-pointers). Three
subsystems, one coherent feature.

## Safety boundaries

Raw addresses and pointers are intentionally low-level: PylsRun does not add
an ownership or lifetime system around them. Feature-gated CPU instructions
are checked before dispatch, while portable compiler builtins do not require
CPUID checks. Use `DebugAllocator`, guard pages, and the buffer-protocol APIs
when you need the concrete safety checks those facilities provide.

See [Platform Support](/docs/0.1.0/advanced/platform-support) for exactly
what is tested where.
