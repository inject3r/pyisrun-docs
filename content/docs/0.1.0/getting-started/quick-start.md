---
title: "Quick Start"
description: "Pointers, a compiler-verified struct, and JIT-compiled assembly, in one file."
order: 3
---

# Quick Start

Everything below is real, working PylsRun code — not pseudocode standing
in for a "someday" API.

## Raw pointers and manual allocation

```python
import pylsrun as pr

p = pr.memory.malloc(64)
p.write_i32(1234)
print(p.read_i32())          # 1234
print(p + 4)                  # real pointer arithmetic, scaled by elem_size
pr.memory.free(p)
```

Nothing here is bounds-checked. That's deliberate — see
[Memory & Pointers](/docs/0.1.0/core-concepts/memory-and-pointers) for the
allocators (`StackArena`, `PoolAllocator`, `DebugAllocator`) that add
exactly the guarantees you ask for.

## A struct with a compiler-verified layout

```python
Point = pr.structs.define_struct("Point", [("x", "f32"), ("y", "f32")])
buf = pr.memory.malloc(Point.__size__)
pt = Point(buf)
pt.x, pt.y = 1.5, -2.0
print(pt, Point.__size__, Point.__align__)
```

`Point.__size__` and every field's offset came from actually compiling
this struct definition with your C++ compiler — see
[Structs & Binary Data](/docs/0.1.0/core-concepts/structs-and-binary).

## SIMD over a real buffer

```python
import array

a = array.array('f', range(8))
b = array.array('f', [1.0] * 8)
out = array.array('f', [0.0] * 8)
pr.simd.add_f32(a, b, out, 8)
print(list(out))
```

On x86-64 this dispatches to AVX-512, AVX2, or SSE2 depending on what the
CPU running it actually supports. On non-x86 builds, the implemented general
SIMD operations use their scalar fallback. Only Linux x86-64 is verified in
this repository — see [SIMD & CPU Intrinsics](/docs/0.1.0/core-concepts/simd-and-intrinsics).

## Runtime assembly, JIT-loaded and executed

```python
code = pr.jit.assemble("""
    mov rax, rdi
    add rax, rsi
    ret
""")
exe = pr.jit.Executable(code)
print(exe.call(2, 40))       # 42
```

`assemble()` shells out to the real GNU assembler; `Executable` maps the
result RW, copies it in, then transitions the mapping to RX and calls
straight into it — see
[Assembly, JIT & ABI](/docs/0.1.0/core-concepts/assembly-and-abi).

## Where to go next

Each concept above has a full page under
[Core Concepts](/docs/0.1.0/core-concepts/index), and `examples/` in the
repository has a runnable script per subsystem, including atomics,
concurrency, virtual memory, and the compile-time oracle.
