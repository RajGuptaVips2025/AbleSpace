"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Calendar,
  Tag,
  ChevronDown,
  SignalHigh,
  Signal,
  SignalMedium,
  SignalLow,
  CircleDot,
  Loader2,
  Edit2,
  Trash2,
  Check,
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
import FieldsCustomizerPopover from "@/components/common/PopOver/FieldsCustomizerPopover";

import {
  getUserTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
} from "@/api/tasks/task.api";
import { PriorityType, TaskStatusType } from "@/types/entity.types";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

const COLUMNS: { id: TaskStatusType; title: string; color: string }[] = [
  { id: "Backlog", title: "Backlog", color: "bg-orange-500" },
  { id: "To Do", title: "To Do", color: "bg-blue-500" },
  { id: "Doing", title: "In Progress", color: "bg-amber-500" },
  { id: "Completed", title: "Completed", color: "bg-emerald-500" },
  { id: "On Hold", title: "On Hold", color: "bg-neutral-500" },
];

export const TaskBoard: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const projects = useAppStore((state) => state.projects);
  const fetchUserProjects = useAppStore((state) => state.fetchUserProjects);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Backlog: true,
    "To Do": true,
    Doing: true,
    Completed: true,
    "On Hold": true,
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

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const res = await getUserTasks();
      if (res.success && res.data) {
        setTasks(res.data);
      } else {
        toast.error(res.message || "Failed to load tasks");
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    if (user?.id) {
      fetchUserProjects(user.id);
    }
  }, [user?.id, fetchUserProjects]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const taskFields: FieldConfig[] = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const associatedProject = taskToEdit
      ? projects.find((p) => p.id === taskToEdit.project_id)
      : undefined;

    let maxDateStr: string | undefined = undefined;
    if (associatedProject?.due_date) {
      if (typeof associatedProject.due_date === "string") {
        maxDateStr = associatedProject.due_date.split("T")[0];
      } else {
        const pd = new Date(associatedProject.due_date);
        maxDateStr = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, "0")}-${String(pd.getDate()).padStart(2, "0")}`;
      }
    }

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
        placeholder: "Describe task requirements and acceptance criteria...",
        colSpan: 2,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: defaultStatusForNewTask,
        required: true,
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
        required: true,
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
        label: maxDateStr ? `Due Date (Max: ${maxDateStr})` : "Due Date",
        type: "date",
        min: todayStr,
        max: maxDateStr, 
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
        const res = await updateTask(taskToEdit.task_id, {
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

        if (res.success && res.data) {
          setTasks((prev) =>
            prev.map((t) => (t.task_id === taskToEdit.task_id ? res.data! : t)),
          );
          toast.success(`Task "${formData.title}" updated!`);
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        } else {
          toast.error(res.message || "Failed to update task");
        }
      } else {
        const payload = {
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
        };

        const res = await createTask(payload as any);
        if (res.success && res.data) {
          setTasks((prev) => [res.data!, ...prev]);
          toast.success(`Task "${formData.title}" created!`);
          setIsTaskModalOpen(false);
        } else {
          toast.error(res.message || "Failed to create task");
        }
      }
    } catch (error) {
      toast.error("An error occurred while saving the task.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setIsDeleting(true);
      const res = await deleteTask(taskToDelete.task_id);
      if (res.success) {
        setTasks((prev) =>
          prev.filter((t) => t.task_id !== taskToDelete.task_id),
        );
        toast.success(`Task "${taskToDelete.title}" deleted.`);
      } else {
        toast.error(res.message || "Failed to delete task");
      }
    } catch {
      toast.error("Failed to delete task");
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

    setTasks((prev) =>
      prev.map((t) =>
        t.task_id === draggedTaskId ? { ...t, status: targetStatus } : t,
      ),
    );

    try {
      const res = await updateTask(draggedTaskId, { status: targetStatus });
      if (!res.success) {
        toast.error(res.message || "Failed to update task status");
        loadTasks();
      }
    } catch {
      toast.error("Failed to update task status");
      loadTasks();
    } finally {
      setDraggedTaskId(null);
      setDragOverColumnId(null);
    }
  };

  const renderPriorityBadge = (priority: PriorityType) => {
    switch (priority) {
      case "Urgent":
        return (
          <div className="flex items-center gap-1 text-red-600 font-medium text-xs">
            <SignalHigh className="h-3.5 w-3.5" />
            <span>Urgent</span>
          </div>
        );
      case "High":
        return (
          <div className="flex items-center gap-1 text-rose-500 font-medium text-xs">
            <Signal className="h-3.5 w-3.5" />
            <span>High</span>
          </div>
        );
      case "Medium":
        return (
          <div className="flex items-center gap-1 text-amber-500 font-medium text-xs">
            <SignalMedium className="h-3.5 w-3.5" />
            <span>Medium</span>
          </div>
        );
      case "Low":
        return (
          <div className="flex items-center gap-1 text-blue-500 font-medium text-xs">
            <SignalLow className="h-3.5 w-3.5" />
            <span>Low</span>
          </div>
        );
      case "No Priority":
      default:
        return (
          <div className="flex items-center gap-1 text-slate-400 font-medium text-xs">
            <CircleDot className="h-3.5 w-3.5" />
            <span>No Priority</span>
          </div>
        );
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.labels?.some((l) => l.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-background">
      <div className="flex min-h-[60px] shrink-0 items-center justify-between border-b border-border px-4">
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          Tasks
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {isSearchOpen ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="h-8 w-40 rounded-md border border-input bg-background pl-8 pr-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring sm:w-56"
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
          />

          <Button
            size="sm"
            onClick={() => handleOpenCreate("To Do")}
            className="h-8 gap-1.5 bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            <span>Loading tasks...</span>
          </div>
        </div>
      ) : viewMode === "list" ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === column.id,
            );
            const isOpen = openSections[column.id] ?? true;

            return (
              <Collapsible
                key={column.id}
                open={isOpen}
                onOpenChange={() => toggleSection(column.id)}
                className="space-y-2 w-full max-w-5xl"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 p-0 hover:bg-transparent text-sm font-semibold text-foreground"
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <span>{column.title}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({columnTasks.length})
                    </span>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="w-full overflow-x-auto rounded-md border border-border bg-card">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[40%] text-xs font-semibold text-foreground">
                            Task
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">
                            Priority
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">
                            Creator
                          </TableHead>
                          <TableHead className="text-xs font-semibold text-foreground">
                            Due Date
                          </TableHead>
                          <TableHead className="text-right text-xs font-semibold text-foreground">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columnTasks.length > 0 ? (
                          columnTasks.map((task) => (
                            <TableRow
                              key={task.task_id}
                              className="hover:bg-muted/30"
                            >
                              <TableCell className="font-medium text-xs text-foreground">
                                {task.title}
                              </TableCell>
                              <TableCell>
                                {renderPriorityBadge(task.priority)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={user?.avatar_url || undefined}
                                    />
                                    <AvatarFallback className="text-[9px]">
                                      {user?.fallback_initials || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {task.creator_name ||
                                      user?.name ||
                                      "Member"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(task.due_date)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
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
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="h-14 text-center text-xs text-muted-foreground"
                            >
                              No tasks in {column.title}.
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5} className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCreate(column.id)}
                              className="h-7 gap-1 text-xs font-normal text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Task
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
        <div className="flex flex-1 items-start gap-4 overflow-x-auto overflow-y-auto pb-4 pl-4 pr-4 pt-4 scrollbar-thin">
          {COLUMNS.map((column) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === column.id,
            );
            const isDragOver = dragOverColumnId === column.id;

            return (
              <div
                key={column.id}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={() => handleDrop(column.id)}
                className={`flex h-auto max-h-full w-72 shrink-0 flex-col gap-3 rounded-xl border border-border/50 bg-muted/30 p-3 transition-all duration-200 sm:w-80 ${
                  isDragOver ? "border-2 border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${column.color}`} />
                    <span className="text-sm font-semibold text-foreground">
                      {column.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenCreate(column.id)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
                  {columnTasks.length > 0 ? (
                    columnTasks.map((task) => {
                      const isBeingDragged = draggedTaskId === task.task_id;

                      return (
                        <Card
                          key={task.task_id}
                          draggable
                          onDragStart={() => handleDragStart(task.task_id)}
                          className={`w-full cursor-grab rounded-md border border-border/80 bg-card p-3 shadow-xs transition-all active:cursor-grabbing hover:border-border ${
                            isBeingDragged
                              ? "opacity-40 scale-95 border-dashed"
                              : ""
                          }`}
                        >
                          <CardContent className="space-y-3 p-0">
                            <div className="flex items-start justify-between gap-2">
                              <h2 className="text-xs font-semibold leading-snug text-card-foreground">
                                {task.title}
                              </h2>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="-mr-1 -mt-1 h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
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
                            {task.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs">
                              {renderPriorityBadge(task.priority)}

                              {task.due_date && (
                                <div className="flex items-center gap-1 rounded-sm bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-500">
                                  <Calendar className="h-2.5 w-2.5" />
                                  <span>{formatDate(task.due_date)}</span>
                                </div>
                              )}
                            </div>

                            {task.labels && task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {task.labels.map((tag, idx) => (
                                  <Badge
                                    key={`${task.task_id}-tag-${idx}`}
                                    variant="secondary"
                                    className="h-4 gap-1 rounded-md bg-muted px-1.5 text-[10px] font-normal text-muted-foreground"
                                  >
                                    <Tag className="h-2 w-2" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-border/40">
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage
                                    src={user?.avatar_url || undefined}
                                  />
                                  <AvatarFallback className="text-[8px]">
                                    {user?.fallback_initials || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                  {task.creator_name || user?.name || "Member"}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="rounded-md border border-dashed border-border/80 p-4 text-center">
                      <p className="text-[11px] text-muted-foreground">
                        No tasks in {column.title}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => handleOpenCreate(column.id)}
                  className="h-7 w-full justify-start gap-1.5 px-2 text-xs font-normal text-muted-foreground hover:text-foreground"
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
                due_date: taskToEdit.due_date
                  ? new Date(taskToEdit.due_date).toISOString().split("T")[0]
                  : "",
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
