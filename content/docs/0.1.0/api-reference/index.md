---
title: "API Reference"
description: "Public Python API reference for PylsRun 0.1.0, checked against the source package."
order: 0
---

# API Reference

This is the public Python API reference for the 0.1.0 source tree. The
class and module docstrings below mirror the package source, while the
method/function lists are checked against the corresponding Python and native
implementations. For narrative explanations and runnable examples, see
[Core Concepts](/docs/0.1.0/core-concepts/index) and the `examples/`
directory in the repository.


## `pylsrun.memory`

pylsrun.memory -- pointers, manual allocation, and raw memory access.

Everything here is [UNSAFE] in the sense a systems programmer expects:
there is no bounds checking beyond what you provide, and dereferencing a
bad address crashes the process exactly as it would in C. That is by
design -- this module gives you real pointers, not a padded imitation of
them.


### `class Allocator`

```text
The allocator protocol every allocator in PylsRun follows:
`alloc(n) -> Pointer` and `free(ptr) -> None`. StackArena,
PoolAllocator, and DebugAllocator all satisfy this shape natively;
subclass this Python base to write your own.
```

- `Allocator.alloc(...)` -- Abstract allocation operation returning a `Pointer`.
- `Allocator.free(...)` -- Abstract release operation for an allocation.


### `class DebugAllocator`

```text
DebugAllocator(poison_byte=0xDD)

A malloc-backed allocator for hunting memory bugs: every allocation is
wrapped in guard canaries (checked on free -> catches buffer overflow
and underflow), freed memory is poisoned before release, and every live
allocation is tracked so check_leaks() can report exactly what is still
outstanding.
```

- `DebugAllocator.alloc(...)` -- alloc(n) -> Pointer. Allocate n bytes wrapped in front/back guard canaries.
- `DebugAllocator.check_leaks(...)` -- check_leaks() -> list[(address, size, serial)] for every allocation still live right now.
- `DebugAllocator.free(...)` -- free(ptr). Validate canaries (raises on overflow/underflow), poison the region, then release it.
- `DebugAllocator.stats(...)` -- stats() -> dict of allocation counters.

### `class LoggingAllocator`

```text
Example custom allocator: wraps plain malloc/free and records every
call, demonstrating the extension point -- add quotas, pooling by
size class, statistics, or anything else the same way.
```

- `LoggingAllocator.alloc(...)` -- Allocate through `malloc()` and record the call.
- `LoggingAllocator.free(...)` -- Release through `free()` and record the call.
- `LoggingAllocator.log` (property) -- Recorded allocation/free events.


### `class Pointer`

```text
Pointer(address=0, elem_size=1)

A raw, typed memory address with real pointer arithmetic.
`elem_size` is the size in bytes of whatever the pointer references;
arithmetic (p + n, p - n, p - other_p) scales by it exactly like C.
No bounds checking is performed -- dereferencing an invalid address
will crash the interpreter, exactly as it would in C.
```

- `Pointer.address` (property)
- `Pointer.cast(...)` -- Return a new Pointer to the same address with a different elem_size.
- `Pointer.elem_size` (property)
- `Pointer.is_null(...)` -- True if address == 0.
- `Pointer.offset(...)` -- Return self + n*elem_size as a new Pointer (same as self + n).
- `Pointer.read_bool(...)` -- Read a native bool (1 byte, 0/nonzero).
- `Pointer.read_bytes(...)` -- Read n raw bytes as a bytes object.
- `Pointer.read_char(...)` -- Read a native char (1 byte, signed on this platform).
- `Pointer.read_f32(...)` -- Read a 32-bit IEEE-754 float.
- `Pointer.read_f64(...)` -- Read a 64-bit IEEE-754 double.
- `Pointer.read_f80(...)` -- Read a native long double (narrowed to a Python float).
- `Pointer.read_i16(...)` -- Read a signed 16-bit integer.
- `Pointer.read_i32(...)` -- Read a signed 32-bit integer.
- `Pointer.read_i64(...)` -- Read a signed 64-bit integer.
- `Pointer.read_i8(...)` -- Read a signed 8-bit integer.
- `Pointer.read_ptr(...)` -- Read a raw 64-bit address.
- `Pointer.read_u16(...)` -- Read an unsigned 16-bit integer.
- `Pointer.read_u32(...)` -- Read an unsigned 32-bit integer.
- `Pointer.read_u64(...)` -- Read an unsigned 64-bit integer.
- `Pointer.read_u8(...)` -- Read an unsigned 8-bit integer.
- `Pointer.read_wchar(...)` -- Read a native wchar_t (size is platform-dependent).
- `Pointer.write_bool(...)` -- Write a native bool (1 byte).
- `Pointer.write_bytes(...)` -- Write raw bytes from any buffer-like object.
- `Pointer.write_char(...)` -- Write a native char (1 byte).
- `Pointer.write_f32(...)` -- Write a 32-bit IEEE-754 float.
- `Pointer.write_f64(...)` -- Write a 64-bit IEEE-754 double.
- `Pointer.write_f80(...)` -- Write a native long double (from a Python float).
- `Pointer.write_i16(...)` -- Write a signed 16-bit integer.
- `Pointer.write_i32(...)` -- Write a signed 32-bit integer.
- `Pointer.write_i64(...)` -- Write a signed 64-bit integer.
- `Pointer.write_i8(...)` -- Write a signed 8-bit integer.
- `Pointer.write_ptr(...)` -- Write a raw 64-bit address.
- `Pointer.write_u16(...)` -- Write an unsigned 16-bit integer.
- `Pointer.write_u32(...)` -- Write an unsigned 32-bit integer.
- `Pointer.write_u64(...)` -- Write an unsigned 64-bit integer.
- `Pointer.write_u8(...)` -- Write an unsigned 8-bit integer.
- `Pointer.write_wchar(...)` -- Write a native wchar_t.

### `class PoolAllocator`

```text
PoolAllocator(block_size, block_count)

A fixed-block-size free-list allocator: every block is the same size,
alloc()/free() are O(1), and free() detects double-frees and foreign
pointers via a used-block bitmap.
```

- `PoolAllocator.alloc(...)` -- alloc() -> Pointer. Take one fixed-size block from the pool.
- `PoolAllocator.free(...)` -- free(ptr). Return a block to the pool; raises on double-free or foreign pointers.
- `PoolAllocator.stats(...)` -- stats() -> dict with block_size/block_count/used_count/free_count.

### `class SharedPtr`

```text
Reference-counted memory ownership: cloning a SharedPtr (via .clone())
creates another owner sharing the same underlying allocation and a
shared counter; the memory is freed only when the last owner is
dropped (garbage collected, or explicitly via .release()).

    a = SharedPtr.alloc(64)
    b = a.clone()          # refcount now 2
    a.release()             # refcount 1, not freed yet
    b.pointer.write_i32(1)
    b.release()              # refcount 0 -> freed
```

- `SharedPtr.alloc(...)` -- Allocate a new shared owner around `malloc()` memory.
- `SharedPtr.clone(...)` -- Create another owner sharing the same allocation and reference count.
- `SharedPtr.pointer` (property)
- `SharedPtr.use_count` (property)
- `SharedPtr.release(...)` -- Drop this owner explicitly; the allocation is freed when the final owner is gone.

### `class StackArena`

```text
StackArena(capacity)

A linear/bump allocator over one pre-reserved block of `capacity` bytes.
alloc() is O(1); release memory in bulk with reset(), or in LIFO scopes
with mark()/release(mark). This models a real stack-discipline allocator,
not Python's own call stack.
```

- `StackArena.alloc(...)` -- alloc(n, align=16) -> Pointer. Bump-allocate n bytes; raises `PylsAllocationError` when exhausted.
- `StackArena.base_address` (property)
- `StackArena.capacity` (property)
- `StackArena.mark(...)` -- mark() -> int. Save the current offset for a later release() (LIFO scope).
- `StackArena.release(...)` -- release(mark). Roll the arena back to a previous mark().
- `StackArena.remaining` (property)
- `StackArena.reset(...)` -- reset(zero=False). Discard all allocations at once, optionally zeroing the block.
- `StackArena.used` (property)

### `class UniquePtr`

```text
Single-owner memory: exactly one UniquePtr is ever responsible for
freeing a given allocation. Frees automatically on garbage collection
or context-manager exit; release() transfers ownership out (the
UniquePtr becomes empty and will no longer free anything).

    with UniquePtr.alloc(64) as up:
        up.pointer.write_i32(42)
    # freed here

    up2 = UniquePtr.alloc(64)
    raw = up2.release()   # up2 no longer owns it; caller must free(raw) itself
```

- `UniquePtr.alloc(...)` -- Allocate an owning pointer wrapper around `malloc()` memory.
- `UniquePtr.pointer` (property)
- `UniquePtr.release(...)` -- Give up ownership without freeing; the caller becomes responsible for the memory.
- `UniquePtr.free(...)` -- Explicitly free the owned allocation and empty the wrapper.
- Supports the context-manager protocol (`with UniquePtr.alloc(...) as p:`).

### Module-level functions

- **`addressof(...)`** -- addressof(buffer_protocol_obj) -> Pointer (zero-copy).
- **`aligned_alloc(...)`** -- aligned_alloc(n, alignment=64, elem_size=1) -> Pointer, portable cross-platform aligned allocation.
- **`aligned_free(...)`** -- aligned_free(ptr_or_address). MUST be used (not free()) to release aligned_alloc() memory.
- **`calloc(...)`** -- calloc(count, size) -> Pointer, zero-initialized.
- **`format_debug_report(...)`** -- A human-readable summary of a DebugAllocator's current state: counters
- **`free(...)`** -- free(ptr_or_address).
- **`get_bit(...)`** -- get_bit(ptr_or_address, bit_index) -> 0 or 1.
- **`hexdump(...)`** -- Render `data` (any bytes-like object) as a classic hex+ASCII dump.
- **`is_aligned(...)`** -- is_aligned(ptr_or_address, alignment) -> bool.
- **`is_little_endian(...)`** -- Runtime host-endianness check.
- **`is_valid_range(...)`** -- Best-effort validation: True if [address, address+length) falls entirely
- **`malloc(...)`** -- malloc(n, elem_size=1) -> Pointer.
- **`mem_find(...)`** -- mem_find(address, length, pattern) -> offset or -1.
- **`mem_read(...)`** -- mem_read(address, typecode, offset=0, endian='native') -> value.
- **`mem_write(...)`** -- mem_write(address, typecode, value, offset=0, endian='native').
- **`memcmp(...)`** -- memcmp(a, b, n) -> int.
- **`memcpy(...)`** -- memcpy(dst, src, n).
- **`memmove(...)`** -- memmove(dst, src, n).
- **`memset(...)`** -- memset(dst, value, n).
- **`realloc(...)`** -- realloc(ptr_or_address, n, elem_size=1) -> Pointer.
- **`set_bit(...)`** -- set_bit(ptr_or_address, bit_index, value).
- **`type_size(...)`** -- type_size(typecode) -> int, in bytes.

## `pylsrun.buffers`

pylsrun.buffers -- the zero-copy buffer system, plus binary serialization
helpers (a sequential BinaryReader/BinaryWriter, LEB128 varints, and CRC32).


### `class BinaryReader`

```text
Sequential little/big/native-endian reader over any bytes-like object (zero-copy via memoryview).
```

- `BinaryReader.remaining(...)` -- Number of unread bytes.
- `BinaryReader.read_bytes(...)` -- Read exactly n bytes as a new `bytes` object.
- `BinaryReader.read(...)` -- Read one supported primitive typecode (`i8/u8/i16/u16/i32/u32/i64/u64/f32/f64`).
- `BinaryReader.read_varint(...)` -- Read one unsigned LEB128 varint.
- `BinaryReader.read_cstring(...)` -- Read a NUL-terminated byte string and decode it.

### `class BinaryWriter`

```text
Sequential binary writer building up a bytearray; endianness matches BinaryReader.
```

- `BinaryWriter.write_bytes(...)` -- Append raw bytes-like data.
- `BinaryWriter.write(...)` -- Pack and append one supported primitive typecode.
- `BinaryWriter.write_varint(...)` -- Append one unsigned LEB128 varint.
- `BinaryWriter.write_cstring(...)` -- Encode a string and append a terminating NUL byte.
- `BinaryWriter.getvalue(...)` -- Return the accumulated output as `bytes`.


### `class MemBlock`

```text
MemBlock(n)

A block of native memory that implements the Python buffer protocol.
`memoryview(block)` and `numpy.frombuffer(block)` can view the same backing
memory without a staging copy; `bytes(block)` explicitly copies into a new
Python bytes object. Construct with MemBlock(n) to own n freshly allocated
bytes, or via MemBlock.from_pointer()/.from_buffer() for a non-owning
zero-copy view over existing memory.
```

- `MemBlock.address` (property)
- `MemBlock.fill(...)` -- fill(byte_value): memset the whole block.
- `MemBlock.free(...)` -- Explicitly release an owning block's memory now (also happens automatically on GC).
- `MemBlock.from_buffer(...)` -- from_buffer(obj, writable=None) -> MemBlock (zero-copy view over any buffer-protocol object)
- `MemBlock.from_pointer(...)` -- from_pointer(address, length, writable=True) -> MemBlock (non-owning view)
- `MemBlock.owns_memory` (property)
- `MemBlock.pointer(...)` -- Return a Pointer(elem_size=1) to byte 0 of this block.
- `MemBlock.to_bytearray(...)` -- Copy the block's contents into a new bytearray.
- `MemBlock.to_bytes(...)` -- Copy the block's contents into a new bytes object.
- `MemBlock.writable` (property)
- **`crc32_zlib(...)`** -- crc32_zlib(data, seed=0) -> int. Classic zlib-compatible CRC32 using the compile-time table above.
- **`crc32c(...)`** -- crc32c(seed, data: bytes-like) -> int. Hardware CRC32C via the SSE4.2 CRC32 instruction. [x86-64 only]
- **`decode_varint(...)`** -- Decode one LEB128 varint from `data` starting at `offset`. Returns (value, new_offset).
- **`encode_varint(...)`** -- LEB128-encode an unsigned integer (the varint format protobuf/DWARF use).

## `pylsrun.structs`

pylsrun.structs -- structs and unions with a real, compiler-verified memory
layout, not a hand-rolled approximation of one.

define_struct()/define_union() take a declarative field list, translate it
into an actual C++ struct/union definition, and hand that to pylsrun.ctime
to compile and probe with the host's own C++ compiler -- so the size,
alignment, and every field's byte offset (bitfields included, down to the
exact bit) are *exactly* what a real C or C++ compiler would produce for
that layout, natural padding and all. The returned class then reads and
writes its fields directly against raw memory at those offsets, with zero
intermediate copies.

    Point = define_struct("Point", [("x", "f32"), ("y", "f32")])
    buf = pylsrun.memory.malloc(Point.__size__)
    p = Point(buf)
    p.x = 1.5
    p.y = -2.0

Field type strings:
    "i8" "u8" "i16" "u16" "i32" "u32" "i64" "u64" "f32" "f64" "ptr" "bool" "char"
    "i32[8]"      -- fixed-length array
    "u32:5"       -- a 5-bit bitfield stored in a uint32_t
    AnotherStruct           -- a nested struct field
    (AnotherStruct, 4)      -- a fixed-length array of a nested struct


### `class FieldSpec`

```text
FieldSpec(name: 'str', typecode: 'Optional[str]' = None, array_len: 'Optional[int]' = None, bits: 'Optional[int]' = None, nested: 'Optional[type]' = None, nested_array_len: 'Optional[int]' = None)
```

- `FieldSpec.name` (property)
- `FieldSpec.array_len` (property)
- `FieldSpec.bits` (property)
- `FieldSpec.nested` (property)
- `FieldSpec.nested_array_len` (property)
- `FieldSpec.typecode` (property)

### `class StructView`

```text
Base class for every type returned by define_struct()/define_union().
Binds to an existing address (a Pointer, MemBlock, or raw integer) --
it never allocates memory itself. Field access reads/writes the
underlying memory directly at the field's compiler-verified offset.
```

- `StructView.__layout__` (property) -- `StructLayout` describing the compiler-derived layout.
- `StructView.__field_specs__` (property) -- Declarative `FieldSpec` definitions for the generated type.
- `StructView.__size__` (property) -- Total native size in bytes.
- `StructView.__align__` (property) -- Native alignment in bytes.
- `StructView.__cpp_name__` (property) -- C++ type name used for the generated declaration.
- `StructView.__cpp_full_decl__` (property) -- Full C++ declaration used for the probe.
- `StructView.address` (property)
- `StructView.raw_bytes(...)` -- A copy of this struct's underlying memory, exactly `__size__` bytes.

### Module-level functions

- **`define_struct(...)`** -- Create a new struct type. Returns a `StructView` subclass; construct it with a `Pointer`, `MemBlock`, or raw address.
- **`define_union(...)`** -- Create a new union type: every field starts at offset 0.

## `pylsrun.simd`

pylsrun.simd -- SSE2/AVX2/AVX-512 vector operations with runtime dispatch.

The raw SIMD entry points in `pylsrun._native` operate directly on
buffer-protocol objects (`array.array`, bytes/bytearray, `MemBlock`, NumPy
arrays, ...), without staging them through Python containers. The
convenience wrappers below accept plain Python lists/tuples too, at the cost
of a conversion through `array.array`.

- **`add(...)`** -- Elementwise a[i]+b[i] over plain Python sequences (convenience wrapper over add_f32).
- **`add_f32(...)`** -- add_f32(a, b, out, n): out[i] = a[i] + b[i], float32 buffers.
- **`add_f32_aligned(...)`** -- Same as add_f32 but uses aligned AVX2 load/store; all buffers must be 32-byte aligned, and `PylsUnsupportedError` is raised when AVX2 is unavailable.
- **`add_f32_avx512(...)`** -- Same as add_f32 but forces the AVX-512F path (raises if unsupported).
- **`add_i32(...)`** -- add_i32(a, b, out, n): int32 elementwise add.
- **`and_i32(...)`** -- and_i32(a, b, out, n): int32 elementwise bitwise AND.
- **`best_tier(...)`** -- best_tier() -> str. Which SIMD tier this CPU will actually use.
- **`broadcast_f32(...)`** -- broadcast_f32(value, out, n): fill out with n copies of value.
- **`cmpgt_f32(...)`** -- cmpgt_f32(a, b, out_u32, n): out[i] = 0xFFFFFFFF if a[i]>b[i] else 0.
- **`cpu_features(...)`** -- cpu_features() -> dict[str, bool]. Every ISA extension this extension knows to check for (all False on non-x86-64 architectures).
- **`div_f32(...)`** -- div_f32(a, b, out, n): out[i] = a[i] / b[i].
- **`dot(...)`** -- Dot product over plain Python sequences (convenience wrapper over dot_f32).
- **`dot_f32(...)`** -- dot_f32(a, b, n) -> float. Dot product.
- **`fma_f32(...)`** -- fma_f32(a, b, c, out, n): out[i] = a[i]*b[i] + c[i] (true FMA3 when available).
- **`max_f32(...)`** -- max_f32(a, b, out, n): out[i] = max(a[i], b[i]).
- **`max_i32(...)`** -- max_i32(a, b, out, n): int32 elementwise max (needs SSE4.1+).
- **`min_f32(...)`** -- min_f32(a, b, out, n): out[i] = min(a[i], b[i]).
- **`min_i32(...)`** -- min_i32(a, b, out, n): int32 elementwise min (needs SSE4.1+).
- **`mul(...)`** -- (no docstring)
- **`mul_f32(...)`** -- mul_f32(a, b, out, n): out[i] = a[i] * b[i].
- **`mul_i32(...)`** -- mul_i32(a, b, out, n): int32 elementwise multiply (needs SSE4.1+).
- **`or_i32(...)`** -- or_i32(a, b, out, n): int32 elementwise bitwise OR.
- **`shuffle_f32(...)`** -- shuffle_f32(a, indices, out, n): per-8-lane-group variable permute (AVX2 accelerated; portable scalar fallback on non-x86 builds; the x86 implementation requires AVX2).
- **`sllv_i32(...)`** -- sllv_i32(a, counts, out, n): per-lane variable left shift (AVX2 accelerated; portable scalar fallback on non-x86 builds; the x86 implementation requires AVX2).
- **`srlv_i32(...)`** -- srlv_i32(a, counts, out, n): per-lane variable right shift (AVX2 accelerated; portable scalar fallback on non-x86 builds; the x86 implementation requires AVX2).
- **`sub(...)`** -- (no docstring)
- **`sub_f32(...)`** -- sub_f32(a, b, out, n): out[i] = a[i] - b[i].
- **`sub_i32(...)`** -- sub_i32(a, b, out, n): int32 elementwise sub.
- **`sum_(...)`** -- (no docstring)
- **`sum_f32(...)`** -- sum_f32(a, n) -> float. Horizontal sum reduction.
- **`xor_i32(...)`** -- xor_i32(a, b, out, n): int32 elementwise bitwise XOR.

## `pylsrun.cpu`

pylsrun.cpu -- CPU identification, register snapshots, and bit-manipulation
intrinsics (POPCNT, LZCNT/TZCNT, ROL/ROR, CRC32C, BMI1, fences).

Feature-gated x86 instructions here check the relevant CPU capability and
raise `pylsrun.errors.PylsUnsupportedError` when it is missing. Portable
bit-manipulation builtins do not require CPUID checks.

- **`addcarry64(...)`** -- addcarry64(carry_in, a, b) -> (carry_out, sum). Add-with-carry (ADC), for wide/multi-limb arithmetic. [x86-64 only]
- **`benchmark(...)`** -- Run `fn()` `iterations` times using the high-resolution timestamp
- **`bextr64(...)`** -- bextr64(v, start, length) -> extracted bitfield (BMI1). [x86-64 only]
- **`blsr64(...)`** -- blsr64(v) -> v with its lowest set bit cleared (BMI1). [x86-64 only]
- **`brand_string(...)`** -- brand_string() -> str, the marketing CPU model name. [x86-64 only]
- **`bswap16(...)`** -- Byte-swap a 16-bit value. Portable.
- **`bswap32(...)`** -- Byte-swap a 32-bit value. Portable.
- **`bswap64(...)`** -- Byte-swap a 64-bit value. Portable.
- **`cache_info(...)`** -- cache_info() -> list[dict]. Every cache level/type CPUID leaf 4 reports. [x86-64 only]
- **`cache_line_size(...)`** -- cache_line_size() -> int, in bytes. [x86-64 only]
- **`count_leading_zeros(...)`** -- Leading-zero count of a 64-bit value. Portable.
- **`count_trailing_zeros(...)`** -- Trailing-zero count of a 64-bit value. Portable.
- **`cpu_features(...)`** -- cpu_features() -> dict[str, bool]. Every ISA extension this extension knows to check for (all False on non-x86-64 architectures).
- **`cpuid(...)`** -- cpuid(leaf, subleaf=0) -> (eax, ebx, ecx, edx). Raw CPUID instruction. [x86-64 only]
- **`crc32c(...)`** -- crc32c(seed, data: bytes-like) -> int. Hardware CRC32C via the SSE4.2 CRC32 instruction. [x86-64 only]
- **`frame_address(...)`** -- frame_address(level=0) -> int. Portable.
- **`lfence(...)`** -- Load fence.
- **`logical_cpu_count(...)`** -- Number of logical CPUs online. [portable]
- **`mfence(...)`** -- Full memory fence.
- **`page_size(...)`** -- The OS virtual-memory page size in bytes. [portable]
- **`physical_cpu_count(...)`** -- Best-effort number of physical cores. [portable]
- **`popcount32(...)`** -- Population count of a 32-bit value. Portable.
- **`popcount64(...)`** -- Population count of a 64-bit value. Portable.
- **`prefetch(...)`** -- prefetch(address, rw=0, locality=3). Hints the CPU to start loading a cache line. rw: 0=read, 1=write. locality: 0 (no reuse) .. 3 (high temporal locality). Portable (__builtin_prefetch); a no-op hint on architectures without a prefetch instruction.
- **`rdtsc(...)`** -- rdtsc() -> int. Raw hardware cycle/timestamp counter (not wall-clock time). [x86-64: RDTSC, tested] [AArch64: CNTVCT_EL0, untested]
- **`rdtscp(...)`** -- rdtscp() -> (tsc, cpu_aux). [x86-64 only]
- **`read_registers(...)`** -- read_registers() -> dict. Snapshot of this native call's GP registers at this instant. [x86-64: tested] [AArch64: written, untested] [other: unsupported]
- **`register_metadata(...)`** -- register_metadata() -> dict[str,int]. Register name -> bit width, describing read_registers().
- **`return_address(...)`** -- The caller's return address. Portable.
- **`rotl64(...)`** -- rotl64(value, n) -> value rotated left by n bits. Portable.
- **`rotr64(...)`** -- rotr64(value, n) -> value rotated right by n bits. Portable.
- **`sfence(...)`** -- Store fence.
- **`stack_pointer(...)`** -- Current frame address (portable, via a compiler builtin).
- **`subborrow64(...)`** -- subborrow64(borrow_in, a, b) -> (borrow_out, diff). Subtract-with-borrow (SBB). [x86-64 only]
- **`vendor_string(...)`** -- vendor_string() -> str, e.g. 'GenuineIntel'. [x86-64 only]
- **`xgetbv(...)`** -- xgetbv(index=0) -> int. Reads XCR0. [x86-64 only]

## `pylsrun.vmem`

pylsrun.vmem -- virtual memory: anonymous mappings, page protection, guard
pages, and /proc/self/maps introspection. [PLATFORM: linux-x86_64]

- **`alloc_with_guard_pages(...)`** -- alloc_with_guard_pages(n) -> (usable_ptr, free_base_address, free_total_size). Touching memory just before/after the usable region raises SIGSEGV immediately.
- **`flush_icache(...)`** -- flush_icache(address=None, length=None). Portable via __builtin___clear_cache: a real instruction-cache flush on architectures that need one (e.g. ARM), a no-op on x86-64.
- **`is_mapped(...)`** -- Best-effort check: does any mapped region in this process contain `address`?
- **`memory_regions(...)`** -- memory_regions() -> list[dict]. Parses /proc/self/maps. [PLATFORM: linux only]
- **`page_size(...)`** -- The OS virtual-memory page size in bytes. [portable]
- **`permissions_at(...)`** -- Return the 'rwxp'-style permission string for the region containing `address`, or None.
- **`vmem_alloc(...)`** -- vmem_alloc(n, prot='rw') -> Pointer. Anonymous virtual-memory mapping with the given protection; the underlying OS backend is POSIX or Win32.
- **`vmem_free(...)`** -- vmem_free(ptr_or_address, n): release a vmem_alloc() mapping.
- **`vmem_protect(...)`** -- vmem_protect(ptr_or_address, n, prot): change page protection.

## `pylsrun.jit`

pylsrun.jit -- turn real x86-64 assembly into directly-callable native code.

assemble() shells out to the host `as`/`objcopy` (part of binutils, which
ships alongside any C/C++ toolchain) to assemble real assembly source into
raw machine code bytes; Executable then maps those bytes RW, copies them
in, and transitions the mapping to RX (the correct W^X-respecting
sequence) so you can call directly into it from Python.


### `class Executable`

```text
Executable(code: bytes)

Maps `code` (raw machine code for the host architecture) into RW memory,
copies it in, then transitions the mapping to RX and makes it directly
callable from Python with up to 6 integer arguments via the host's native
calling convention. Use pylsrun.jit.assemble() to produce `code` from real
assembly source for the host architecture.
```

- `Executable.address` (property)
- `Executable.call(...)` -- `call(*args) -> int`; jump into the mapped code with up to 6 integer args (native ABI).
- `Executable.free(...)` -- Explicitly release the mapping now.
- `Executable.size` (property)

### Module-level functions

- **`as_ctypes_function(...)`** -- Wrap an `Executable` address as a `ctypes` function.
- **`assemble(...)`** -- Assemble real x86-64 assembly source into raw machine-code bytes.
- **`assemble_and_load(...)`** -- Call `assemble()` and wrap the result in an `Executable`.

## `pylsrun.abi`

pylsrun.abi -- crossing the native ABI boundary.

    abi_info()      - what ABI this build targets
    call_sysv6()    - hand-written, register-level SysV AMD64 call (<=6 args)
    call_native()   - fully general call via libffi (any typecode combo,
                      including variadic functions)
    Library         - dlopen/dlsym/dlclose
    make_callback() - a real native function pointer that invokes a Python
                      callable (a libffi closure), for native code -- your
                      own JIT'd code included -- to call back into Python


### `class Callback`

```text
See pylsrun._native.Callback(...) factory docstring.
```

- `Callback.address` (property)

### `class Library`

```text
Library(path, mode='now')

A dlopen()'d shared library. symbol(name) resolves a function/variable
address via dlsym(); pass that address to call_native() or call_sysv6()
to actually invoke it. Keep the Library object alive for as long as any
address obtained from it might still be used.
```

- `Library.close(...)` -- Explicitly dlclose() this library now.
- `Library.symbol(...)` -- symbol(name) -> int address, via dlsym.
### Module-level functions

- **`abi_info(...)`** -- `abi_info() -> dict` describing this build's ABI.
- **`call_native(...)`** -- General native call via libffi; set `variadic_from` to the index of the first variadic argument for varargs functions.
- **`call_sysv6(...)`** -- Hand-written SysV AMD64 call with up to 6 integer/pointer args.
- **`calling_conventions_available(...)`** -- Report which named calling conventions are meaningful on this build.
- **`make_callback(...)`** -- Create a native callback pointer that invokes a Python callable.

## `pylsrun.atomics`

pylsrun.atomics -- atomic load/store/exchange/compare-exchange/fetch-op
directly on raw memory addresses (via C++20 std::atomic_ref), with all five
standard memory orderings: 'relaxed', 'acquire', 'release', 'acq_rel', 'seq_cst'.

Typecodes: i8 u8 i16 u16 i32 u32 i64 u64 f32 f64
(fetch_and/fetch_or/fetch_xor are integer-only; everything else also
supports f32/f64, per C++20's floating-point atomic support.)

- **`atomic_compare_exchange(...)`** -- atomic_compare_exchange(address, typecode, expected, desired, order='seq_cst') -> (success, actual_value).
- **`atomic_exchange(...)`** -- atomic_exchange(address, typecode, value, order='seq_cst') -> old_value.
- **`atomic_fetch_add(...)`** -- atomic_fetch_add(address, typecode, value, order='seq_cst') -> old_value.
- **`atomic_fetch_and(...)`** -- atomic_fetch_and(address, typecode, value, order='seq_cst') -> old_value (integer typecodes only).
- **`atomic_fetch_or(...)`** -- atomic_fetch_or(address, typecode, value, order='seq_cst') -> old_value (integer typecodes only).
- **`atomic_fetch_sub(...)`** -- atomic_fetch_sub(address, typecode, value, order='seq_cst') -> old_value.
- **`atomic_fetch_xor(...)`** -- atomic_fetch_xor(address, typecode, value, order='seq_cst') -> old_value (integer typecodes only).
- **`atomic_is_lock_free(...)`** -- atomic_is_lock_free(typecode) -> bool.
- **`atomic_load(...)`** -- atomic_load(address, typecode, order='seq_cst') -> value.
- **`atomic_store(...)`** -- atomic_store(address, typecode, value, order='seq_cst').

## `pylsrun.concurrency`

pylsrun.concurrency -- real C++ synchronization primitives: Mutex,
RecursiveMutex, SpinLock, RWLock, ConditionVariable, Semaphore, Barrier,
plus ThreadLocal (dynamically-creatable TLS slots) and NativeThread (runs a
native function pointer on a real std::thread, outside the interpreter).

Every blocking call releases the GIL for its duration, so a blocked native
wait never freezes the rest of the Python process.


### `class Barrier`

```text
Barrier(parties)

A real C++20 std::barrier for `parties` threads.
```

- `Barrier.arrive_and_drop(...)` -- Arrive and permanently reduce the expected party count by one.
- `Barrier.arrive_and_wait(...)` -- Arrive at the barrier and block (GIL released) until every party has arrived.

### `class ConditionVariable`

```text
ConditionVariable()

Pairs with a Mutex the caller already holds; see wait().
```

- `ConditionVariable.notify_all(...)` -- Wake every waiter.
- `ConditionVariable.notify_one(...)` -- Wake one waiter.
- `ConditionVariable.wait(...)` -- wait(mutex, timeout=None). `mutex` must already be locked by the caller; atomically unlocks it while waiting and relocks it before returning. Returns False on timeout, True otherwise.

### `class Mutex`

```text
Mutex()

A real std::mutex. Blocking lock() releases the GIL.
```

- `Mutex.lock(...)` -- Block (GIL released) until the mutex is acquired.
- `Mutex.try_lock(...)` -- Non-blocking acquire attempt -> bool.
- `Mutex.unlock(...)` -- Release the mutex.

### `class NativeThread`

```text
NativeThread(address, a0=0, a1=0, a2=0, a3=0)

Starts a real std::thread that calls the native function at `address` immediately (up to 4 integer args), entirely outside the Python interpreter. join() blocks (GIL released) and returns the function's return value.
```

- `NativeThread.detach(...)` -- Detach the thread to run independently.
- `NativeThread.join(...)` -- join() -> int. Blocks (GIL released) until the native thread finishes; returns its return value.
- `NativeThread.joinable(...)` -- bool: whether join()/detach() can still be called.

### `class RWLock`

```text
RWLock()

A real std::shared_mutex: many readers or one writer.
```

- `RWLock.lock_read(...)` -- Acquire shared (read) ownership.
- `RWLock.lock_write(...)` -- Acquire exclusive (write) ownership.
- `RWLock.try_lock_read(...)` -- Non-blocking shared acquire -> bool.
- `RWLock.try_lock_write(...)` -- Non-blocking exclusive acquire -> bool.
- `RWLock.unlock_read(...)` -- Release shared ownership.
- `RWLock.unlock_write(...)` -- Release exclusive ownership.

### `class RecursiveMutex`

```text
RecursiveMutex()

A real std::recursive_mutex.
```

- `RecursiveMutex.lock(...)` -- Block (GIL released) until acquired; re-entrant from the same thread.
- `RecursiveMutex.try_lock(...)` -- Non-blocking acquire attempt -> bool.
- `RecursiveMutex.unlock(...)` -- Release one level of recursive ownership.

### `class Semaphore`

```text
Semaphore(initial_count=0)

A real C++20 std::counting_semaphore.
```

- `Semaphore.acquire(...)` -- Block (GIL released) until a permit is available.
- `Semaphore.release(...)` -- release(n=1): add n permits.
- `Semaphore.try_acquire(...)` -- Non-blocking acquire attempt -> bool.

### `class SpinLock`

```text
SpinLock()

A busy-wait lock over std::atomic_flag; hold only briefly.
```

- `SpinLock.lock(...)` -- Busy-wait (GIL released) until acquired.
- `SpinLock.try_lock(...)` -- Single non-blocking attempt -> bool.
- `SpinLock.unlock(...)` -- Release the spinlock.

### `class ThreadLocal`

```text
ThreadLocal()

A dynamically-creatable thread-local storage slot (pthread_key_t/TlsAlloc), storing one pointer-sized integer per OS thread.
```

- `ThreadLocal.get(...)` -- get() -> int. Returns this thread's stored value, or 0 if this thread never called set().
- `ThreadLocal.set(...)` -- set(value: int). Stores a pointer-sized integer, independently, per calling OS thread.

## `pylsrun.ctime`

pylsrun.ctime -- the *dynamic* half of PylsRun's compile-time story.

pylsrun._native (see pylsrun.ctime_native re-exports below) already bakes a
handful of consteval/constexpr/template-computed constants directly into
the extension at ITS OWN build time. That covers fixed, known-in-advance
values.

This module covers the other case: evaluating an *arbitrary*, caller-supplied
C++ constant expression or struct definition, on demand, at run time -- by
writing a tiny real C++ translation unit, compiling it with a real host
compiler (g++ or clang++), running it, and parsing back what the compiler
computed. The computation itself is still done entirely by the C++ compiler;
this module is the plumbing that gets a question to the compiler and returns
the result. Probes are keyed by source hash: the compiled executable is kept
in a temporary cache directory, and the returned stdout is cached in-process
so repeated calls in the same process avoid rerunning the probe.

This is also literally the engine behind pylsrun.structs: struct field
offsets, total size, and alignment are never guessed or hand-computed --
they come from compiling a real struct definition and reading back
sizeof/alignof/offsetof, so they are exactly what your platform's C++
compiler would actually produce.


### `class FieldLayout`

```text
FieldLayout(name: 'str', offset: 'int', size: 'int', is_bitfield: 'bool' = False, bit_byte_offset: 'int' = 0, bit_nbytes: 'int' = 0, bit_mask: 'int' = 0, bit_shift: 'int' = 0)
```

- `FieldLayout.name` (property)
- `FieldLayout.offset` (property)
- `FieldLayout.size` (property)
- `FieldLayout.bit_byte_offset` (property)
- `FieldLayout.bit_mask` (property)
- `FieldLayout.bit_nbytes` (property)
- `FieldLayout.bit_shift` (property)
- `FieldLayout.is_bitfield` (property)

### `class StructLayout`

```text
StructLayout(size: 'int', align: 'int', fields: 'dict' = <factory>, cpp_source: 'str' = '')
```

- `StructLayout.size` (property)
- `StructLayout.align` (property)
- `StructLayout.fields` (property)
- `StructLayout.cpp_source` (property)

### Module-level functions

- **`alignof(...)`** -- `alignof(cpp_type)`, as computed by the real host compiler.
- **`crc32_table(...)`** -- 256-entry zlib-polynomial CRC32 table, computed in the native extension at C++ compile time.
- **`demo_struct_layout(...)`** -- Fixed demo struct's size/align/type-traits, evaluated by the native extension's compile-time C++ code.
- **`eval_constexpr(...)`** -- Evaluate a caller-supplied arithmetic expression as a genuine C++ `constexpr`.
- **`factorial_table(...)`** -- Factorial table for `0..15`, computed by a consteval C++ function at build time.
- **`fibonacci_30_via_template(...)`** -- The 30th Fibonacci number, computed via C++ class-template recursion at compile time.
- **`fibonacci_table(...)`** -- First 30 Fibonacci numbers, computed by a consteval C++ function at build time.
- **`mask_table(...)`** -- 65-entry bit-mask table computed at C++ compile time.
- **`probe_struct_layout(...)`** -- Compile a real C++ struct definition and read back its authoritative size, alignment, field offsets, and bitfield ranges.
- **`query_struct_layout(...)`** -- Public alias of `probe_struct_layout()` for simple callers.
- **`set_compiler(...)`** -- Force a specific compiler executable (default: auto-detect `g++`/`clang++`).
- **`sizeof(...)`** -- `sizeof(cpp_type)`, as computed by the real host compiler.
- **`static_assertions_passed(...)`** -- True only because the extension's build-time static assertions passed; a failed assertion prevents a successful build.

## `pylsrun.platform_info`

pylsrun.platform_info -- a single place to ask "what can this build actually do".

- **`has_feature(...)`** -- True if cpu.cpu_features() reports `name` as supported (e.g. 'avx2', 'avx512f', 'bmi1').
- **`platform_summary(...)`** -- OS, architecture, pointer width, endianness, compiler, and CPU features in one dict.
- **`require_feature(...)`** -- Raise PylsUnsupportedError if `name` is not supported on this CPU.

## `pylsrun.errors`

pylsrun.errors -- the PylsRun exception hierarchy.

All of these are defined natively (see csrc/pylsrun_module.cpp) so that C++
code can raise them directly; this module just gives them a documented,
stable Python import path.

    PylsRunError                 - base class for everything below
    +-- PylsUnsupportedError     - feature not available on this CPU/OS/build
    +-- PylsAllocationError      - allocator corruption, double-free, exhaustion
    +-- PylsABIError             - native-call / calling-convention failures


### `class PylsABIError`

```text
Raised for native-call / calling-convention failures.
```


### `class PylsAllocationError`

```text
Raised by the allocators for corruption, double-free, or exhaustion.
```


### `class PylsRunError`

```text
Base class for every PylsRun-specific exception.
```


### `class PylsUnsupportedError`

```text
Raised when a requested feature is not available on this CPU, OS, or build.
```
