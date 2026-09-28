---
title: "The Buffer System"
description: "Zero-copy MemBlock, the Python buffer protocol, and memoryview/NumPy interoperability."
order: 7
---

# The Buffer System

Module: `pylsrun.buffers` (re-exports `MemBlock` from the native extension).

`MemBlock` implements CPython's buffer protocol (`bf_getbuffer`/
`bf_releasebuffer`) directly in C++. `memoryview(block)` and — if NumPy is
installed — `numpy.frombuffer(block)` can view the same underlying memory
without a staging copy; `bytes(block)` is an explicit copy into a new Python
`bytes` object.

## Owning vs. non-owning

```python
from pylsrun import buffers

# Owning: allocates and (eventually) frees its own memory
mb = buffers.MemBlock(1024)

# Non-owning: a zero-copy VIEW over memory you already have
view = buffers.MemBlock.from_buffer(some_bytearray)          # any buffer-protocol object
view2 = buffers.MemBlock.from_pointer(some_pointer, length=64)  # [UNSAFE] raw address, no lifetime tracking
```

`from_buffer` keeps a strong reference to the source object for as long as
the `MemBlock` view exists, so the source can't be garbage-collected out
from under it. `from_pointer` has no such safety net — exactly like
casting a raw pointer in C, the caller is asserting the range stays valid.

## Reading, writing, slicing

```python
mb[0]              # single byte as int (0-255)
mb[0] = 65          # write a single byte
mb[0:8]             # slice -> another MemBlock, a ZERO-COPY view into the same memory
mb.to_bytes()        # copy out as bytes
mb.to_bytearray()     # copy out as bytearray
mb.fill(0)             # memset
len(mb)
mb.address             # int, address of byte 0
mb.writable             # bool
mb.owns_memory          # bool
mb.pointer()             # -> Pointer(elem_size=1) to byte 0
mb.free()                 # explicitly release an OWNING block now (also happens on GC)
```

Writing through a slice writes through to the parent (it's the same
memory, not a copy) — this is deliberate and matches how a real pointer
slice/subrange would behave.

## memoryview / NumPy interop

```python
mv = memoryview(mb)          # zero-copy
mv[0:4] = b"data"

import numpy as np           # entirely optional; only imported if you do
arr = np.frombuffer(mb, dtype=np.uint8)   # also zero-copy
```

## Safety

Requesting a writable buffer view (`PyBUF_WRITABLE`, which `memoryview()`
does by default for a writable object) on a read-only `MemBlock` raises
`BufferError`, not silent read-only-ness. `free()` on an owning block
raises if a `memoryview` onto it is still open, to avoid a dangling view.
