import axios, { AxiosError } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  fallback_initials: string;
  is_guest: boolean;
  created_at: string;
}

export interface AuthSuccessData {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface FirebaseUserPayload {
  name: string;
  email: string;
  avatar_url?: string;
}

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

export const registerUser = async (
  payload: RegisterPayload
): Promise<ApiResponse<AuthSuccessData>> => {
  try {
    const response = await apiClient.post<AuthSuccessData>("/auth/register", payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Registration failed. Please try again.");
  }
};

export const loginUser = async (
  payload: LoginPayload
): Promise<ApiResponse<AuthSuccessData>> => {
  try {
    const response = await apiClient.post<AuthSuccessData>(
      "/auth/login",
      payload
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(
      error,
      "Invalid email or password."
    );
  }
};

export const loginAsGuest = async (): Promise<ApiResponse<AuthSuccessData>> => {
  try {
    const response = await apiClient.post<AuthSuccessData>("/auth/guest");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Failed to initialize guest session.");
  }
};

export const firebaseLoginUser = async (
  payload: FirebaseUserPayload
): Promise<ApiResponse<AuthSuccessData>> => {
  try {
    const response = await apiClient.post<AuthSuccessData>("/auth/firebase", payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(error, "Firebase authentication failed.");
  }
};

export const getCurrentUser = async (): Promise<
  ApiResponse<{ user: User }>
> => {
  try {
    const response =
      await apiClient.get<{ user: User }>(
        "/auth/me"
      );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return handleAxiosError(
      error,
      "Failed to fetch current user."
    );
  }
};