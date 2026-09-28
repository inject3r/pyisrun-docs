---
title: "PylsRun Documentation"
description: "Systems programming for Python, implemented entirely in C++: pointers, structs, SIMD, JIT, native ABI calls, atomics, and concurrency."
order: 0
---

# PylsRun Documentation

PylsRun gives Python real access to the primitives systems programmers
reach for — implemented entirely in C++ underneath, not approximated in
pure Python.

## What is PylsRun?

PylsRun is a systems-programming library covering:

- **Raw pointers & manual allocation** — real arithmetic, `malloc`/`free`,
  three allocator strategies, guard pages
- **Compiler-verified structs & unions** — field offsets come from
  actually compiling your struct, bitfields included
- **SIMD with runtime CPU dispatch** — on x86-64, AVX-512 down to SSE2 is
  chosen by CPUID at call time; general SIMD operations have scalar fallbacks
  on non-x86 builds
- **Runtime assembly & JIT** — assemble x86-64 source, map it RW →
  RX, call straight into it
- **Native ABI calls, both directions** — hand-written SysV calls,
  libffi for the general case, and callbacks that run Python from native
  code
- **Atomics & concurrency** — `std::atomic_ref` on raw memory, real
  mutexes/semaphores/threads, every wait releases the GIL
- **Virtual memory control** — mmap, page protection, guard pages that
  trap an overflow at the instruction that caused it
- **Compile-time C++** — constants baked in at the extension's own build
  time, plus a dynamic oracle that compiles arbitrary C++ on demand

## Quick links

- **[Getting Started](/docs/0.1.0/getting-started/index)** — what PylsRun
  is, requirements, and where to go first
- **[Installation](/docs/0.1.0/getting-started/installation)** — build
  from source or install a debug build
- **[Quick Start](/docs/0.1.0/getting-started/quick-start)** — pointers, a
  struct, and JIT-compiled assembly in under twenty lines
- **[Core Concepts](/docs/0.1.0/core-concepts/index)** — all eight
  subsystems, one page each
- **[API Reference](/docs/0.1.0/api-reference/index)** — every public
  function and class, collected from the real package

## At a glance

| Area | What you get |
|---|---|
| Memory | `malloc`/`calloc`/`realloc`/`free`/`aligned_alloc`, `StackArena`, `PoolAllocator`, `DebugAllocator` |
| Pointers | Real arithmetic, typed read/write, `bool`/`char`/`wchar`/`f80` included |
| Structs | `define_struct`/`define_union`, custom pack values, `alignas(N)`, bitfields to the exact bit |
| SIMD | SSE2/AVX2/AVX-512 arithmetic, reductions, shuffle, compare — runtime-dispatched |
| Assembly | `pylsrun.jit.assemble()` + `Executable`, backed by the real GNU assembler |
| ABI | `call_sysv6`, `call_native` (incl. struct-by-value + variadic), `Library`, `make_callback` |
| Atomics | load/store/exchange/CAS/fetch-op, all five memory orders |
| Concurrency | `Mutex`, `RWLock`, `Semaphore`, `Barrier`, `ThreadLocal`, `NativeThread` |
| Virtual memory | `vmem_alloc`/`protect`/`free`, guard pages, `/proc/self/maps` |
| Compile-time | Baked-in `consteval` constants + a dynamic C++ compilation oracle |

## Version

Version: **v0.1.0** · Built and tested on Linux x86-64 — see
[Platform Support](/docs/0.1.0/advanced/platform-support) for the full
matrix.
