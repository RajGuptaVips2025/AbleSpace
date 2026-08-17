"use client";

import React from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/context/SidebarContext";

const DashboardTopBar = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex h-[60px] shrink-0 items-center border-b border-border px-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="ml-2 h-5 w-px bg-border" />
    </div>
  );
};

export default DashboardTopBar;