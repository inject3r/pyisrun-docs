---
title: "Getting Started"
description: "What PylsRun is, what it isn't, and where to go first."
order: 1
---

# Getting Started

PylsRun gives Python real access to the primitives systems programmers
actually reach for: raw pointers with real arithmetic, manual allocation,
struct layouts verified by an actual compiler, SIMD with runtime CPU
dispatch, runtime assembly assembled to machine code and loaded into executable memory, native ABI calls
in both directions, atomics over raw memory, and real C++ concurrency
primitives — exposed through a thin Python package over the native C++
extension.

## What this is not

It is not a padded, "safe-by-default" imitation of low-level access. Most
of the API is **[UNSAFE]** by design: dereferencing a bad address crashes
the process exactly like it would in C. If you want guardrails, PylsRun
gives you real ones too — `DebugAllocator`'s guard canaries, guard pages
that trap an overflow at the instruction that caused it, capability
checks that turn an unsupported CPU instruction into a clean Python
exception instead of `SIGILL` — but nothing stops you from writing to an
address you don't own if that's what you ask for.

## Key ideas

- **Every primitive is real.** A `Pointer` is a real address. A struct's
  field offset comes from actually compiling that struct with your C++
  compiler. SIMD dispatch checks the real CPU at the real call time.
- **Compile-time claims are backed by compilation.** Where PylsRun says a
  layout or a constant is "compiler-verified," that's not a figure of
  speech — see [Compile-Time C++](/docs/0.1.0/core-concepts/compile-time-cpp).
- **Portable core, honest about the rest.** The core atomics/locking primitives
  use standard C++ facilities, and the struct engine delegates layout to the
  host C++ compiler. Thread-local storage and OS-facing pieces still use
  platform glue; x86-specific SIMD/ABI/JIT paths are guarded and non-x86
  paths either fall back where implemented or report unsupported.
  See [Platform Support](/docs/0.1.0/advanced/platform-support).

## Requirements

- Python ≥ 3.10
- A C++20 compiler (GCC ≥ 11 or Clang ≥ 14) to build the extension
- `libffi` development headers
- `binutils` (`as`, `objcopy`) — only needed for `pylsrun.jit.assemble()`

## Next steps

- **[Installation](/docs/0.1.0/getting-started/installation)** — build
  from source, or use a prebuilt wheel.
- **[Quick Start](/docs/0.1.0/getting-started/quick-start)** — pointers, a
  struct, and JIT-compiled assembly in under twenty lines.
- **[Package Layout](/docs/0.1.0/getting-started/package-layout)** — how
  the `pylsrun` package is organized, so you know where to look.
