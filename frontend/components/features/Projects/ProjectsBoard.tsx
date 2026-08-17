"use client";

import React, { useEffect, useState } from "react";
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
  DropdownMenuCheckboxItem,
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

const priorityStyles: Record<string, string> = {
  High: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Medium:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "No Priority":
    "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
  Urgent: "bg-red-600/10 text-red-700 dark:text-red-400 border-red-600/20",
};

// 🌟 Schema configuration for projects
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
    label: "Custom Labels",
    type: "tags",
    placeholder: "Type label and press Add or Enter...",
    defaultValue: [],
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [visibleColumns] = useState({
    project: true,
    status: true,
    priority: true,
    team: true,
    dueDate: true,
    actions: true,
  });
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

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

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !query ||
      project.name?.toLowerCase().includes(query) ||
      project.status?.toLowerCase().includes(query) ||
      project.team_name?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || project.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden bg-background">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:min-h-[60px] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-0 shrink-0">
        <h1 className="text-base font-semibold text-foreground">Projects</h1>

        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
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
              aria-label="Search projects"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-8 w-8 text-foreground"
                aria-label="Filter"
              >
                <Filter className="h-3.5 w-3.5" />

                {(statusFilter !== "All" || priorityFilter !== "All") && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 text-xs font-semibold text-foreground">
                Filter Projects
              </div>

              <DropdownMenuSeparator />

              <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                Status
              </div>

              {[
                "All",
                "Backlog",
                "To Do",
                "In Progress",
                "Completed",
                "On Hold",
              ].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() => setStatusFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              <div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                Priority
              </div>

              {["All", "Urgent", "High", "Medium", "Low", "No Priority"].map(
                (priority) => (
                  <DropdownMenuCheckboxItem
                    key={priority}
                    checked={priorityFilter === priority}
                    onCheckedChange={() => setPriorityFilter(priority)}
                  >
                    {priority}
                  </DropdownMenuCheckboxItem>
                ),
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setStatusFilter("All");
                  setPriorityFilter("All");
                }}
                className="justify-center text-xs font-medium"
              >
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-8 gap-1.5 rounded-md bg-neutral-900 px-3 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Project</span>
          </Button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4">
        <div className="min-w-0 w-full overflow-x-auto rounded-md border border-border bg-card">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                {visibleColumns.project && (
                  <TableHead className="w-[35%] text-xs font-semibold text-foreground">
                    Projects
                  </TableHead>
                )}

                {visibleColumns.status && (
                  <TableHead className="text-xs font-semibold text-foreground">
                    Status
                  </TableHead>
                )}

                {visibleColumns.priority && (
                  <TableHead className="text-xs font-semibold text-foreground">
                    Priority
                  </TableHead>
                )}

                {visibleColumns.team && (
                  <TableHead className="text-xs font-semibold text-foreground">
                    Team
                  </TableHead>
                )}

                {visibleColumns.dueDate && (
                  <TableHead className="text-xs font-semibold text-foreground">
                    Due Date
                  </TableHead>
                )}

                {visibleColumns.actions && (
                  <TableHead className="text-right text-xs font-semibold text-foreground">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isProjectsLoading && projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading projects...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-xs font-medium text-foreground">
                        No projects found
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {searchQuery
                          ? "Try a different search query."
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
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => onSelectProject?.(project.id)}
                    >
                      {visibleColumns.project && (
                        <TableCell className="text-xs font-medium text-blue-600 hover:underline">
                          {project.name}
                        </TableCell>
                      )}

                      {visibleColumns.status && (
                        <TableCell className="text-xs text-muted-foreground">
                          {project.status}
                        </TableCell>
                      )}

                      {visibleColumns.priority && (
                        <TableCell>
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
                        <TableCell className="text-xs text-muted-foreground">
                          {project.team_name || "—"}
                        </TableCell>
                      )}

                      {visibleColumns.dueDate && (
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(project.due_date)}
                        </TableCell>
                      )}

                      {visibleColumns.actions && (
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                      )}
                    </TableRow>
                  ))}

                  <TableRow className="hover:bg-muted/30">
                    <TableCell colSpan={6} className="py-2.5 px-4">
                      <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Projects</span>
                      </button>
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
