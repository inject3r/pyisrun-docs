---
title: "Concurrency & Atomics"
description: "Atomics over raw memory, real C++ synchronization primitives, thread-local storage, and native threads."
order: 5
---

# Concurrency & Atomics

Modules: `pylsrun.atomics`, `pylsrun.concurrency`.

## Atomics over raw memory

No boxed "atomic object" type — atomicity applies directly to whatever
memory you already have, via C++20 `std::atomic_ref`:

```python
from pylsrun import atomics, memory

p = memory.malloc(8, elem_size=8)
atomics.atomic_store(p.address, "i64", 100)
old = atomics.atomic_fetch_add(p.address, "i64", 23)     # 100
atomics.atomic_load(p.address, "i64")                      # 123
ok, actual = atomics.atomic_compare_exchange(p.address, "i64", 123, 999)
atomics.atomic_load(p.address, "i64")                      # 999
memory.free(p)
```

Functions: `atomic_load` `atomic_store` `atomic_exchange`
`atomic_compare_exchange` (returns `(success, actual_value)`)
`atomic_fetch_add` `atomic_fetch_sub` (integer + float typecodes, per
C++20's floating-point atomic support) `atomic_fetch_and` `atomic_fetch_or`
`atomic_fetch_xor` (integer typecodes only) `atomic_is_lock_free(typecode)`.

All load/store/exchange/compare-exchange/fetch operations take `order=` — one
of `"relaxed"`, `"acquire"`, `"release"`, `"acq_rel"`, `"seq_cst"`
(default), mapping 1:1 onto `std::memory_order`.
`atomic_is_lock_free(typecode)` is the exception: it only takes the typecode.

## Concurrency primitives

Real C++ synchronization objects. **Every blocking call releases the
GIL** (`Py_BEGIN_ALLOW_THREADS`/`Py_END_ALLOW_THREADS`) for its duration,
so a blocked native wait never freezes the rest of the Python process.

```python
from pylsrun import concurrency

mu = concurrency.Mutex()
with mu:
    ...                      # or mu.lock() / mu.unlock() / mu.try_lock()

rec = concurrency.RecursiveMutex()   # same shape, re-entrant

sp = concurrency.SpinLock()          # busy-wait over std::atomic_flag; hold only briefly
sp.lock(); sp.unlock()

rw = concurrency.RWLock()            # std::shared_mutex
rw.lock_read(); rw.unlock_read()
rw.lock_write(); rw.unlock_write()

cv = concurrency.ConditionVariable()
with mu:
    cv.wait(mu)                        # atomically unlocks mu while waiting, relocks before returning
    cv.wait(mu, timeout=2.0)           # -> False on timeout
cv.notify_one(); cv.notify_all()

sem = concurrency.Semaphore(initial_count=0)
sem.release(1); sem.acquire(); sem.try_acquire()

barrier = concurrency.Barrier(parties=4)
barrier.arrive_and_wait()
```

`ConditionVariable.wait(mutex, ...)` requires `mutex` to be a
`pylsrun.concurrency.Mutex` **already locked by the caller** — it uses
`std::condition_variable_any` under the hood and follows the standard C++
wait/notify discipline exactly.

## Thread-local storage

```python
tls = concurrency.ThreadLocal()   # a dynamically-creatable TLS slot (pthread_key_t/TlsAlloc)
tls.set(some_int_or_address)       # independent storage per OS thread
tls.get()                           # -> int, 0 if this thread never called set()
```

Unlike C++'s `thread_local` keyword (a static declaration), `ThreadLocal`
is a real object you can create at runtime and pass around.

## Native threads

```python
nt = concurrency.NativeThread(address, a0, a1, ...)  # starts immediately, up to 4 int args
result = nt.join()      # blocks (GIL released), returns the function's return value
nt.detach()
nt.joinable()
```

Spawns a real `std::thread` that calls the native function at `address`
directly — entirely outside the Python interpreter once started (no
per-call GIL/bytecode overhead), unlike a `threading.Thread` running
Python code. Works with any native address: a JIT'd `Executable`, a
`Library` symbol, or anything else with a real calling-convention-
compatible signature.
