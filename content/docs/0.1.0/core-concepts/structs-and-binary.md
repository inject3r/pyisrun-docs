---
title: "Structs & Binary Data"
description: "Compiler-verified struct and union layouts, plus binary readers/writers and checksums."
order: 2
---

# Structs & Binary Data

Module: `pylsrun.structs` (layout engine) and `pylsrun.buffers` (binary I/O).

## How layout is computed

`define_struct`/`define_union` never guess at padding, alignment, or
bitfield packing. Given your field list, they generate a **real C++
struct/union definition**, hand it to `pylsrun.ctime` (see
the Compile-Time C++ guide), which compiles a tiny program that calls
`sizeof`/`alignof`/`offsetof` on it with your actual host compiler, and
uses the compiler's own answer. For bitfields specifically, the exact byte
range and bit mask are found empirically: an instance is zeroed, the target
bitfield is set to all-ones, and the probe program reports exactly which
bytes changed — so bitfield packing (which the C++ standard leaves
implementation-defined) is *whatever your compiler actually does*, not a
reimplementation of GCC's rules that might drift from reality.

## Defining a struct

```python
import pylsrun as pr
from pylsrun import structs

Point = structs.define_struct("Point", [
    ("x", "f32"),
    ("y", "f32"),
])
```

Field type strings:

| spec         | meaning                                      |
|--------------|-----------------------------------------------|
| `"i32"` etc. | any native typecode (see memory_and_pointers.md) |
| `"i32[8]"`   | fixed-length array of 8 int32_t                |
| `"u32:5"`    | a 5-bit bitfield stored in a uint32_t          |
| `AnotherStructType`         | a nested struct field           |
| `(AnotherStructType, 4)`    | a fixed-length array of 4 nested structs |
| `"f80"` / `"wchar"` | native long double / wchar_t; sizes are platform-dependent |

`packed=True` emits `#pragma pack(1)` — no padding between fields.
`packed` also accepts an explicit integer (e.g. `packed=4`) for a custom
pack value instead of "no padding at all". `align=N` emits `alignas(N)`
on the struct itself — a custom (over-)alignment requirement, distinct
from `packed` (which controls padding *between* fields, not the struct's
own alignment):

```python
Custom = structs.define_struct("Custom", [("a", "i8"), ("b", "i32")], packed=4, align=32)
```

## Using a struct

```python
buf = pr.memory.malloc(Point.__size__)
p = Point(buf)          # bind to a Pointer, MemBlock, or raw int address
p.x, p.y = 1.5, -2.0
print(p)                 # Point(x=1.5, y=-2.0)
p.raw_bytes()             # copy of the underlying __size__ bytes
p.address                 # the bound address
```

`Point.__size__`, `Point.__align__` — compiler-verified. `Point.__layout__`
is a `ctime.StructLayout` with a `.fields` dict of `FieldLayout(name,
offset, size, is_bitfield, bit_mask, bit_shift, ...)`.

## Unions

```python
U = structs.define_union("Reinterpret", [("as_i32", "i32"), ("as_f32", "f32")])
u = U(buf)
u.as_i32 = 0x3F800000
u.as_f32   # -> 1.0
```

## Binary reader/writer

```python
from pylsrun import buffers

w = buffers.BinaryWriter(endian="little")
w.write("u32", 42)
w.write("f64", 3.5)
w.write_cstring("hello")
data = w.getvalue()

r = buffers.BinaryReader(data, endian="little")
r.read("u32")        # 42
r.read("f64")        # 3.5
r.read_cstring()      # "hello"
r.read_bytes(n)
r.remaining()
```

## Variable-length integers (LEB128)

```python
buffers.encode_varint(300)              # b'\xac\x02'
buffers.decode_varint(data, offset=0)   # (300, new_offset)
```

## Checksums

```python
buffers.crc32_zlib(data, seed=0)   # classic zlib-polynomial CRC32 (compile-time table)
buffers.crc32c(seed, data)          # hardware SSE4.2 CRC32C (Castagnoli polynomial) -- different algorithm, not interchangeable
```

## `MemBlock` for zero-copy binary parsing

Bind a `BinaryReader` directly over a `MemBlock`/`memoryview` of memory you
already have (e.g. a `memoryview`/`MemBlock.from_pointer()` view) to parse binary data without ever copying
it into a fresh Python `bytes` object — see the Buffers guide.
