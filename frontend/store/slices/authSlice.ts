import { StateCreator } from "zustand";
import { User, getCurrentUser } from "@/api/auth/auth.api";
import { ProjectSlice } from "./projectSlice";

export interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  hydrateAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
}

export const createAuthSlice: StateCreator<
  AuthSlice & ProjectSlice,
  [["zustand/devtools", never]],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  token: null,

  setAuth: (user, token) => {
    // 1. Set cookie on Vercel domain so Next.js middleware allows navigation
    if (typeof document !== "undefined" && token) {
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
    }

    set(
      {
        user,
        token,
        isAuthenticated: true,
      },
      false,
      "auth/setAuth"
    );
  },

  hydrateAuth: async () => {
    try {
      const response = await getCurrentUser();

      if (response.success && response.data) {
        set(
          {
            user: response.data.user,
            isAuthenticated: true,
          },
          false,
          "auth/hydrate/fulfilled"
        );
      } else {
        set(
          {
            user: null,
            isAuthenticated: false,
          },
          false,
          "auth/hydrate/rejected"
        );
      }
    } catch {
      set(
        {
          user: null,
          isAuthenticated: false,
        },
        false,
        "auth/hydrate/error"
      );
    } finally {
      set(
        { isHydrated: true },
        false,
        "auth/hydrate/complete"
      );
    }
  },

  logout: async () => {
    // 1. Clear the frontend cookie
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax; Secure";
    }

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8000/api"
        }/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    set(
      {
        user: null,
        token: null,
        isAuthenticated: false,
        projects: [],
        currentProject: null,
      },
      false,
      "auth/logout"
    );

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  setHydrated: (hydrated) => {
    set(
      { isHydrated: hydrated },
      false,
      "auth/setHydrated"
    );
  },
});









// import { StateCreator } from "zustand";
// import {
//   User,
//   getCurrentUser,
// } from "@/api/auth/auth.api";
// import { ProjectSlice } from "./projectSlice";

// export interface AuthSlice {
//   user: User | null;
//   isAuthenticated: boolean;
//   isHydrated: boolean;
//   token: string | null;
//   setAuth: (user: User, token: string) => void;
//   hydrateAuth: () => Promise<void>;
//   logout: () => Promise<void>;
//   setHydrated: (hydrated: boolean) => void;
// }

// export const createAuthSlice: StateCreator<
//   AuthSlice & ProjectSlice,
//   [["zustand/devtools", never]],
//   [],
//   AuthSlice
// > = (set) => ({
//   user: null,
//   isAuthenticated: false,
//   isHydrated: false,
//   token: null,

//   setAuth: (user, token ) => {
//     set(
//       {
//         user,
//         token,
//         isAuthenticated: true,
//       },
//       false,
//       "auth/setAuth"
//     );
//   },

//   hydrateAuth: async () => {
//     try {
//       const response = await getCurrentUser();

//       if (response.success && response.data) {
//         set(
//           {
//             user: response.data.user,
//             isAuthenticated: true,
//           },
//           false,
//           "auth/hydrate/fulfilled"
//         );
//       } else {
//         set(
//           {
//             user: null,
//             isAuthenticated: false,
//           },
//           false,
//           "auth/hydrate/rejected"
//         );
//       }
//     } catch {
//       set(
//         {
//           user: null,
//           isAuthenticated: false,
//         },
//         false,
//         "auth/hydrate/error"
//       );
//     } finally {
//       set(
//         { isHydrated: true },
//         false,
//         "auth/hydrate/complete"
//       );
//     }
//   },

//   logout: async () => {
//     try {
//       await fetch(
//         `${
//           process.env.NEXT_PUBLIC_API_URL ||
//           "http://localhost:8000/api"
//         }/auth/logout`,
//         {
//           method: "POST",
//           credentials: "include",
//         }
//       );
//     } catch (error) {
//       console.error("Logout error:", error);
//     }

//     set(
//       {
//         user: null,
//         isAuthenticated: false,
//         projects: [],
//         currentProject: null,
//       },
//       false,
//       "auth/logout"
//     );
//   },

//   setHydrated: (hydrated) => {
//     set(
//       { isHydrated: hydrated },
//       false,
//       "auth/setHydrated"
//     );
//   },
// });