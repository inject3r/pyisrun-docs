import { notFound } from "next/navigation";
import { getAllDocs, getDocBySlug, getAdjacentDocs } from "@/lib/docs";
import Breadcrumb from "@/components/docs/Breadcrumb";
import TableOfContents from "@/components/docs/TableOfContents";
import MarkdownContent from "@/components/docs/MarkdownContent";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/project";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  try {
    const docs = getAllDocs();

    if (!docs || docs.length === 0) {
      return [
        { slug: [Project.version] },
        { slug: [Project.version, "getting-started"] },
      ];
    }

    const params = [];

    for (const version of Project.versions) {
      params.push({ slug: [version] });

      for (const doc of docs) {
        params.push({
          slug: [version, ...doc.slug.split("/")],
        });
      }
    }

    return params;
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [
      { slug: [Project.version] },
      { slug: [Project.version, "getting-started"] },
    ];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return {
      title: "Documentation Not Found",
    };
  }

  const version = slug[0];
  const docSlug = slug.slice(1).join("/") || "index";

  const doc = getDocBySlug(docSlug);

  if (!doc) {
    return {
      title: "Documentation Not Found",
    };
  }

  return {
    title: `${doc.title} | PylsRun Docs (${version})`,
    description: doc.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    notFound();
  }

  const version = slug[0];
  const docSlug = slug.slice(1).join("/") || "index";

  if (!Project.versions.includes(version)) {
    notFound();
  }

  const doc = getDocBySlug(docSlug);

  if (!doc) {
    notFound();
  }

  const { prev, next } = getAdjacentDocs(docSlug);

  return (
    <>
      <div className="mb-6">
        <Breadcrumb />
      </div>

      <div className="max-w-none">
        <MarkdownContent content={doc.content} />
      </div>

      {doc.headings && doc.headings.length > 0 && (
        <div className="mt-12 border-t border-[#1a1f26] pt-8">
          <TableOfContents headings={doc.headings} />
        </div>
      )}

      <nav
        aria-label="pagination"
        className="relative mt-12 flex w-full flex-wrap items-stretch justify-between gap-px border-t border-[#1a1f26] pt-8"
      >
        {prev ? (
          <Link
            href={`/docs/${version}/${prev.slug}`}
            className="group relative flex flex-1 basis-0 flex-col gap-1.5 border border-[#1a1f26] bg-[#0b0d10] p-4 no-underline transition-colors duration-150 hover:border-[#2a3138] hover:bg-[#0e1116]"
            aria-label={`Go to previous page: ${prev.title}`}
          >
            <span
              aria-hidden
              className="absolute left-0 top-0 bottom-0 w-px bg-[#ffb454] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />

            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#3a424d] transition-colors group-hover:text-[#7d8794]">
              <ChevronLeft
                className="h-3 w-3 transition-transform duration-150 group-hover:-translate-x-0.5"
                strokeWidth={2}
              />
              <span>prev</span>
            </span>

            <span className="truncate font-mono text-[12.5px] font-semibold text-[#e8edf2]">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1 basis-0" />
        )}

        {next ? (
          <Link
            href={`/docs/${version}/${next.slug}`}
            className="group relative flex flex-1 basis-0 flex-col items-end gap-1.5 border border-[#1a1f26] bg-[#0b0d10] p-4 text-right no-underline transition-colors duration-150 hover:border-[#2a3138] hover:bg-[#0e1116]"
            aria-label={`Go to next page: ${next.title}`}
          >
            <span
              aria-hidden
              className="absolute right-0 top-0 bottom-0 w-px bg-[#ffb454] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />

            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#3a424d] transition-colors group-hover:text-[#7d8794]">
              <span>next</span>
              <ChevronRight
                className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </span>

            <span className="truncate font-mono text-[12.5px] font-semibold text-[#e8edf2]">
              {next.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1 basis-0" />
        )}
      </nav>

      <div className="mt-8 flex items-center justify-between font-mono text-[10.5px]">
        <span className="flex items-center gap-1.5 text-[#5c6874]">
          <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
          <span>{docSlug === "index" ? "index" : docSlug}</span>
        </span>
        <span className="flex items-center gap-1.5 text-[#7ee787]">
          <span>[ exit 0 ]</span>
        </span>
      </div>
    </>
  );
}
