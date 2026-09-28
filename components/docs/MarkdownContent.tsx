"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../ui/CodeBlock";

interface MarkdownContentProps {
  content: string;
}

interface CodeBlockProps {
  node?: any;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

function HeadingWithLink({
  level,
  children,
  ...props
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  const text =
    typeof children === "string"
      ? children
      : React.Children.toArray(children).join("");

  const id = String(text)
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const levelStyles: Record<number, string> = {
    1: "mt-8 mb-4 font-mono text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.15] tracking-tight text-[#e8edf2]",
    2: "mt-10 mb-4 border-b border-[#1a1f26] pb-3 font-mono text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold leading-[1.2] tracking-tight text-[#e8edf2]",
    3: "mt-8 mb-3 font-mono text-[1.1rem] font-semibold leading-[1.3] tracking-tight text-[#e8edf2]",
    4: "mt-6 mb-2 font-mono text-[0.98rem] font-semibold leading-[1.4] text-[#e8edf2]",
    5: "mt-5 mb-2 font-mono text-[0.92rem] font-semibold leading-[1.4] text-[#b8c0cc]",
    6: "mt-4 mb-2 font-mono text-[0.85rem] font-semibold uppercase tracking-wider text-[#7d8794]",
  };

  const prefix = "#".repeat(Math.min(level, 3));

  return (
    <HeadingTag
      id={id}
      className={`group/heading scroll-mt-[100px] ${levelStyles[level] || levelStyles[4]}`}
      {...props}
    >
      <a
        href={`#${id}`}
        aria-label={`Link to ${text}`}
        className="ml-[-1.25em] mr-1.5 inline-block w-[1em] text-[#3a424d] opacity-0 no-underline transition-opacity duration-150 hover:text-[#ffb454] group-hover/heading:opacity-100"
      >
        #
      </a>
      {level <= 2 && (
        <span
          aria-hidden
          className="mr-2 select-none font-normal text-[#3a424d]"
        >
          {prefix}
        </span>
      )}
      {children}
    </HeadingTag>
  );
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="docs-content max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children, ...props }: CodeBlockProps) => {
            const match = /language-([\w-]+)/.exec(className || "");
            const raw = String(children);
            const code = raw.replace(/\n$/, "");

            const isBlock = Boolean(match) || raw.includes("\n");

            if (!isBlock) {
              return (
                <code
                  className="border border-[#1f252c] bg-[#0e1116] px-[0.4em] py-[0.15em] font-mono text-[0.85em] text-[#ffb454]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock code={code} language={match?.[1] || "text"} />;
          },

          h1: ({ children, ...props }) => (
            <HeadingWithLink level={1} {...props}>
              {children}
            </HeadingWithLink>
          ),
          h2: ({ children, ...props }) => (
            <HeadingWithLink level={2} {...props}>
              {children}
            </HeadingWithLink>
          ),
          h3: ({ children, ...props }) => (
            <HeadingWithLink level={3} {...props}>
              {children}
            </HeadingWithLink>
          ),
          h4: ({ children, ...props }) => (
            <HeadingWithLink level={4} {...props}>
              {children}
            </HeadingWithLink>
          ),
          h5: ({ children, ...props }) => (
            <HeadingWithLink level={5} {...props}>
              {children}
            </HeadingWithLink>
          ),
          h6: ({ children, ...props }) => (
            <HeadingWithLink level={6} {...props}>
              {children}
            </HeadingWithLink>
          ),

          p: ({ children, ...props }) => (
            <p
              className="my-4 font-mono text-[13px] leading-[1.85] text-[#b8c0cc]"
              {...props}
            >
              {children}
            </p>
          ),

          ul: ({ children, ...props }) => (
            <ul
              className="my-4 list-disc space-y-1.5 pl-6 font-mono text-[13px] leading-[1.85] text-[#b8c0cc] marker:text-[#ffb454]"
              {...props}
            >
              {children}
            </ul>
          ),

          ol: ({ children, ...props }) => (
            <ol
              className="my-4 list-decimal space-y-1.5 pl-6 font-mono text-[13px] leading-[1.85] text-[#b8c0cc] marker:text-[#ffb454]"
              {...props}
            >
              {children}
            </ol>
          ),

          li: ({ children, ...props }) => (
            <li className="text-[#b8c0cc]" {...props}>
              {children}
            </li>
          ),

          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-5 border-l-2 border-[#ffb454] bg-[#ffb454]/[0.04] px-5 py-3 font-mono text-[12.5px] leading-[1.75] text-[#c0c7d2]"
              {...props}
            >
              {children}
            </blockquote>
          ),

          a: ({ children, href, ...props }) => (
            <a
              href={href}
              className="font-medium text-[#ffb454] no-underline underline-offset-[3px] transition-colors hover:text-[#ffc978] hover:underline"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              {...props}
            >
              {children}
            </a>
          ),

          table: ({ children, ...props }) => (
            <div className="my-6 overflow-x-auto border border-[#1a1f26] bg-[#0b0d10]">
              <table className="min-w-full border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),

          th: ({ children, ...props }) => (
            <th
              className="border-b border-[#1a1f26] bg-[#0e1116] px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-[#7d8794]"
              {...props}
            >
              {children}
            </th>
          ),

          td: ({ children, ...props }) => (
            <td
              className="border-b border-[#0f1215] px-4 py-3 font-mono text-[12px] text-[#b8c0cc]"
              {...props}
            >
              {children}
            </td>
          ),

          hr: (props) => <hr className="my-8 border-[#1a1f26]" {...props} />,

          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
