# PylsRun Documentation Website

This is the documentation website for **PylsRun** — a systems-programming
library for Python, implemented entirely in C++: raw pointers, compiler-
verified struct layouts, SIMD, real inline-assembly JIT execution, native
ABI calls, atomics, and concurrency.

## Repository

Library source code: [github.com/pylsrun/pylsrun](https://github.com/pylsrun/pylsrun)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Documentation structure

Docs live in `content/docs/<version>/` as Markdown files with YAML
frontmatter (`title`, `description`, `order`). The sidebar navigation is
generated automatically from that folder structure — add a new `.md` file
and it appears in the sidebar with no extra registration step. See
`lib/docs.ts` for exactly how categories are ordered and labeled.

## Build

```bash
npm run build
```

## Brand assets

`public/logo.svg` / `app/icon.svg` is the source-of-truth mark (a pulse
waveform in a violet → cyan gradient — "Pyls" as in "pulse"). The raster
assets (`app/favicon.ico`, `app/apple-icon.png`, `public/logo.jpg`) are
rendered from that same SVG.

## License

MIT
