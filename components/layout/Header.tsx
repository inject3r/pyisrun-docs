"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import MobileMenu from "./MobileMenu";
import { Project } from "@/project";

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
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

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const navItems = [
  { href: "/docs", label: "docs" },
  { href: `${Project.repo}/issues`, label: "issues", external: true },
  { href: `${Project.repo}/releases`, label: "releases", external: true },
  { href: "/changelog", label: "changelog" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1f26]/80 bg-[#0b0d10]/82 backdrop-blur-[18px] backdrop-saturate-150">
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/35 to-transparent"
      />

      <div className="mx-auto flex h-[64px] w-[min(1240px,calc(100%-40px))] items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 no-underline"
        >
          <span className="relative grid h-[28px] w-[28px] place-items-center border border-[#2a3138] bg-[#0e1116] transition-colors duration-200 group-hover:border-[#ffb454]/40">
            <Logo size="md" />
            <span
              aria-hidden
              className="absolute -right-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.7)]"
            />
          </span>
          <span className="flex items-baseline gap-2 font-mono">
            <span className="text-[14px] font-semibold tracking-tight text-[#e8edf2] transition-colors group-hover:text-white">
              {Project.name}
            </span>
            <span className="text-[10.5px] font-medium text-[#5c6874]">
              v{Project.version}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-px md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="group/nav relative inline-flex items-center gap-1.5 rounded-sm px-3 py-2 font-mono text-[12px] text-[#7d8794] no-underline transition-colors duration-150 hover:bg-[#0e1116] hover:text-[#e8edf2]"
            >
              <span
                aria-hidden
                className="select-none text-[#3a424d] transition-colors duration-150 group-hover/nav:text-[#ffb454]"
              >
                ›
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={Project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="group/gh hidden items-center gap-1.5 border border-[#1f252c] bg-[#0e1116] px-3 py-1.5 font-mono text-[11.5px] text-[#b8c0cc] no-underline transition-all duration-150 hover:border-[#2a3138] hover:text-[#e8edf2] md:inline-flex"
          >
            <GitHubIcon />
            <span className="text-[#5c6874] transition-colors group-hover/gh:text-[#7d8794]">
              star
            </span>
          </a>

          <Link
            href={`/docs/${Project.version}/getting-started/index`}
            className="group/cta hidden items-center gap-2 border border-[#ffb454] bg-[#ffb454] px-3.5 py-1.5 font-mono text-[11.5px] font-semibold text-[#08090b] no-underline transition-all duration-150 hover:bg-[#ffc978] hover:shadow-[0_0_24px_rgba(255,180,84,0.3)] md:inline-flex"
          >
            <span className="text-[#08090b]/55">$</span>
            <span>get started</span>
            <ArrowIcon />
          </Link>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
