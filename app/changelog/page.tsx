import { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/project";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release history for PylsRun.",
};

const releases = [
  {
    version: "0.1.0",
    date: "initial release",
    commit: "a1f3c8e",
    highlights: [
      "Raw pointers with real arithmetic, malloc/calloc/realloc/free/aligned_alloc, and three allocator strategies (StackArena, PoolAllocator, DebugAllocator)",
      "Compiler-verified struct & union layouts, including bitfields down to the exact bit, custom pack values, and alignas(N)",
      "SIMD (SSE2 → AVX2 → AVX-512) with genuine runtime CPUID dispatch, plus a portable scalar fallback on non-x86 architectures",
      "Real inline assembly assembled by the host GNU assembler and executed via a JIT-mapped RW → RX buffer",
      "Native ABI calls in both directions: a hand-written SysV AMD64 path, a general libffi path (including struct-by-value and variadic functions), and native-to-Python callbacks",
      "Atomics over raw memory via std::atomic_ref, and real C++ concurrency primitives (Mutex, RWLock, Semaphore, Barrier, ThreadLocal, NativeThread)",
      "Virtual memory control: mmap/mprotect wrappers and guard pages that trap overflow at the exact instruction that caused it",
      "A two-part compile-time C++ system: consteval constants baked in at the extension's own build time, plus a dynamic oracle that compiles arbitrary C++ on demand",
      "70 passing tests, including subprocess-isolated tests that prove documented crash behavior actually happens",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <Section className="pt-32 pb-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-14">
            <div className="mb-4 flex items-center gap-2 font-mono text-[11px] tracking-wider text-[#3a424d]">
              <span className="text-[#7ee787]">$</span>
              <span>cat CHANGELOG.md</span>
              <span
                className="ml-1 inline-block h-3 w-1.5 translate-y-[2px] bg-[#ffb454]"
                style={{ animation: "blink 1.1s steps(1) infinite" }}
              />
            </div>

            <h1 className="mb-3 font-mono text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-[#e8edf2]">
              changelog
            </h1>
            <p className="font-mono text-[13px] leading-relaxed text-[#7d8794]">
              Every release of {Project.name}, in reverse-chronological order.
            </p>
          </div>

          <div className="space-y-12">
            {releases.map((release, idx) => (
              <article
                key={release.version}
                className="relative border border-[#1a1f26] bg-[#0b0d10]"
              >
                <div
                  aria-hidden
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/30 to-transparent"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1f26] bg-[#0e1116] px-5 py-3.5">
                  <div className="flex items-baseline gap-3 font-mono">
                    <span className="text-[10px] tracking-wider text-[#3a424d]">
                      0x{String(idx).padStart(2, "0")}
                    </span>
                    <h2 className="text-[17px] font-semibold tracking-tight text-[#e8edf2]">
                      v{release.version}
                    </h2>
                    <span className="text-[11px] text-[#5c6874]">
                      {release.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[10.5px]">
                    <span className="text-[#3a424d]">commit</span>
                    <a
                      href={`${Project.repo}/commit/${release.commit}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 text-[#7d8794] no-underline transition-colors hover:text-[#e8edf2]"
                    >
                      <span>{release.commit}</span>
                      <ArrowUpRight
                        className="h-3 w-3 text-[#3a424d] transition-colors group-hover:text-[#ffb454]"
                        strokeWidth={1.8}
                      />
                    </a>
                    <span className="border border-[#7ee787]/30 bg-[#7ee787]/[0.06] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#7ee787]">
                      latest
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 font-mono text-[10.5px] tracking-wider text-[#3a424d]">
                    HIGHLIGHTS [{release.highlights.length}]
                  </div>
                  <ul className="space-y-3">
                    {release.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 font-mono text-[11.5px] leading-[1.75]"
                      >
                        <span className="mt-[3px] shrink-0 text-[10px] text-[#7ee787]">
                          [ ok ]
                        </span>
                        <span className="text-[#b8c0cc]">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between border-t border-[#1a1f26] bg-[#08090b] px-5 py-2.5 font-mono text-[10.5px]">
                  <span className="flex items-center gap-1.5 text-[#5c6874]">
                    <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
                    <span>stable</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[#7ee787]">
                    <span>[ exit 0 ]</span>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 border-t border-[#1a1f26] pt-8">
            <div className="mb-4 font-mono text-[10.5px] tracking-wider text-[#3a424d]">
              SEE ALSO
            </div>
            <div className="space-y-2.5">
              <a
                href={`${Project.repo}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-mono text-[12px] text-[#7d8794] no-underline transition-colors hover:text-[#e8edf2]"
              >
                <span className="select-none text-[#3a424d] transition-colors group-hover:text-[#ffb454]">
                  ›
                </span>
                <span>full release history on GitHub</span>
                <ArrowUpRight
                  className="h-3 w-3 -translate-y-px text-[#3a424d] opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:text-[#ffb454] group-hover:opacity-70"
                  strokeWidth={1.8}
                />
              </a>
              <Link
                href={`/docs/${Project.version}/getting-started/index`}
                className="group flex items-center gap-2 font-mono text-[12px] text-[#7d8794] no-underline transition-colors hover:text-[#e8edf2]"
              >
                <span className="select-none text-[#3a424d] transition-colors group-hover:text-[#ffb454]">
                  ›
                </span>
                <span>getting started</span>
              </Link>
              <Link
                href={`/docs/${Project.version}/api-reference/index`}
                className="group flex items-center gap-2 font-mono text-[12px] text-[#7d8794] no-underline transition-colors hover:text-[#e8edf2]"
              >
                <span className="select-none text-[#3a424d] transition-colors group-hover:text-[#ffb454]">
                  ›
                </span>
                <span>api reference</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
