---
title: "Installation"
description: "Build PylsRun from source, or install a debug build with ASan/UBSan."
order: 2
---

# Installation

## Tested requirements

- Linux, x86-64 (the only environment currently built and tested; see
  [Platform Support](/docs/0.1.0/advanced/platform-support) for other targets)
- Python ≥ 3.10
- A C++20 compiler: GCC ≥ 11 or Clang ≥ 14
- `libffi` development headers (`libffi-dev` / `libffi-devel`)
- `binutils` (`as`, `objcopy`) — needed only for `pylsrun.jit.assemble()`

All of the above are standard on any Linux box that already has a C/C++
toolchain installed.

## Install

```bash
pip install .
```

or, from a prebuilt wheel if one is available for your platform:

```bash
pip install pylsrun
```

### Debug build (AddressSanitizer / UndefinedBehaviorSanitizer)

```bash
PYLSRUN_DEBUG=1 pip install . --no-build-isolation
```

Use this when chasing a bug that might involve PylsRun's raw-pointer
APIs — ASan/UBSan catches buffer overflows, use-after-free, and undefined
behavior far more precisely than reading a segfault backtrace. See
[Safety & Performance](/docs/0.1.0/advanced/safety-and-performance).

### Editable install (for development)

```bash
pip install -e . --no-build-isolation
```

### Alternate build: CMake

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
# Linux example: install/place the resulting platform-specific extension
# according to your Python environment and platform.
```

`setup.py` is the primary, tested build path. `CMakeLists.txt` mirrors the
same native sources for direct CMake builds; it is not itself a scikit-build
project.

## Verify

```python
import pylsrun as pr
print(pr.__version__)
print(pr.platform_info.platform_summary()["arch"])
```

## Next steps

- **[Quick Start](/docs/0.1.0/getting-started/quick-start)** — pointers, a
  struct, and JIT-compiled assembly in under twenty lines.
- **[Package Layout](/docs/0.1.0/getting-started/package-layout)** — how
  the package is organized.
