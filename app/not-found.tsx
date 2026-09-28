import Link from "next/link";
import { Metadata } from "next";
import Logo from "@/components/ui/Logo";
import { Project } from "@/project";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "The page you are looking for doesn't exist or has been moved. Explore PylsRun's docs: raw pointers, compiler-verified structs, SIMD, JIT execution, native ABI calls, atomics, and concurrency for Python.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090b10] max-sm:mt-16">
      <div className="px-6 text-center">
        <div className="mb-8 flex justify-center">
          <span className="grid h-[52px] w-[52px] place-items-center rounded-[14px] border border-[#465270] bg-gradient-to-br from-[#28324c] to-[#151a27] text-[20px] font-extrabold text-[#dae3ff] shadow-[inset_0_1px_rgba(255,255,255,0.08),0_5px_18px_rgba(0,0,0,0.25)]">
            <Logo size="lg" />
          </span>
        </div>

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#252c3b] bg-[#11151e]/60 px-4 py-2 font-mono text-[12px] font-semibold text-[#9ca5b5] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f08a88] shadow-[0_0_0_4px_rgba(240,138,136,0.11),0_0_15px_rgba(240,138,136,0.45)]" />
          SIGSEGV: address not mapped
        </div>

        <h1 className="mb-4 text-[clamp(5rem,15vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-[#f4f5f8]">
          404
        </h1>

        <h2 className="mb-4 text-xl font-semibold tracking-tight text-[#c0c7d2] sm:text-2xl">
          You dereferenced a null route
        </h2>

        <p className="mx-auto mb-8 max-w-md text-[14px] leading-relaxed text-[#9ca5b5] sm:text-[15px]">
          The page you're looking for doesn't exist or has been moved — and
          unlike a real bad pointer, this one won't crash the process.
        </p>

        <div className="flex flex-wrap justify-center gap-2.5">
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[9px] border border-[#252c3b] bg-[#11151e] px-5 text-[14px] font-semibold text-[#f4f5f8] no-underline transition-all hover:-translate-y-px hover:border-[#46506a]"
          >
            ← Back to Home
          </Link>

          <Link
            href={`/docs/${Project.version}/getting-started/index`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[9px] border border-[#91a8fb] bg-gradient-to-br from-[#9db0ff] to-[#788fe6] px-5 text-[14px] font-bold text-[#0a0d15] no-underline shadow-[0_12px_30px_rgba(100,128,222,0.25),inset_0_1px_rgba(255,255,255,0.35)] transition-all hover:-translate-y-px hover:border-[#bcc9ff] hover:shadow-[0_15px_38px_rgba(100,128,222,0.35)]"
          >
            Go to Documentation
          </Link>
        </div>

        <div className="mt-12 border-t border-[#1b2130] pt-8">
          <p className="font-mono text-[11px] text-[#687386]">
            {Project.name} v{Project.version} — {Project.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}
