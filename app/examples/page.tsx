"use client";

import Link from "next/link";
import { Binary, Braces, Cpu, Zap, ArrowLeftRight, Clock3, ShieldAlert, FileCode2, ExternalLink } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { Project } from "@/project";

const EXAMPLES = [
  {
    title: "Pointers and memory",
    level: "beginner",
    icon: Binary,
    path: "examples/01_pointers_and_memory.py",
    summary: "Raw allocation, typed reads and writes, pointer arithmetic, and manual release.",
    code: `import pylsrun as pr\n\np = pr.memory.malloc(64)\np.write_i32(1234)\nprint(p.read_i32())\npr.memory.free(p)`,
  },
  {
    title: "Compiler-verified struct layout",
    level: "beginner",
    icon: Braces,
    path: "examples/02_struct_layout.py",
    summary: "Structs, arrays, bitfields, nested structs, and unions backed by a real C++ layout probe.",
    code: `Point = pr.structs.define_struct(\n    "Point", [("x", "f32"), ("y", "f32")]\n)\nbuf = pr.memory.malloc(Point.__size__)\npt = Point(buf)\npt.x, pt.y = 1.5, -2.0`,
  },
  {
    title: "SIMD dispatch and arithmetic",
    level: "intermediate",
    icon: Cpu,
    path: "examples/03_simd_avx.py",
    summary: "Runtime CPU feature detection, buffer-based SIMD arithmetic, reductions, FMA, comparisons, and integer operations.",
    code: `import array\nfrom pylsrun import simd\n\na = array.array("f", range(16))\nb = array.array("f", [10.0] * 16)\nout = array.array("f", [0.0] * 16)\nsimd.add_f32(a, b, out, 16)`,
  },
  {
    title: "Inline assembly and JIT",
    level: "advanced",
    icon: Zap,
    path: "examples/04_inline_asm_and_jit.py",
    summary: "Assemble host assembly, map it RW→RX, execute it, and inspect CPU registers and timestamp counters.",
    code: `from pylsrun import jit\n\ncode = jit.assemble("""\n    mov rax, rdi\n    add rax, rsi\n    ret\n""")\nexe = jit.Executable(code)\nprint(exe.call(10, 5))\nexe.free()`,
  },
  {
    title: "ABI calls and callbacks",
    level: "advanced",
    icon: ArrowLeftRight,
    path: "examples/05_abi_and_calling_convention.py",
    summary: "Hand-written SysV calls, general libffi calls into shared libraries, and native-to-Python callbacks. The shown library name is a Linux example.",
    code: `from pylsrun import abi\n\n# Linux example\nlibc = abi.Library("libc.so.6")\naddr = libc.symbol("strlen")\n\n# call_native can describe scalar arguments with typecodes.\nresult = abi.call_native(addr, ["ptr"], [buffer_ptr], ret_typecode="u64")`,
  },
  {
    title: "Compile-time C++ oracle",
    level: "intermediate",
    icon: Clock3,
    path: "examples/06_compile_time_constexpr.py",
    summary: "Use static tables baked into the extension and dynamic host-compiler probes such as eval_constexpr, sizeof, and layout queries.",
    code: `from pylsrun import ctime\n\nprint(ctime.factorial_table()[10])\nprint(ctime.eval_constexpr("6 * 7"))\nprint(ctime.sizeof("double"))\nprint(ctime.alignof("long double"))`,
  },
  {
    title: "Atomics, concurrency, and virtual memory",
    level: "advanced",
    icon: ShieldAlert,
    path: "examples/07_atomics_concurrency_vmem.py",
    summary: "Atomics over raw addresses, native synchronization primitives, page protection, guard pages, and Linux /proc maps.",
    code: `from pylsrun import atomics, concurrency, vmem\n\natomics.atomic_fetch_add(\n    counter.address, "i64", 1, order="relaxed"\n)\nmu = concurrency.Mutex()\nregion = vmem.vmem_alloc(4096, prot="rw")`,
  },
];

export default function ExamplesPage() {
  return (
    <Section className="min-h-screen bg-[#08090b] pt-28 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5c6874]">
            examples / v{Project.version}
          </div>
          <h1 className="font-mono text-4xl font-bold tracking-tight text-[#e8edf2] sm:text-5xl">
            Source-backed examples
          </h1>
          <p className="mt-5 font-mono text-sm leading-7 text-[#7d8794]">
            These entries map directly to the seven Python example files shipped in the
            library repository. No extra APIs or hypothetical integrations are shown here.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {EXAMPLES.map((example, index) => {
            const Icon = example.icon;
            return (
              <article key={example.path} className="border border-[#1a1f26] bg-[#0b0d10] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center border border-[#2a3138] bg-[#0e1116]">
                      <Icon className="h-4 w-4 text-[#ffb454]" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-[#5c6874]">
                        {String(index + 1).padStart(2, "0")} · {example.level}
                      </div>
                      <h2 className="mt-1 font-mono text-base font-semibold text-[#e8edf2]">
                        {example.title}
                      </h2>
                    </div>
                  </div>
                  <a
                    href={`${Project.repo}/blob/main/${example.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-[#7d8794] hover:text-[#e8edf2]"
                  >
                    source <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-4 font-mono text-[11.5px] leading-6 text-[#7d8794]">{example.summary}</p>
                <pre className="mt-4 overflow-x-auto border border-[#1a1f26] bg-[#08090b] p-4 font-mono text-[11px] leading-6 text-[#b8c0cc]">
                  <code>{example.code}</code>
                </pre>
                <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-[#5c6874]">
                  <FileCode2 className="h-3 w-3" />
                  <span>{example.path}</span>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
