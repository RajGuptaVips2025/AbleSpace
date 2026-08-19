import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  devtools,
} from "zustand/middleware";

import {
  AuthSlice,
  createAuthSlice,
} from "./slices/authSlice";

import {
  ProjectSlice,
  createProjectSlice,
} from "./slices/projectSlice";
import { createTaskSlice, TaskSlice } from "./slices/taskSlice";

export type RootStoreState = AuthSlice & ProjectSlice & TaskSlice;

export const useAppStore = create<RootStoreState>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createProjectSlice(...a),
        ...createTaskSlice(...a),
      }),
      {
        name: "taskboard-app-storage",

        storage: createJSONStorage(() =>
          localStorage
        ),

        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
          projects: state.projects,
          currentProject: state.currentProject,
          tasks: state.tasks,
          currentTask: state.currentTask,
        }),

        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        },

        
      }
    ),

    {
      name: "AppStore",
    }
  )
);








