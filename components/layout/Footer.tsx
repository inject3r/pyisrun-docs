import Logo from "@/components/ui/Logo";
import { Project } from "@/project";
import Link from "next/link";
import {
  BookOpen,
  FileCode,
  Cpu,
  GitCompare,
  Bug,
  ArrowUpRight,
} from "lucide-react";

const GitHub = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const docLinks = [
  {
    href: `/docs/${Project.version}/getting-started/index`,
    label: "getting started",
    icon: BookOpen,
  },
  {
    href: `/docs/${Project.version}/core-concepts/index`,
    label: "core concepts",
    icon: Cpu,
  },
  {
    href: `/docs/${Project.version}/advanced/index`,
    label: "advanced",
    icon: FileCode,
  },
  {
    href: `/docs/${Project.version}/comparison/index`,
    label: "comparison",
    icon: GitCompare,
  },
  {
    href: `/docs/${Project.version}/debugging/index`,
    label: "debugging",
    icon: Bug,
  },
];

const resourceLinks = [
  { href: Project.repo, label: "github repository", external: true },
  { href: `${Project.repo}/issues`, label: "issues", external: true },
  { href: `${Project.repo}/releases`, label: "releases", external: true },
  { href: "/changelog", label: "changelog", external: false },
];

const communityLinks = [
  { href: `${Project.repo}/discussions`, label: "discussions" },
  { href: `${Project.repo}/blob/main/CONTRIBUTING.md`, label: "contributing" },
  { href: `https://pypi.org/project/${Project.pypi}/`, label: "pypi" },
];

const FooterLink = ({
  href,
  label,
  external,
  icon: Icon,
}: {
  href: string;
  label: string;
  external?: boolean;
  icon?: any;
}) => {
  const className =
    "group/link inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[#7d8794] no-underline transition-colors duration-150 hover:text-[#e8edf2]";

  const content = (
    <>
      <span
        aria-hidden
        className="select-none text-[#3a424d] transition-colors duration-150 group-hover/link:text-[#ffb454]"
      >
        ›
      </span>
      {Icon && (
        <Icon className="h-3 w-3 text-[#5c6874] transition-colors group-hover/link:text-[#7d8794]" />
      )}
      <span>{label}</span>
      {external && (
        <ArrowUpRight
          className="h-3 w-3 -translate-y-px text-[#3a424d] opacity-0 transition-all duration-150 group-hover/link:translate-y-0 group-hover/link:text-[#ffb454] group-hover/link:opacity-70"
          strokeWidth={1.8}
        />
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
};

const ColHead = ({ addr, title }: { addr: string; title: string }) => (
  <div className="mb-4 flex items-baseline gap-2">
    <span className="font-mono text-[10px] tracking-wider text-[#3a424d]">
      {addr}
    </span>
    <h4 className="font-mono text-[11.5px] font-semibold uppercase tracking-wider text-[#b8c0cc]">
      {title}
    </h4>
  </div>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-[#1a1f26] bg-[#08090b]">
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/25 to-transparent"
      />

      <div className="mx-auto w-[min(1130px,calc(100%-48px))] py-14">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="relative grid h-[28px] w-[28px] place-items-center border border-[#2a3138] bg-[#0e1116]">
                <Logo size="sm" />
                <span
                  aria-hidden
                  className="absolute -right-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.7)]"
                />
              </span>
              <span className="flex items-baseline gap-2 font-mono">
                <span className="text-[14px] font-semibold tracking-tight text-[#e8edf2]">
                  {Project.name}
                </span>
                <span className="text-[10.5px] text-[#5c6874]">
                  v{Project.version}
                </span>
              </span>
            </div>

            <p className="mb-5 max-w-sm font-mono text-[11.5px] leading-[1.85] text-[#7d8794]">
              Raw pointers, compiler-verified structs, SIMD, JIT execution, and
              native ABI calls — a real systems toolkit for Python, built on
              C++20.
            </p>

            <div className="mb-5 inline-flex flex-col gap-1.5 border border-[#1a1f26] bg-[#0b0d10] px-3 py-2.5 font-mono text-[10.5px]">
              <div className="flex items-center gap-2">
                <span className="text-[#3a424d]">runtime</span>
                <span className="text-[#7d8794]">cross-platform core</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#3a424d]">native tested</span>
                <span className="text-[#7d8794]">linux x86-64 · gcc</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#3a424d]">python </span>
                <span className="text-[#7d8794]">3.10+ · cpython</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#3a424d]">license</span>
                <span className="text-[#7ee787]">mit</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={Project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 border border-[#1f252c] bg-[#0e1116] px-3 py-1.5 font-mono text-[11px] text-[#b8c0cc] no-underline transition-all duration-150 hover:border-[#2a3138] hover:text-[#e8edf2]"
                aria-label="GitHub repository"
              >
                <GitHub />
                <span>repository</span>
              </a>
              <a
                href={`https://pypi.org/project/${Project.pypi}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 border border-[#1f252c] bg-[#0e1116] px-3 py-1.5 font-mono text-[11px] text-[#b8c0cc] no-underline transition-all duration-150 hover:border-[#2a3138] hover:text-[#e8edf2]"
              >
                <span className="text-[#5c6874] group-hover:text-[#7d8794]">
                  $
                </span>
                <span>pip install {Project.pypi}</span>
              </a>
            </div>
          </div>

          <div className="hidden md:col-span-1 md:block" />

          <div className="md:col-span-2">
            <ColHead addr="0x01" title="Docs" />
            <ul className="space-y-2.5">
              {docLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <ColHead addr="0x02" title="Resources" />
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink
                    href={link.href}
                    label={link.label}
                    external={link.external}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <ColHead addr="0x03" title="Community" />
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href} label={link.label} external />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-[#1a1f26] pt-6 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] text-[#5c6874]">
            <span className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
              <span>operational</span>
            </span>
            <span className="text-[#3a424d]">·</span>
            <span>mit license</span>
            <span className="text-[#3a424d]">·</span>
            <span>
              © {currentYear} {Project.name} contributors
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10.5px] text-[#5c6874]">
            <span className="hidden sm:inline">
              built for people who want the real primitives
            </span>
            <span className="hidden text-[#3a424d] sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-[#7ee787]">
              <span>[ exit 0 ]</span>
              <span className="animate-blink inline-block h-2.5 w-1.5 translate-y-px bg-[#ffb454]" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
