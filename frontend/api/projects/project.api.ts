import { CreateProjectFormData, PriorityType, ProjectStatusType } from "@/types/entity.types";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}

export interface Project {
    id: string;
    user_id: string; 
    name: string;
    description?: string | null;
    status: ProjectStatusType;
    priority: PriorityType;
    due_date: string;
    team_name: string;
    labels: string[];
    resources: string[];
    comments?: string[];
    created_at: string;
    creator_name?: string;
    creator_email?: string;
}

export type CreateProjectPayload = CreateProjectFormData;

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const handleAxiosError = (error: unknown, fallbackMessage: string): ApiResponse => {
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

export const createProject = async (
    payload: CreateProjectPayload
): Promise<ApiResponse<Project>> => {
    try {
        const response = await apiClient.post<Project>(
            "/projects/create-project",
            payload
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, "Failed to create project. Please try again.");
    }
};

export const getUserProjects = async (
    userId: string
): Promise<ApiResponse<Project[]>> => {
    try {
        const response = await apiClient.get<Project[]>(`/projects/user/${userId}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, "Failed to fetch user projects.");
    }
};

export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
    try {
        const response = await apiClient.get<Project[]>("/projects/get-project");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, "Failed to fetch projects.");
    }
};

export const getProjectById = async (
    id: string
): Promise<ApiResponse<Project>> => {
    try {
        const response = await apiClient.get<Project>(`/projects/${id}`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, `Failed to fetch project with ID: ${id}`);
    }
};

export const updateProject = async (
    id: string,
    payload: UpdateProjectPayload
): Promise<ApiResponse<Project>> => {
    try {
        const response = await apiClient.patch<Project>(`/projects/update-project/${id}`, payload);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, "Failed to update project.");
    }
};

export const deleteProject = async (
    id: string
): Promise<ApiResponse<{ message: string; id: string }>> => {
    try {
        const response = await apiClient.delete<{ message: string; id: string }>(
            `/projects/delete-project/${id}`
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, "Failed to delete project.");
    }
};

export const addProjectComment = async (
    id: string,
    comment: string
): Promise<ApiResponse<Project>> => {
    try {
        const response = await apiClient.post<Project>(
            `/projects/add-comment/${id}`,
            { comment }
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return handleAxiosError(error, "Failed to add comment.");
    }
};


