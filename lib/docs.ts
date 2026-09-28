import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface DocItem {
  slug: string;
  title: string;
  description?: string;
  order: number;
  content: string;
  headings: { level: number; text: string; id: string }[];
  version: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  items?: NavItem[];
}

const docsRootDirectory = path.join(process.cwd(), "content/docs");

export function getAvailableVersions(): string[] {
  if (!fs.existsSync(docsRootDirectory)) {
    return [];
  }

  const versions = fs
    .readdirSync(docsRootDirectory)
    .filter((item) => {
      const itemPath = path.join(docsRootDirectory, item);
      return (
        fs.statSync(itemPath).isDirectory() && /^\d+\.\d+\.\d+$/.test(item)
      );
    })
    .sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split(".").map(Number);
      const [bMajor, bMinor, bPatch] = b.split(".").map(Number);
      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

  return versions;
}

export function getLatestVersion(): string | null {
  const versions = getAvailableVersions();
  return versions.length > 0 ? versions[0] : null;
}

function getVersionDirectory(version: string): string {
  return path.join(docsRootDirectory, version);
}

function ensureVersionDirectory(version: string) {
  const versionDir = getVersionDirectory(version);
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }
  return versionDir;
}

function resolveVersion(version: string): string {
  if (version === "latest") {
    const latestVersion = getLatestVersion();
    if (!latestVersion) {
      throw new Error("No versions found");
    }
    return latestVersion;
  }
  return version;
}

export function getAllDocs(version: string = "latest"): DocItem[] {
  const actualVersion = resolveVersion(version);
  const versionDir = getVersionDirectory(actualVersion);

  if (!fs.existsSync(versionDir)) {
    console.error(`Version directory not found: ${actualVersion}`);
    return [];
  }

  const items: DocItem[] = [];

  function walkDir(dir: string, baseSlug: string = "") {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const slug = baseSlug
          ? `${baseSlug}/${entry.name.replace(/\.md$/, "")}`
          : entry.name.replace(/\.md$/, "");

        if (entry.isDirectory()) {
          walkDir(fullPath, slug);
        } else if (entry.name.endsWith(".md")) {
          const fileContent = fs.readFileSync(fullPath, "utf-8");
          const { data, content } = matter(fileContent);

          items.push({
            slug: slug,
            title: data.title || entry.name.replace(/\.md$/, ""),
            description: data.description,
            order: data.order || 999,
            content,
            headings: extractHeadings(content),
            version: actualVersion,
          });
        }
      }
    } catch (error) {
      console.error(`Error walking directory ${dir}:`, error);
    }
  }

  walkDir(versionDir);
  return items.sort((a, b) => a.order - b.order);
}

export function getDocBySlug(
  slug: string,
  version: string = "latest",
): DocItem | null {
  const actualVersion = resolveVersion(version);
  const versionDir = getVersionDirectory(actualVersion);

  const fullPath = path.join(versionDir, `${slug}.md`);
  const indexPath = path.join(versionDir, slug, "index.md");

  let filePath = fullPath;
  if (!fs.existsSync(fullPath) && fs.existsSync(indexPath)) {
    filePath = indexPath;
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      slug,
      title: data.title || slug.split("/").pop() || "Documentation",
      description: data.description,
      order: data.order || 999,
      content,
      headings: extractHeadings(content),
      version: actualVersion,
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

export function getAdjacentDocs(
  currentSlug: string,
  version: string = "latest",
): {
  prev: DocItem | null;
  next: DocItem | null;
} {
  const allDocs = getAllDocs(version);
  const currentIndex = allDocs.findIndex((doc) => doc.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? allDocs[currentIndex - 1] : null,
    next: currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null,
  };
}

export function getDocNav(version: string = "latest"): { items: NavItem[] } {
  const docs = getAllDocs(version);
  const nav: NavItem[] = [];

  const groups: { [key: string]: DocItem[] } = {};

  for (const doc of docs) {
    const parts = doc.slug.split("/");
    const group = parts.length > 1 ? parts[0] : "root";

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(doc);
  }

  const categoryOrder: { [key: string]: number } = {
    root: 0,
    "getting-started": 1,
    "core-concepts": 2,
    advanced: 3,
    "api-reference": 4,
    comparison: 5,
    debugging: 6,
  };

  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const orderA = categoryOrder[a] ?? 999;
    const orderB = categoryOrder[b] ?? 999;
    return orderA - orderB;
  });

  const buildHref = (slug: string): string => {
    if (version === "latest") {
      return `/docs/${slug}`;
    }
    return `/docs/${version}/${slug}`;
  };

  for (const group of sortedGroups) {
    const items = groups[group];
    if (group === "root") {
      for (const item of items.sort((a, b) => a.order - b.order)) {
        nav.push({
          title: item.title,
          href: buildHref(item.slug),
          icon: getIconForCategory(item.slug),
        });
      }
    } else {
      nav.push({
        title: formatGroupName(group),
        href: buildHref(group),
        icon: getIconForCategory(group),
        items: items
          .sort((a, b) => a.order - b.order)
          .map((item) => ({
            title: item.title,
            href: buildHref(item.slug),
            icon: getIconForCategory(item.slug),
          })),
      });
    }
  }

  return { items: nav };
}

function getIconForCategory(category: string): string {
  const lowerCategory = category.toLowerCase();
  if (
    lowerCategory.includes("getting-started") ||
    lowerCategory.includes("start")
  ) {
    return "Rocket";
  }
  if (lowerCategory.includes("core-concepts")) {
    return "Cpu";
  }
  if (lowerCategory.includes("advanced")) {
    return "Settings";
  }
  if (lowerCategory.includes("api")) {
    return "Zap";
  }
  if (lowerCategory.includes("comparison")) {
    return "GitCompare";
  }
  if (lowerCategory.includes("debugging")) {
    return "Bug";
  }
  if (lowerCategory.includes("guide")) {
    return "BookOpen";
  }
  if (lowerCategory.includes("architecture")) {
    return "Settings";
  }
  return "Box";
}

function extractHeadings(
  content: string,
): { level: number; text: string; id: string }[] {
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");
    headings.push({ level, text, id });
  }

  return headings;
}

function formatGroupName(group: string): string {
  return group
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
