---
title: "SIMD & CPU Intrinsics"
description: "SSE2/AVX2/AVX-512 with runtime dispatch, CPU identification, registers, and bit-manipulation intrinsics."
order: 3
---

# SIMD & CPU Intrinsics

Modules: `pylsrun.simd`, `pylsrun.cpu`.

## Runtime dispatch

Most buffer-oriented SIMD operations perform CPU-feature detection **at call
time** and select the highest supported implementation tier for that specific
operation. The generic x86-64 tier order exposed by `pylsrun.simd.best_tier()` is
AVX-512F → AVX2 → SSE2; individual operations can have narrower requirements
(for example, the int32 min/max/mul family needs SSE4.1 at its SSE-width tier).
The extension is *not* compiled with `-mavx2`/`-march=native` globally — each
SIMD implementation is individually compiled for its required ISA, so an
SSE2-capable x86-64 CPU does not execute AVX2/AVX-512 code paths.

## Buffers, not lists

SIMD functions operate directly on buffer-protocol objects
(`array.array('f', ...)`, `bytearray`, `MemBlock`, numpy arrays) — zero
Python-level copies:

```python
import array
from pylsrun import simd

a = array.array('f', range(16))
b = array.array('f', [1.0] * 16)
out = array.array('f', [0.0] * 16)
simd.add_f32(a, b, out, 16)
```

Convenience wrappers taking plain lists exist too (`simd.add`, `simd.sub`,
`simd.mul`, `simd.dot`, `simd.sum_`), at the cost of a conversion.

## float32 operations

`add_f32` `sub_f32` `mul_f32` `div_f32` `min_f32` `max_f32` `fma_f32`
(`a*b+c`, true FMA3 when the `fma` CPU feature is present, else an honest
two-rounding multiply-then-add) `sum_f32` `dot_f32` `broadcast_f32`
`shuffle_f32` (AVX2 variable permute, per 8-lane group) `cmpgt_f32`
(writes `0xFFFFFFFF`/`0` per lane).

`add_f32_avx512` forces the AVX-512F path (raises `PylsUnsupportedError` if
unavailable). `add_f32_aligned` uses aligned AVX2 load/store — all three
buffers must be 32-byte aligned (for example,
`memory.aligned_alloc(8, alignment=32, elem_size=4)`), and the call raises
`PylsUnsupportedError` when AVX2 is unavailable.

## int32 operations

`add_i32` `sub_i32` `and_i32` `or_i32` `xor_i32` (SSE2/AVX2) and
`mul_i32` `min_i32` `max_i32` (need at least SSE4.1) and `sllv_i32`
`srlv_i32` (per-lane variable shift, AVX2-only — there is no pre-AVX2
instruction for it).

## CPU identification

```python
from pylsrun import cpu
cpu.cpu_features()          # dict[str, bool] of every ISA extension checked
cpu.vendor_string()          # "GenuineIntel" / "AuthenticAMD"
cpu.brand_string()
cpu.cache_line_size()
cpu.cache_info()             # list of {level, type, line_size, size_bytes, ways}
cpu.logical_cpu_count()
cpu.physical_cpu_count()     # best-effort, parses /proc/cpuinfo
cpu.page_size()
```

## Registers

```python
cpu.read_registers()   # dict snapshot: rax..r15, rflags, rip, rsp, rbp
cpu.register_metadata() # name -> bit width
cpu.stack_pointer()
cpu.frame_address(level=0)
cpu.return_address()
```

`read_registers()` is a genuine snapshot of this native call's own register
state (captured via inline assembly in a `noinline` function) — it reflects
what the C calling convention and compiler codegen put in each register at
that instant, exactly as a debugger would show you, not some abstract
"your Python program's state".

## Timers and fences

```python
cpu.rdtsc()          # raw timestamp counter (not wall-clock time)
cpu.rdtscp()          # (tsc, cpu_aux) -- serializing read
cpu.xgetbv(index=0)   # reads XCR0 (needs OSXSAVE; raises PylsUnsupportedError otherwise)
cpu.mfence(); cpu.sfence(); cpu.lfence()
```

## Bit-manipulation intrinsics

```python
cpu.popcount32(v); cpu.popcount64(v)
cpu.count_trailing_zeros(v); cpu.count_leading_zeros(v)   # TZCNT/LZCNT with portable fallback
cpu.rotl64(v, n); cpu.rotr64(v, n)
cpu.bswap16(v); cpu.bswap32(v); cpu.bswap64(v)
cpu.crc32c(seed, data)     # hardware SSE4.2 CRC32 instruction (Castagnoli)
cpu.blsr64(v)               # BMI1: clear lowest set bit
cpu.bextr64(v, start, length)  # BMI1: bitfield extract
cpu.prefetch(address, rw=0, locality=3)   # portable (__builtin_prefetch): hint the CPU to start loading a cache line
cpu.addcarry64(carry_in, a, b)     # -> (carry_out, sum); ADC-based, for wide/multi-limb arithmetic [x86-64 only]
cpu.subborrow64(borrow_in, a, b)   # -> (borrow_out, diff); SBB-based [x86-64 only]
```

The explicitly x86-gated operations (`crc32c`, `blsr64`, `bextr64`,
`addcarry64`, and `subborrow64`) are exposed only on x86-64. The feature-gated
CRC32C/BMI1 operations check the corresponding CPU feature before issuing the
instruction and raise `pylsrun.errors.PylsUnsupportedError` when it is absent.
The portable bit operations and `prefetch` do not require CPUID gating.

## Benchmarking

```python
cpu.benchmark(lambda: some_call(), iterations=10_000)
# -> {"total_cycles", "mean_cycles", "iterations"}
```
