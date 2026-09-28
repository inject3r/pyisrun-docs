import Link from "next/link";
import { ArrowLeftRight, Boxes, Code2, Cpu, MemoryStick, TerminalSquare } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { Project } from "@/project";

const SURFACES = [
  {
    icon: MemoryStick,
    title: "Python buffer protocol",
    text: "MemBlock exposes a native buffer. memoryview(block), bytes(block), and buffer consumers such as NumPy can operate on it; slicing returns zero-copy views.",
    code: `import numpy as np\nfrom pylsrun import memory\n\nblock = memory.malloc(1024)\nview = memoryview(block)\narr = np.frombuffer(block, dtype=np.uint8)`,
  },
  {
    icon: ArrowLeftRight,
    title: "ctypes-compatible function addresses",
    text: "JIT Executable objects expose an address, and as_ctypes_function turns an Executable into a callable ctypes function pointer.",
    code: `import ctypes\nfrom pylsrun import jit\n\nexe = jit.Executable(code)\nfn = jit.as_ctypes_function(exe, restype=ctypes.c_long)`,
  },
  {
    icon: Boxes,
    title: "Shared libraries through libffi",
    text: "abi.Library resolves symbols from a shared library; call_native describes arguments with PylsRun typecodes and calls the function through libffi. The shown library name is a Linux example.",
    code: `from pylsrun import abi\n\n# Linux example\nlib = abi.Library("libm.so.6")\nsqrt = lib.symbol("sqrt")\nvalue = abi.call_native(sqrt, ["f64"], [2.0], ret_typecode="f64")`,
  },
  {
    icon: Cpu,
    title: "SIMD over buffer-protocol objects",
    text: "Native SIMD entry points accept buffer-protocol objects directly, including array.array, bytearray, MemBlock, and compatible NumPy arrays.",
    code: `import array\nfrom pylsrun import simd\n\na = array.array("f", [1.0] * 8)\nb = array.array("f", [2.0] * 8)\nout = array.array("f", [0.0] * 8)\nsimd.add_f32(a, b, out, 8)`,
  },
  {
    icon: TerminalSquare,
    title: "Host compiler integration",
    text: "The compile-time subsystem can query the host C++ compiler for constexpr expressions, type sizes, alignments, and struct layouts. It does not provide a general C++ kernel compiler API.",
    code: `from pylsrun import ctime\n\nanswer = ctime.eval_constexpr("6 * 7")\nsize = ctime.sizeof("double")\nalignment = ctime.alignof("long double")`,
  },
  {
    icon: Code2,
    title: "Python threading + native synchronization",
    text: "The native concurrency primitives can be used from Python threading.Thread. Blocking native synchronization calls release the GIL; NativeThread is also available for native function pointers.",
    code: `import threading\nfrom pylsrun import concurrency\n\nmu = concurrency.Mutex()\n\nwith mu:\n    # protect shared native memory\n    pass`,
  },
];

export default function IntegrationsPage() {
  return (
    <Section className="min-h-screen bg-[#08090b] pt-28 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5c6874]">
            interoperability / v{Project.version}
          </div>
          <h1 className="font-mono text-4xl font-bold tracking-tight text-[#e8edf2] sm:text-5xl">
            Real integration surfaces
          </h1>
          <p className="mt-5 font-mono text-sm leading-7 text-[#7d8794]">
            This page lists interfaces that are present in the source tree. It does not
            imply official integrations with third-party frameworks that are not shipped here.
          </p>
          <div className="mt-5 border border-[#332a1d] bg-[#0e1116] px-4 py-3 font-mono text-[11px] leading-6 text-[#b8c0cc]">
            Cross-platform code paths exist for POSIX and Windows, but the repository states
            that native builds are only verified on Linux x86-64; non-Linux/non-x86 targets are untested.
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {SURFACES.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="border border-[#1a1f26] bg-[#0b0d10] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center border border-[#2a3138] bg-[#0e1116]">
                    <Icon className="h-4 w-4 text-[#7ee787]" />
                  </div>
                  <h2 className="font-mono text-base font-semibold text-[#e8edf2]">{item.title}</h2>
                </div>
                <p className="mt-4 font-mono text-[11.5px] leading-6 text-[#7d8794]">{item.text}</p>
                <pre className="mt-4 overflow-x-auto border border-[#1a1f26] bg-[#08090b] p-4 font-mono text-[11px] leading-6 text-[#b8c0cc]">
                  <code>{item.code}</code>
                </pre>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 font-mono text-[11px]">
          <Link className="border border-[#1f252c] px-3 py-2 text-[#b8c0cc] hover:border-[#2a3138]" href={`/docs/${Project.version}/core-concepts/buffers`}>
            buffers
          </Link>
          <Link className="border border-[#1f252c] px-3 py-2 text-[#b8c0cc] hover:border-[#2a3138]" href={`/docs/${Project.version}/core-concepts/assembly-and-abi`}>
            assembly + ABI
          </Link>
          <Link className="border border-[#1f252c] px-3 py-2 text-[#b8c0cc] hover:border-[#2a3138]" href={`/docs/${Project.version}/core-concepts/compile-time`}>
            compile-time
          </Link>
        </div>
      </Container>
    </Section>
  );
}
