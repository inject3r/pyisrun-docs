"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Project } from "@/project";

const menuItems = [
  { href: "/docs", label: "docs", addr: "0x01" },
  { href: `${Project.repo}/issues`, label: "issues", addr: "0x02" },
  { href: `${Project.repo}/releases`, label: "releases", addr: "0x03" },
  { href: "/changelog", label: "changelog", addr: "0x04" },
];

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

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
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
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText(`pip install ${Project.pypi}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="grid h-8 w-8 place-content-center border border-[#1f252c] bg-[#0e1116] text-[#b8c0cc] transition-colors hover:border-[#2a3138] hover:text-[#e8edf2] md:hidden"
        aria-label="Open menu"
      >
        <Menu size={15} />
      </button>

      <div
        className={`fixed inset-0 z-[999] transition-all duration-300 ease-in-out ${
          isOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 h-dvh bg-[#08090b]/85 backdrop-blur-[18px] backdrop-saturate-150 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        <aside
          className={`absolute left-0 top-0 flex h-[100dvh] w-full max-w-sm flex-col border-r border-[#1a1f26] bg-[#0b0d10] shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/35 to-transparent"
          />

          <div className="flex shrink-0 items-center justify-between border-b border-[#1a1f26] p-4">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-[26px] w-[26px] place-items-center border border-[#2a3138] bg-[#0e1116]">
                <Logo size="sm" />
                <span
                  aria-hidden
                  className="absolute -right-[3px] -top-[3px] h-1.5 w-1.5 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.7)]"
                />
              </span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <p className="text-[13.5px] font-semibold leading-none tracking-tight text-[#e8edf2]">
                  {Project.name}
                </p>
                <p className="text-[10px] leading-none text-[#5c6874]">
                  v{Project.version}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="grid h-8 w-8 place-items-center border border-[#1f252c] bg-[#0e1116] text-[#7d8794] transition-colors hover:border-[#2a3138] hover:text-[#e8edf2]"
              aria-label="Close menu"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pt-5 pb-2 font-mono text-[10px] tracking-wider text-[#3a424d]">
              NAVIGATE
            </div>

            <nav className="px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group/nav flex items-center gap-3 px-3 py-3 font-mono text-[13px] text-[#7d8794] no-underline transition-colors hover:bg-[#0e1116] hover:text-[#e8edf2]"
                >
                  <span className="text-[10px] text-[#3a424d] transition-colors group-hover/nav:text-[#5c6874]">
                    {item.addr}
                  </span>
                  <span
                    aria-hidden
                    className="select-none text-[#3a424d] transition-colors group-hover/nav:text-[#ffb454]"
                  >
                    ›
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}

              <a
                href={Project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="group/nav flex items-center gap-3 px-3 py-3 font-mono text-[13px] text-[#7d8794] no-underline transition-colors hover:bg-[#0e1116] hover:text-[#e8edf2]"
              >
                <span className="text-[10px] text-[#3a424d] transition-colors group-hover/nav:text-[#5c6874]">
                  0x05
                </span>
                <span
                  aria-hidden
                  className="select-none text-[#3a424d] transition-colors group-hover/nav:text-[#ffb454]"
                >
                  ›
                </span>
                <GitHubIcon />
                <span>github</span>
              </a>
            </nav>

            <div className="px-4 pt-6 pb-2 font-mono text-[10px] tracking-wider text-[#3a424d]">
              INSTALL
            </div>

            <div className="px-4">
              <div className="flex items-center gap-2 border border-[#1f252c] bg-[#0e1116] px-3 py-2.5 transition-colors hover:border-[#2a3138]">
                <span className="font-mono text-[11px] text-[#5c6874]">$</span>
                <code className="flex-1 overflow-x-auto whitespace-nowrap border-0 bg-transparent p-0 font-mono text-[11.5px] text-[#e8edf2]">
                  pip install {Project.pypi}
                </code>
                <button
                  onClick={handleCopyCommand}
                  className="grid h-6 w-6 flex-shrink-0 place-items-center border border-[#1f252c] bg-[#0b0d10] text-[#5c6874] transition-colors hover:border-[#2a3138] hover:text-[#e8edf2]"
                  aria-label="Copy command"
                >
                  {copied ? (
                    <span className="text-[#7ee787]">
                      <CheckIcon />
                    </span>
                  ) : (
                    <CopyIcon />
                  )}
                </button>
              </div>

              {copied && (
                <div className="mt-3 flex items-center gap-1.5 px-1 font-mono text-[10.5px] text-[#7ee787]">
                  <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.7)]" />
                  <span>copied to clipboard</span>
                </div>
              )}
            </div>

            <div className="px-4 pt-6 pb-2 font-mono text-[10px] tracking-wider text-[#3a424d]">
              SYSTEM
            </div>

            <div className="mx-4 mb-4 flex flex-col gap-1.5 border border-[#1a1f26] bg-[#08090b] px-3 py-2.5 font-mono text-[10.5px]">
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
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#1a1f26] px-4 py-3 font-mono text-[10.5px]">
            <span className="flex items-center gap-1.5 text-[#5c6874]">
              <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
              <span>operational</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#7ee787]">
              <span>[ exit 0 ]</span>
              <span
                className="inline-block h-2.5 w-1.5 translate-y-px bg-[#ffb454]"
                style={{ animation: "blink 1.1s steps(1) infinite" }}
              />
            </span>
          </div>
        </aside>
      </div>

      <style jsx global>{`
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
    </>
  );
}
