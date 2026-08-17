"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { PriorityType, ProjectStatusType } from "@/types/entity.types";

interface EditProjectViewProps {
  projectId: string;
}

const PRIORITIES: PriorityType[] = [
  "No Priority",
  "Urgent",
  "High",
  "Medium",
  "Low",
];

const STATUSES: ProjectStatusType[] = [
  "Backlog",
  "To Do",
  "In Progress",
  "Completed",
  "On Hold",
];

export const EditProjectView: React.FC<EditProjectViewProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const { currentProject, isLoading, fetchProjectById, editProject } =
    useAppStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "In Progress" as ProjectStatusType,
    priority: "Medium" as PriorityType,
    team_name: "",
    due_date: "",
  });

  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    }
  }, [projectId, fetchProjectById]);

  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name || "",
        description: currentProject.description || "",
        status: currentProject.status || "Backlog",
        priority: currentProject.priority || "No Priority",
        team_name: currentProject.team_name || "",
        due_date: currentProject.due_date
          ? new Date(currentProject.due_date).toISOString().split("T")[0]
          : "",
      });
      setLabels(currentProject.labels || []);
      setResources(currentProject.resources || []);
    }
  }, [currentProject]);

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleAddResource = () => {
    if (newResource.trim() && !resources.includes(newResource.trim())) {
      setResources([...resources, newResource.trim()]);
      setNewResource("");
    }
  };

  const handleRemoveResource = (resToRemove: string) => {
    setResources(resources.filter((r) => r !== resToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await editProject(projectId, {
        ...formData,
        labels,
        resources,
      });

      if (updated) {
        toast.success("Project updated successfully!");
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        toast.error("Failed to update project.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred while updating the project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !currentProject) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          <span>Loading project data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Edit Project
            </h1>
            <p className="text-xs text-muted-foreground">
              Update project details, status, deadlines, and resources.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 text-xs"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-8 gap-1.5 bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <Card className="border border-border/80 shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Project Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter project name..."
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Write a brief overview of the project objectives..."
                className="min-h-[100px] text-xs resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-medium">
                  Status
                </Label>

                <Select
                  value={formData.status}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setFormData({
                        ...formData,
                        status: val,
                      });
                    }
                  }}
                >
                  <SelectTrigger id="status" className="h-9 text-xs">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUSES.map((st) => (
                      <SelectItem key={st} value={st} className="text-xs">
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-medium">
                  Priority
                </Label>

                <Select
                  value={formData.priority}
                  onValueChange={(val) => {
                    if (val !== null) {
                      setFormData({
                        ...formData,
                        priority: val,
                      });
                    }
                  }}
                >
                  <SelectTrigger id="priority" className="h-9 text-xs">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>

                  <SelectContent>
                    {PRIORITIES.map((pr) => (
                      <SelectItem key={pr} value={pr} className="text-xs">
                        {pr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="team_name" className="text-xs font-medium">
                  Team / Workspace
                </Label>
                <Input
                  id="team_name"
                  value={formData.team_name}
                  onChange={(e) =>
                    setFormData({ ...formData, team_name: e.target.value })
                  }
                  placeholder="e.g., Engineering, Design"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due_date" className="text-xs font-medium">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Labels / Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                  placeholder="Add label and press Enter..."
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddLabel}
                  className="h-8 text-xs px-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {labels.map((lbl) => (
                  <Badge
                    key={lbl}
                    variant="secondary"
                    className="gap-1 font-normal text-xs py-0.5 pr-1 text-muted-foreground bg-muted"
                  >
                    <span>{lbl}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(lbl)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Resources & Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddResource();
                    }
                  }}
                  placeholder="Add URL/doc link and press Enter..."
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddResource}
                  className="h-8 text-xs px-2"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-1.5 min-h-[36px]">
                {resources.map((res) => (
                  <div
                    key={res}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-2.5 py-1 text-xs"
                  >
                    <span className="truncate max-w-[280px] text-muted-foreground">
                      {res}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(res)}
                      className="text-muted-foreground hover:text-rose-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default EditProjectView;
