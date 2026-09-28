---
title: "PylsRun vs ctypes, cffi & Cython"
description: "A feature-by-feature comparison. No fabricated benchmark numbers."
order: 1
---

# PylsRun vs ctypes, cffi & Cython

This page intentionally has no throughput/latency numbers. Benchmarks
depend enormously on what you're measuring and how, and a made-up "2.3x
faster" figure would be worse than no number at all. What follows is a
qualitative, feature-by-feature comparison instead — check the ✓/Partial/✗
against what you actually need.

## Capabilities

| Feature | PylsRun | ctypes | cffi | Cython |
|---|---|---|---|---|
| Real pointer arithmetic | ✓ | Partial | Partial | ✓ |
| Compiler-verified struct layout | ✓ | ✗ (hand-declared, can drift) | ✓ (via real headers in API mode) | ✓ |
| Built-in SIMD with runtime CPU dispatch | ✓ | ✗ | ✗ | Partial (manual work) |
| Built-in runtime assembly/JIT facility | ✓ | ✗ | ✗ | ✗ |
| Built-in atomics over raw memory | ✓ | ✗ | ✗ | ✗ |
| Built-in native concurrency primitives | ✓ | ✗ | ✗ | ✗ |
| Struct-by-value in native calls | ✓ | Partial | ✓ | ✓ |
| Native-to-Python callbacks | ✓ | ✓ | ✓ | ✓ |

## Safety & ergonomics

| Aspect | PylsRun | ctypes | cffi | Cython |
|---|---|---|---|---|
| Built-in debug allocator (canaries + poisoning) | ✓ | ✗ | ✗ | ✗ |
| Built-in guard-page allocator | ✓ | ✗ | ✗ | ✗ |
| Built-in CPU capability checks before gated instructions | ✓ | ✗ | ✗ | ✗ |
| PylsRun-specific exception hierarchy | ✓ | ✗ | ✗ | ✗ |
| Compiles your own logic to native code | Partial | ✗ | Partial | ✓ |

## Reading the table honestly

Here, `✗` means the framework does not provide that feature as a built-in
facility. You can still reach many of the same OS, C, or C++ mechanisms
directly through ctypes, cffi, Cython, or handwritten native extensions.

- **ctypes** is in the standard library and needs no compiler at all to
  call an existing shared library — genuinely hard to beat for "I just
  need to call one function in `libfoo.so`." Its struct declarations are
  hand-written, though, so a layout can silently drift from what the real
  C compiler would produce.
- **cffi** improves on that with API mode, which parses real C headers —
  much of the struct-layout story here is similar in spirit to PylsRun's
  compiler-oracle approach, applied to declared C signatures rather than
  Python-declared struct fields.
- **Cython** is a different kind of tool: a Python-like language that
  compiles to C. It's the strongest option here for writing and compiling
  *your own* numeric logic, and its typed-object model catches a class of
  errors PylsRun's raw pointers simply don't try to catch.
- **PylsRun** doesn't compete with any of these at what they're each best
  at. It's narrower and lower-level: pointers, compiler-verified layouts,
  SIMD, JIT, and concurrency, as one coherent toolkit, with the safety
  net being explicit opt-in (`DebugAllocator`, guard pages) rather than
  the default.

See [Why PylsRun](/docs/0.1.0/comparison/why-pylsrun) for when that
tradeoff is the right one.
