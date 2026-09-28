---
title: "Packaging & Builds"
description: "setup.py vs CMakeLists.txt, debug builds, and how the wheel gets built."
order: 3
---

# Packaging & Builds

## Two build paths

`setup.py` (setuptools + a standard `Extension`) is the primary, tested
build path. `CMakeLists.txt` mirrors the same `csrc/` sources for direct CMake
builds and is not itself a `scikit-build-core` project.

```bash
# setuptools
pip install .

# CMake
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
# Linux example: install/place the resulting platform-specific extension
# according to your Python environment and platform.
```

## Release vs debug builds

Release (the default) compiles with `-O3 -DNDEBUG`. Setting
`PYLSRUN_DEBUG=1` switches to `-O0 -g -fsanitize=address,undefined
-fno-omit-frame-pointer` instead:

```bash
PYLSRUN_DEBUG=1 pip install . --no-build-isolation
```

This is the real tool for chasing a bug that might involve PylsRun's raw
pointer APIs — see [Debugging](/docs/0.1.0/debugging/index).

## What actually gets linked

- `libffi` — for `call_native`, `Library`, and `make_callback`
- `pthread` — for the concurrency primitives and `NativeThread` (POSIX
  builds; Windows link libraries differ, see
  [Platform Support](/docs/0.1.0/advanced/platform-support))
- `dl` — for `dlopen`/`dlsym`/`dlclose` on POSIX (via
  `platform_compat.cpp`)

`setup.py` and `CMakeLists.txt` both branch on the host OS to pick the
right set automatically.

## Producing a wheel or sdist

```bash
python3 setup.py sdist bdist_wheel
```

produces both a source distribution and a platform wheel in `dist/`. Only
a Linux x86-64 wheel is built by the tooling in this repository — see
[Platform Support](/docs/0.1.0/advanced/platform-support) for what
building on another platform would and wouldn't need to change.

## Package metadata

Project metadata (name, version, classifiers) lives in `setup.py`;
`pyproject.toml` only declares the build backend
(`setuptools.build_meta`) and pytest's test path, to avoid the two files
disagreeing with each other.
