"use client";

import { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({
  code,
  language = "bash",
  filename,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linesCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <div className="group relative my-6 overflow-hidden border border-[#1f252c] bg-[#0b0d10] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      {filename && (
        <div className="flex items-center justify-between border-b border-[#1a1f26] bg-[#0e1116] px-3.5 py-2 font-mono text-[11px]">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff7b72]/45" />
              <span className="h-2 w-2 rounded-full bg-[#ffb454]/45" />
              <span className="h-2 w-2 rounded-full bg-[#7ee787]/45" />
            </div>
            <span className="text-[#3a424d]">/</span>
            <span className="text-[#7d8794]">{filename}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#3a424d]">
            <span>{linesCount} lines</span>
            <span>·</span>
            <span className="text-[#5c6874]">{language}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className={`absolute right-3 z-30 inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] transition-all duration-200 ${
          filename ? "top-12" : "top-3"
        } ${
          copied
            ? "border-[#7ee787]/40 bg-[#7ee787]/[0.06] text-[#7ee787] opacity-100"
            : "border-[#1f252c] bg-[#0e1116] text-[#7d8794] opacity-0 hover:border-[#2a3138] hover:text-[#e8edf2] group-hover:opacity-100 max-sm:opacity-100"
        }`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={2.2} />
            <span className="font-semibold">copied</span>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className="select-none text-[#5c6874] transition-colors"
            >
              $
            </span>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
            <span>copy</span>
          </>
        )}
      </button>

      <div className="overflow-x-auto">
        <div className="relative">
          <div className="sticky left-0 z-20 float-left -ml-px shrink-0 select-none border-r border-[#1a1f26] bg-[#08090b] text-right font-mono text-[12px] text-[#3a424d]">
            <div className="px-4 py-5 max-sm:px-2 max-sm:py-4">
              {Array.from({ length: linesCount }, (_, i) => (
                <div key={i} className="leading-[26px]">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-max">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1.25rem",
                  background: "transparent",
                  fontSize: "13px",
                  lineHeight: "26px",
                  fontFamily:
                    "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
                  whiteSpace: "pre",
                  overflow: "visible",
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: "inherit",
                    whiteSpace: "pre",
                  },
                }}
                showLineNumbers={false}
                wrapLongLines={false}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7ee787]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
