'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { ProjectsBoard } from "@/components/features/Projects/ProjectsBoard"; // Update path if needed

export default function ProjectsPage() {
  const router = useRouter();

  const handleSelectProject = (projectId: string) => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  return (
    <div>
      <ProjectsBoard onSelectProject={handleSelectProject} />
    </div>
  );
}