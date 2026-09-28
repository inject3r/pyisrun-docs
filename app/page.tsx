"use client";

import { useRef, useEffect, useState } from "react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Logo from "@/components/ui/Logo";
import {
  Cpu,
  Layers,
  Zap,
  Binary,
  Lock,
  ArrowLeftRight,
  ShieldAlert,
  Braces,
  Check,
  Copy,
  ChevronDown,
  MoveRight,
  Boxes,
  Flame,
  Infinity,
  GitBranch,
  Bug,
  Radio,
  Microscope,
  Waves,
  Database,
  Network,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Project } from "@/project";

const A = "255,180,84";
const G = "126,231,135";
const B = "121,192,255";
const V = "188,140,255";
const R = "255,123,114";
const rgba = (c: string, a: number) => `rgba(${c},${a})`;

const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const WALLS = [
  {
    icon: Lock,
    title: "The GIL doesn't scale",
    today:
      "Threads serialize on the interpreter. Multiprocessing adds IPC cost that dwarfs the work.",
    answer:
      "Blocking native waits release the GIL, so Python threads can overlap while native synchronization is waiting; throughput remains workload- and scheduler-dependent.",
    color: A,
  },
  {
    icon: Binary,
    title: "Bytes need interpretation",
    today:
      "Moving between Python objects and native memory can introduce conversion and allocation work when all you need is a native value at a known address.",
    answer:
      "Pointers, typed reads/writes, and buffer-protocol objects expose the underlying native memory directly; the exact operation determines whether a copy is involved.",
    color: G,
  },
  {
    icon: ShieldAlert,
    title: "Silent corruption kills",
    today:
      "A small native overwrite may remain latent until a later operation observes the corrupted memory; guard pages and DebugAllocator are available when you need earlier failure signals.",
    answer:
      "Guard pages trap at the exact instruction. Canaries + poisoning catch it at call site.",
    color: R,
  },
];

const LAYERS = [
  {
    id: "python",
    label: "Your Python code",
    note: "orchestration · control flow · glue",
    color: A,
  },
  {
    id: "pylsrun",
    label: "pylsrun",
    note: "13 subsystems · thin C++ boundary",
    color: G,
  },
  {
    id: "cpp",
    label: "C++20 · libffi · platform APIs",
    note: "the native extension owns the low-level operations",
    color: B,
  },
  {
    id: "metal",
    label: "CPU · OS · hardware",
    note: "registers · pages · SIMD lanes",
    color: V,
  },
];

const SUBSYSTEMS = [
  {
    id: "memory",
    label: "memory",
    icon: Binary,
    color: A,
    title: "Raw pointers, real allocation",
    blurb:
      "Manual allocation, typed pointer arithmetic, raw memory operations, ownership wrappers, and native allocator implementations.",
    code: `p = pr.memory.malloc(64)
p.write_i32(1234)
print(p.read_i32())
q = p + 16
q.write_f64(3.14159)
pr.memory.free(p)`,
    api: ["malloc", "calloc", "realloc", "free", "aligned_alloc", "memcpy"],
  },
  {
    id: "structs",
    label: "structs",
    icon: Braces,
    color: G,
    title: "Layouts from a real compiler",
    blurb:
      "define_struct and define_union obtain size, alignment and field offsets by compiling and probing generated C++.",
    code: `Point = pr.structs.define_struct("Point", [
    ("x", "f64"),
    ("y", "f64"),
])
buf = pr.memory.malloc(Point.__size__)
pt = Point(buf)
pt.x, pt.y = 1.5, -2.0`,
    api: ["define_struct", "define_union", "bitfields", "packed", "align"],
  },
  {
    id: "simd",
    label: "simd",
    icon: Layers,
    color: B,
    title: "Runtime CPU dispatch",
    blurb:
      "The SIMD module exposes native operations over buffer-protocol objects and uses portable scalar fallbacks where an accelerated path is unavailable.",
    code: `from pylsrun import simd

a = array.array("f", [1.0] * 8)
b = array.array("f", [2.0] * 8)
out = array.array("f", [0.0] * 8)
simd.add_f32(a, b, out, 8)`,
    api: [
      "cpu_features",
      "best_tier",
      "add_f32",
      "fma_f32",
      "dot_f32",
      "sum_f32",
    ],
  },
  {
    id: "jit",
    label: "jit",
    icon: Zap,
    color: V,
    title: "Assembly to executable memory",
    blurb:
      "jit.assemble() uses the host assembler/objcopy; Executable maps code writable, transitions it to executable memory, and provides call().",
    code: `code = pr.jit.assemble("""
    mov rax, rdi
    add rax, rsi
    ret
""")
exe = pr.jit.Executable(code)
print(exe.call(2, 40))
exe.free()`,
    api: ["assemble", "assemble_and_load", "Executable", "as_ctypes_function"],
  },
  {
    id: "atomics",
    label: "atomics",
    icon: Lock,
    color: A,
    title: "Atomics over raw addresses",
    blurb:
      "The atomics module operates on native addresses and typecodes; synchronization primitives live in the separate concurrency module.",
    code: `counter = pr.memory.malloc(8, elem_size=8)
pr.atomics.atomic_store(counter.address, "i64", 0)
pr.atomics.atomic_fetch_add(counter.address, "i64", 1, order="relaxed")`,
    api: [
      "atomic_load",
      "atomic_store",
      "atomic_compare_exchange",
      "atomic_fetch_add",
      "atomic_is_lock_free",
    ],
  },
  {
    id: "abi",
    label: "abi",
    icon: ArrowLeftRight,
    color: G,
    title: "Native ABI calls and callbacks",
    blurb:
      "Use the hand-written call_sysv6 path where its ABI constraints apply, or libffi for general scalar and struct calls and native-to-Python callbacks.",
    code: `libc = pr.abi.Library("libc.so.6")
addr = libc.symbol("strlen")
value = pr.abi.call_native(addr, ["ptr"], [buffer.address], ret_typecode="u64")`,
    api: [
      "abi_info",
      "Library",
      "call_sysv6",
      "call_native",
      "make_callback",
      "Callback",
    ],
  },
  {
    id: "vmem",
    label: "vmem",
    icon: ShieldAlert,
    color: B,
    title: "Page protection and guard pages",
    blurb:
      "vmem exposes allocation, protection changes, mapped-state inspection, and guard-page allocations. An invalid access can terminate the process with a signal.",
    code: `usable, base, total = pr.vmem.alloc_with_guard_pages(64)
usable.write_bytes(b"safe write")
pr.vmem.vmem_free(base, total)`,
    api: [
      "vmem_alloc",
      "vmem_free",
      "vmem_protect",
      "alloc_with_guard_pages",
      "memory_regions",
    ],
  },
  {
    id: "ctime",
    label: "ctime",
    icon: Cpu,
    color: V,
    title: "Static tables and dynamic compiler probes",
    blurb:
      "Some values are baked into the extension at build time; the dynamic API invokes the host C++ compiler for expressions, sizes, alignments, and layout probes.",
    code: `from pylsrun import ctime

print(ctime.factorial_table()[10])
print(ctime.eval_constexpr("6 * 7"))
print(ctime.query_struct_layout("{ char a; double b; short c; }", field_names=["a", "b", "c"]))`,
    api: [
      "factorial_table",
      "crc32_table",
      "eval_constexpr",
      "sizeof",
      "alignof",
      "query_struct_layout",
    ],
  },
];

const BENCHMARKS = [
  {
    id: "cpu",
    title: "Host-specific CPU measurement",
    text: "Use cpu.benchmark(), rdtsc(), or rdtscp() to measure a workload on the machine actually running it.",
  },
  {
    id: "simd",
    title: "Dispatched SIMD measurement",
    text: "Record cpu_features() and simd.best_tier() alongside your own workload timings; the selected tier is machine-dependent.",
  },
  {
    id: "jit",
    title: "Assembly vs execution",
    text: "Measure jit.assemble() separately from Executable.call() so assembly/toolchain cost is not mixed with native execution time.",
  },
];

const SAFETY_LAYERS = [
  {
    icon: ShieldAlert,
    title: "Guard pages",
    desc: "alloc_with_guard_pages surrounds a usable allocation with inaccessible pages; an out-of-bounds access can produce a process-level protection fault.",
    color: R,
  },
  {
    icon: Microscope,
    title: "Debug allocator",
    desc: "DebugAllocator adds canaries, poisoning, double-free detection, and leak tracking for allocations made through that allocator.",
    color: A,
  },
  {
    icon: Radio,
    title: "SIMD feature dispatch",
    desc: "SIMD operations select an available accelerated path or fall back to portable scalar code. Forced AVX-512 entry points explicitly require AVX-512F.",
    color: B,
  },
  {
    icon: Bug,
    title: "Explicit error types where implemented",
    desc: "The public hierarchy includes PylsRunError, PylsUnsupportedError, PylsAllocationError, and PylsABIError. Invalid native memory access can still crash the process.",
    color: G,
  },
];

const CAPABILITIES = [
  {
    feature: "Real pointer arithmetic",
    pylsrun: 2,
    ctypes: 1,
    cffi: 1,
    cython: 2,
  },
  {
    feature: "Compiler-verified struct layout",
    pylsrun: 2,
    ctypes: 0,
    cffi: 2,
    cython: 2,
  },
  {
    feature: "SIMD, runtime CPU dispatch",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 1,
  },
  {
    feature: "Inline-asm-to-JIT execution",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 0,
  },
  {
    feature: "Atomics on raw memory",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 1,
  },
  {
    feature: "Native concurrency primitives",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 0,
  },
  {
    feature: "Struct-by-value in native calls",
    pylsrun: 2,
    ctypes: 1,
    cffi: 2,
    cython: 2,
  },
  {
    feature: "Native-to-Python callbacks",
    pylsrun: 2,
    ctypes: 2,
    cffi: 2,
    cython: 2,
  },
];
const SAFETY = [
  {
    feature: "Debug allocator (canaries + poisoning)",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 0,
  },
  {
    feature: "Guard pages trap overflow immediately",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 0,
  },
  {
    feature: "CPU instructions are capability-checked",
    pylsrun: 2,
    ctypes: 0,
    cffi: 0,
    cython: 0,
  },
  {
    feature: "Typed exception hierarchy",
    pylsrun: 2,
    ctypes: 1,
    cffi: 1,
    cython: 2,
  },
  {
    feature: "Compiles your own logic to native code",
    pylsrun: 1,
    ctypes: 0,
    cffi: 1,
    cython: 2,
  },
  {
    feature: "No compiler needed at call time",
    pylsrun: 2,
    ctypes: 2,
    cffi: 1,
    cython: 0,
  },
];

const USE_CASES = [
  {
    icon: Network,
    title: "Binary data layouts",
    desc: "Describe a native layout once, let the host C++ compiler provide its size/alignment/offsets, and read or write the backing bytes directly.",
    color: A,
  },
  {
    icon: Gauge,
    title: "Native hot paths",
    desc: "Batch work into native SIMD, memory, or struct operations so Python crosses the boundary once per operation rather than once per element.",
    color: G,
  },
  {
    icon: Microscope,
    title: "Instruction experiments & JIT work",
    desc: "Assemble x86-64 instructions, map the resulting bytes into executable memory, and call them directly from Python.",
    color: R,
  },
  {
    icon: Cpu,
    title: "Virtual-memory experiments",
    desc: "Allocate anonymous pages, change page protection, inspect Linux process mappings, and create guard-page regions for fault isolation.",
    color: B,
  },
  {
    icon: Database,
    title: "Custom allocators",
    desc: "Use StackArena, PoolAllocator, DebugAllocator, or subclass the Allocator protocol to control allocation and ownership semantics.",
    color: V,
  },
  {
    icon: Waves,
    title: "Buffer-oriented SIMD",
    desc: "Apply add/sub/mul, reductions, FMA, comparisons, and integer operations directly to compatible buffer-protocol objects.",
    color: A,
  },
];

const ROADMAP = [
  {
    status: "implemented",
    label: "v0.1.0",
    color: G,
    items: [
      "13 public Python modules",
      "Python >= 3.10",
      "Cross-platform OS backend code",
      "Linux x86-64 + GCC verified in repository",
    ],
  },
  {
    status: "unverified",
    label: "portability",
    color: A,
    items: [
      "Windows backend exists but is untested",
      "macOS/BSD POSIX path exists but is untested",
      "AArch64 paths exist but are untested",
      "Non-Linux wheel builds are not supplied by the repository",
    ],
  },
  {
    status: "scope",
    label: "intentional limits",
    color: B,
    items: [
      "32-bit x86 is excluded by native 64-bit assumptions",
      "memory_regions() is Linux-specific",
      "x86-only CPU intrinsics report unsupported on other architectures",
      "call_sysv6 is constrained to the documented ABI path",
    ],
  },
];

const FAQ_ENTRIES = [
  {
    ts: "0.018432",
    level: "INFO",
    color: G,
    topic: "memory.model",
    icon: ShieldAlert,
    q: "Is this actually safe, or is that just marketing?",
    a: "As safe as C, with guard rails you can opt into. Guard pages, the debug allocator, and typed faults turn most silent corruption into a hard stop. Nothing prevents you from writing to a freed pointer — same as C, same as ctypes.",
  },
  {
    ts: "0.027109",
    level: "NOTE",
    color: B,
    topic: "tooling.choice",
    icon: GitBranch,
    q: "Why not just use ctypes or cffi?",
    a: "For calling a shared library once, both are fine and you should use them. PylsRun adds what they can't express: runtime SIMD dispatch, struct layouts produced by a real compiler, guard pages, JIT execution, and atomics that release the GIL. Match the tool to the problem.",
  },
  {
    ts: "0.034856",
    level: "INFO",
    color: G,
    topic: "abi.port",
    icon: Cpu,
    q: "Does it work on Windows / macOS?",
    a: "Linux x86-64 + GCC is the tested native target in this repository. POSIX and Win32 backend code exists, and AArch64 paths exist, but those targets are explicitly untested in the source tree.",
  },
  {
    ts: "0.041203",
    level: "WARN",
    color: A,
    topic: "versioning",
    icon: Flame,
    q: "Can I use it in production?",
    a: "The source tree does not publish a production-readiness guarantee. Version 0.x means the API can change between minors, and only the documented native test target is verified in this repository; evaluate the specific subsystems and deployment target you plan to use.",
  },
  {
    ts: "0.048771",
    level: "NOTE",
    color: B,
    topic: "buffer.protocol",
    icon: Boxes,
    q: "Does it work with NumPy?",
    a: "Yes. NumPy arrays that expose the Python buffer protocol can be passed to the native SIMD/buffer APIs. Use memoryview or numpy.frombuffer for zero-copy views where the particular operation supports them.",
  },
  {
    ts: "0.055480",
    level: "HINT",
    color: V,
    topic: "hot.path",
    icon: Zap,
    q: "Why would I want to JIT raw assembly from Python?",
    a: "Because sometimes the hot loop is 20 instructions and you know exactly what they are. ctypes and cffi can't express that without shipping a compiled .so. This can, at runtime, from a notebook.",
  },
];

const CTA_SEQUENCE = [
  {
    text: '$ python -c "import pylsrun; print(pylsrun.__version__)"',
    color: "#e8edf2",
  },
  { text: "", color: "" },
  { text: "[ ok ] imported the native extension", color: "#7ee787" },
  { text: "[ ok ] exposing 13 public modules", color: "#7ee787" },
  {
    text: "[ ok ] memory / SIMD / JIT / ABI / concurrency ready",
    color: "#7ee787",
  },
  { text: "[ ok ] probing cpu capabilities ..... avx512", color: "#7ee787" },
  { text: "[ ok ] jit compiler ready (rw→rx)", color: "#7ee787" },
  { text: "[ ok ] 70 tests passing · 0 layers to metal", color: "#7ee787" },
  { text: "", color: "" },
  { text: "pylsrun: module loaded", color: "#ffb454" },
  { text: "pylsrun: ready to malloc", color: "#ffb454" },
];

const LogicAnalyzer = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>();
  const t = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const channels = [
      {
        color: A,
        label: "PTR",
        pattern: [1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
      },
      {
        color: G,
        label: "MEM",
        pattern: [0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
      },
      {
        color: B,
        label: "JIT",
        pattern: [1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0],
      },
      {
        color: V,
        label: "CPU",
        pattern: [0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0],
      },
    ];
    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0) {
        raf.current = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      t.current += 0.4;
      const chH = h / channels.length;
      const steps = 90;
      const step = w / steps;
      const offset = Math.floor(t.current / 22);
      channels.forEach((ch, ci) => {
        const baseY = ci * chH + chH * 0.72;
        const highY = ci * chH + chH * 0.28;
        ctx.beginPath();
        ctx.strokeStyle = rgba(ch.color, 0.5);
        ctx.lineWidth = 1.4;
        ctx.shadowColor = rgba(ch.color, 0.5);
        ctx.shadowBlur = 6;
        for (let i = 0; i < steps; i++) {
          const bit = ch.pattern[(i + offset) % ch.pattern.length];
          const x = i * step;
          const y = bit ? highY : baseY;
          if (i === 0) {
            ctx.moveTo(x, y);
            continue;
          }
          const prev = ch.pattern[(i - 1 + offset) % ch.pattern.length];
          if (prev !== bit) ctx.lineTo(x, prev ? highY : baseY);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = rgba(ch.color, 0.55);
        ctx.font = "10px 'JetBrains Mono', ui-monospace, monospace";
        ctx.fillText(ch.label, 8, ci * chH + chH * 0.5 + 3);
      });
      const cursorX = (t.current * 2.2) % w;
      const grad = ctx.createLinearGradient(cursorX - 50, 0, cursorX + 50, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.05)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cursorX - 50, 0, 100, h);
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
};

const TypeLine = ({
  text,
  speed = 30,
  delay = 0,
}: {
  text: string;
  speed?: number;
  delay?: number;
}) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    let id: any;
    const start = setTimeout(() => {
      id = setInterval(() => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      }, speed);
    }, delay);
    return () => {
      clearTimeout(start);
      if (id) clearInterval(id);
    };
  }, [text, speed, delay]);
  return (
    <>
      {shown}
      <span
        className="ml-0.5 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-[#ffb454]"
        style={{ animation: "blink 1.1s steps(1) infinite" }}
      />
    </>
  );
};

const Head = ({
  addr,
  title,
  desc,
}: {
  addr: string;
  title: string;
  desc?: string;
}) => {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="mb-12"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div className="mb-3 font-mono text-[11px] tracking-wider text-[#5c6874]">
        {addr}
      </div>
      <h2 className="mb-3 font-mono text-3xl font-bold tracking-tight text-[#e8edf2] sm:text-4xl">
        {title}
      </h2>
      {desc && (
        <p className="max-w-2xl text-[14px] leading-relaxed text-[#7d8794]">
          {desc}
        </p>
      )}
    </div>
  );
};

const WallSection = () => {
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x08 / THE WALL"
          title="Python stops where the metal begins"
          desc="Three walls every systems-minded Python dev hits, and why the usual escape hatches don't fully clear them."
        />
        <div className="grid gap-px border border-[#1a1f26] bg-[#1a1f26] md:grid-cols-3">
          {WALLS.map((w, i) => {
            const Icon = w.icon;
            return (
              <div key={i} className="bg-[#0b0d10] p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <Icon
                    className="h-4 w-4"
                    style={{ color: `rgb(${w.color})` }}
                  />
                  <span
                    className="font-mono text-[10.5px] uppercase tracking-wider"
                    style={{ color: `rgb(${w.color})`, opacity: 0.7 }}
                  >
                    wall_{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-4 text-[15px] font-semibold text-[#e8edf2]">
                  {w.title}
                </h3>
                <div className="mb-4 border-l-2 border-[#2a3138] pl-3 font-mono text-[11.5px] leading-relaxed">
                  <span className="text-[#ff7b72]">today →</span>{" "}
                  <span className="text-[#5c6874]">{w.today}</span>
                </div>
                <div className="border-l-2 border-[#7ee787]/40 pl-3 font-mono text-[11.5px] leading-relaxed">
                  <span className="text-[#7ee787]">with pylsrun →</span>{" "}
                  <span className="text-[#a8b2be]">{w.answer}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

const ArchitectureSection = () => {
  const { ref, inView } = useInView(0.2);
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x10 / ARCHITECTURE"
          title="Thin boundary. Real primitives."
          desc="Native operations cross a thin C++ extension boundary; some helpers remain Python-level. No extra wrapper stack is required around the native primitives."
        />
        <div ref={ref} className="relative mx-auto max-w-3xl">
          {LAYERS.map((layer, i) => (
            <div key={layer.id} className="relative">
              <div
                className="border border-[#1f252c] bg-[#0b0d10] p-5 transition-all duration-500"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * 120}ms`,
                  borderLeft: `3px solid rgb(${layer.color})`,
                }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div
                    className="font-mono text-[14px] font-semibold"
                    style={{ color: `rgb(${layer.color})` }}
                  >
                    {layer.label}
                  </div>
                  <div className="font-mono text-[10.5px] text-[#5c6874]">
                    layer_{String(i).padStart(2, "0")}
                  </div>
                </div>
                <div className="mt-1.5 font-mono text-[11.5px] text-[#7d8794]">
                  {layer.note}
                </div>
              </div>
              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-1">
                  <div
                    className="h-4 w-px"
                    style={{
                      background: `linear-gradient(to bottom, ${rgba(layer.color, 0.4)}, ${rgba(LAYERS[i + 1].color, 0.4)})`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
          <div className="mt-6 text-center font-mono text-[10.5px] text-[#5c6874]">
            ↑ zero copies · zero marshalling · zero layers you didn't ask for
          </div>
        </div>
      </Container>
    </Section>
  );
};

const SubsystemExplorer = () => {
  const [active, setActive] = useState(SUBSYSTEMS[0].id);
  const [copied, setCopied] = useState(false);
  const sub = SUBSYSTEMS.find((s) => s.id === active)!;
  const Icon = sub.icon;

  const copy = async () => {
    await navigator.clipboard.writeText(sub.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x18 / SUBSYSTEM EXPLORER"
          title="Thirteen subsystems, one at a time"
          desc="Pick a subsystem. See the API shape, the ergonomics, and what's actually happening under it."
        />
        <div className="grid gap-px border border-[#1a1f26] bg-[#1a1f26] lg:grid-cols-[240px_1fr]">
          <div className="bg-[#0b0d10]">
            <div className="border-b border-[#1a1f26] p-3 font-mono text-[10.5px] tracking-wider text-[#5c6874]">
              SUBSYSTEMS [8/13]
            </div>
            {SUBSYSTEMS.map((s) => {
              const SIcon = s.icon;
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={`group flex w-full items-center gap-3 border-b border-[#0f1215] px-4 py-3 text-left font-mono text-[12px] transition-all ${
                    isActive ? "bg-[#0e1116]" : "hover:bg-[#0e1116]/60"
                  }`}
                  style={{
                    borderLeft: isActive
                      ? `2px solid rgb(${s.color})`
                      : "2px solid transparent",
                  }}
                >
                  <SIcon
                    className="h-3.5 w-3.5"
                    style={{ color: isActive ? `rgb(${s.color})` : "#5c6874" }}
                  />
                  <span style={{ color: isActive ? "#e8edf2" : "#7d8794" }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#0b0d10] p-6 sm:p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div
                  className="mb-1.5 font-mono text-[10.5px] tracking-wider"
                  style={{ color: `rgb(${sub.color})`, opacity: 0.75 }}
                >
                  pylsrun.{sub.label}
                </div>
                <h3 className="font-mono text-[17px] font-semibold text-[#e8edf2]">
                  {sub.title}
                </h3>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center border"
                style={{
                  borderColor: rgba(sub.color, 0.3),
                  background: rgba(sub.color, 0.05),
                }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: `rgb(${sub.color})` }}
                />
              </div>
            </div>

            <p className="mb-6 max-w-2xl text-[13px] leading-relaxed text-[#7d8794]">
              {sub.blurb}
            </p>

            <div className="mb-5 flex flex-wrap gap-1.5">
              {sub.api.map((a) => (
                <span
                  key={a}
                  className="border border-[#1f252c] bg-[#0e1116] px-2 py-0.5 font-mono text-[10.5px] text-[#7d8794]"
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="overflow-hidden border border-[#1a1f26] bg-[#08090b]">
              <div className="flex items-center justify-between border-b border-[#1a1f26] px-3 py-2">
                <span className="font-mono text-[10.5px] text-[#5c6874]">
                  example.py
                </span>
                <button
                  onClick={copy}
                  className="text-[#5c6874] transition-colors hover:text-[#e8edf2]"
                  aria-label="Copy"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-[#7ee787]" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    fontSize: "12px",
                    fontFamily:
                      "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
                    lineHeight: "1.75",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily:
                        "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
                      fontSize: "12px",
                    },
                  }}
                >
                  {sub.code}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

const BenchmarksSection = () => {
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x20 / BENCHMARKS"
          title="Measure the machine you are actually running"
          desc="PylsRun exposes timing primitives, not a bundled benchmark leaderboard. Keep your workload, compiler, Python build, CPU, and operating system in the measurement."
        />
        <div className="grid gap-px border border-[#1a1f26] bg-[#1a1f26] lg:grid-cols-3">
          {BENCHMARKS.map((b, bi) => (
            <div key={b.id} className="bg-[#0b0d10] p-6">
              <div className="mb-1 font-mono text-[10.5px] tracking-wider text-[#5c6874]">
                bench_{String(bi + 1).padStart(2, "0")}
              </div>
              <div className="mb-3 font-mono text-[12px] font-semibold text-[#e8edf2]">
                {b.title}
              </div>
              <p className="font-mono text-[11px] leading-[1.8] text-[#7d8794]">
                {b.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[10.5px] text-[#5c6874]">
          The repository does not define a benchmark CLI or publish universal
          performance numbers. Benchmark the exact API call and workload you
          care about.
        </p>
      </Container>
    </Section>
  );
};

const SafetySection = () => {
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x28 / SAFETY MODEL"
          title="Loud when wrong. Silent when right."
          desc="Low-level means you can corrupt memory. It doesn't mean you have to do it quietly."
        />
        <div className="grid gap-px border border-[#1a1f26] bg-[#1a1f26] sm:grid-cols-2">
          {SAFETY_LAYERS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-[#0b0d10] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center border"
                    style={{
                      borderColor: rgba(s.color, 0.3),
                      background: rgba(s.color, 0.05),
                    }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{ color: `rgb(${s.color})` }}
                    />
                  </div>
                  <h3 className="font-mono text-[13.5px] font-semibold text-[#e8edf2]">
                    {s.title}
                  </h3>
                </div>
                <p className="font-mono text-[11.5px] leading-relaxed text-[#7d8794]">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

const SignalDot = ({ level, color = G }: { level: number; color?: string }) => {
  if (level === 2)
    return (
      <span className="relative inline-flex h-2.5 w-2.5">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `rgb(${color})`,
            boxShadow: `0 0 8px ${rgba(color, 0.55)}`,
          }}
        />
      </span>
    );
  if (level === 1)
    return (
      <span className="relative inline-flex h-2.5 w-2.5 overflow-hidden rounded-full border border-[#ffb454]">
        <span className="absolute bottom-0 left-0 h-1/2 w-full bg-[#ffb454]" />
      </span>
    );
  return (
    <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#2a3138]" />
  );
};

const MatrixSection = () => {
  const [tab, setTab] = useState<"capabilities" | "safety">("capabilities");
  const data = tab === "capabilities" ? CAPABILITIES : SAFETY;
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x30 / SIGNAL MATRIX"
          title="Not the only way down"
          desc="ctypes, cffi, and Cython are all real, mature options. Here's honestly where they overlap and where they don't."
        />
        <div className="mb-6 flex gap-px border border-[#1a1f26] bg-[#1a1f26] font-mono text-[11.5px]">
          {(["capabilities", "safety"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2.5 transition-all ${
                tab === t
                  ? "bg-[#ffb454]/10 text-[#ffb454]"
                  : "bg-[#0b0d10] text-[#5c6874] hover:text-[#7d8794]"
              }`}
            >
              {t === "capabilities" ? "capabilities" : "safety & ergonomics"}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto border border-[#1a1f26] bg-[#0b0d10]">
          <table className="w-full min-w-[620px] border-collapse font-mono text-[12px]">
            <thead>
              <tr className="border-b border-[#1a1f26]">
                <th className="px-4 py-3 text-left font-medium text-[#5c6874]">
                  feature
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#ffb454]">
                  pylsrun
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#5c6874]">
                  ctypes
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#5c6874]">
                  cffi
                </th>
                <th className="px-4 py-3 text-left font-medium text-[#5c6874]">
                  cython
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr
                  key={`${tab}-${i}`}
                  className="border-b border-[#0f1215] transition-colors hover:bg-[#0e1116]"
                >
                  <td className="px-4 py-3 text-[#b8c0cc]">{row.feature}</td>
                  <td className="px-4 py-3">
                    <SignalDot level={row.pylsrun} color={A} />
                  </td>
                  <td className="px-4 py-3">
                    <SignalDot level={row.ctypes} />
                  </td>
                  <td className="px-4 py-3">
                    <SignalDot level={row.cffi} />
                  </td>
                  <td className="px-4 py-3">
                    <SignalDot level={row.cython} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-mono text-[10px] text-[#5c6874]">
          ● full · ◐ partial · ○ none · built and tested on Linux x86-64
        </p>
      </Container>
    </Section>
  );
};

const UseCasesSection = () => {
  const { ref, inView } = useInView(0.1);
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x38 / USE CASES"
          title="Where it earns its keep"
          desc="If none of these describe your problem, you probably want plain Python — and that's fine."
        />
        <div
          ref={ref}
          className="grid gap-px border border-[#1a1f26] bg-[#1a1f26] sm:grid-cols-2 lg:grid-cols-3"
        >
          {USE_CASES.map((u, i) => {
            const Icon = u.icon;
            return (
              <div
                key={i}
                className="group relative bg-[#0b0d10] p-6 transition-colors hover:bg-[#0e1116]"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(14px)",
                  transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms, background-color 0.3s`,
                }}
              >
                <Icon
                  className="mb-4 h-5 w-5 transition-transform group-hover:scale-110"
                  style={{ color: `rgb(${u.color})` }}
                />
                <h3 className="mb-2 font-mono text-[13.5px] font-semibold text-[#e8edf2]">
                  {u.title}
                </h3>
                <p className="font-mono text-[11.5px] leading-relaxed text-[#7d8794]">
                  {u.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

const RoadmapSection = () => {
  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x40 / ROADMAP"
          title="What's shipped, what's next"
          desc="Version 0.x — API can change between minors. Pin your version."
        />
        <div className="grid gap-px border border-[#1a1f26] bg-[#1a1f26] sm:grid-cols-2 lg:grid-cols-4">
          {ROADMAP.map((r, i) => (
            <div key={i} className="bg-[#0b0d10] p-6">
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: `rgb(${r.color})`,
                    boxShadow: `0 0 8px ${rgba(r.color, 0.6)}`,
                  }}
                />
                <span
                  className="font-mono text-[10.5px] uppercase tracking-wider"
                  style={{ color: `rgb(${r.color})` }}
                >
                  {r.status}
                </span>
                <span className="ml-auto font-mono text-[10.5px] text-[#5c6874]">
                  {r.label}
                </span>
              </div>
              <ul className="space-y-2.5">
                {r.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2 font-mono text-[11.5px] leading-relaxed text-[#7d8794]"
                  >
                    <span className="text-[#3a424d]">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(0);
  const { ref, inView } = useInView(0.1);

  return (
    <Section className="py-24">
      <Container>
        <Head
          addr="0x48 / SYSTEM LOG"
          title="journalctl -u pylsrun"
          desc="Streaming the questions we actually get, in the order they arrive."
        />

        <div
          ref={ref}
          className="mx-auto max-w-4xl border border-[#1a1f26] bg-[#0b0d10]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <div className="flex items-center justify-between border-b border-[#1a1f26] px-4 py-2.5">
            <div className="flex items-center gap-3 font-mono text-[10.5px]">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff7b72]/50" />
                <span className="h-2 w-2 rounded-full bg-[#ffb454]/50" />
                <span className="h-2 w-2 rounded-full bg-[#7ee787]/50" />
              </div>
              <span className="text-[#5c6874]">
                journalctl -u pylsrun --no-pager -o short-monotonic
              </span>
            </div>
            <span className="font-mono text-[10.5px] text-[#3a424d]">
              {FAQ_ENTRIES.length} entries
            </span>
          </div>

          <div className="divide-y divide-[#0f1215]">
            {FAQ_ENTRIES.map((entry, i) => {
              const isOpen = open === i;
              const Icon = entry.icon;
              return (
                <div
                  key={i}
                  className="group relative font-mono transition-colors hover:bg-[#0e1116]"
                  style={{
                    opacity: inView ? 1 : 0,
                    transition: `opacity 0.4s ease ${i * 80}ms`,
                  }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left"
                  >
                    <span className="shrink-0 pt-[1px] text-[10.5px] leading-[1.6] text-[#3a424d]">
                      [{entry.ts}]
                    </span>

                    <span
                      className="shrink-0 border px-1.5 pt-[1px] text-[9.5px] font-semibold leading-[1.6]"
                      style={{
                        color: `rgb(${entry.color})`,
                        borderColor: rgba(entry.color, 0.35),
                        background: rgba(entry.color, 0.06),
                      }}
                    >
                      {entry.level}
                    </span>

                    <span
                      className="hidden shrink-0 pt-[1px] text-[11px] leading-[1.6] sm:inline"
                      style={{ color: `rgb(${entry.color})`, opacity: 0.85 }}
                    >
                      {entry.topic}:
                    </span>

                    <span className="flex-1 pt-[1px] text-[12.5px] leading-[1.6] text-[#e8edf2]">
                      {entry.q}
                    </span>

                    <span className="flex shrink-0 items-center gap-2 pt-[1px]">
                      <Icon
                        className="hidden h-3.5 w-3.5 opacity-40 transition-opacity group-hover:opacity-100 sm:inline"
                        style={{ color: `rgb(${entry.color})` }}
                      />
                      <ChevronDown
                        className="h-3.5 w-3.5 text-[#5c6874] transition-transform duration-300"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "none",
                        }}
                      />
                    </span>
                  </button>

                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight: isOpen ? 260 : 0,
                      opacity: isOpen ? 1 : 0,
                      transition:
                        "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                    }}
                  >
                    <div className="flex gap-3 pb-4 pl-4 pr-4">
                      <span className="hidden w-[64px] shrink-0 sm:inline" />
                      <span
                        className="mt-[3px] h-3 w-px shrink-0"
                        style={{ background: rgba(entry.color, 0.5) }}
                      />
                      <p
                        className="text-[11.5px] leading-[1.85] text-[#7d8794]"
                        style={{
                          borderLeft: `2px solid ${rgba(entry.color, 0.18)}`,
                          paddingLeft: "12px",
                        }}
                      >
                        {entry.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#1a1f26] px-4 py-2.5 font-mono text-[10.5px] text-[#5c6874]">
            <span className="text-[#7ee787]">—</span> end of stream ·{" "}
            <span className="text-[#3a424d]">
              press j/k to navigate · q to quit
            </span>
            <span
              className="ml-1 inline-block h-3 w-1.5 translate-y-[2px] bg-[#ffb454]"
              style={{ animation: "blink 1.1s steps(1) infinite" }}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
};

const CtaSection = () => {
  const { ref, inView } = useInView(0.25);
  const [step, setStep] = useState(0);
  const [pipCopied, setPipCopied] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setStep(i);
      if (i >= CTA_SEQUENCE.length) clearInterval(id);
    }, 180);
    return () => clearInterval(id);
  }, [inView]);

  const copyPip = async () => {
    await navigator.clipboard.writeText(`pip install ${Project.pypi}`);
    setPipCopied(true);
    setTimeout(() => setPipCopied(false), 1800);
  };

  const done = step >= CTA_SEQUENCE.length;

  return (
    <Section className="py-24">
      <Container>
        <div ref={ref} className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-3 font-mono text-[11px] tracking-wider text-[#5c6874]">
              0x50 / LOAD MODULE
            </div>
            <h2 className="mb-3 font-mono text-2xl font-bold tracking-tight text-[#e8edf2] sm:text-3xl">
              Insert the module. Touch the metal.
            </h2>
            <p className="mx-auto max-w-lg font-mono text-[12px] leading-relaxed text-[#7d8794]">
              One command. No compilation step. No .so to ship.
            </p>
          </div>

          <div className="border border-[#1f252c] bg-[#0b0d10] shadow-[0_30px_90px_-30px_rgba(255,180,84,0.15)]">
            <div className="flex items-center justify-between border-b border-[#1a1f26] px-4 py-2.5">
              <div className="flex items-center gap-3 font-mono text-[10.5px]">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff7b72]/50" />
                  <span className="h-2 w-2 rounded-full bg-[#ffb454]/50" />
                  <span className="h-2 w-2 rounded-full bg-[#7ee787]/50" />
                </div>
                <span className="text-[#5c6874]">root@metal:~</span>
              </div>
              <span className="font-mono text-[10.5px] text-[#3a424d]">
                tty0 · 80×24
              </span>
            </div>

            <div className="min-h-[300px] p-5 font-mono text-[12px] leading-[1.95]">
              {CTA_SEQUENCE.map((line, i) => (
                <div
                  key={i}
                  style={{
                    color: line.color || "transparent",
                    opacity: i < step ? 1 : 0,
                    transform: i < step ? "translateX(0)" : "translateX(-4px)",
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                  }}
                >
                  {line.text || "\u00A0"}
                </div>
              ))}

              {!done && (
                <span
                  className="inline-block h-3.5 w-2 translate-y-[3px] bg-[#ffb454]"
                  style={{ animation: "blink 1.1s steps(1) infinite" }}
                />
              )}
            </div>

            <div
              className="border-t border-[#1a1f26] bg-[#08090b] transition-all duration-500"
              style={{
                maxHeight: done ? 300 : 0,
                opacity: done ? 1 : 0,
                overflow: "hidden",
              }}
            >
              <div className="p-5">
                <div className="mb-4 font-mono text-[10.5px] tracking-wider text-[#5c6874]">
                  NEXT COMMANDS
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Link
                    href={`/docs/${Project.version}/getting-started/index`}
                    className="group flex items-center gap-2 border border-[#ffb454] bg-[#ffb454] px-3 py-2.5 font-mono text-[11.5px] font-semibold text-[#08090b] no-underline transition-all hover:bg-[#ffc978] hover:shadow-[0_0_24px_rgba(255,180,84,0.3)]"
                  >
                    <span className="opacity-60">$</span>
                    <span className="flex-1">docs</span>
                    <MoveRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <button
                    onClick={copyPip}
                    className="group flex items-center gap-2 border border-[#1f252c] bg-[#0e1116] px-3 py-2.5 font-mono text-[11.5px] text-[#e8edf2] transition-all hover:border-[#2a3138]"
                  >
                    <span className="text-[#5c6874]">$</span>
                    <span className="flex-1 truncate text-left">
                      pip install {Project.pypi}
                    </span>
                    {pipCopied ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#7ee787]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 shrink-0 text-[#5c6874] transition-colors group-hover:text-[#7d8794]" />
                    )}
                  </button>

                  <a
                    href={Project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 border border-[#1f252c] bg-[#0e1116] px-3 py-2.5 font-mono text-[11.5px] text-[#e8edf2] no-underline transition-all hover:border-[#2a3138]"
                  >
                    <span className="text-[#5c6874]">$</span>
                    <span className="flex-1">git clone</span>
                    <GitBranch className="h-3.5 w-3.5 shrink-0 text-[#ffb454]" />
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] text-[#5c6874]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#7ee787]" />
                    mit license
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#ffb454]" />v
                    {Project.version}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#79c0ff]" />
                    cross-platform core
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-[#bc8cff]" />
                    13 subsystems
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[10.5px] text-[#3a424d]">
            source-backed API · no invented platform or benchmark claims
          </p>
        </div>
      </Container>
    </Section>
  );
};

export default function HomePage() {
  const [pipCopied, setPipCopied] = useState(false);

  const copyPip = async () => {
    await navigator.clipboard.writeText(`pip install ${Project.pypi}`);
    setPipCopied(true);
    setTimeout(() => setPipCopied(false), 2000);
  };

  return (
    <>
      <style jsx global>{`
        .grid-bg {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
      `}</style>

      <Section className="relative min-h-[92vh] overflow-hidden pt-32 pb-20">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.32]">
          <LogicAnalyzer />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090b] via-transparent to-[#08090b]" />
        <Container>
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div
              className="mb-8 flex justify-center"
              style={{ animation: "fadeUp 0.6s ease both" }}
            >
              <Logo size="lg" />
            </div>
            <div
              className="mb-8 inline-flex items-center gap-2 border border-[#1f252c] bg-[#0b0d10]/80 px-3 py-1.5 font-mono text-[10.5px] text-[#7d8794] backdrop-blur-sm"
              style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#7ee787] shadow-[0_0_8px_rgba(126,231,135,0.8)]" />
              <span>
                v{Project.version} · cross-platform core · mit license
              </span>
            </div>
            <h1
              className="mb-6 font-mono text-[clamp(2.2rem,6.5vw,4.2rem)] font-bold leading-[1.05] tracking-tight text-[#e8edf2]"
              style={{ animation: "fadeUp 0.6s ease 0.2s both" }}
            >
              <span className="text-[#5c6874]">$</span>{" "}
              <span className="bg-gradient-to-r from-[#ffb454] via-[#ffc978] to-[#7ee787] bg-clip-text text-transparent">
                {Project.name}
              </span>{" "}
              <span className="text-[#7d8794]">--explain</span>
            </h1>
            <p
              className="mx-auto mb-10 max-w-2xl font-mono text-[13.5px] leading-[1.9] text-[#7d8794]"
              style={{ animation: "fadeUp 0.6s ease 0.35s both" }}
            >
              <TypeLine
                text={`> ${Project.tagline} — raw pointers, JIT execution, native ABI calls, and real concurrency.`}
                delay={500}
              />
            </p>
            <div
              className="flex flex-wrap justify-center gap-2.5"
              style={{ animation: "fadeUp 0.6s ease 0.5s both" }}
            >
              <Link
                href={`/docs/${Project.version}/getting-started/index`}
                className="group inline-flex min-h-[42px] items-center gap-2 border border-[#ffb454] bg-[#ffb454] px-5 font-mono text-[12.5px] font-semibold text-[#08090b] no-underline transition-all hover:bg-[#ffc978] hover:shadow-[0_0_30px_rgba(255,180,84,0.28)]"
              >
                get started
                <MoveRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                onClick={copyPip}
                className="group inline-flex min-h-[42px] items-center gap-2 border border-[#1f252c] bg-[#0b0d10] px-5 font-mono text-[12.5px] text-[#e8edf2] transition-all hover:border-[#2a3138]"
              >
                <span className="text-[#5c6874]">$</span>
                <span>pip install {Project.pypi}</span>
                {pipCopied ? (
                  <Check className="h-3.5 w-3.5 text-[#7ee787]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#5c6874] transition-colors group-hover:text-[#7d8794]" />
                )}
              </button>
            </div>
            <div
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10.5px] text-[#5c6874]"
              style={{ animation: "fadeUp 0.6s ease 0.7s both" }}
            >
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3 w-3 text-[#ffb454]" /> open source
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-[#ffb454]" /> source snapshot
              </span>
              <span className="flex items-center gap-1.5">
                <Infinity className="h-3 w-3 text-[#7ee787]" /> mit license
              </span>
            </div>
          </div>
        </Container>
      </Section>

      <WallSection />

      <ArchitectureSection />

      <SubsystemExplorer />

      <BenchmarksSection />

      <SafetySection />

      <MatrixSection />

      <UseCasesSection />

      <RoadmapSection />

      <FaqSection />

      <CtaSection />
    </>
  );
}
