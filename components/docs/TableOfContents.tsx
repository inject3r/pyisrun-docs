"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ArrowUp, List, X } from "lucide-react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 },
    );

    const elements = headings.map((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
      return element;
    });

    return () => {
      elements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Table of contents"
          aria-expanded={isOpen}
          className={`group inline-flex items-center gap-2 border px-3 py-2 font-mono text-[11.5px] shadow-[0_12px_30px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-200 ${
            isOpen
              ? "border-[#ffb454]/40 bg-[#0e1116]/95 text-[#ffb454]"
              : "border-[#1f252c] bg-[#0e1116]/90 text-[#7d8794] hover:border-[#2a3138] hover:text-[#e8edf2]"
          }`}
        >
          <List className="h-3.5 w-3.5" strokeWidth={2} />
          <span>contents</span>
          <ChevronRight
            className={`h-3 w-3 transition-transform duration-300 ${
              isOpen
                ? "rotate-90 text-[#ffb454]"
                : "text-[#3a424d] group-hover:text-[#5c6874]"
            }`}
            strokeWidth={2}
          />
        </button>

        <div
          className={`absolute bottom-14 right-0 w-[300px] overflow-hidden border border-[#1a1f26] bg-[#0b0d10]/98 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all duration-300 ${
            isOpen
              ? "max-h-[520px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 translate-y-3 opacity-0"
          }`}
        >
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/35 to-transparent"
          />

          <div className="p-4">
            <div className="mb-3 flex items-center justify-between border-b border-[#1a1f26] pb-3">
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-[10px] tracking-wider text-[#3a424d]">
                  0x00
                </span>
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[#b8c0cc]">
                  On this page
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-[#1f252c] bg-[#0e1116] px-1.5 py-0.5 font-mono text-[9.5px] text-[#5c6874]">
                  [{headings.length}]
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close contents"
                  className="grid h-6 w-6 place-items-center border border-transparent text-[#5c6874] transition-colors hover:border-[#1f252c] hover:bg-[#0e1116] hover:text-[#e8edf2]"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <ul className="scrollbar-phosphor max-h-[380px] space-y-px overflow-y-auto pr-1">
              {headings.map((heading) => {
                const isActive = activeId === heading.id;
                const indent =
                  heading.level === 3
                    ? "pl-6"
                    : heading.level === 4
                      ? "pl-9"
                      : heading.level >= 5
                        ? "pl-12"
                        : "";

                return (
                  <li key={heading.id}>
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`group/toc flex w-full items-center gap-2 border-l-2 py-1.5 pl-2 pr-2 text-left font-mono text-[11.5px] transition-colors duration-150 ${
                        isActive
                          ? "border-[#ffb454] bg-[#ffb454]/[0.06] text-[#ffb454]"
                          : "border-transparent text-[#7d8794] hover:border-[#2a3138] hover:bg-[#0e1116] hover:text-[#e8edf2]"
                      } ${indent}`}
                    >
                      <span
                        aria-hidden
                        className={`shrink-0 select-none text-[10px] transition-colors ${
                          isActive
                            ? "text-[#ffb454]"
                            : "text-[#3a424d] group-hover/toc:text-[#ffb454]"
                        }`}
                      >
                        ›
                      </span>

                      <span className="truncate">{heading.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setIsOpen(false);
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 border border-[#1f252c] bg-[#0e1116] px-3 py-2 font-mono text-[11px] text-[#7d8794] transition-colors duration-150 hover:border-[#2a3138] hover:text-[#e8edf2]"
            >
              <ArrowUp className="h-3 w-3" strokeWidth={2} />
              <span>back to top</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
