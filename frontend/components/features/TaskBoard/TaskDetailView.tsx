"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { PriorityType, TaskStatusType } from "@/types/entity.types";
import {
  CreateEntityDialog,
  FieldConfig,
} from "@/components/common/Dialog/CreateEntityDialog";
import { FolderKanban } from "lucide-react";
import EntityDetailView from "@/components/common/Dashboard/EntityDetailView";
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
import { Task } from "@/api/tasks/task.api";

interface TaskDetailViewProps {
  taskId: string;
}

const STATUSES: { label: TaskStatusType; color: string }[] = [
  { label: "Backlog", color: "bg-orange-500 text-orange-500" },
  { label: "To Do", color: "bg-blue-500 text-blue-500" },
  { label: "Doing", color: "bg-amber-500 text-amber-500" },
  { label: "Completed", color: "bg-emerald-500 text-emerald-500" },
  { label: "On Hold", color: "bg-neutral-500 text-neutral-500" },
];

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ taskId }) => {
  const router = useRouter();

  const user = useAppStore((state) => state.user);
  const projects = useAppStore((state) => state.projects); 
  const fetchUserProjects = useAppStore((state) => state.fetchUserProjects);
  const currentTask = useAppStore((state) => state.currentTask);
  const subtasks = useAppStore((state) => state.subtasks);
  const isTasksLoading = useAppStore((state) => state.isTasksLoading);
  const fetchTaskById = useAppStore((state) => state.fetchTaskById);
  const fetchSubtasks = useAppStore((state) => state.fetchSubtasks);
  const addTask = useAppStore((state) => state.addTask);
  const editTask = useAppStore((state) => state.editTask);
  const removeTask = useAppStore((state) => state.removeTask);
  const addCommentToTask = useAppStore((state) => state.addCommentToTask);
  const clearCurrentTask = useAppStore((state) => state.clearCurrentTask);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [subtaskToEdit, setSubtaskToEdit] = useState<Task | null>(null);
  const [subtaskToDelete, setSubtaskToDelete] = useState<Task | null>(null);
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskById(taskId);
      fetchSubtasks(taskId);
    }
    if (user?.id) {
      fetchUserProjects(user.id);
    }

    return () => {
      clearCurrentTask();
    };
  }, [
    taskId,
    user?.id,
    fetchTaskById,
    fetchSubtasks,
    fetchUserProjects,
    clearCurrentTask,
  ]);

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

  const taskFormFields: FieldConfig[] = useMemo(() => {
    const todayStr = formatToLocalDateStr(new Date());
    const maxDateStr = currentTask?.due_date
      ? formatToLocalDateStr(currentTask.due_date)
      : undefined;

    return [
      {
        name: "title",
        label: "Title",
        type: "text",
        required: "Title is required", 
        placeholder: "Add subtask title here",
        colSpan: 2,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Add subtask description here",
        colSpan: 2,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: "To Do",
        required: "Status is required",
        colSpan: 1,
        options: STATUSES.map((s) => ({ label: s.label, value: s.label })),
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
        label: maxDateStr ? `Due Date (Max: ${maxDateStr})` : "Due Date",
        type: "date",
        required: "Due date is required", 
        min: todayStr,
        max: maxDateStr,
        colSpan: 2,
      },
      {
        name: "labels",
        label: "Labels",
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
  }, [currentTask?.due_date]);

  const editTaskFields: FieldConfig[] = useMemo(() => {
    const todayStr = formatToLocalDateStr(new Date());
    const parentProject = projects.find(
      (p) => p.id === currentTask?.project_id,
    );
    const maxProjectDateStr = parentProject?.due_date
      ? formatToLocalDateStr(parentProject.due_date)
      : undefined;
    return [
      {
        name: "title",
        label: "Title",
        type: "text",
        required: "Title is required",
        placeholder: "Task title",
        colSpan: 2,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Task description...",
        colSpan: 2,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: "To Do",
        required: "Status is required",
        colSpan: 1,
        options: STATUSES.map((s) => ({ label: s.label, value: s.label })),
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
        label: maxProjectDateStr
          ? `Due Date (Project Deadline: ${maxProjectDateStr})`
          : "Due Date",
        type: "date",
        required: "Due date is required",
        min: todayStr,
        max: maxProjectDateStr,
        colSpan: 2,
      },
      {
        name: "labels",
        label: "Labels",
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
  }, [projects, currentTask?.project_id]);

  const handleEditSubmit = async (formData: any) => {
    if (!currentTask) return;

    try {
      const updated = await editTask(currentTask.task_id, {
        title: formData.title,
        description: formData.description || "",
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date ? formData.due_date : null,
        labels: formData.labels || [],
        resources: formData.resources || [],
      } as any);

      if (updated) {
        toast.success("Task updated!");
        setIsEditDialogOpen(false);
      } else {
        throw new Error(
          "Failed to update task. Please check the entered details.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task",
      );
      throw error;
    }
  };

  const handleCreateSubtask = async (formData: any) => {
    if (!currentTask) return;

    try {
      const newSubtask = await addTask({
        project_id: currentTask.project_id,
        parent_id: currentTask.task_id,
        title: formData.title,
        description: formData.description || "",
        status: formData.status || "To Do",
        priority: formData.priority || "No Priority",
        due_date: formData.due_date ? formData.due_date : null,
        labels: formData.labels || [],
        resources: formData.resources || [],
      } as any);

      if (newSubtask) {
        toast.success(`Subtask "${formData.title}" created!`);
        setIsSubtaskModalOpen(false);
        await fetchSubtasks(currentTask.task_id);
      } else {
        throw new Error(
          "Failed to create subtask. Please check the entered details.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while creating the subtask",
      );
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!currentTask) return;
    try {
      setIsDeleting(true);
      const success = await removeTask(currentTask.task_id);
      if (success) {
        toast.success("Task deleted");
        router.push("/dashboard/tasks");
      } else {
        toast.error("Failed to delete task");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <EntityDetailView
      title={currentTask?.title || ""}
      description={currentTask?.description}
      isLoading={isTasksLoading && !currentTask}
      emptyMessage="Task not found"
      onEditClick={() => setIsEditDialogOpen(true)}
      onDeleteClick={handleDelete}
      isDeleting={isDeleting}
      deleteTitle="Delete Task"
      deleteDescription={`Are you sure you want to permanently delete "${currentTask?.title}" and its subtasks?`}
      primaryBadge={{
        icon: FolderKanban,
        text: currentTask?.project_name || "Project",
      }}
      labels={currentTask?.labels || []}
      resources={currentTask?.resources || []}
      tableTitle="Subtasks"
      tableItems={subtasks.map((st) => ({
        id: st.task_id,
        title: st.title,
        priority: st.priority,
        creatorName: st.creator_name || user?.name,
        creatorAvatar: user?.avatar_url || undefined,
        creatorFallback: user?.fallback_initials,
        dueDate: st.due_date,
        onEdit: () => setSubtaskToEdit(st),
        onDelete: () => setSubtaskToDelete(st),
      }))}
      isTableLoading={isTasksLoading}
      emptyTableMessage="No subtasks created for this task yet."
      onAddTableItem={() => setIsSubtaskModalOpen(true)}
      addTableItemText="Add Subtask"
      comments={currentTask?.comments || []}
      isSubmittingComment={isSubmittingComment}
      onAddComment={async (text) => {
        if (!currentTask) return;
        setIsSubmittingComment(true);
        const updated = await addCommentToTask(currentTask.task_id, text);
        setIsSubmittingComment(false);
        if (updated) {
          toast.success("Comment added");
        } else {
          toast.error("Failed to add comment");
        }
      }}
      status={currentTask?.status || "To Do"}
      statusOptions={STATUSES}
      onStatusChange={async (st) => {
        if (currentTask) {
          await editTask(currentTask.task_id, { status: st });
        }
      }}
      priority={currentTask?.priority || "No Priority"}
      onPriorityChange={async (pr) => {
        if (currentTask) {
          await editTask(currentTask.task_id, { priority: pr });
        }
      }}
      creatorName={currentTask?.creator_name || user?.name}
      creatorAvatar={user?.avatar_url || undefined}
      creatorInitials={user?.fallback_initials}
      createdAt={currentTask?.created_at}
      dueDate={currentTask?.due_date}
      maxDueDate={
        projects.find((p) => p.id === currentTask?.project_id)?.due_date
      }
      onDueDateChange={async (dateStr: string) => {
        if (!currentTask || !dateStr) return;

        const parentProject = projects.find(
          (p) => p.id === currentTask.project_id,
        );
        const maxProjectDateStr = parentProject?.due_date
          ? formatToLocalDateStr(parentProject.due_date)
          : undefined;

        if (maxProjectDateStr && dateStr > maxProjectDateStr) {
          toast.error(
            `Due date cannot be after the project deadline (${maxProjectDateStr})`,
          );
          return;
        }

        try {
          const ok = await editTask(currentTask.task_id, {
            due_date: dateStr,
          });
          if (ok) {
            toast.success("Due date updated");
            await fetchTaskById(currentTask.task_id);
          } else {
            toast.error("Failed to update due date");
          }
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to update due date",
          );
        }
      }}
      sidebarExtraRows={
        <div className="flex items-center justify-between py-1 text-xs">
          <span className="text-muted-foreground">Project</span>
          <span className="font-medium text-foreground">
            {currentTask?.project_name || "General"}
          </span>
        </div>
      }
    >

      {currentTask && (
        <CreateEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mode="edit"
          title="Edit Task"
          submitButtonText="Save Changes"
          fields={editTaskFields}
          initialData={{
            title: currentTask.title,
            description: currentTask.description || "",
            status: currentTask.status,
            priority: currentTask.priority,
            due_date: formatToLocalDateStr(currentTask.due_date),
            labels: currentTask.labels || [],
            resources: currentTask.resources || [],
          }}
          onSubmit={handleEditSubmit}
        />
      )}

      <CreateEntityDialog
        isOpen={isSubtaskModalOpen}
        onClose={() => setIsSubtaskModalOpen(false)}
        mode="create"
        title="Add Subtask"
        submitButtonText="Create Subtask"
        fields={taskFormFields}
        onSubmit={handleCreateSubtask}
      />

      {subtaskToEdit && (
        <CreateEntityDialog
          isOpen={!!subtaskToEdit}
          onClose={() => setSubtaskToEdit(null)}
          mode="edit"
          title="Edit Subtask"
          submitButtonText="Save Changes"
          fields={taskFormFields}
          initialData={{
            title: subtaskToEdit.title,
            description: subtaskToEdit.description || "",
            status: subtaskToEdit.status,
            priority: subtaskToEdit.priority,
            due_date: formatToLocalDateStr(subtaskToEdit.due_date),
            labels: subtaskToEdit.labels || [],
            resources: subtaskToEdit.resources || [],
          }}
          onSubmit={async (formData) => {
            if (!currentTask) return;
            const ok = await editTask(subtaskToEdit.task_id, formData);
            if (ok) {
              toast.success("Subtask updated!");
              setSubtaskToEdit(null);
              fetchSubtasks(currentTask.task_id);
            }
          }}
        />
      )}

      <AlertDialog
        open={!!subtaskToDelete}
        onOpenChange={(open) => !open && setSubtaskToDelete(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              Delete Subtask
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Are you sure you want to permanently delete &quot;
              {subtaskToDelete?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              disabled={isDeletingSubtask}
              className="h-8 text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!subtaskToDelete || !currentTask) return;
                setIsDeletingSubtask(true);
                try {
                  const ok = await removeTask(subtaskToDelete.task_id);
                  if (ok) {
                    toast.success("Subtask deleted");
                    fetchSubtasks(currentTask.task_id);
                  }
                } finally {
                  setIsDeletingSubtask(false);
                  setSubtaskToDelete(null);
                }
              }}
              disabled={isDeletingSubtask}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeletingSubtask ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EntityDetailView>
  );
};

export default TaskDetailView;
