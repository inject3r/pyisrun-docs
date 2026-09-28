---
title: "Compile-Time C++"
description: "Static consteval/constexpr constants baked in at build time, plus a dynamic compiler oracle."
order: 8
---

# Compile-Time C++

Module: `pylsrun.ctime`.

PylsRun's compile-time story has two genuinely different halves. Both
compute things with the C++ compiler; Python only ever sees the result.

## 1. Static: baked into the extension at *its own* build time

`csrc/ctime_native.cpp` contains real `consteval` functions, `constexpr`
array-building, class-template recursion, and `static_assert` checks. These
run when the extension itself is compiled — not when you import it, not
when you call the function.

```python
from pylsrun import ctime

ctime.factorial_table()            # dict[int,int] 0..15, via a consteval function
ctime.fibonacci_table()             # list[int], first 30, via consteval
ctime.fibonacci_30_via_template()    # via C++ class-template recursion (CtFib<N>)
ctime.crc32_table()                   # the 256-entry zlib CRC32 table, via consteval
ctime.mask_table()                     # mask_table[i] == (1<<i)-1, via consteval
ctime.demo_struct_layout()              # sizeof/alignof/type-traits on a fixed demo struct
ctime.static_assertions_passed()         # always True -- if a static_assert had
                                           # failed, the extension wouldn't have compiled
```

The numeric values/tables are computed and baked into the extension at
build time. Calling these Python functions still constructs the corresponding
Python `dict`/`list`/value at runtime; what is avoided is recomputing the C++
result.

## 2. Dynamic: compiles *your* C++ on demand

For arbitrary, caller-supplied expressions and struct definitions,
`pylsrun.ctime` writes a small real C++ translation unit, compiles it with
a real host compiler (`g++`/`clang++`, auto-detected via `PATH`), runs it,
and parses back what the compiler computed:

```python
ctime.eval_constexpr("6 * 7")                                    # 42
ctime.eval_constexpr("sizeof(long double)", cpp_type="unsigned long long")  # host compiler value
ctime.sizeof("double")     # host compiler value
ctime.alignof("long double")  # host compiler value

layout = ctime.query_struct_layout(
    "{ char a; double b; short c; }",
    field_names=["a", "b", "c"],
)
layout.size, layout.align
layout.fields["b"].offset
```

`eval_constexpr` genuinely exploits the C++ standard: a `constexpr`
variable's initializer *must* be a constant expression, evaluated at
compile time, or the program is ill-formed — so if the generated program
compiles at all, the value was computed by the compiler at compile time,
not by this Python function at run time.

This is also literally the engine `pylsrun.structs.define_struct`/
`define_union` use to get authoritative field offsets (see
the Structs & Binary Data guide) — including the empirical bitfield-bit-range
detection technique described there.

Each probe is keyed by a source hash. Its compiled executable is kept under
a temporary cache directory so later calls do not need to compile the same
source again; within a single process, the probe's stdout is also cached so
the executable is not rerun either.

```python
ctime.set_compiler("/usr/bin/clang++")   # override auto-detection
```

Requires a working `g++`/`clang++` in `PATH` for the dynamic half; the
static half needs nothing at runtime (it's compiled into the extension).
