import { getAllDocs, getAvailableVersions, getLatestVersion } from "@/lib/docs";
import Link from "next/link";
import {
  ChevronRight,
  Rocket,
  Zap,
  Cpu,
  Settings,
  GitCompare,
  Bug,
  Box,
} from "lucide-react";
import { Project } from "@/project";

const CATEGORY_META: Record<
  string,
  { addr: string; color: string; icon: any }
> = {
  "Getting Started": { addr: "0x00", color: "255,180,84", icon: Rocket },
  "Core Concepts": { addr: "0x10", color: "126,231,135", icon: Cpu },
  Advanced: { addr: "0x20", color: "121,192,255", icon: Settings },
  "API Reference": { addr: "0x30", color: "188,140,255", icon: Zap },
  Comparison: { addr: "0x40", color: "255,180,84", icon: GitCompare },
  Debugging: { addr: "0x50", color: "255,123,114", icon: Bug },
  Other: { addr: "0x60", color: "125,135,148", icon: Box },
};

function groupDocsByCategory(docs: any[]) {
  const groups: { [key: string]: any[] } = {
    "Getting Started": [],
    "Core Concepts": [],
    Advanced: [],
    "API Reference": [],
    Comparison: [],
    Debugging: [],
    Other: [],
  };

  docs.forEach((doc) => {
    const slug = doc.slug;
    if (slug.includes("getting-started")) {
      groups["Getting Started"].push(doc);
    } else if (slug.includes("core-concepts")) {
      groups["Core Concepts"].push(doc);
    } else if (slug.includes("advanced")) {
      groups["Advanced"].push(doc);
    } else if (slug.includes("api-reference")) {
      groups["API Reference"].push(doc);
    } else if (slug.includes("comparison")) {
      groups["Comparison"].push(doc);
    } else if (slug.includes("debugging")) {
      groups["Debugging"].push(doc);
    } else {
      groups["Other"].push(doc);
    }
  });

  return Object.fromEntries(
    Object.entries(groups).filter(([_, items]) => items.length > 0),
  );
}

interface Props {
  params: {
    version: string;
  };
}

export default async function DocsHomePage({ params }: Props) {
  const { version } = await params;
  const docs = getAllDocs(version);
  const groupedDocs = groupDocsByCategory(docs);
  const versions = getAvailableVersions();
  const latestVersion = getLatestVersion();

  const displayVersion = version === "latest" ? latestVersion : version;
  const isLatestVersion = version === "latest" || version === latestVersion;

  return (
    <div className="mx-auto w-[min(1130px,calc(100%-48px))] py-12">
      <div className="mb-12 border-b border-[#1a1f26] pb-8">
        <div className="mb-4 flex items-center gap-2 font-mono text-[11px] tracking-wider text-[#3a424d]">
          <span className="text-[#7ee787]">$</span>
          <span>pylsrun --docs</span>
          {!isLatestVersion && displayVersion && (
            <>
              <span className="text-[#5c6874]">--version</span>
              <span className="text-[#ffb454]">{displayVersion}</span>
            </>
          )}
          <span
            className="ml-1 inline-block h-3 w-1.5 translate-y-[2px] bg-[#ffb454]"
            style={{ animation: "blink 1.1s steps(1) infinite" }}
          />
        </div>

        <h1 className="mb-3 font-mono text-[clamp(2rem,4.5vw,3rem)] font-bold leading-[1.08] tracking-tight text-[#e8edf2]">
          <span className="text-[#5c6874]">docs</span>
          <span className="text-[#3a424d]">/</span>
          <span className="bg-gradient-to-r from-[#ffb454] via-[#ffc978] to-[#7ee787] bg-clip-text text-transparent">
            {Project.name.toLowerCase()}
          </span>
        </h1>

        <p className="max-w-2xl font-mono text-[13px] leading-[1.85] text-[#7d8794]">
          {Project.tagline}
        </p>
      </div>

      {versions.length > 0 && (
        <div className="mb-12">
          <div className="mb-3 font-mono text-[10.5px] tracking-wider text-[#3a424d]">
            VERSION
          </div>
          <div className="inline-flex flex-wrap gap-px border border-[#1a1f26] bg-[#1a1f26]">
            {versions.map((ver) => {
              const isActive =
                ver === version ||
                (version === "latest" && ver === latestVersion);
              return (
                <Link
                  key={ver}
                  href={`/docs/${ver}`}
                  className={`group inline-flex items-center gap-2 px-3.5 py-2 font-mono text-[11.5px] no-underline transition-colors duration-150 ${
                    isActive
                      ? "bg-[#ffb454]/[0.08] text-[#ffb454]"
                      : "bg-[#0b0d10] text-[#7d8794] hover:bg-[#0e1116] hover:text-[#e8edf2]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive
                        ? "bg-[#ffb454] shadow-[0_0_6px_rgba(255,180,84,0.7)]"
                        : "bg-[#3a424d]"
                    }`}
                  />
                  <span>v{ver}</span>
                  {ver === latestVersion && (
                    <span
                      className={`border px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider ${
                        isActive
                          ? "border-[#ffb454]/40 text-[#ffb454]"
                          : "border-[#7ee787]/30 text-[#7ee787]"
                      }`}
                    >
                      latest
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-14">
        {Object.entries(groupedDocs).map(([category, categoryDocs]) => {
          const meta = CATEGORY_META[category] || CATEGORY_META["Other"];
          const Icon = meta.icon;
          return (
            <section key={category}>
              <div className="mb-5 flex items-baseline gap-3 border-b border-[#1a1f26] pb-3">
                <span className="font-mono text-[10px] tracking-wider text-[#3a424d]">
                  {meta.addr}
                </span>
                <Icon
                  className="h-3.5 w-3.5 translate-y-[1px]"
                  style={{ color: `rgb(${meta.color})` }}
                  strokeWidth={2}
                />
                <h2 className="font-mono text-[14px] font-semibold tracking-tight text-[#e8edf2]">
                  {category}
                </h2>
                <span className="ml-auto font-mono text-[10.5px] text-[#5c6874]">
                  [{categoryDocs.length}]
                </span>
              </div>

              {/* doc grid */}
              <div className="grid grid-cols-1 gap-px border border-[#1a1f26] bg-[#1a1f26] sm:grid-cols-2 lg:grid-cols-3">
                {categoryDocs.map((doc) => (
                  <Link
                    key={doc.slug}
                    href={`/docs/${
                      version == null || version === undefined
                        ? Project.version
                        : version
                    }/${doc.slug}`}
                    className="group relative block bg-[#0b0d10] p-5 no-underline transition-colors duration-200 hover:bg-[#0e1116]"
                  >
                    {/* hover accent glow */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(400px circle at 50% 0%, rgba(${meta.color},0.06), transparent 70%)`,
                      }}
                    />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* prefix + title */}
                        <div className="mb-2 flex items-baseline gap-1.5">
                          <span
                            aria-hidden
                            className="select-none text-[#3a424d] transition-colors duration-150 group-hover:text-[#ffb454]"
                          >
                            ›
                          </span>
                          <h3 className="truncate text-[13.5px] font-semibold text-[#e8edf2] transition-colors group-hover:text-white">
                            {doc.title}
                          </h3>
                        </div>

                        {doc.description && (
                          <p className="line-clamp-2 pl-[14px] font-mono text-[11.5px] leading-[1.7] text-[#7d8794]">
                            {doc.description}
                          </p>
                        )}
                      </div>

                      <ChevronRight
                        className="mt-1 h-3.5 w-3.5 shrink-0 text-[#3a424d] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#ffb454]"
                        strokeWidth={2}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── footer strip ──────────────────────────────── */}
      <div className="mt-16 flex items-center justify-between border-t border-[#1a1f26] pt-6 font-mono text-[10.5px]">
        <span className="flex items-center gap-1.5 text-[#5c6874]">
          <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
          <span>
            {docs.length} pages · v{displayVersion || Project.version}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-[#7ee787]">
          <span>[ exit 0 ]</span>
        </span>
      </div>
    </div>
  );
}
