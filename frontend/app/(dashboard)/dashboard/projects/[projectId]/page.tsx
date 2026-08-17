import React from "react";
import ProjectDetailView from "@/components/features/Projects/ProjectDetailView";

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // In Next.js App Router, params is an asynchronous Promise
  const { projectId } = await params;

  return (
    <div className="h-full w-full overflow-hidden bg-background">
      <ProjectDetailView projectId={projectId} />
    </div>
  );
}