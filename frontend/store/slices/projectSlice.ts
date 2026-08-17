import { StateCreator } from "zustand";
import {
  Project,
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  CreateProjectPayload,
  UpdateProjectPayload,
  deleteProject,
  addProjectComment,
} from "@/api/projects/project.api";

export interface ProjectSlice {
  projects: Project[];
  currentProject: Project | null;
  isProjectsLoading: boolean;
  projectError: string | null;

  fetchUserProjects: (userId: string) => Promise<void>;
  fetchProjectById: (projectId: string) => Promise<Project | null>;
  setCurrentProject: (project: Project | null) => void;
  addProject: (payload: CreateProjectPayload) => Promise<Project | null>;
  editProject: (id: string, payload: UpdateProjectPayload) => Promise<Project | null>;
  removeProject: (id: string) => Promise<boolean>;
  addComment: (id: string, comment: string) => Promise<Project | null>;
  clearCurrentProject: () => void;
}

export const createProjectSlice: StateCreator<
  ProjectSlice,
  [["zustand/devtools", never]],
  [],
  ProjectSlice
> = (set, get) => ({
  projects: [],
  currentProject: null,
  isProjectsLoading: false,
  projectError: null,

  fetchUserProjects: async (userId: string) => {
    set({ isProjectsLoading: true, projectError: null }, false, "projects/fetchUser/pending");
    try {
      const res = await getUserProjects(userId);
      if (res.success && res.data) {
        set({ projects: res.data, isProjectsLoading: false }, false, "projects/fetchUser/fulfilled");
      } else {
        set({ projectError: res.message || "Failed to load projects", isProjectsLoading: false }, false, "projects/fetchUser/rejected");
      }
    } catch {
      set({ projectError: "Failed to fetch projects", isProjectsLoading: false }, false, "projects/fetchUser/error");
    }
  },

  fetchProjectById: async (projectId: string) => {
    const cached = get().projects.find((p) => p.id === projectId);
    if (cached) {
      set({ currentProject: cached }, false, "projects/setFromCache");
      return cached;
    }

    set({ isProjectsLoading: true, projectError: null }, false, "projects/fetchById/pending");
    try {
      const res = await getProjectById(projectId);
      if (res.success && res.data) {
        set({ currentProject: res.data, isProjectsLoading: false }, false, "projects/fetchById/fulfilled");
        return res.data;
      }
      set({ projectError: res.message || "Project not found", isProjectsLoading: false }, false, "projects/fetchById/rejected");
      return null;
    } catch {
      set({ projectError: "Failed to load project details", isProjectsLoading: false }, false, "projects/fetchById/error");
      return null;
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project }, false, "projects/setCurrent");
  },

  addProject: async (payload: CreateProjectPayload) => {
    try {
      const res = await createProject(payload);
      if (res.success && res.data) {
        set((state) => ({ projects: [res.data!, ...state.projects] }), false, "projects/add");
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  },

  editProject: async (id: string, payload: UpdateProjectPayload) => {
    try {
      const res = await updateProject(id, payload);
      if (res.success && res.data) {
        const updated = res.data;
        set(
          (state) => ({
            projects: state.projects.map((p) => (p.id === id ? updated : p)),
            currentProject: state.currentProject?.id === id ? updated : state.currentProject,
          }),
          false,
          "projects/edit"
        );
        return updated;
      }
      return null;
    } catch {
      return null;
    }
  },

  removeProject: async (id: string) => {
    try {
      const res = await deleteProject(id);
      if (res.success) {
        set(
          (state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
          }),
          false,
          "projects/remove"
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  addComment: async (id: string, comment: string) => {
    try {
      const res = await addProjectComment(id, comment);
      if (res.success && res.data) {
        const updated = res.data;
        set(
          (state) => ({
            projects: state.projects.map((p) => (p.id === id ? updated : p)),
            currentProject: state.currentProject?.id === id ? updated : state.currentProject,
          }),
          false,
          "projects/addComment"
        );
        return updated;
      }
      return null;
    } catch {
      return null;
    }
  },

  clearCurrentProject: () => {
    set({ currentProject: null }, false, "projects/clearCurrent");
  },
});