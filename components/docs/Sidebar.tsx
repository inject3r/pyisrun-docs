"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { Project } from "@/project";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  items?: NavItem[];
}

interface SidebarProps {
  items: NavItem[];
}

function VersionTabs({
  selectedVersion,
  onVersionChange,
}: {
  selectedVersion: string;
  onVersionChange: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 font-mono text-[10px] tracking-wider text-[#3a424d]">
        VERSION
      </div>
      <div className="inline-flex flex-wrap gap-px border border-[#1a1f26] bg-[#1a1f26]">
        {Project.versions.map((ver) => {
          const isActive = ver === selectedVersion;
          const isLatest = ver === Project.version;
          return (
            <button
              key={ver}
              onClick={() => onVersionChange(ver)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] transition-colors duration-150 ${
                isActive
                  ? "bg-[#ffb454]/[0.08] text-[#ffb454]"
                  : "bg-[#0b0d10] text-[#7d8794] hover:bg-[#0e1116] hover:text-[#e8edf2]"
              }`}
            >
              <span
                className={`h-1 w-1 rounded-full ${
                  isActive
                    ? "bg-[#ffb454] shadow-[0_0_6px_rgba(255,180,84,0.7)]"
                    : "bg-[#3a424d]"
                }`}
              />
              <span>v{ver}</span>
              {isLatest && (
                <span
                  className={`border px-1 py-px text-[8.5px] font-semibold uppercase tracking-wider ${
                    isActive
                      ? "border-[#ffb454]/40 text-[#ffb454]"
                      : "border-[#7ee787]/30 text-[#7ee787]"
                  }`}
                >
                  latest
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavContent({
  items,
  selectedVersion,
  openItems,
  toggleItem,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  selectedVersion: string;
  openItems: Record<string, boolean>;
  toggleItem: (title: string) => void;
  pathname: string | null;
  onNavigate?: () => void;
}) {
  const getVersionedHref = (href: string) => {
    if (href.startsWith("/docs")) {
      const withoutDocs = href.replace("/docs", "");
      return `/docs/${selectedVersion}${withoutDocs}`;
    }
    if (href.startsWith("/")) {
      return `/docs/${selectedVersion}${href}`;
    }
    return href;
  };

  const isActive = (href: string) => {
    if (href === `/docs/${selectedVersion}`) {
      return pathname === href;
    }
    return pathname === href || pathname?.startsWith(href + "/") || false;
  };

  const renderItems = (navItems: NavItem[], depth = 0): React.ReactNode =>
    navItems.map((item, idx) => {
      const versionedHref = getVersionedHref(item.href);
      const active = isActive(versionedHref);
      const hasChildren = item.items && item.items.length > 0;
      const isOpen = openItems[item.title] ?? false;
      const addr = `0x${String(idx).padStart(2, "0")}`;

      return (
        <li key={item.title}>
          {hasChildren ? (
            <>
              <button
                onClick={() => toggleItem(item.title)}
                className={`group/nav flex w-full items-center gap-2 px-2 py-2 font-mono text-[12px] transition-colors ${
                  active
                    ? "text-[#e8edf2]"
                    : "text-[#7d8794] hover:bg-[#0e1116] hover:text-[#e8edf2]"
                }`}
                style={{
                  borderLeft: active
                    ? "2px solid rgb(255,180,84)"
                    : "2px solid transparent",
                }}
              >
                <span className="shrink-0 text-[9.5px] text-[#3a424d] transition-colors group-hover/nav:text-[#5c6874]">
                  {addr}
                </span>

                <span
                  aria-hidden
                  className={`select-none text-[#3a424d] transition-colors ${
                    active ? "text-[#ffb454]" : "group-hover/nav:text-[#ffb454]"
                  }`}
                >
                  ›
                </span>

                {item.icon && (
                  <span
                    className={`shrink-0 ${
                      active ? "text-[#ffb454]" : "text-[#5c6874]"
                    }`}
                  >
                    {item.icon}
                  </span>
                )}

                <span className="flex-1 truncate text-left">{item.title}</span>

                <ChevronRight
                  className={`h-3 w-3 shrink-0 transition-all duration-200 ${
                    isOpen
                      ? "rotate-90 text-[#ffb454]"
                      : "text-[#3a424d] group-hover/nav:text-[#5c6874]"
                  }`}
                  strokeWidth={2}
                />
              </button>

              {isOpen && item.items && (
                <ul className="ml-4 border-l border-[#1a1f26] pl-3">
                  {renderItems(item.items, depth + 1)}
                </ul>
              )}
            </>
          ) : (
            <Link
              href={versionedHref}
              onClick={onNavigate}
              className={`group/nav flex items-center gap-2 px-2 py-2 font-mono text-[12px] no-underline transition-colors ${
                active
                  ? "bg-[#ffb454]/[0.06] text-[#ffb454]"
                  : "text-[#7d8794] hover:bg-[#0e1116] hover:text-[#e8edf2]"
              }`}
              style={{
                borderLeft: active
                  ? "2px solid rgb(255,180,84)"
                  : "2px solid transparent",
              }}
            >
              {depth > 0 && (
                <span className="shrink-0 text-[9.5px] text-[#3a424d]">·</span>
              )}

              {depth === 0 && (
                <span className="shrink-0 text-[9.5px] text-[#3a424d] transition-colors group-hover/nav:text-[#5c6874]">
                  {addr}
                </span>
              )}

              <span
                aria-hidden
                className={`select-none text-[#3a424d] transition-colors ${
                  active ? "text-[#ffb454]" : "group-hover/nav:text-[#ffb454]"
                }`}
              >
                ›
              </span>

              {item.icon && (
                <span
                  className={`shrink-0 ${
                    active ? "text-[#ffb454]" : "text-[#5c6874]"
                  }`}
                >
                  {item.icon}
                </span>
              )}

              <span className="flex-1 truncate">{item.title}</span>
            </Link>
          )}
        </li>
      );
    });

  return <ul className="space-y-px">{renderItems(items)}</ul>;
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getCurrentVersionFromPath = () => {
    const match = pathname?.match(/\/(\d+\.\d+\.\d+)\//);
    return match ? match[1] : Project.version;
  };

  const [selectedVersion, setSelectedVersion] = useState(
    getCurrentVersionFromPath(),
  );

  useEffect(() => {
    setSelectedVersion(getCurrentVersionFromPath());
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const next: Record<string, boolean> = {};

    const walk = (navItems: NavItem[]) => {
      for (const item of navItems) {
        if (item.items?.length) {
          const hasActive = item.items.some((child) => {
            const versionedHref = child.href.startsWith("/docs")
              ? child.href.replace("/docs", `/docs/${selectedVersion}`)
              : `/docs/${selectedVersion}${child.href}`;
            return (
              pathname === versionedHref ||
              pathname?.startsWith(versionedHref + "/")
            );
          });
          next[item.title] = hasActive;
          if (hasActive) walk(item.items);
        }
      }
    };

    walk(items);
    setOpenItems(next);
  }, [pathname, items, selectedVersion]);

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleVersionChange = (newVersion: string) => {
    if (newVersion === selectedVersion) return;
    const newPathname = pathname?.replace(
      /\/(\d+\.\d+\.\d+)(\/|$)/,
      `/${newVersion}$2`,
    );
    if (newPathname) router.push(newPathname);
  };

  const navContent = (
    <NavContent
      items={items}
      selectedVersion={selectedVersion}
      openItems={openItems}
      toggleItem={toggleItem}
      pathname={pathname}
      onNavigate={() => setMobileMenuOpen(false)}
    />
  );

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open docs navigation"
        className="fixed bottom-6 left-4 z-40 grid h-10 w-10 place-items-center border border-[#1f252c] bg-[#0e1116]/90 text-[#b8c0cc] shadow-[0_12px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-colors hover:border-[#2a3138] hover:text-[#e8edf2] md:hidden"
      >
        <Menu className="h-4 w-4" strokeWidth={2} />
      </button>

      <aside className="sticky top-[80px] hidden h-[calc(100vh-100px)] w-full flex-col md:flex">
        <VersionTabs
          selectedVersion={selectedVersion}
          onVersionChange={handleVersionChange}
        />

        <div className="scrollbar-phosphor flex-1 overflow-y-auto pr-1">
          {navContent}
        </div>

        <div className="mt-4 flex items-center gap-1.5 border-t border-[#1a1f26] pt-4 font-mono text-[10px] text-[#3a424d]">
          <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
          <span>synced</span>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#08090b]/85 backdrop-blur-[18px] transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 flex h-full w-[300px] flex-col border-r border-[#1a1f26] bg-[#0b0d10] shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ffb454]/35 to-transparent"
          />

          <div className="flex shrink-0 items-center justify-between border-b border-[#1a1f26] p-4">
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-[10px] text-[#3a424d]">0x00</span>
              <span className="text-[13px] font-semibold tracking-tight text-[#e8edf2]">
                docs
              </span>
              <span className="text-[10px] text-[#5c6874]">
                v{selectedVersion}
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation"
              className="grid h-8 w-8 place-items-center border border-[#1f252c] bg-[#0e1116] text-[#7d8794] transition-colors hover:border-[#2a3138] hover:text-[#e8edf2]"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="scrollbar-phosphor flex-1 overflow-y-auto p-3">
            <VersionTabs
              selectedVersion={selectedVersion}
              onVersionChange={(v) => {
                handleVersionChange(v);
              }}
            />
            {navContent}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-[#1a1f26] px-4 py-3 font-mono text-[10.5px]">
            <span className="flex items-center gap-1.5 text-[#5c6874]">
              <span className="h-1 w-1 rounded-full bg-[#7ee787] shadow-[0_0_6px_rgba(126,231,135,0.6)]" />
              <span>synced</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#7ee787]">
              <span>[ exit 0 ]</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
