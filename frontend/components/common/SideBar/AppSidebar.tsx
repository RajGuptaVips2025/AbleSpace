"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid, Folder, PanelLeftClose } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { UserProfilePopover } from "@/components/common/PopOver/UserProfilePopover";
import { useAppStore } from "@/store/useAppStore";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
}

const workspaceNavItems: NavItem[] = [
  {
    id: "tasks",
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: LayoutGrid,
  },
  {
    id: "projects",
    title: "Projects",
    href: "/dashboard/projects",
    icon: Folder,
  },
];

interface AppSidebarProps {
  isOpen: boolean;
  onToggleSidebar?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onToggleSidebar,
}) => {
  const pathname = usePathname();
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const user = useAppStore((state) => state.user);

  return (
    <>
      {isOpen && (
        <div
          onClick={onToggleSidebar}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`relative z-40 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ${
          isOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex h-16 w-full items-center justify-between p-2">
          <div className="flex-1 min-w-0">
            <UserProfilePopover
              user={{
                name: user?.name || "Admin",
                email: user?.email || "admin@workspace.com",
                avatarUrl: user?.avatar_url || undefined,
                fallback: user?.fallback_initials || "U",
              }}
            />
          </div>

          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 md:hidden ml-1"
              onClick={onToggleSidebar}
            >
              <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          <Collapsible
            open={isWorkspaceOpen}
            onOpenChange={setIsWorkspaceOpen}
            className="space-y-1"
          >
            {/* <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold text-sidebar-foreground hover:bg-transparent"
              >
                <span>Workspace</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isWorkspaceOpen ? "" : "-rotate-90"
                  }`}
                />
              </Button>
            </CollapsibleTrigger> */}

            <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer select-none">
              <span>Projects</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isWorkspaceOpen ? "" : "-rotate-90"
                }`}
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1 pt-1">
              {workspaceNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
