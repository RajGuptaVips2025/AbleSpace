"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Calendar,
  Tag,
  ChevronDown,
  CircleDot,
  SignalHigh,
  Signal,
  SignalMedium,
  SignalLow,
  Loader2,
  Edit2,
  Trash2,
  GripVertical,
  Filter,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  CreateEntityDialog,
  FieldConfig,
} from "@/components/common/Dialog/CreateEntityDialog";

import { type Task } from "@/api/tasks/task.api";
import { PriorityType, TaskStatusType } from "@/types/entity.types";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

import {
  FieldsCustomizerPopover,
  DEFAULT_VISIBLE_FIELDS,
  VisibleFields,
} from "@/components/common/PopOver/FieldsCustomizerPopover";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TaskFilters {
  status: string;
  priority: string;
  dueBefore: string;
}
const DEFAULT_FILTERS: TaskFilters = {
  status: "all",
  priority: "all",
  dueBefore: "",
};

const DEFAULT_COLUMNS: { id: TaskStatusType; title: string }[] = [
  { id: "To Do", title: "To Do" },
  { id: "Doing", title: "Doing" },
  { id: "Completed", title: "Completed" },
  { id: "On Hold", title: "On Hold" },
  { id: "Backlog", title: "Backlog" },
];

export const TaskBoard: React.FC = () => {
  const router = useRouter();

  const user = useAppStore((state) => state.user);
  const projects = useAppStore((state) => state.projects);
  const fetchUserProjects = useAppStore((state) => state.fetchUserProjects);

  const tasks = useAppStore((state) => state.tasks);
  const isTasksLoading = useAppStore((state) => state.isTasksLoading);
  const fetchUserTasks = useAppStore((state) => state.fetchUserTasks);
  const addTask = useAppStore((state) => state.addTask);
  const editTask = useAppStore((state) => state.editTask);
  const removeTask = useAppStore((state) => state.removeTask);

  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "To Do": true,
    Doing: true,
    Completed: true,
    "On Hold": true,
    Backlog: true,
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] =
    useState<TaskStatusType>("To Do");

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] =
    useState<TaskStatusType | null>(null);

  const [columns, setColumns] =
    useState<{ id: TaskStatusType; title: string }[]>(DEFAULT_COLUMNS);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(
    null,
  );
  const [dragOverColumnIndex, setDragOverColumnIndex] = useState<number | null>(
    null,
  );

  const [visibleFields, setVisibleFields] = useState<VisibleFields>(() => {
    try {
      const saved = localStorage.getItem("taskboard_visible_fields");
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_FIELDS;
    } catch {
      return DEFAULT_VISIBLE_FIELDS;
    }
  });

  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.priority !== "all") count++;
    if (filters.dueBefore !== "") count++;
    return count;
  }, [filters]);

  const handleToggleField = (fieldKey: keyof VisibleFields) => {
    setVisibleFields((prev) => {
      const next = { ...prev, [fieldKey]: !prev[fieldKey] };
      try {
        localStorage.setItem("taskboard_visible_fields", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save field preferences:", e);
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem("taskboard_columns_order");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setColumns(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved column order:", e);
    }
  }, []);

  useEffect(() => {
    fetchUserTasks();
    if (user?.id) {
      fetchUserProjects(user.id);
    }
  }, [user?.id, fetchUserTasks, fetchUserProjects]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatToLocalDateStr = (
    dateInput?: string | Date | null,
  ): string | undefined => {
    if (!dateInput) return undefined;
    if (
      typeof dateInput === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())
    ) {
      return dateInput.trim();
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return undefined;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const taskFields: FieldConfig[] = useMemo(() => {
    const todayStr = formatToLocalDateStr(new Date())!;

    const associatedProject = taskToEdit
      ? projects.find((p) => p.id === taskToEdit.project_id)
      : undefined;

    const maxDateStr = formatToLocalDateStr(associatedProject?.due_date);

    const projectOptions = projects.map((p) => ({
      label: p.name,
      value: p.id,
    }));

    return [
      {
        name: "project_id",
        label: "Associated Project",
        type: "select",
        required: "Please select an associated project",
        placeholder: "Select a project...",
        options: projectOptions,
        colSpan: 2,
        disabledInEdit: true,
      },
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
        placeholder: "Describe task requirements...",
        colSpan: 2,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: defaultStatusForNewTask,
        required: "Status is required",
        colSpan: 1,
        options: [
          { label: "To Do", value: "To Do" },
          { label: "Doing", value: "Doing" },
          { label: "Completed", value: "Completed" },
          { label: "On Hold", value: "On Hold" },
          { label: "Backlog", value: "Backlog" },
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
          {
            label: "High",
            value: "High",
            icon: Signal,
            color: "text-orange-500",
          },
          {
            label: "Medium",
            value: "Medium",
            icon: SignalMedium,
            color: "text-amber-500",
          },
          {
            label: "Low",
            value: "Low",
            icon: SignalLow,
            color: "text-blue-500",
          },
        ],
      },
      {
        name: "due_date",
        label: "Due Date",
        type: "date",
        required: "Due date is required",
        min: todayStr,
        dynamicMax: (values) => {
          const selectedProjId = values?.project_id || taskToEdit?.project_id;
          const proj = projects.find((p) => p.id === selectedProjId);
          return formatToLocalDateStr(proj?.due_date);
        },
        colSpan: 2,
      },
      {
        name: "labels",
        label: "Task Labels",
        type: "tags",
        placeholder: "Type label and press Add or Enter...",
        defaultValue: [],
        colSpan: 2,
      },
      {
        name: "resources",
        label: "Resources & Links",
        type: "list",
        placeholder: "Paste document link or URL...",
        defaultValue: [],
        colSpan: 2,
      },
    ];
  }, [projects, defaultStatusForNewTask, taskToEdit]);

  const handleOpenCreate = (status: TaskStatusType = "To Do") => {
    if (projects.length === 0) {
      toast.error("Please create at least one project before adding tasks.");
      return;
    }
    setTaskToEdit(null);
    setDefaultStatusForNewTask(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (formData: any) => {
    try {
      if (!formData.project_id && !taskToEdit) {
        toast.error("Please select an associated project");
        return;
      }

      if (taskToEdit) {
        const updated = await editTask(taskToEdit.task_id, {
          title: formData.title,
          description: formData.description || "",
          status: formData.status,
          priority: formData.priority,
          due_date: formData.due_date ? formData.due_date : null,
          labels: Array.isArray(formData.labels) ? formData.labels : [],
          resources: Array.isArray(formData.resources)
            ? formData.resources
            : [],
        } as any);

        if (updated) {
          toast.success(`Task "${formData.title}" updated!`);
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        } else {
          throw new Error(
            "Failed to update task. Please check the entered details.",
          );
        }
      } else {
        const created = await addTask({
          project_id: formData.project_id,
          title: formData.title,
          description: formData.description || "",
          status: formData.status || "To Do",
          priority: formData.priority || "No Priority",
          due_date: formData.due_date ? formData.due_date : null,
          labels: Array.isArray(formData.labels) ? formData.labels : [],
          resources: Array.isArray(formData.resources)
            ? formData.resources
            : [],
        } as any);

        if (created) {
          toast.success(`Task "${formData.title}" created!`);
          setIsTaskModalOpen(false);
        } else {
          throw new Error(
            "Failed to create task. Please check the entered details.",
          );
        }
      }
    } catch (error) {
      console.error("Task submit error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the task.",
      );
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      const success = await removeTask(taskToDelete.task_id);
      if (success) {
        toast.success(`Task "${taskToDelete.title}" deleted.`);
      } else {
        toast.error("Failed to delete task");
      }
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatusType) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const handleDrop = async (targetStatus: TaskStatusType) => {
    if (!draggedTaskId) return;

    const task = tasks.find((t) => t.task_id === draggedTaskId);
    if (!task || task.status === targetStatus) {
      setDraggedTaskId(null);
      setDragOverColumnId(null);
      return;
    }

    try {
      await editTask(draggedTaskId, { status: targetStatus });
    } catch {
      toast.error("Failed to update task status");
    } finally {
      setDraggedTaskId(null);
      setDragOverColumnId(null);
    }
  };

  const handleColumnDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedColumnIndex(index);
  };

  const handleColumnDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedColumnIndex !== null && draggedColumnIndex !== index) {
      setDragOverColumnIndex(index);
    }
  };

  const handleColumnDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) {
      setDraggedColumnIndex(null);
      setDragOverColumnIndex(null);
      return;
    }

    setColumns((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedColumnIndex, 1);
      updated.splice(targetIndex, 0, moved);

      try {
        localStorage.setItem(
          "taskboard_columns_order",
          JSON.stringify(updated),
        );
      } catch (err) {
        console.error("Failed to save column order:", err);
      }

      return updated;
    });

    setDraggedColumnIndex(null);
    setDragOverColumnIndex(null);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.labels?.some((l) => l.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (filters.status !== "all" && t.status !== filters.status) {
        return false;
      }

      if (
        filters.priority !== "all" &&
        (t.priority || "No Priority") !== filters.priority
      ) {
        return false;
      }

      if (filters.dueBefore) {
        if (!t.due_date) return false;
        const taskDate = formatToLocalDateStr(t.due_date);
        if (!taskDate || taskDate > filters.dueBefore) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, filters]);

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-background">
      <div className="flex min-h-[56px] sm:min-h-[64px] shrink-0 items-center justify-between border-b border-border px-3 sm:px-6 gap-2">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground shrink-0">
          Tasks
        </h1>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {isSearchOpen ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-8 w-28 sm:w-44 rounded-md border border-input bg-background pl-8 pr-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }
                }}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-foreground"
              aria-label="Search tasks"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <FieldsCustomizerPopover
            currentView={viewMode}
            onViewChange={(mode) => setViewMode(mode)}
            visibleFields={visibleFields}
            onToggleField={handleToggleField}
          />

          <Popover>
            {/* <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`relative h-8 w-8 text-foreground transition-all ${
                  activeFiltersCount > 0
                    ? "border-primary bg-primary/10 text-primary"
                    : ""
                }`}
                aria-label="Filter tasks"
              >
                <Filter className="h-3.5 w-3.5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger> */}
            <PopoverTrigger
              className={`relative inline-flex items-center justify-center h-8 w-8 rounded-lg border border-input bg-background text-foreground hover:bg-muted cursor-pointer outline-none transition-all ${activeFiltersCount > 0 ? "border-primary bg-primary/10 text-primary" : ""}`}
            >
              <Filter className="h-3.5 w-3.5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                  {activeFiltersCount}
                </span>
              )}
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-64 rounded-2xl p-3.5 shadow-xl border border-border bg-popover space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Filter Tasks</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Statuses</option>
                  <option value="To Do">To Do</option>
                  <option value="Doing">Doing</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="No Priority">No Priority</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Due On or Before
                </label>
                <div className="relative flex items-center">
                  <Calendar className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />

                  <input
                    type="date"
                    value={filters.dueBefore}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dueBefore: e.target.value,
                      }))
                    }
                    onClick={(e) => (e.target as any).showPicker?.()}
                    className="w-full h-8 rounded-lg border border-input bg-background pl-8 pr-7 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                  />
                  {filters.dueBefore && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, dueBefore: "" }))
                      }
                      className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-muted"
                      title="Clear date"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="sm"
            onClick={() => handleOpenCreate("To Do")}
            className="h-8 gap-1 rounded-lg bg-neutral-900 px-2.5 sm:px-3 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {isTasksLoading && tasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            <span>Loading tasks...</span>
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* ==================== LIST VIEW ==================== */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === column.id,
            );
            const isOpen = openSections[column.id] ?? true;

            return (
              <Collapsible
                key={column.id}
                open={isOpen}
                onOpenChange={() => toggleSection(column.id)}
                className="space-y-2 w-full"
              >
                {/* <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 p-0 hover:bg-transparent text-sm font-bold text-foreground select-none"
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <span>{column.title}</span>
                  </Button>
                </CollapsibleTrigger> */}

                <CollapsibleTrigger className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none">
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                  />
                  <span>{column.title}</span>
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] font-normal"
                  >
                    {tasks.length}
                  </Badge>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="w-full overflow-x-auto rounded-lg border border-border/80 bg-card shadow-xs">
                    <Table>
                      <TableHeader className="bg-muted/40 border-b border-border/70">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[45%] text-xs font-semibold text-foreground py-3">
                            Task
                          </TableHead>
                          <TableHead className="w-[18%] text-xs font-semibold text-foreground py-3">
                            Priority
                          </TableHead>
                          <TableHead className="w-[12%] text-xs font-semibold text-foreground py-3">
                            Members
                          </TableHead>
                          <TableHead className="w-[18%] text-xs font-semibold text-foreground py-3">
                            Due Date
                          </TableHead>
                          <TableHead className="w-[7%] text-right text-xs font-semibold text-foreground py-3 pr-4">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columnTasks.length > 0
                          ? columnTasks.map((task) => (
                              <TableRow
                                key={task.task_id}
                                className="hover:bg-muted/30 border-b border-border/50 transition-colors"
                              >
                                <TableCell
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/tasks/${task.task_id}`,
                                    )
                                  }
                                  className="font-semibold text-xs text-foreground hover:text-blue-600 cursor-pointer py-3"
                                >
                                  {task.title}
                                </TableCell>

                                <TableCell className="py-3">
                                  {task.priority === "Urgent" ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                                      <SignalHigh className="h-3.5 w-3.5" />
                                      <span>Urgent</span>
                                    </div>
                                  ) : task.priority === "High" ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
                                      <Signal className="h-3.5 w-3.5" />
                                      <span>High</span>
                                    </div>
                                  ) : task.priority === "Medium" ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                                      <SignalMedium className="h-3.5 w-3.5" />
                                      <span>Medium</span>
                                    </div>
                                  ) : task.priority === "Low" ? (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
                                      <SignalLow className="h-3.5 w-3.5" />
                                      <span>Low</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                      <CircleDot className="h-3.5 w-3.5" />
                                      <span>No Priority</span>
                                    </div>
                                  )}
                                </TableCell>

                                <TableCell className="py-3">
                                  <Avatar className="h-6 w-6 border border-border">
                                    <AvatarImage
                                      src={user?.avatar_url || undefined}
                                    />
                                    <AvatarFallback className="text-[10px] font-medium bg-muted text-foreground">
                                      {user?.fallback_initials || "CN"}
                                    </AvatarFallback>
                                  </Avatar>
                                </TableCell>

                                <TableCell className="text-xs font-medium text-foreground py-3">
                                  {task.due_date
                                    ? new Date(
                                        task.due_date,
                                      ).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </TableCell>

                                <TableCell className="text-right py-3 pr-4">
                                  <DropdownMenu>
                                    {/* <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                      >
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger> */}

                                    <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none">
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-36 text-xs"
                                    >
                                      <DropdownMenuItem
                                        onClick={() => handleOpenEdit(task)}
                                        className="gap-2 cursor-pointer text-xs"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                        <span>Edit Task</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setTaskToDelete(task)}
                                        className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Delete Task</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          : null}

                        <TableRow className="hover:bg-transparent border-none">
                          <TableCell colSpan={5} className="py-2.5 px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCreate(column.id)}
                              className="h-7 gap-1.5 px-2 text-xs font-medium text-foreground hover:bg-muted/60"
                            >
                              <Plus className="h-3.5 w-3.5 text-foreground" />
                              <span>Add Task</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        /* ==================== BOARD / KANBAN VIEW ==================== */
        <div className="flex flex-1 items-start gap-4 overflow-x-auto overflow-y-auto p-6 scrollbar-thin">
          {columns.map((column, colIdx) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === column.id,
            );
            const isColumnBeingDragged = draggedColumnIndex === colIdx;
            const isColumnDragOver = dragOverColumnIndex === colIdx;
            const isTaskDragOver =
              dragOverColumnId === column.id && draggedTaskId !== null;

            return (
              <div
                key={column.id}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, colIdx)}
                onDragOver={(e) => {
                  if (draggedColumnIndex !== null) {
                    handleColumnDragOver(e, colIdx);
                  } else {
                    handleDragOver(e, column.id);
                  }
                }}
                onDrop={(e) => {
                  if (draggedColumnIndex !== null) {
                    handleColumnDrop(e, colIdx);
                  } else {
                    handleDrop(column.id);
                  }
                }}
                className={`flex h-auto max-h-full w-72 shrink-0 flex-col gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3.5 transition-all duration-200 sm:w-80 ${
                  isColumnBeingDragged
                    ? "opacity-30 scale-95 border-dashed border-primary"
                    : ""
                } ${
                  isColumnDragOver ? "ring-2 ring-primary ring-offset-2" : ""
                } ${isTaskDragOver ? "border-2 border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-center justify-between px-1">
                  <div
                    className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none"
                    title="Drag to switch column position"
                  >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-xs font-semibold text-foreground">
                      {column.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenCreate(column.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-230px)] pr-0.5">
                  {columnTasks.length > 0
                    ? columnTasks.map((task) => {
                        const isBeingDragged = draggedTaskId === task.task_id;

                        return (
                          <Card
                            key={task.task_id}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleDragStart(task.task_id);
                            }}
                            className={`w-full cursor-grab rounded-xl border border-border/70 bg-card p-3.5 shadow-xs transition-all active:cursor-grabbing hover:border-border hover:shadow-sm ${
                              isBeingDragged
                                ? "opacity-40 scale-95 border-dashed"
                                : ""
                            }`}
                          >
                            <CardContent className="space-y-3 p-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/tasks/${task.task_id}`,
                                    )
                                  }
                                  className="text-xs font-semibold leading-snug text-foreground hover:text-blue-600 cursor-pointer transition-colors"
                                >
                                  {task.title}
                                </h3>

                                <DropdownMenu>
                                  {/* <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="-mr-1 -mt-1 h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger> */}

                                  <DropdownMenuTrigger className="flex -mr-1 -mt-1 h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none transition-colors">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-36 text-xs"
                                  >
                                    <DropdownMenuItem
                                      onClick={() => handleOpenEdit(task)}
                                      className="gap-2 cursor-pointer text-xs"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                      <span>Edit Task</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setTaskToDelete(task)}
                                      className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete Task</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={user?.avatar_url || undefined}
                                    />
                                    <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700">
                                      {user?.fallback_initials || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-foreground truncate">
                                    {task.creator_name || user?.name || "Admin"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 ml-auto">
                                  {visibleFields.priority && task.priority && (
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                      {task.priority}
                                    </span>
                                  )}

                                  {visibleFields.status && task.status && (
                                    <span className="text-[10px] font-medium rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                                      {task.status}
                                    </span>
                                  )}

                                  {visibleFields.dueDate && task.due_date && (
                                    <div className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(task.due_date)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {visibleFields.labels &&
                                task.labels &&
                                task.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                                    {task.labels.map((tag, idx) => (
                                      <Badge
                                        key={`${task.task_id}-tag-${idx}`}
                                        variant="outline"
                                        className="h-5 gap-1 rounded-md border-border/80 bg-background px-2 text-[11px] font-normal text-muted-foreground"
                                      >
                                        <Tag className="h-2.5 w-2.5" />
                                        <span>{tag}</span>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        );
                      })
                    : null}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => handleOpenCreate(column.id)}
                  className="h-7 w-full justify-start gap-1 px-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <CreateEntityDialog
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        mode={taskToEdit ? "edit" : "create"}
        title={taskToEdit ? "Edit Task" : "Create New Task"}
        description={
          taskToEdit
            ? "Update task requirements, priority, deadlines, and labels."
            : "Define a new work item, select its project, and set properties."
        }
        submitButtonText={taskToEdit ? "Save Changes" : "Create Task"}
        fields={taskFields}
        initialData={
          taskToEdit
            ? {
                project_id: taskToEdit.project_id,
                title: taskToEdit.title,
                description: taskToEdit.description || "",
                status: taskToEdit.status,
                priority: taskToEdit.priority,
                due_date: formatToLocalDateStr(taskToEdit.due_date) || "",
                labels: taskToEdit.labels || [],
                resources: taskToEdit.resources || [],
              }
            : {
                project_id: "",
                status: defaultStatusForNewTask,
                priority: "No Priority",
                labels: [],
                resources: [],
              }
        }
        onSubmit={handleTaskSubmit}
      />

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
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{taskToDelete?.title}&quot;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel disabled={isDeleting} className="h-8 text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskBoard;
