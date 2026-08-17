"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  Sidebar,
  Tag,
  Paperclip,
  ChevronDown,
  Plus,
  SignalHigh,
  SignalMedium,
  SignalLow,
  CircleDot,
  Signal,
  Send,
  Smile,
  Settings,
  Check,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  CreateEntityDialog,
  FieldConfig,
} from "@/components/common/Dialog/CreateEntityDialog";
import { PriorityType, ProjectStatusType } from "@/types/entity.types";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";
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
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { createTask, getTasksByProject, type Task } from "@/api/tasks/task.api";

interface TaskItem {
  id: string;
  title: string;
  priority: PriorityType;
  assignee?: {
    name: string;
    avatarUrl?: string;
    fallback: string;
  };
  dueDate?: string;
}

interface ProjectDetailViewProps {
  projectId: string;
}

const PRIORITIES: {
  label: PriorityType;
  icon: React.ElementType;
  color: string;
  hoverColor: string;
}[] = [
  {
    label: "No Priority",
    icon: CircleDot,
    color: "text-slate-400",
    hoverColor: "hover:text-slate-500",
  },
  {
    label: "Urgent",
    icon: SignalHigh,
    color: "text-red-500",
    hoverColor: "hover:text-red-600",
  },
  {
    label: "High",
    icon: Signal,
    color: "text-orange-500",
    hoverColor: "hover:text-orange-600",
  },
  {
    label: "Medium",
    icon: SignalMedium,
    color: "text-amber-500",
    hoverColor: "hover:text-amber-600",
  },
  {
    label: "Low",
    icon: SignalLow,
    color: "text-slate-400",
    hoverColor: "hover:text-slate-500",
  },
];

const STATUSES: { label: ProjectStatusType; color: string }[] = [
  { label: "Backlog", color: "bg-orange-500 text-orange-500" },
  { label: "To Do", color: "bg-blue-500 text-blue-500" },
  { label: "In Progress", color: "bg-amber-500 text-amber-500" },
  { label: "Completed", color: "bg-emerald-500 text-emerald-500" },
  { label: "On Hold", color: "bg-neutral-500 text-neutral-500" },
];

const TASK_FIELDS: FieldConfig[] = [
  {
    name: "title",
    label: "Task Title",
    type: "text",
    placeholder: "e.g. Create Docker Compose file",
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
    defaultValue: "To Do",
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
    label: "Due Date",
    type: "date",
    colSpan: 2,
  },
  {
    name: "labels",
    label: "Task Labels / Tags",
    type: "tags",
    placeholder: "Type label (e.g. DevOps, Docker) and press Add or Enter...",
    defaultValue: [],
    colSpan: 2,
  },
  {
    name: "resources",
    label: "Resources / Documentation Links",
    type: "list",
    placeholder: "Paste document/repo link and press Add...",
    defaultValue: [],
    colSpan: 2,
  },
];

const PROJECT_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Project Name",
    type: "text",
    placeholder: "e.g. Cloud Infrastructure Migration",
    required: "Project name is required",
    colSpan: 2,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Provide an overview and goals for this project...",
    colSpan: 2,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "To Do",
    required: true,
    colSpan: 1,
    options: [
      { label: "Backlog", value: "Backlog" },
      { label: "To Do", value: "To Do" },
      { label: "In Progress", value: "In Progress" },
      { label: "Completed", value: "Completed" },
      { label: "On Hold", value: "On Hold" },
    ],
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    defaultValue: "Medium",
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
    name: "due_date",
    label: "Due Date",
    type: "date",
    colSpan: 1,
  },
  {
    name: "team_name",
    label: "Team Name",
    type: "text",
    placeholder: "e.g. DevOps, Frontend Team",
    colSpan: 1,
  },
  {
    name: "labels",
    label: "Labels",
    type: "tags",
    placeholder: "Type label and press Add...",
    defaultValue: [],
  },
  {
    name: "resources",
    label: "Resources / URLs",
    type: "list",
    placeholder: "https://github.com/...",
    defaultValue: [],
  },
];

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
}) => {
  const user = useAppStore((state) => state.user);
  const currentProject = useAppStore((state) => state.currentProject);
  const isProjectsLoading = useAppStore((state) => state.isProjectsLoading);
  const fetchProjectById = useAppStore((state) => state.fetchProjectById);
  const editProject = useAppStore((state) => state.editProject);
  const router = useRouter();
  const removeProject = useAppStore((state) => state.removeProject);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const addComment = useAppStore((state) => state.addComment);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);

  const taskFields: FieldConfig[] = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const maxDateStr = currentProject?.due_date
      ? typeof currentProject.due_date === "string"
        ? currentProject.due_date.split("T")[0]
        : new Date(currentProject.due_date).toISOString().split("T")[0]
      : undefined;

    return [
      {
        name: "title",
        label: "Task Title",
        type: "text",
        placeholder: "e.g. Create Docker Compose file",
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
        defaultValue: "To Do",
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
        label: "Due Date",
        type: "date",
        min: todayStr,
        max: maxDateStr,
        colSpan: 2,
      },
      {
        name: "labels",
        label: "Task Labels / Tags",
        type: "tags",
        placeholder: "Type label and press Add or Enter...",
        defaultValue: [],
        colSpan: 2,
      },
      {
        name: "resources",
        label: "Resources / Documentation Links",
        type: "list",
        placeholder: "Paste document link and press Add...",
        defaultValue: [],
        colSpan: 2,
      },
    ];
  }, [currentProject?.due_date]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1025px)");

    setIsSidebarOpen(mediaQuery.matches);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    }
  }, [projectId, fetchProjectById]);

  const handleUpdatePriority = async (newPriority: PriorityType) => {
    if (!currentProject) return;
    try {
      const updated = await editProject(currentProject.id, {
        priority: newPriority,
      });
      if (updated) {
        toast.success(`Priority set to ${newPriority}`);
      } else {
        toast.error("Failed to update priority");
      }
    } catch {
      toast.error("Failed to update priority");
    }
  };

  const handleUpdateStatus = async (newStatus: ProjectStatusType) => {
    if (!currentProject) return;
    try {
      const updated = await editProject(currentProject.id, {
        status: newStatus,
      });
      if (updated) {
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCreateTask = async (formData: any) => {
    if (!currentProject) return;

    try {
      const payload = {
        project_id: currentProject.id,
        title: formData.title,
        description: formData.description || "",
        status: formData.status || "To Do",
        priority: formData.priority || "No Priority",
        due_date: formData.due_date ? formData.due_date : null,
        labels: Array.isArray(formData.labels) ? formData.labels : [],
        resources: Array.isArray(formData.resources) ? formData.resources : [],
      };

      const res = await createTask(payload as any);

      if (res.success && res.data) {
        setTasks((prev) => [res.data!, ...prev]);
        toast.success(`Task "${formData.title}" created successfully!`);
        setIsTaskModalOpen(false);
      } else {
        toast.error(res.message || "Failed to create task");
      }
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleEditProject = async (formData: any) => {
    if (!currentProject) return;
    try {
      const updated = await editProject(currentProject.id, formData);
      if (updated) {
        toast.success("Project updated successfully");
        setIsEditDialogOpen(false);
      } else {
        toast.error("Failed to update project");
      }
    } catch {
      toast.error("Failed to update project");
    }
  };
  const handleDeleteProject = async () => {
    if (!currentProject) return;
    try {
      setIsDeleting(true);
      const success = await removeProject(currentProject.id);
      if (success) {
        toast.success("Project deleted successfully");
        router.push("/dashboard/projects");
      } else {
        toast.error("Failed to delete project");
      }
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleUpdateDueDate = async (selectedDate: Date | undefined) => {
    if (!currentProject || !selectedDate) return;
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const updated = await editProject(currentProject.id, {
        due_date: formattedDate,
      });
      if (updated) {
        toast.success(`Due date updated to ${formatDate(formattedDate)}`);
        setIsCalendarOpen(false);
      } else {
        toast.error("Failed to update due date");
      }
    } catch {
      toast.error("Failed to update due date");
    }
  };

  const loadProjectTasks = async (pId: string) => {
    try {
      setIsTasksLoading(true);
      const res = await getTasksByProject(pId);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch project tasks:", error);
    } finally {
      setIsTasksLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      loadProjectTasks(projectId);
    }
  }, [projectId, fetchProjectById]);

  const renderPriorityIcon = (level: PriorityType) => {
    const item = PRIORITIES.find((p) => p.label === level) || PRIORITIES[0];
    const Icon = item.icon;
    return <Icon className={`h-3.5 w-3.5 ${item.color}`} />;
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

  const handleAddComment = async (text: string, isReply: boolean = false) => {
    if (!currentProject || !text.trim()) return;
    try {
      setIsSubmittingComment(true);
      const updated = await addComment(currentProject.id, text.trim());
      if (updated) {
        toast.success("Comment added");
        if (isReply) setReplyText("");
        else setNewComment("");
      } else {
        toast.error("Failed to post comment");
      }
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const creatorName =
    currentProject?.creator_name || user?.name || "Workspace Member";
  const creatorAvatar = user?.avatar_url || undefined;
  const creatorInitials =
    currentProject?.creator_name?.slice(0, 2).toUpperCase() ||
    user?.fallback_initials ||
    "U";

  if (isProjectsLoading && !currentProject) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          <span>Loading project details...</span>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background">
        <p className="text-sm font-medium text-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col h-full w-full bg-background overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {currentProject.name}
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Eye className="h-3.5 w-3.5 text-indigo-500" />
            <span>1</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setIsEditDialogOpen(true)}
                className="cursor-pointer gap-2 text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Project</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`h-8 w-8 transition-colors ${
              isSidebarOpen
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <Sidebar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
        {currentProject.description ||
          "No description provided for this project."}
      </p>

      <div className="flex flex-row gap-8 items-start relative">
        <div className="flex-1 min-w-0 w-full space-y-8">
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">
                Properties
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 font-normal py-0.5">
                  <span className="font-semibold text-foreground">
                    {currentProject.team_name
                      ? currentProject.team_name.charAt(0).toUpperCase()
                      : "T"}
                  </span>
                  <span>{currentProject.team_name || "General"}</span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-1 font-normal text-rose-500 bg-rose-500/10"
                >
                  <CalendarIcon className="h-3 w-3" />
                  <span>{formatDate(currentProject.due_date)}</span>
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">
                Labels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentProject.labels && currentProject.labels.length > 0 ? (
                  currentProject.labels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="gap-1 font-normal text-[11px] text-muted-foreground bg-muted hover:bg-muted/80"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {label}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No labels</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">
                Resources
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {currentProject.resources &&
                currentProject.resources.length > 0 ? (
                  currentProject.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.startsWith("http") ? res : `https://${res}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline max-w-[200px] truncate"
                    >
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{res}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No resources attached
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <ChevronDown className="h-4 w-4" />
                <span>Tasks</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-foreground">
                      Task
                    </TableHead>
                    <TableHead className="text-xs font-medium text-foreground">
                      Priority
                    </TableHead>
                    <TableHead className="text-xs font-medium text-foreground">
                      Assignee
                    </TableHead>
                    <TableHead className="text-xs font-medium text-foreground">
                      Due Date
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium text-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isTasksLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-20 text-center text-xs text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                          <span>Loading tasks...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TableRow key={task.task_id}>
                        <TableCell className="font-medium text-xs text-blue-600 hover:underline cursor-pointer">
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs font-medium">
                            {renderPriorityIcon(task.priority)}
                            <span>{task.priority}</span>
                          </div>
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
                              {task.creator_name || user?.name || "Member"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(task.due_date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-20 text-center text-xs text-muted-foreground"
                      >
                        No tasks created under this project yet.
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTaskModalOpen(true)}
                        className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Task
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Collapsible
              open={isCommentsOpen}
              onOpenChange={setIsCommentsOpen}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isCommentsOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <span>Comments</span>
                    {currentProject.comments &&
                      currentProject.comments.length > 0 && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({currentProject.comments.length})
                        </span>
                      )}
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-3 transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                {currentProject.comments &&
                currentProject.comments.length > 0 ? (
                  <div className="space-y-3">
                    {currentProject.comments.map((comment, index) => (
                      <Card
                        key={index}
                        className="border border-border/80 shadow-xs"
                      >
                        <CardHeader className="p-3 pb-0 flex-row items-center justify-between space-y-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={user?.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-[10px]">
                                {user?.fallback_initials || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-foreground">
                              {user?.name || "Workspace Member"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Comment #{index + 1}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {comment}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No comments yet. Be the first to leave a comment below.
                    </p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-card p-2 shadow-xs">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(newComment, false);
                  }
                }}
                placeholder="Add a comment... (Press Enter to post)"
                disabled={isSubmittingComment}
                className="h-8 text-xs border-0 focus-visible:ring-0 shadow-none px-2"
              />
              <Button
                variant="ghost"
                size="icon"
                disabled={isSubmittingComment || !newComment.trim()}
                onClick={() => handleAddComment(newComment, false)}
                className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity min-[1025px]:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            <div
              className="
        fixed inset-y-0 right-0 z-50
        w-80 max-w-[85vw]
        bg-background
        border-l border-border
        p-4
        overflow-y-auto
        shadow-2xl
        space-y-6

        min-[1025px]:static
        min-[1025px]:z-0
        min-[1025px]:w-80
        min-[1025px]:max-w-none
        min-[1025px]:shadow-none
        min-[1025px]:p-0
        min-[1025px]:border-none
        min-[1025px]:overflow-visible

        shrink-0
      "
            >
              <div className="flex items-center justify-between pb-2 border-b border-border min-[1025px]:hidden">
                <span className="text-xs font-semibold text-foreground">
                  Project Details
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Collapsible
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                asChild
              >
                <Card className="border border-border/80 shadow-none rounded-md overflow-hidden transition-all">
                  <CardHeader
                    className={`h-9 p-0 ${isDetailsOpen ? "border-b border-border/80" : ""}`}
                  >
                    <div className="flex h-full items-center justify-between px-2.5">
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-foreground/80 cursor-pointer select-none"
                        >
                          <ChevronDown
                            className={`h-3 w-3 transition-transform duration-200 ${
                              isDetailsOpen ? "" : "-rotate-90"
                            }`}
                          />
                          <span>Details</span>
                        </button>
                      </CollapsibleTrigger>

                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm text-foreground hover:bg-muted"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CollapsibleContent className="transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                    <CardContent className="p-3.5 space-y-3 text-xs">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Status</span>

                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  STATUSES.find(
                                    (s) => s.label === currentProject.status,
                                  )?.color || "bg-amber-500"
                                }`}
                              />
                              <span>{currentProject.status}</span>
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-40 p-1.5 shadow-lg"
                            align="end"
                          >
                            <div className="space-y-0.5">
                              {STATUSES.map((st) => (
                                <button
                                  key={st.label}
                                  onClick={() => handleUpdateStatus(st.label)}
                                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                    currentProject.status === st.label
                                      ? "bg-muted text-foreground"
                                      : "text-muted-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${st.color}`}
                                  />
                                  <span>{st.label}</span>
                                  {currentProject.status === st.label && (
                                    <Check className="ml-auto h-3 w-3" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Priority</span>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs font-medium hover:bg-muted"
                            >
                              {renderPriorityIcon(currentProject.priority)}
                              <span>{currentProject.priority}</span>
                              <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-48 p-2 shadow-lg"
                            align="end"
                          >
                            <span className="block px-2 py-1 text-[11px] font-medium text-muted-foreground">
                              Priority
                            </span>

                            <div className="space-y-0.5 pt-1">
                              {PRIORITIES.map((item) => {
                                const ItemIcon = item.icon;
                                const isSelected =
                                  currentProject.priority === item.label;

                                return (
                                  <button
                                    key={item.label}
                                    onClick={() =>
                                      handleUpdatePriority(item.label)
                                    }
                                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                      isSelected
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ItemIcon
                                        className={`h-3.5 w-3.5 ${item.color}`}
                                      />
                                      <span className={item.color}>
                                        {item.label}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">
                          Created By
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={creatorAvatar} />
                            <AvatarFallback className="text-[9px]">
                              {creatorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {creatorName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Due Date</span>

                        <Popover
                          open={isCalendarOpen}
                          onOpenChange={setIsCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-normal transition-colors hover:bg-muted"
                            >
                              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {currentProject.due_date
                                  ? formatDate(currentProject.due_date)
                                  : "Set due date"}
                              </span>
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-auto p-0 shadow-lg"
                            align="end"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                currentProject.due_date
                                  ? new Date(currentProject.due_date)
                                  : undefined
                              }
                              onSelect={handleUpdateDueDate}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today; 
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Labels</span>

                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="gap-1 text-[11px] font-normal"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {currentProject.labels?.[0] || "General"}
                          </Badge>

                          {currentProject.labels &&
                            currentProject.labels.length > 1 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{currentProject.labels.length - 1}
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Team</span>

                        <span className="font-medium text-foreground">
                          {currentProject.team_name || "General"}
                        </span>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Card className="border border-border/80 shadow-xs">
                <CardHeader className="p-3.5 pb-2 flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>Updates</span>
                  </div>
                </CardHeader>

                <CardContent className="p-3.5 pt-1 space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 shrink-0">
                      {renderPriorityIcon(currentProject.priority)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {creatorName}
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        set priority to {currentProject.priority}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={creatorAvatar} />
                      <AvatarFallback className="text-[9px]">
                        {creatorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">
                        {creatorName}
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        created project ·{" "}
                        {formatDate(currentProject.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <CreateEntityDialog
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        mode="create"
        title="Create New Task"
        description={`Create a new work item linked to "${currentProject.name}".`}
        submitButtonText="Create Task"
        fields={taskFields} 
        onSubmit={handleCreateTask}
      />
      {currentProject && (
        <CreateEntityDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          mode="edit"
          title="Edit Project"
          description="Update project information and configurations."
          submitButtonText="Save Changes"
          fields={PROJECT_FIELDS}
          initialData={{
            name: currentProject.name,
            description: currentProject.description || "",
            status: currentProject.status,
            priority: currentProject.priority,
            due_date: currentProject.due_date
              ? new Date(currentProject.due_date).toISOString().split("T")[0]
              : "",
            team_name: currentProject.team_name || "",
            labels: currentProject.labels || [],
            resources: currentProject.resources || [],
          }}
          onSubmit={handleEditProject}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project{" "}
              <span className="font-semibold text-foreground">
                "{currentProject?.name}"
              </span>{" "}
              and all of its associated tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailView;
