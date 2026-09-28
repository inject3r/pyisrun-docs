import Link from "next/link";
import { Gauge, Info, TerminalSquare } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { Project } from "@/project";

const AREAS = [
  { title: "CPU timer utilities", text: "pylsrun.cpu exposes rdtsc(), rdtscp(), and benchmark() for host-specific measurement." },
  { title: "SIMD", text: "Measure the actual selected tier on the machine under test. best_tier() reports the dispatch tier; individual operations may have narrower requirements." },
  { title: "ABI calls", text: "Compare call_sysv6 and call_native only on the ABI and host compiler combination being tested." },
  { title: "Allocators", text: "Benchmark malloc/free, StackArena, PoolAllocator, and DebugAllocator separately because their semantics and safety instrumentation differ." },
  { title: "Concurrency", text: "Measure Mutex, SpinLock, RWLock, Semaphore, Barrier, and atomic operations under a workload that matches the target contention pattern." },
  { title: "JIT", text: "Separate assembly time from execution time: jit.assemble() invokes the host assembler/objcopy, while Executable.call() measures the mapped native code path." },
];

const EXAMPLE = `from pylsrun import cpu\n\ndef workload():\n    # perform the operation you actually care about\n    return sum(i * i for i in range(1000))\n\nprint(cpu.benchmark(workload, iterations=10_000))`;

export default function BenchmarksPage() {
  return (
    <Section className="min-h-screen bg-[#08090b] pt-28 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5c6874]">benchmarking / methodology</div>
          <h1 className="font-mono text-4xl font-bold tracking-tight text-[#e8edf2] sm:text-5xl">Measure your host, not a made-up baseline</h1>
          <p className="mt-5 font-mono text-sm leading-7 text-[#7d8794]">
            No benchmark numbers from a particular CPU, OS, Python build, or competitor were retained here because
            the repository does not ship a reproducible benchmark dataset. The page documents the real measurement surfaces instead.
          </p>
        </div>

        <div className="mt-10 border border-[#332a1d] bg-[#0e1116] p-5">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb454]" />
            <p className="font-mono text-[11px] leading-6 text-[#7d8794]">
              Results are machine-dependent. CPU frequency, compiler flags, available SIMD features,
              allocator state, OS scheduling, and Python version all affect timings. PylsRun has no built-in
              <code className="mx-1 text-[#b8c0cc]">pylsrun bench</code> command in the current source tree.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => (
            <article key={area.title} className="border border-[#1a1f26] bg-[#0b0d10] p-5">
              <Gauge className="h-4 w-4 text-[#7ee787]" />
              <h2 className="mt-3 font-mono text-sm font-semibold text-[#e8edf2]">{area.title}</h2>
              <p className="mt-2 font-mono text-[11px] leading-6 text-[#7d8794]">{area.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="border border-[#1a1f26] bg-[#0b0d10] p-5">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#e8edf2]"><TerminalSquare className="h-4 w-4 text-[#ffb454]" /> real benchmark API</div>
            <pre className="mt-4 overflow-x-auto border border-[#1a1f26] bg-[#08090b] p-4 font-mono text-[11px] leading-6 text-[#b8c0cc]"><code>{EXAMPLE}</code></pre>
          </div>
          <div className="border border-[#1a1f26] bg-[#0b0d10] p-5">
            <div className="font-mono text-xs font-semibold text-[#e8edf2]">Reproduction rule</div>
            <p className="mt-3 font-mono text-[11px] leading-6 text-[#7d8794]">
              Record the host, OS, Python implementation/version, compiler and flags, CPU feature set,
              iteration count, and whether the path is warm or cold. For JIT work, record assembly and execution separately.
            </p>
            <Link href={`/docs/${Project.version}/advanced/safety-and-performance`} className="mt-5 inline-flex font-mono text-[10.5px] text-[#79c0ff] hover:text-[#e8edf2]">
              performance notes →
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
