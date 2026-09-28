"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  const paths = pathname.split("/").filter((p) => p && p !== "docs");
  const breadcrumbs = paths.map((path, index) => {
    const href = `/docs/${paths.slice(0, index + 1).join("/")}`;
    const label = path
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 font-mono text-[11.5px]"
    >
      <span aria-hidden className="select-none text-[#7ee787]">
        $
      </span>

      <Link
        href="/docs"
        className="group inline-flex items-center gap-1 text-[#7d8794] no-underline transition-colors hover:text-[#e8edf2]"
      >
        <span>docs</span>
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={crumb.href} className="flex items-center gap-2">
            <span aria-hidden className="select-none text-[#3a424d]">
              /
            </span>
            {isLast ? (
              <span className="font-semibold text-[#ffb454]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="group inline-flex items-center gap-1 text-[#7d8794] no-underline transition-colors hover:text-[#e8edf2]"
              >
                <span>{crumb.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
