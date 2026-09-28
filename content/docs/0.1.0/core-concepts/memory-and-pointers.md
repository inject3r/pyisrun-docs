---
title: "Memory & Pointers"
description: "Manual allocation, real pointer arithmetic, native typecodes, and the three allocator strategies."
order: 1
---

# Memory & Pointers

Module: `pylsrun.memory`. **[UNSAFE]** throughout unless noted.

## Native types (typecodes)

Every typed read/write in PylsRun uses one of these typecodes:

| typecode | C type       | size |
|----------|--------------|------|
| `i8`/`u8`   | int8_t/uint8_t   | 1 |
| `i16`/`u16` | int16_t/uint16_t | 2 |
| `i32`/`u32` | int32_t/uint32_t | 4 |
| `i64`/`u64` | int64_t/uint64_t | 8 |
| `f32`       | float            | 4 |
| `f64`       | double           | 8 |
| `f80`       | long double      | platform-dependent (16 on x86-64 Linux) |
| `ptr`       | uintptr_t        | 8 |
| `bool`      | bool             | 1 |
| `char`      | char             | 1 |
| `wchar`     | wchar_t          | platform-dependent (4 on Linux, 2 on Windows) |

`pylsrun.memory.type_size(typecode)` returns the size in bytes for THIS
build (so `f80`/`wchar` are never hardcoded/guessed). Every `Pointer`
typed method has a matching pair for all of these, e.g. `read_bool`/
`write_bool`, `read_f80`/`write_f80`. `pylsrun.memory.is_little_endian()`
is a genuine runtime check (not an assumption), even though this build
only targets little-endian x86-64.

## Pointer

The snippets on this page use the alias established here:

```python
import pylsrun as pr
```

`Pointer(address=0, elem_size=1)` — a typed address with real arithmetic:

```python
p = pr.memory.malloc(40, elem_size=4)   # elem_size scales arithmetic
q = p + 3                               # q.address == p.address + 12
n = q - p                               # n == 3 (element count, not bytes)
```

Methods: `read_i8`/`write_i8` ... `read_f64`/`write_f64`, `read_ptr`/`write_ptr`,
`read_bytes(n, offset=0)`, `write_bytes(data, offset=0)`, `cast(elem_size)`,
`offset(n)`, `is_null()`. All typed methods accept `offset=` and
`endian=` ("native"/"little"/"big"). Properties: `.address`, `.elem_size`.
Supports `int(p)`, `bool(p)`, hashing, and ordering comparisons.

## Manual allocation

```python
pr.memory.malloc(n, elem_size=1)
pr.memory.calloc(count, size)              # zero-initialized
pr.memory.realloc(ptr, n, elem_size=1)
pr.memory.free(ptr_or_address)
pr.memory.aligned_alloc(n, alignment=64, elem_size=1)   # portable: posix_memalign / _aligned_malloc
pr.memory.aligned_free(ptr_or_address)                    # MUST be used instead of free() for aligned_alloc() memory
```

`calloc` gives you zero-initialized memory; `malloc`/`aligned_alloc` give
you uninitialized memory, exactly like C.

## Bulk memory operations

```python
pr.memory.memcpy(dst, src, n)
pr.memory.memmove(dst, src, n)
pr.memory.memset(dst, value, n)
result = pr.memory.memcmp(a, b, n)       # int comparison result
result = pr.memory.mem_find(address, length, pattern)  # offset or -1
```

`dst`/`src`/`a`/`b` accept either a `Pointer` or a raw integer address.

## Raw address-based access (no Pointer object needed)

```python
pr.memory.mem_read(address, typecode, offset=0, endian="native")
pr.memory.mem_write(address, typecode, value, offset=0, endian="native")
```

## Bit-level access

```python
bit = pr.memory.get_bit(ptr_or_address, bit_index)  # 0 or 1
pr.memory.set_bit(ptr_or_address, bit_index, value)
```

## Zero-copy interop

```python
p = pr.memory.addressof(buffer_protocol_obj)  # -> Pointer
```

Works on `bytearray`, `array.array`, numpy arrays, PylsRun's own `MemBlock`
— anything implementing the buffer protocol. **Writing through the
returned Pointer into an immutable object (plain `bytes`) is undefined
behavior**, exactly like mutating a `bytes` object through `ctypes` would
be; use `bytearray` for anything you intend to write.

## Alignment / validation helpers

```python
aligned = pr.memory.is_aligned(ptr_or_address, alignment)  # -> bool
```

## `hexdump`

```python
print(pr.memory.hexdump(some_bytes_like, width=16, start_address=0))
```

## Allocators

### `StackArena(capacity)` — linear/bump allocator **[SAFE within capacity]**

```python
arena = pr.memory.StackArena(1 << 20)
p = arena.alloc(64, align=16)     # O(1) bump
mark = arena.mark()
q = arena.alloc(128)
arena.release(mark)               # rolls back to `mark` (LIFO discipline)
arena.reset(zero=False)           # discard everything at once
```
Raises `pylsrun.errors.PylsAllocationError` when exhausted.

### `PoolAllocator(block_size, block_count)` — fixed-block free list **[SAFE against double-free/foreign pointers]**

```python
pool = pr.memory.PoolAllocator(block_size=64, block_count=1000)
b = pool.alloc()
pool.free(b)
pool.free(b)   # raises PylsAllocationError: double free detected
```
`pool.stats()` returns `{block_size, block_count, used_count, free_count}`.

### `DebugAllocator(poison_byte=0xDD)` — canaries, poisoning, leak tracking

```python
dbg = pr.memory.DebugAllocator()
p = dbg.alloc(16)
dbg.free(p)               # validates guard canaries, then poisons + frees
dbg.check_leaks()         # -> list of (address, size, allocation_serial)
dbg.stats()                # counters: live/peak/total allocs & frees
```

Every allocation is wrapped in front/back guard canaries; `free()` raises
`PylsAllocationError` if either canary was overwritten (buffer
overflow/underflow) or if the pointer wasn't one this allocator handed out
(double-free/foreign pointer). Freed bytes are poisoned (filled with
`poison_byte`) before the underlying `free()` as a debugging aid. A use-after-free
is still invalid/undefined; the poison does not make the access safe.

For real memory-corruption debugging beyond what `DebugAllocator` catches,
build with `PYLSRUN_DEBUG=1` (AddressSanitizer/UBSan) — see the Installation guide.

## Ownership wrappers

`StackArena`/`PoolAllocator`/`DebugAllocator` are allocation *strategies*;
`UniquePtr` and `SharedPtr` are ownership *discipline* on top of plain
`malloc`/`free`:

```python
with pr.memory.UniquePtr.alloc(64) as up:
    up.pointer.write_i32(42)
# freed automatically here

a = pr.memory.SharedPtr.alloc(64)
b = a.clone()          # use_count == 2
a.release()             # use_count == 1, not freed yet
b.release()              # use_count == 0 -> freed
```

`pr.memory.addressof()`/`MemBlock.from_pointer()` (see the Buffers guide)
are the **non-owning, borrowed-view** counterpart to these two.

## Custom allocators

Any object with `alloc(n) -> Pointer` and `free(ptr) -> None` is a
drop-in allocator. `pr.memory.Allocator` documents that shape as a base
class; `pr.memory.LoggingAllocator` is a minimal worked example (wraps
`malloc`/`free`, records every call) to build your own from.

## Pointer validation

```python
valid = pr.memory.is_valid_range(address, length=1, need_write=False)  # -> bool
```

Best-effort where `vmem.memory_regions()` is implemented: checks the range
falls inside a currently-mapped, readable (and, if `need_write`, writable)
region via `/proc/self/maps`. On platforms without that Linux-specific
introspection backend it returns `False`. It is a diagnostic aid, not a
safety guarantee (the mapping could change between this check and your next
dereference).

## Memory reports

```python
print(pr.memory.format_debug_report(dbg))  # dbg: a DebugAllocator
```
