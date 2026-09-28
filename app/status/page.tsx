import { CheckCircle2, CircleAlert, Cpu, PackageCheck, Terminal } from "lucide-react";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import { Project } from "@/project";

const FACTS = [
  ["version", Project.version],
  ["python", ">= 3.10"],
  ["language", "C++20 native extension"],
  ["build paths", "setuptools + CMake"],
  ["tested native target", "Linux x86-64 + GCC"],
  ["license", "MIT"],
];

const BACKENDS = [
  { name: "POSIX", detail: "dynamic loading, virtual memory, aligned allocation, TLS", status: "implemented" },
  { name: "Windows", detail: "LoadLibrary/GetProcAddress, VirtualAlloc/Protect/Free, aligned allocation, TLS", status: "implemented / untested" },
  { name: "AArch64", detail: "AAPCS64 register/call paths and scalar SIMD fallback are present", status: "implemented / untested" },
  { name: "Linux x86-64", detail: "native build and runtime path used by the repository tests", status: "tested" },
];

export default function StatusPage() {
  return (
    <Section className="min-h-screen bg-[#08090b] pt-28 pb-24">
      <Container>
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#5c6874]">repository status / factual snapshot</div>
          <h1 className="font-mono text-4xl font-bold tracking-tight text-[#e8edf2] sm:text-5xl">Source status</h1>
          <p className="mt-5 font-mono text-sm leading-7 text-[#7d8794]">
            This is a static source-tree status page. It intentionally does not invent uptime, download counts,
            coverage percentages, CI matrices, or live service health that are not recorded in the repository.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTS.map(([label, value]) => (
            <div key={label} className="border border-[#1a1f26] bg-[#0b0d10] p-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#5c6874]">{label}</div>
              <div className="mt-2 font-mono text-sm text-[#e8edf2]">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="border border-[#1a1f26] bg-[#0b0d10] p-5">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#7ee787]"><PackageCheck className="h-4 w-4" /> build + packaging facts</div>
            <ul className="mt-5 space-y-3 font-mono text-[11.5px] leading-6 text-[#b8c0cc]">
              <li>› setup.py builds pylsrun._native with C++20.</li>
              <li>› CMakeLists.txt provides an alternate native build path.</li>
              <li>› POSIX builds link libffi, libdl, and pthread.</li>
              <li>› Windows has a libffi build branch, but the source explicitly marks it untested.</li>
              <li>› The repository build target documented as verified is Linux x86-64 with GCC.</li>
            </ul>
          </article>

          <article className="border border-[#1a1f26] bg-[#0b0d10] p-5">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#79c0ff]"><Cpu className="h-4 w-4" /> platform backends</div>
            <div className="mt-5 space-y-3">
              {BACKENDS.map((item) => (
                <div key={item.name} className="border border-[#1a1f26] bg-[#08090b] p-3">
                  <div className="flex items-center justify-between gap-4 font-mono text-[11px]">
                    <span className="text-[#e8edf2]">{item.name}</span>
                    <span className={item.status === "tested" ? "text-[#7ee787]" : "text-[#ffb454]"}>{item.status}</span>
                  </div>
                  <div className="mt-1 font-mono text-[10.5px] leading-5 text-[#5c6874]">{item.detail}</div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            [Terminal, "Debug builds", "PYLSRUN_DEBUG=1 enables -O0/-g plus AddressSanitizer and UndefinedBehaviorSanitizer."],
            [CheckCircle2, "Public package", "The Python package exposes the documented memory, buffers, structs, SIMD, CPU, VM, JIT, ABI, atomics, concurrency, and compile-time modules."],
            [CircleAlert, "Native test scope", "A source-level portable backend is not evidence of a verified build on every platform."],
          ].map(([Icon, title, text]) => {
            const Component = Icon as typeof Terminal;
            return <div key={String(title)} className="border border-[#1a1f26] bg-[#0b0d10] p-5"><Component className="h-4 w-4 text-[#ffb454]" /><div className="mt-3 font-mono text-xs font-semibold text-[#e8edf2]">{title}</div><div className="mt-2 font-mono text-[10.5px] leading-5 text-[#7d8794]">{text}</div></div>;
          })}
        </div>
      </Container>
    </Section>
  );
}
