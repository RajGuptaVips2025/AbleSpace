"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/common/SideBar/AppSidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/context/SidebarContext";
import DashboardTopBar from "@/components/common/Dashboard/DashboardTopBar";
import { useAppStore } from "@/store/useAppStore";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { isAuthenticated, isHydrated } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar isOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />

      <main className="flex min-w-0 w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopBar />
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}