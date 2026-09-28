---
title: "Why PylsRun"
description: "When PylsRun is the right tool, and when it plainly isn't."
order: 2
---

# Why PylsRun

## Reach for it when

- You want **real pointer arithmetic and manual allocation** from Python,
  not a wrapped approximation of it.
- You need a **struct layout you can trust** — bitfields included — and
  you'd rather have your actual compiler compute it than hand-maintain an
  offset table that can drift.
- You want **SIMD that adapts to the CPU it's actually running on**,
  without shipping separate builds per instruction set.
- You want to **assemble real machine code and run it**, for a JIT, an
  emulator, or just to see exactly what an instruction sequence does.
- You want **atomics and real concurrency primitives** operating directly
  on memory you already have, not a separate boxed "atomic object" type.
- You want a **native call path with both directions covered** — calling
  into a C library, and having that C library call back into your Python
  code, correctly, with the GIL handled for you.

## Reach for something else when

- You need to call **one function in an existing shared library** and
  nothing else — `ctypes` does that with zero dependencies and no
  compiler step.
- You need **broad, mature C-header parsing** for a large existing C API
  — `cffi`'s API mode is a better fit than hand-declaring structs.
- You're writing **substantial new numeric logic** that should compile to
  fast native code — that's Cython's actual specialty, not PylsRun's.
- You need a **verified native build on Windows, macOS, or ARM today** —
  PylsRun has portable OS/backend paths for those targets, but only Linux
  x86-64 is actually built and tested in this repository. See
  [Platform Support](/docs/0.1.0/advanced/platform-support).
- You need **bounds-checked memory access by default** — PylsRun's
  default is C's default: unchecked. The safety tools
  (`DebugAllocator`, guard pages) are opt-in, not automatic.

## The honest pitch

PylsRun exists for the moments when you already know exactly what
address, what layout, or what instruction sequence you need, and the
friction is that Python doesn't normally let you say so directly. It
gives you that directness back, in one coherent package, built on real
C++ — with the tradeoffs of real C++ included.
