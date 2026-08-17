"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Link from "next/link";

interface AuthCardProps {
  termsUrl?: string;
  privacyUrl?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  termsUrl = "#",
  privacyUrl = "#",
}) => {
  const { handleGoogleLogin, isGoogleLoading } = useGoogleAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">

      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2.5 16.88a1 1 0 0 1-.32-1.39l9-13a1 1 0 0 1 1.64 0l9 13a1 1 0 0 1-.82 1.57H3.32a1 1 0 0 1-.82-.06z" />
            <path d="M12 2.5v14.38" />
          </svg>
        </div>

        <span className="text-lg font-semibold tracking-tight text-foreground">
          Pyramid
        </span>
      </div>

      <Card className="w-full max-w-[384px] rounded-3xl border border-border/80 bg-card p-6 shadow-xs sm:rounded-4xl">
        <CardHeader className="space-y-1.5 p-0 text-center">
          <CardTitle className="text-xl font-semibold tracking-tight text-card-foreground">
            Let's get back on track
          </CardTitle>

          <CardDescription className="text-sm text-muted-foreground">
            Sign in with Google or continue as a guest to enter your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-6 flex flex-col gap-3 p-0">

          <Link
            href="/login"
            replace
            className="flex h-12 w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Continue as Guest
          </Link>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="h-12 w-full gap-2 rounded-full border-border/80 bg-background text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>

            {isGoogleLoading ? "Connecting..." : "Login with Google"}
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 max-w-[280px] text-center text-xs leading-relaxed text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          href={termsUrl}
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href={privacyUrl}
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default AuthCard;