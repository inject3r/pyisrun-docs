---
title: "Comparison"
description: "How PylsRun overlaps with ctypes, cffi, and Cython, and where it doesn't."
order: 0
---

# Comparison

ctypes, cffi, and Cython are all real, mature ways to get closer to the
metal from Python. PylsRun doesn't replace any of them — it covers a
different, narrower slice: pointer/memory primitives, compiler-verified
struct layout, SIMD, JIT execution, and native concurrency, as a single
coherent toolkit rather than something you'd typically reach for one
piece at a time.

- **[PylsRun vs ctypes, cffi & Cython](/docs/0.1.0/comparison/vs-ctypes-cffi-cython)**
  — a feature-by-feature, no-fabricated-numbers comparison.
- **[Why PylsRun](/docs/0.1.0/comparison/why-pylsrun)** — when it's the
  right tool, and when it plainly isn't.
