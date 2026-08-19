import { StateCreator } from "zustand";
import {
    Task,
    getUserTasks,
    getTaskById,
    getTasksByProject,
    getSubtasks,
    createTask,
    updateTask,
    deleteTask,
    addTaskComment,
    CreateTaskPayload,
    UpdateTaskPayload,
} from "@/api/tasks/task.api";

export interface TaskSlice {
    tasks: Task[];
    currentTask: Task | null;
    subtasks: Task[];
    isTasksLoading: boolean;
    taskError: string | null;

    fetchUserTasks: () => Promise<void>;
    fetchTasksByProject: (projectId: string) => Promise<void>;
    fetchTaskById: (taskId: string) => Promise<Task | null>;
    fetchSubtasks: (taskId: string) => Promise<void>;
    setCurrentTask: (task: Task | null) => void;
    addTask: (payload: CreateTaskPayload) => Promise<Task | null>;
    editTask: (id: string, payload: UpdateTaskPayload) => Promise<Task | null>;
    removeTask: (id: string) => Promise<boolean>;
    addCommentToTask: (id: string, comment: string) => Promise<Task | null>;
    clearCurrentTask: () => void;
}

export const createTaskSlice: StateCreator<
    TaskSlice,
    [["zustand/devtools", never]],
    [],
    TaskSlice
> = (set, get) => ({
    tasks: [],
    currentTask: null,
    subtasks: [],
    isTasksLoading: false,
    taskError: null,

    fetchUserTasks: async () => {
        set({ isTasksLoading: true, taskError: null }, false, "tasks/fetchUser/pending");
        try {
            const res = await getUserTasks();
            if (res.success && res.data) {
                set({ tasks: res.data, isTasksLoading: false }, false, "tasks/fetchUser/fulfilled");
            } else {
                set(
                    { taskError: res.message || "Failed to load tasks", isTasksLoading: false },
                    false,
                    "tasks/fetchUser/rejected"
                );
            }
        } catch {
            set({ taskError: "Failed to fetch user tasks", isTasksLoading: false }, false, "tasks/fetchUser/error");
        }
    },

    fetchTasksByProject: async (projectId: string) => {
        set({ isTasksLoading: true, taskError: null }, false, "tasks/fetchByProject/pending");
        try {
            const res = await getTasksByProject(projectId);
            if (res.success && res.data) {
                set({ tasks: res.data, isTasksLoading: false }, false, "tasks/fetchByProject/fulfilled");
            } else {
                set(
                    { taskError: res.message || "Failed to load project tasks", isTasksLoading: false },
                    false,
                    "tasks/fetchByProject/rejected"
                );
            }
        } catch {
            set({ taskError: "Failed to fetch project tasks", isTasksLoading: false }, false, "tasks/fetchByProject/error");
        }
    },

    fetchTaskById: async (taskId: string) => {
        const cached = get().tasks.find((t) => t.task_id === taskId);
        if (cached) {
            set({ currentTask: cached }, false, "tasks/setFromCache");
            return cached;
        }

        set({ isTasksLoading: true, taskError: null }, false, "tasks/fetchById/pending");
        try {
            const res = await getTaskById(taskId);
            if (res.success && res.data) {
                set({ currentTask: res.data, isTasksLoading: false }, false, "tasks/fetchById/fulfilled");
                return res.data;
            }
            set(
                { taskError: res.message || "Task not found", isTasksLoading: false },
                false,
                "tasks/fetchById/rejected"
            );
            return null;
        } catch {
            set({ taskError: "Failed to load task details", isTasksLoading: false }, false, "tasks/fetchById/error");
            return null;
        }
    },

    fetchSubtasks: async (taskId: string) => {
        set({ isTasksLoading: true, taskError: null }, false, "tasks/fetchSubtasks/pending");
        try {
            const res = await getSubtasks(taskId);
            if (res.success && res.data) {
                set({ subtasks: res.data, isTasksLoading: false }, false, "tasks/fetchSubtasks/fulfilled");
            } else {
                set(
                    { taskError: res.message || "Failed to load subtasks", isTasksLoading: false },
                    false,
                    "tasks/fetchSubtasks/rejected"
                );
            }
        } catch {
            set({ taskError: "Failed to load subtasks", isTasksLoading: false }, false, "tasks/fetchSubtasks/error");
        }
    },

    setCurrentTask: (task) => {
        set({ currentTask: task }, false, "tasks/setCurrent");
    },

    addTask: async (payload: CreateTaskPayload) => {
        try {
            const res = await createTask(payload);
            if (res.success && res.data) {
                const newTask = res.data;
                set(
                    (state) => ({
                        tasks: [newTask, ...state.tasks],
                        subtasks:
                            payload.parent_id === state.currentTask?.task_id
                                ? [newTask, ...state.subtasks]
                                : state.subtasks,
                    }),
                    false,
                    "tasks/add"
                );
                return newTask;
            }
            return null;
        } catch {
            return null;
        }
    },

    editTask: async (id: string, payload: UpdateTaskPayload) => {
        try {
            const res = await updateTask(id, payload);
            if (res.success && res.data) {
                const updated = res.data;
                set(
                    (state) => ({
                        tasks: state.tasks.map((t) => (t.task_id === id ? updated : t)),
                        subtasks: state.subtasks.map((st) => (st.task_id === id ? updated : st)),
                        currentTask:
                            state.currentTask?.task_id === id ? updated : state.currentTask,
                    }),
                    false,
                    "tasks/edit"
                );
                return updated;
            }
            return null;
        } catch {
            return null;
        }
    },

    removeTask: async (id: string) => {
        try {
            const res = await deleteTask(id);
            if (res.success) {
                set(
                    (state) => ({
                        tasks: state.tasks.filter((t) => t.task_id !== id),
                        subtasks: state.subtasks.filter((st) => st.task_id !== id),
                        currentTask:
                            state.currentTask?.task_id === id ? null : state.currentTask,
                    }),
                    false,
                    "tasks/remove"
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    addCommentToTask: async (id: string, comment: string) => {
        try {
            const res = await addTaskComment(id, comment);
            if (res.success && res.data) {
                const updated = res.data;
                set(
                    (state) => ({
                        tasks: state.tasks.map((t) => (t.task_id === id ? updated : t)),
                        subtasks: state.subtasks.map((st) => (st.task_id === id ? updated : st)),
                        currentTask:
                            state.currentTask?.task_id === id ? updated : state.currentTask,
                    }),
                    false,
                    "tasks/addComment"
                );
                return updated;
            }
            return null;
        } catch {
            return null;
        }
    },

    clearCurrentTask: () => {
        set({ currentTask: null, subtasks: [] }, false, "tasks/clearCurrent");
    },
});