"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy"}
      className={`group inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] transition-all duration-150 ${
        copied
          ? "border-[#7ee787]/40 bg-[#7ee787]/[0.06] text-[#7ee787]"
          : "border-[#1f252c] bg-[#0e1116] text-[#7d8794] hover:border-[#2a3138] hover:text-[#e8edf2]"
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
            className="select-none text-[#5c6874] transition-colors group-hover:text-[#ffb454]"
          >
            $
          </span>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
          <span>copy</span>
        </>
      )}
    </button>
  );
}
