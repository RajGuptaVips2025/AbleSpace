import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { firebaseLoginUser } from "@/api/auth/auth.api";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

export const useGoogleAuth = () => {
  const router = useRouter();

  const setAuth = useAppStore((state) => state.setAuth);

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        toast.error("Google account must have an email associated.");
        return;
      }

      const backendResult = await firebaseLoginUser({
        name: firebaseUser.displayName || "Google User",
        email: firebaseUser.email,
        avatar_url: firebaseUser.photoURL || undefined,
      });

      if (!backendResult.success || !backendResult.data) {
        toast.error(
          backendResult.message || "Failed to sync user session."
        );
        return;
      }

      if (typeof document !== "undefined" && backendResult.data.token) {
        document.cookie = `auth_token=${backendResult.data.token}; path=/; max-age=604800; SameSite=Lax; Secure`;
      }

      setAuth(
        backendResult.data.user,
        backendResult.data.token
      );

      toast.success("Successfully logged in with Google!");

      router.replace("/dashboard/projects");
    } catch (error: any) {
      if (error?.code !== "auth/popup-closed-by-user") {
        console.error("Firebase Login Error:", error);
        toast.error("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    handleGoogleLogin,
    isGoogleLoading,
  };
};






