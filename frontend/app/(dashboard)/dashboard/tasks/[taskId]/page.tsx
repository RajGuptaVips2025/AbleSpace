// import TaskDetailView from "@/components/features/TaskBoard/TaskDetailView";

import TaskDetailView from "@/components/features/TaskBoard/TaskDetailView";

interface TaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const { taskId } = await params;
  return <TaskDetailView taskId={taskId} />;
}