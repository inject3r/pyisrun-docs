import { getDocNav, getAvailableVersions } from "@/lib/docs";
import Sidebar from "@/components/docs/Sidebar";
import { ReactNode } from "react";
import {
  Rocket,
  BookOpen,
  Zap,
  Settings,
  Box,
  Cpu,
  GitCompare,
  Bug,
} from "lucide-react";

const iconMap: Record<string, ReactNode> = {
  Rocket: <Rocket className="h-3.5 w-3.5" strokeWidth={2} />,
  BookOpen: <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />,
  Zap: <Zap className="h-3.5 w-3.5" strokeWidth={2} />,
  Settings: <Settings className="h-3.5 w-3.5" strokeWidth={2} />,
  Box: <Box className="h-3.5 w-3.5" strokeWidth={2} />,
  Cpu: <Cpu className="h-3.5 w-3.5" strokeWidth={2} />,
  GitCompare: <GitCompare className="h-3.5 w-3.5" strokeWidth={2} />,
  Bug: <Bug className="h-3.5 w-3.5" strokeWidth={2} />,
};

function getIconComponent(iconName?: string): ReactNode {
  if (!iconName) return <Box className="h-3.5 w-3.5" strokeWidth={2} />;
  return iconMap[iconName] || <Box className="h-3.5 w-3.5" strokeWidth={2} />;
}

interface Props {
  children: ReactNode;
  params: {
    version: string;
  };
}

export default async function DocsLayout({ children, params }: Props) {
  const { version } = await params;
  const nav = getDocNav(version);

  const sidebarItems = nav.items.map((item) => ({
    title: item.title,
    href: item.href,
    icon: getIconComponent(item.icon),
    items: item.items?.map((sub) => ({
      title: sub.title,
      href: sub.href,
      icon: getIconComponent(sub.icon),
    })),
  }));

  return (
    <div className="mx-auto w-[min(1200px,calc(100%-48px))] py-12">
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        <aside className="lg:sticky lg:top-[80px] lg:h-[calc(100vh-100px)] lg:overflow-y-auto lg:pr-2">
          <Sidebar items={sidebarItems} version={version} />
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}