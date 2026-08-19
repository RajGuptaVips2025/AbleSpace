"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import {
  CreateEntityDialog,
  FieldConfig,
} from "@/components/common/Dialog/CreateEntityDialog";
import {
  CircleDot,
  SignalHigh,
  Signal,
  SignalMedium,
  SignalLow,
} from "lucide-react";
import EntityDetailView from "@/components/common/Dashboard/EntityDetailView";
import { type Task } from "@/api/tasks/task.api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectDetailViewProps {
  projectId: string;
}

const STATUSES = [
  { label: "Backlog", color: "bg-orange-500 text-orange-500" },
  { label: "To Do", color: "bg-blue-500 text-blue-500" },
  { label: "In Progress", color: "bg-amber-500 text-amber-500" },
  { label: "Completed", color: "bg-emerald-500 text-emerald-500" },
  { label: "On Hold", color: "bg-neutral-500 text-neutral-500" },
];

const formatToLocalDateStr = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "";
  if (
    typeof dateInput === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())
  ) {
    return dateInput.trim();
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PROJECT_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Project Name",
    type: "text",
    required: "Project name is required",
    colSpan: 2,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    colSpan: 2,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: "Status is required",
    colSpan: 1,
    options: STATUSES.map((s) => ({ label: s.label, value: s.label })),
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    required: "Priority is required",
    colSpan: 1,
    options: [
      {
        label: "No Priority",
        value: "No Priority",
        icon: CircleDot,
        color: "text-muted-foreground",
      },
      {
        label: "Urgent",
        value: "Urgent",
        icon: SignalHigh,
        color: "text-red-500",
      },
      { label: "High", value: "High", icon: Signal, color: "text-orange-500" },
      {
        label: "Medium",
        value: "Medium",
        icon: SignalMedium,
        color: "text-amber-500",
      },
      { label: "Low", value: "Low", icon: SignalLow, color: "text-blue-500" },
    ],
  },
  {
    name: "team_name",
    label: "Team Name",
    type: "text",
    required: "Team name is required", 
    colSpan: 1,
  },
  {
    name: "due_date",
    label: "Due Date",
    type: "date",
    required: "Due date is required",
    min: new Date().toISOString().split("T")[0],
    colSpan: 1,
  },
  {
    name: "labels",
    label: "Labels",
    type: "tags",
    defaultValue: [],
  },
  {
    name: "resources",
    label: "Resources / URLs",
    type: "list",
    defaultValue: [],
  },
];

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const currentProject = useAppStore((state) => state.currentProject);
  const isProjectsLoading = useAppStore((state) => state.isProjectsLoading);
  const fetchProjectById = useAppStore((state) => state.fetchProjectById);
  const editProject = useAppStore((state) => state.editProject);
  const removeProject = useAppStore((state) => state.removeProject);
  const addComment = useAppStore((state) => state.addComment);
  const editTask = useAppStore((state) => state.editTask);
  const removeTask = useAppStore((state) => state.removeTask);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const tasks = useAppStore((state) => state.tasks);
  const isTasksLoading = useAppStore((state) => state.isTasksLoading);
  const fetchTasksByProject = useAppStore((state) => state.fetchTasksByProject);
  const addTask = useAppStore((state) => state.addTask);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchTasksByProject(projectId);
    }
  }, [projectId, fetchProjectById, fetchTasksByProject]);

  const taskFields: FieldConfig[] = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const maxDateStr = formatToLocalDateStr(currentProject?.due_date);

    return [
      {
        name: "title",
        label: "Task Title",
        type: "text",
        placeholder: "e.g. Implement authentication middleware",
        required: "Task title is required",
        colSpan: 2,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Describe task requirements, scope, and deliverables...",
        colSpan: 2,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: "To Do",
        required: "Status is required",
        placeholder: "Select status...",
        colSpan: 1,
        options: [
          { label: "Backlog", value: "Backlog" },
          { label: "To Do", value: "To Do" },
          { label: "Doing", value: "Doing" },
          { label: "Completed", value: "Completed" },
          { label: "On Hold", value: "On Hold" },
        ],
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        defaultValue: "No Priority",
        required: "Priority is required",
        colSpan: 1,
        options: [
          { label: "No Priority", value: "No Priority" },
          { label: "Urgent", value: "Urgent" },
          { label: "High", value: "High" },
          { label: "Medium", value: "Medium" },
          { label: "Low", value: "Low" },
        ],
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: "Due date is required",
        min: todayStr,
        max: maxDateStr,
        colSpan: 2,
      },
      {
        name: "labels",
        label: "Task Labels",
        type: "tags",
        defaultValue: [],
        colSpan: 2,
      },
      {
        name: "resources",
        label: "Resources",
        type: "list",
        defaultValue: [],
        colSpan: 2,
      },
    ];
  }, [currentProject?.due_date]);

  const handleCreateTask = async (formData: any) => {
    if (!currentProject) return;

    const newTask = await addTask({
      project_id: currentProject.id,
      title: formData.title,
      description: formData.description || "",
      status: formData.status || "To Do",
      priority: formData.priority || "No Priority",
      due_date: formData.due_date ? formData.due_date : null,
      labels: formData.labels || [],
      resources: formData.resources || [],
    } as any);

    if (newTask) {
      toast.success(`Task "${formData.title}" created!`);
      setIsTaskModalOpen(false);
    } else {
      toast.error("Failed to create task");
    }
  };

  const handleDelete = async () => {
    if (!currentProject) return;
    try {
      setIsDeleting(true);
      const ok = await removeProject(currentProject.id);
      if (ok) {
        toast.success("Project deleted successfully");
        router.push("/dashboard/projects");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <EntityDetailView
      title={currentProject?.name || ""}
      description={currentProject?.description}
      isLoading={isProjectsLoading && !currentProject}
      emptyMessage="Project not found"
      onEditClick={() => setIsEditDialogOpen(true)}
      onDeleteClick={handleDelete}
      isDeleting={isDeleting}
      deleteTitle="Delete Project"
      deleteDescription={`Are you sure you want to permanently delete "${currentProject?.name}" and all its tasks?`}
      primaryBadge={{
        text: currentProject?.team_name || "General Team",
      }}
      labels={currentProject?.labels || []}
      resources={currentProject?.resources || []}
      tableTitle="Tasks"
      tableItems={tasks.map((t) => ({
        id: t.task_id,
        title: t.title,
        priority: t.priority,
        creatorName: t.creator_name || user?.name,
        creatorAvatar: user?.avatar_url || undefined,
        creatorFallback: user?.fallback_initials,
        dueDate: t.due_date,
        onClick: () => router.push(`/dashboard/tasks/${t.task_id}`),
        onEdit: () => setTaskToEdit(t),
        onDelete: () => setTaskToDelete(t),
      }))}
      isTableLoading={isTasksLoading}
      emptyTableMessage="No tasks created under this project yet."
      onAddTableItem={() => setIsTaskModalOpen(true)}
      addTableItemText="Add Task"
      comments={currentProject?.comments || []}
      isSubmittingComment={isSubmittingComment}
      onAddComment={async (text) => {
        if (!currentProject) return;
        setIsSubmittingComment(true);
        const ok = await addComment(currentProject.id, text);
        setIsSubmittingComment(false);
        if (ok) toast.success("Comment added");
      }}
      status={currentProject?.status || "To Do"}
      statusOptions={STATUSES}
      onStatusChange={async (st) => {
        if (currentProject) editProject(currentProject.id, { status: st });
      }}
      priority={currentProject?.priority || "Medium"}
      onPriorityChange={async (pr) => {
        if (currentProject) editProject(currentProject.id, { priority: pr });
      }}
      creatorName={currentProject?.creator_name || user?.name}
      creatorAvatar={user?.avatar_url}
      creatorInitials={user?.fallback_initials}
      createdAt={currentProject?.created_at}
      dueDate={currentProject?.due_date}
      onDueDateChange={async (dateStr: string) => {
        if (currentProject && dateStr) {
          await editProject(currentProject.id, { due_date: dateStr });
          toast.success("Due date updated");
        }
      }}
      sidebarExtraRows={
        <div className="flex items-center justify-between py-1 text-xs">
          <span className="text-muted-foreground">Team</span>
          <span className="font-medium text-foreground">
            {currentProject?.team_name || "General"}
          </span>
        </div>
      }
    >
      {currentProject && (
        <CreateEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mode="edit"
          title="Edit Project"
          submitButtonText="Save Changes"
          fields={PROJECT_FIELDS}
          initialData={{
            name: currentProject.name,
            description: currentProject.description || "",
            status: currentProject.status,
            priority: currentProject.priority,
            due_date: formatToLocalDateStr(currentProject.due_date),
            team_name: currentProject.team_name || "",
            labels: currentProject.labels || [],
            resources: currentProject.resources || [],
          }}
          onSubmit={async (data) => {
            const ok = await editProject(currentProject.id, data);
            if (ok) {
              toast.success("Project updated!");
              setIsEditDialogOpen(false);
            }
          }}
        />
      )}
      <CreateEntityDialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        mode="create"
        title="Create New Task"
        submitButtonText="Create Task"
        fields={taskFields}
        onSubmit={handleCreateTask}
      />

      {taskToEdit && (
        <CreateEntityDialog
          isOpen={!!taskToEdit}
          onClose={() => setTaskToEdit(null)}
          mode="edit"
          title="Edit Task"
          submitButtonText="Save Changes"
          fields={taskFields}
          initialData={{
            title: taskToEdit.title,
            description: taskToEdit.description || "",
            status: taskToEdit.status,
            priority: taskToEdit.priority,
            due_date: formatToLocalDateStr(taskToEdit.due_date),
            labels: taskToEdit.labels || [],
            resources: taskToEdit.resources || [],
          }}
          onSubmit={async (formData) => {
            const ok = await editTask(taskToEdit.task_id, formData);
            if (ok) {
              toast.success("Task updated!");
              setTaskToEdit(null);
            }
          }}
        />
      )}

      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete &quot;
              {taskToDelete?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              disabled={isDeletingTask}
              className="h-8 text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!taskToDelete) return;
                setIsDeletingTask(true);
                try {
                  const ok = await removeTask(taskToDelete.task_id);
                  if (ok) toast.success("Task deleted");
                } finally {
                  setIsDeletingTask(false);
                  setTaskToDelete(null);
                }
              }}
              disabled={isDeletingTask}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeletingTask ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EntityDetailView>
  );
};

export default ProjectDetailView;
