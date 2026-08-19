"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border/80 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:text-xs group-[.toaster]:font-medium",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-[11px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-xl group-[.toast]:text-xs",
          success:
            "group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-foreground",
          error:
            "group-[.toaster]:border-rose-500/30 group-[.toaster]:text-foreground",
          warning:
            "group-[.toaster]:border-amber-500/30 group-[.toaster]:text-foreground",
          info: "group-[.toaster]:border-blue-500/30 group-[.toaster]:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster as default };
