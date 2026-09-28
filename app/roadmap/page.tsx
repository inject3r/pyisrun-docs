import { Check, CircleAlert, Compass, MonitorCog } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { Project } from "@/project";

const CURRENT = [
  "raw pointers and manual allocation",
  "compiler-probed struct and union layouts",
  "SIMD with runtime CPU dispatch plus scalar fallback",
  "runtime assembly JIT on supported host toolchains",
  "SysV/libffi ABI calls and native callbacks",
  "atomics over raw addresses and native synchronization primitives",
  "virtual memory control and guard-page allocation",
  "static and dynamic compile-time C++ facilities",
];

const PORTABILITY = [
  "POSIX-specific implementation paths are present for Linux and are written to be portable to macOS/BSD.",
  "A Windows backend exists for dynamic loading, virtual memory, aligned allocation, and TLS.",
  "AArch64 register/calling-convention code paths are present.",
  "The repository only reports Linux x86-64 + GCC as built and tested; other targets are unverified.",
  "32-bit x86 is excluded by 64-bit assumptions in the native code.",
];

const VERIFICATION = [
  "Build and run the native extension on macOS/BSD.",
  "Build and run the native extension on Windows.",
  "Build and run the AArch64 code paths.",
  "Expand packaging/wheel coverage beyond the Linux x86-64 build used by the repository.",
];

export default function RoadmapPage() {
  return (
    <Section className="min-h-screen bg-[#08090b] pt-28 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5c6874]">
            scope / portability / v{Project.version}
          </div>
          <h1 className="font-mono text-4xl font-bold tracking-tight text-[#e8edf2] sm:text-5xl">
            Scope and verification status
          </h1>
          <p className="mt-5 font-mono text-sm leading-7 text-[#7d8794]">
            The repository does not contain a trustworthy future-release roadmap. This page therefore
            separates shipped source capabilities from portability work that is still unverified.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <article className="border border-[#1a1f26] bg-[#0b0d10] p-5 lg:col-span-1">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#7ee787]"><Check className="h-4 w-4" /> present in 0.1.0</div>
            <ul className="mt-5 space-y-3 font-mono text-[11.5px] leading-6 text-[#b8c0cc]">
              {CURRENT.map((item) => <li key={item}>› {item}</li>)}
            </ul>
          </article>

          <article className="border border-[#1a1f26] bg-[#0b0d10] p-5 lg:col-span-1">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#ffb454]"><MonitorCog className="h-4 w-4" /> portability in source</div>
            <ul className="mt-5 space-y-3 font-mono text-[11.5px] leading-6 text-[#b8c0cc]">
              {PORTABILITY.map((item) => <li key={item}>› {item}</li>)}
            </ul>
          </article>

          <article className="border border-[#1a1f26] bg-[#0b0d10] p-5 lg:col-span-1">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#79c0ff]"><Compass className="h-4 w-4" /> verification backlog</div>
            <ul className="mt-5 space-y-3 font-mono text-[11.5px] leading-6 text-[#b8c0cc]">
              {VERIFICATION.map((item) => <li key={item}>› {item}</li>)}
            </ul>
          </article>
        </div>

        <div className="mt-8 flex items-start gap-3 border border-[#332a1d] bg-[#0e1116] p-4 font-mono text-[11px] leading-6 text-[#7d8794]">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb454]" />
          <span>Portable code paths are not the same thing as verified platform support. Use the Linux x86-64 + GCC environment as the only tested native target documented by the source tree.</span>
        </div>
      </Container>
    </Section>
  );
}
