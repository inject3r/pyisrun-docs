---
title: "Assembly, JIT & ABI"
description: "Runtime assembly execution, hand-written and libffi-based native calls, and callbacks."
order: 4
---

# Assembly, JIT & ABI

Modules: `pylsrun.jit`, `pylsrun.abi`.

## Runtime assembly, assembled and executed at runtime

```python
from pylsrun import jit

code = jit.assemble("""
    mov rax, rdi
    add rax, rsi
    ret
""")
exe = jit.Executable(code)
exe.call(2, 40)   # 42
exe.free()
```

`assemble()` shells out to the host `as`/`objcopy` (binutils) — real GNU
assembler, real machine code, not a hand-rolled mini-assembler with a
limited instruction subset. `syntax="intel"` (default) or `"att"`.
Comments use `#`, not `;` (`;` separates instructions on one line in GAS).

`Executable(code_bytes)` maps the bytes RW, copies them in, then
transitions the mapping to RX — the correct W^X-respecting order — and
`.call(*args)` jumps directly into it with up to 6 integer/pointer
arguments via the System V AMD64 calling convention (because that's what
the C compiler's own function-pointer-cast-and-call codegen produces for
that arity). `.address`, `.size`, `.free()`, and context-manager support
are all available. For more than 6 arguments, or non-integer argument
types, use `abi.call_native()` against the same `.address` instead.

`pylsrun.jit.as_ctypes_function(exe, restype=..., argtypes=...)` wraps an
`Executable`'s address as a `ctypes` callable. This is an interop convenience;
PylsRun's own `abi.call_native()` also supports struct arguments and returns
by value through libffi when the struct is described as a list of typecodes.

Instruction-cache synchronization is a documented no-op on x86-64 (the
icache is kept coherent with the dcache by hardware after an ordinary
write + permission change) — `vmem.flush_icache()` exists for API symmetry
with architectures (ARM) where it would matter, but does nothing here.

## ABI info

```python
from pylsrun import abi
abi.abi_info()
# returns arch / os / calling_convention / pointer_size /
# little_endian / compiler for the current native build
```

## Hand-written calling convention control (no libffi)

```python
import pylsrun as pr

libc = abi.Library("libc.so.6")
strlen_addr = libc.symbol("strlen")
buf = pr.memory.malloc(16)
buf.write_bytes(b"hello\x00")
abi.call_sysv6(strlen_addr, buf.address)   # 5
```

`call_sysv6(address, a0..a5)` moves each argument into the exact SysV AMD64
argument register (`rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`) via inline
assembly with every operand forced through memory (so GCC's register
allocator can't collide with the hand-picked registers), then `call`s.
This is literally manual ABI control, not "trust the compiler's cast" —
compare with `Executable.call()` above, which *does* trust the compiler.

## General native calls (libffi)

```python
libm = abi.Library("libm.so.6")
cos_addr = libm.symbol("cos")
abi.call_native(cos_addr, ["f64"], [0.0], ret_typecode="f64")   # 1.0
```

`call_native(address, arg_typecodes, args, ret_typecode="i64",
variadic_from=-1)` supports any combination of the native typecodes (see
the Memory & Pointers guide) as arguments/return, plus `void`. Set
`variadic_from` to the index of the first variadic argument to call a
varargs C function correctly (uses `ffi_prep_cif_var`).

### Struct arguments and return values, by value

Any entry in `arg_typecodes`/`ret_typecode` can be a **list of typecodes**
instead of a single string — that describes a struct passed/returned BY
VALUE, member types in order (nestable, for a struct-within-a-struct).
libffi computes the real ABI layout (size, alignment, register/stack
classification) for that member list itself, using the same algorithm the
actual calling convention uses — so this isn't a guess. A struct argument
is any exact-size bytes-like object (`pylsrun.structs`' own
`StructView.raw_bytes()` is the natural source); a struct return comes
back as a plain `bytes` object.

```python
import struct as pystruct
libc = abi.Library("libc.so.6")
div_addr = libc.symbol("div")
# div_t div(int numer, int denom) -> struct { int quot; int rem; }
result = abi.call_native(div_addr, ["i32", "i32"], [17, 5], ret_typecode=["i32", "i32"])
quot, rem = pystruct.unpack("<ii", result)   # (3, 2)
```

## Calling-convention introspection

```python
abi.calling_conventions_available()
# returns the conventions exposed by the current build/libffi combination
```

`stdcall`/`thiscall`/`fastcall` are 32-bit x86 concepts — on 64-bit x86
there is exactly one calling convention per OS (SysV AMD64 on Linux/macOS,
Microsoft x64 on Windows), so those three are always `False` here, not
because libffi lacks them, but because this library targets 64-bit only.

## Shared libraries

Library names are platform-specific; the `.so` names below are Linux examples. The `Library` API itself uses the host platform dynamic-loader implementation.

```python
lib = abi.Library("libsomething.so", mode="now")   # or mode="lazy"
addr = lib.symbol("some_function")
lib.close()   # or use `with abi.Library(...) as lib:`
```

Keep the `Library` object alive for as long as any address obtained from it
might still be called — `dlclose()` on `__del__`/`close()` unmaps the code.

## Native-to-Python callbacks

```python
def handler(a, b):
    return a + b

cb = abi.make_callback(handler, ["i64", "i64"], "i64")
cb.address   # a real, callable native function pointer (libffi closure)
abi.call_native(cb.address, ["i64", "i64"], [10, 32], ret_typecode="i64")  # 42
```

`make_callback` allocates a libffi closure (`ffi_prep_closure_loc`) whose
trampoline, when called by *any* native code — a C library expecting a
callback, or your own JIT'd assembly — acquires the GIL
(`PyGILState_Ensure`/`Release`) and invokes your Python callable. Up to 6
arguments. Exceptions raised inside the callable are printed and cleared
(matching `ctypes`' own callback semantics), then a zeroed value is
returned to the native caller — exceptions cannot safely propagate through
arbitrary native call frames.

## Platform notes

This repository only exercises the SysV AMD64 convention on Linux x86-64.
`abi_call.cpp` is structured with `#ifdef _WIN32`/`#ifdef __aarch64__`
branch points for MS x64 / AArch64 ABIs (and thus `stdcall`/`fastcall`
where libffi would support them on those platforms), but none of that has
been compiled or tested here — see the top-level README's "Platform
support" section.
