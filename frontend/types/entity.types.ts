export type PriorityType = "No Priority" | "Urgent" | "High" | "Medium" | "Low";
export type ProjectStatusType = "Backlog" | "To Do" | "In Progress" | "Completed" | "On Hold";
export type TaskStatusType = "Backlog" | "To Do" | "Doing" | "Completed" | "On Hold";

export interface UserOption {
  id: string;
  name: string;
  avatar_url?: string;
  fallback_initials?: string;
}

export interface ProjectOption {
  id: string;
  name: string;
}

export interface CreateProjectFormData {
  name: string;
  description?: string;
  status: ProjectStatusType;
  priority: PriorityType;
  due_date?: string;
  team_name?: string;
  labels: string[];
  resources: string[];
}

export interface CreateTaskFormData {
  title: string;
  description?: string;
  status: TaskStatusType;
  priority: PriorityType;
  project_id: string;
  assignee_id?: string;
  reporter_id?: string;
  parent_id?: string;
  team_name?: string;
  labels?: string[];
  resources?: string[]; 
  due_date?: string | null;
}

