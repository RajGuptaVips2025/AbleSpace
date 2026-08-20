"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MoreHorizontal,
  Loader2,
  FolderKanban,
  Trash2,
  ExternalLink,
  Edit2,
  Search,
  Filter,
  Plus,
  CircleDot,
  SignalHigh,
  Signal,
  SignalMedium,
  SignalLow,
  Columns3,
  Check,
  Calendar,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { toast } from "sonner";
import {
  CreateEntityDialog,
  FieldConfig,
} from "@/components/common/Dialog/CreateEntityDialog";
import { useAppStore } from "@/store/useAppStore";
import { Project } from "@/api/projects/project.api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ProjectsBoardProps {
  onSelectProject?: (projectId: string) => void;
}

interface ProjectVisibleColumns {
  status: boolean;
  priority: boolean;
  team: boolean;
  dueDate: boolean;
}

const DEFAULT_PROJECT_COLUMNS: ProjectVisibleColumns = {
  status: true,
  priority: true,
  team: true,
  dueDate: true,
};

interface ProjectFilters {
  status: string;
  priority: string;
  dueBefore: string;
}

const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  status: "all",
  priority: "all",
  dueBefore: "",
};

const priorityStyles: Record<string, string> = {
  High: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Medium:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "No Priority":
    "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
  Urgent: "bg-red-600/10 text-red-700 dark:text-red-400 border-red-600/20",
};

const PROJECT_FIELDS: FieldConfig[] = [
  {
    name: "name",
    label: "Project Name",
    type: "text",
    placeholder: "e.g. Write API Documentation",
    required: "Project name is required",
    colSpan: 2,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Create clear and detailed documentation...",
    colSpan: 2,
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "Backlog",
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
    name: "team_name",
    label: "Team",
    type: "text",
    placeholder: "e.g. Designer, Engineering",
    required: "Team name is required",
    colSpan: 1,
  },
  {
    name: "due_date",
    label: "Due Date",
    type: "date",
    required: "Due date is required",
    colSpan: 1,
  },
  {
    name: "labels",
    label: "Custom Labels (Max 5)",
    type: "tags",
    placeholder: "Type label and press Add or Enter...",
    defaultValue: [],
    validate: (value: string[]) =>
      !value || value.length <= 5 || "A maximum of 5 labels is allowed",
  },
  {
    name: "resources",
    label: "Resources & Documentation",
    type: "list",
    placeholder: "Paste document link or URL...",
    defaultValue: [],
  },
];

export const ProjectsBoard: React.FC<ProjectsBoardProps> = ({
  onSelectProject,
}) => {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const projects = useAppStore((state) => state.projects);
  const isProjectsLoading = useAppStore((state) => state.isProjectsLoading);
  const fetchUserProjects = useAppStore((state) => state.fetchUserProjects);
  const addProject = useAppStore((state) => state.addProject);
  const editProject = useAppStore((state) => state.editProject);
  const removeProject = useAppStore((state) => state.removeProject);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [visibleColumns, setVisibleColumns] = useState<ProjectVisibleColumns>(
    () => {
      try {
        const saved = localStorage.getItem("projects_visible_columns");
        return saved ? JSON.parse(saved) : DEFAULT_PROJECT_COLUMNS;
      } catch {
        return DEFAULT_PROJECT_COLUMNS;
      }
    },
  );

  const handleToggleColumn = (fieldKey: keyof ProjectVisibleColumns) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [fieldKey]: !prev[fieldKey] };
      try {
        localStorage.setItem("projects_visible_columns", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save project column preferences:", e);
      }
      return next;
    });
  };

  const [filters, setFilters] = useState<ProjectFilters>(
    DEFAULT_PROJECT_FILTERS,
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.priority !== "all") count++;
    if (filters.dueBefore !== "") count++;
    return count;
  }, [filters]);

  useEffect(() => {
    if (user?.id) {
      fetchUserProjects(user.id);
    }
  }, [user?.id, fetchUserProjects]);

  const handleOpenCreate = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleProjectSubmit = async (formData: any) => {
    try {
      if (projectToEdit) {
        const updated = await editProject(projectToEdit.id, {
          ...formData,
          labels: formData.labels ?? [],
          resources: formData.resources ?? [],
        });

        if (updated) {
          toast.success(`Project "${formData.name}" updated!`);
          setIsModalOpen(false);
          setProjectToEdit(null);
        } else {
          toast.error("Failed to update project.");
        }
      } else {
        const payload = {
          ...formData,
          labels: formData.labels ?? [],
          resources: formData.resources ?? [],
        };

        const created = await addProject(payload);

        if (!created) {
          throw new Error("Failed to create project");
        }

        toast.success(`Project "${formData.name}" created!`);
        setIsModalOpen(false);

        router.push(`/dashboard/projects/${created.id}`);
      }
    } catch (error) {
      console.error("Project submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save project.",
      );
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setIsDeleting(true);
      const success = await removeProject(projectToDelete.id);

      if (success) {
        toast.success(
          `Project "${projectToDelete.name}" deleted successfully.`,
        );
      } else {
        toast.error("Failed to delete project. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the project.");
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
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

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        project.name?.toLowerCase().includes(query) ||
        project.status?.toLowerCase().includes(query) ||
        project.team_name?.toLowerCase().includes(query) ||
        project.labels?.some((l) => l.toLowerCase().includes(query));

      const matchesStatus =
        filters.status === "all" || project.status === filters.status;

      const matchesPriority =
        filters.priority === "all" ||
        (project.priority || "No Priority") === filters.priority;

      let matchesDueDate = true;
      if (filters.dueBefore) {
        if (!project.due_date) {
          matchesDueDate = false;
        } else {
          const projDate = formatToLocalDateStr(project.due_date);
          if (!projDate || projDate > filters.dueBefore) {
            matchesDueDate = false;
          }
        }
      }

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesDueDate
      );
    });
  }, [projects, searchQuery, filters]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? dateString
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const projectFieldsList: {
    key: keyof ProjectVisibleColumns;
    label: string;
  }[] = [
    { key: "status", label: "Status" },
    { key: "priority", label: "Priority" },
    { key: "team", label: "Team" },
    { key: "dueDate", label: "Due Date" },
  ];

  const totalCols =
    1 +
    (visibleColumns.status ? 1 : 0) +
    (visibleColumns.priority ? 1 : 0) +
    (visibleColumns.team ? 1 : 0) +
    (visibleColumns.dueDate ? 1 : 0) +
    1;

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-background">
      <div className="flex min-h-[56px] sm:min-h-[64px] shrink-0 items-center justify-between border-b border-border px-3 sm:px-6 gap-2">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground shrink-0">
          Projects
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
                placeholder="Search projects..."
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
              aria-label="Search projects"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <Popover>
            {/* <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-2.5 sm:px-3 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Fields</span>
              </Button>
            </PopoverTrigger> */}

            <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-input bg-background px-2.5 sm:px-3 text-xs font-medium text-foreground hover:bg-muted cursor-pointer outline-none transition-colors">
              <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Fields</span>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-48 rounded-2xl p-2.5 shadow-xl border border-border bg-popover"
            >
              <div className="space-y-0.5">
                {projectFieldsList.map((field) => {
                  const isChecked = !!visibleColumns[field.key];

                  return (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() => handleToggleColumn(field.key)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors select-none"
                    >
                      <span className="text-muted-foreground hover:text-foreground">
                        {field.label}
                      </span>

                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-[5px] border transition-all duration-150 ${
                          isChecked
                            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-900"
                            : "border-muted-foreground/30 bg-muted/40"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

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
                aria-label="Filter projects"
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
                  <span>Filter Projects</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_PROJECT_FILTERS)}
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
                  <option value="Backlog">Backlog</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
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
            onClick={handleOpenCreate}
            className="h-8 gap-1 rounded-lg bg-neutral-900 px-2.5 sm:px-3 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Project</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="min-w-0 w-full overflow-x-auto rounded-lg border border-border/80 bg-card shadow-xs">
          <Table className="w-full">
            <TableHeader className="bg-muted/40 border-b border-border/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[35%] text-xs font-semibold text-foreground py-3">
                  Projects
                </TableHead>

                {visibleColumns.status && (
                  <TableHead className="text-xs font-semibold text-foreground py-3">
                    Status
                  </TableHead>
                )}

                {visibleColumns.priority && (
                  <TableHead className="text-xs font-semibold text-foreground py-3">
                    Priority
                  </TableHead>
                )}

                {visibleColumns.team && (
                  <TableHead className="text-xs font-semibold text-foreground py-3">
                    Team
                  </TableHead>
                )}

                {visibleColumns.dueDate && (
                  <TableHead className="text-xs font-semibold text-foreground py-3">
                    Due Date
                  </TableHead>
                )}

                <TableHead className="text-right text-xs font-semibold text-foreground py-3 pr-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isProjectsLoading && projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalCols} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading projects...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={totalCols} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-xs font-medium text-foreground">
                        No projects found
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {searchQuery || activeFiltersCount > 0
                          ? "Try adjusting your search or active filters."
                          : "Create your first project to get started."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredProjects.map((project) => (
                    <TableRow
                      key={project.id}
                      className="cursor-pointer transition-colors hover:bg-muted/40 border-b border-border/50"
                      onClick={() => onSelectProject?.(project.id)}
                    >
                      <TableCell className="font-semibold text-xs text-foreground hover:text-blue-600 py-3">
                        {project.name}
                      </TableCell>

                      {visibleColumns.status && (
                        <TableCell className="text-xs text-muted-foreground py-3">
                          {project.status}
                        </TableCell>
                      )}

                      {visibleColumns.priority && (
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                              priorityStyles[project.priority] ||
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {project.priority}
                          </span>
                        </TableCell>
                      )}

                      {visibleColumns.team && (
                        <TableCell className="text-xs text-muted-foreground py-3">
                          {project.team_name || "—"}
                        </TableCell>
                      )}

                      {visibleColumns.dueDate && (
                        <TableCell className="text-xs font-medium text-foreground py-3">
                          {formatDate(project.due_date)}
                        </TableCell>
                      )}

                      <TableCell
                        className="text-right py-3 pr-4"
                        onClick={(e) => e.stopPropagation()}
                      >
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

                          <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-40 p-1 text-xs"
                          >
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(project)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Edit Project</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => onSelectProject?.(project.id)}
                              className="cursor-pointer gap-2 text-xs"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Open Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setProjectToDelete(project)}
                              className="cursor-pointer gap-2 text-xs text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete Project</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell colSpan={totalCols} className="py-2.5 px-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenCreate}
                        className="h-7 gap-1.5 px-2 text-xs font-medium text-foreground hover:bg-muted/60"
                      >
                        <Plus className="h-3.5 w-3.5 text-foreground" />
                        <span>Add Project</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>

          <CreateEntityDialog
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setProjectToEdit(null);
            }}
            mode={projectToEdit ? "edit" : "create"}
            title={projectToEdit ? "Edit Project" : "Create New Project"}
            description={
              projectToEdit
                ? "Update project details, deadlines, tags, and documentation links."
                : "Define project goals, properties, custom labels, and attach documentation."
            }
            submitButtonText={projectToEdit ? "Save Changes" : "Create Project"}
            fields={PROJECT_FIELDS}
            initialData={projectToEdit}
            onSubmit={handleProjectSubmit}
          />

          <AlertDialog
            open={!!projectToDelete}
            onOpenChange={(open) => !open && setProjectToDelete(null)}
          >
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base">
                  Delete Project
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-foreground">
                    &quot;{projectToDelete?.name}&quot;
                  </span>
                  ? This will permanently delete the project along with all
                  associated tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-2">
                <AlertDialogCancel
                  disabled={isDeleting}
                  className="h-8 text-xs"
                >
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
      </div>
    </div>
  );
};

export default ProjectsBoard;
