import {
  CreateTaskFormData,
  PriorityType,
  TaskStatusType,
} from "@/types/entity.types";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface Task {
  task_id: string;
  user_id: string;
  project_id: string;
  parent_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatusType;
  priority: PriorityType;
  due_date?: string | null;
  labels: string[];
  resources: string[];
  comments?: string[];
  created_at: string;
  updated_at?: string;
  project_name?: string;
  creator_name?: string;
  creator_email?: string;
}

export type CreateTaskPayload = CreateTaskFormData;
export type UpdateTaskPayload = Partial<CreateTaskPayload>;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleAxiosError = (
  error: unknown,
  fallbackMessage: string
): ApiResponse => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;

    const formattedMessage = Array.isArray(serverMessage)
      ? serverMessage.join(", ")
      : serverMessage;

    return {
      success: false,
      message: formattedMessage || error.message || fallbackMessage,
      error: error.response?.data || error,
    };
  }

  return {
    success: false,
    message: error instanceof Error ? error.message : fallbackMessage,
    error,
  };
};

export const createTask = async (
  payload: CreateTaskPayload
): Promise<ApiResponse<Task>> => {
  try {
    const response = await apiClient.post<Task>(
      "/tasks/create-task",
      payload
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to create task. Please try again.");
  }
};

export const getUserTasks = async (): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await apiClient.get<Task[]>("/tasks/get-tasks");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch user tasks.");
  }
};

export const getAllTasks = async (): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await apiClient.get<Task[]>("/tasks/getAll-tasks");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to fetch all tasks.");
  }
};

export const getTasksByProject = async (
  projectId: string
): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await apiClient.get<Task[]>(
      `/tasks/project/${projectId}`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(
      error,
      `Failed to fetch tasks for project with ID: ${projectId}`
    );
  }
};

export const getTaskById = async (
  id: string
): Promise<ApiResponse<Task>> => {
  try {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, `Failed to fetch task with ID: ${id}`);
  }
};

export const getSubtasks = async (
  id: string
): Promise<ApiResponse<Task[]>> => {
  try {
    const response = await apiClient.get<Task[]>(`/tasks/${id}/subtasks`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(
      error,
      `Failed to fetch subtasks for task with ID: ${id}`
    );
  }
};

export const updateTask = async (
  id: string,
  payload: UpdateTaskPayload
): Promise<ApiResponse<Task>> => {
  try {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to update task.");
  }
};

export const deleteTask = async (
  id: string
): Promise<ApiResponse<{ message: string; task_id: string }>> => {
  try {
    const response = await apiClient.delete<{
      message: string;
      task_id: string;
    }>(`/tasks/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to delete task.");
  }
};

export const addTaskComment = async (
  id: string,
  comment: string
): Promise<ApiResponse<Task>> => {
  try {
    const response = await apiClient.post<Task>(
      `/tasks/${id}/add-comment`,
      { comment }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to add comment to task.");
  }
};