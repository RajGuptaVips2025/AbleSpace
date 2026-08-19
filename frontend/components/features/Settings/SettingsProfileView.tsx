"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  User,
  Sun,
  Pencil,
  Moon,
  Check,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";

export const SettingsProfileView: React.FC = () => {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "theme" | "color">(
    "profile",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [fullName, setFullName] = useState(user?.name || "Dexter");
  const [title, setTitle] = useState("Designer");
  const [username, setUsername] = useState(
    user?.name?.toLowerCase().replace(/\s+/g, "") || "Dexuser",
  );

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as "light" | "dark") || "light";
    }
    return "light";
  });

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Theme switched to ${newTheme} mode`);
  };

  const handleLeaveWorkspace = () => {
    if (confirm("Are you sure you want to leave this workspace?")) {
      logout();
      toast.success("You have left the workspace.");
      router.push("/login");
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full space-y-5">
      <button
        onClick={() => router.push("/dashboard/projects")}
        className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to app</span>
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-xl border border-border/80 bg-muted/30 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <nav className="space-y-1">
        <button
          onClick={() => {
            setActiveTab("profile");
            setIsMobileSidebarOpen(false);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "profile"
              ? "bg-muted text-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("theme");
            setIsMobileSidebarOpen(false);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "theme"
              ? "bg-muted text-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Theme</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("color");
            setIsMobileSidebarOpen(false);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "color"
              ? "bg-muted text-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <div className="h-3.5 w-3.5 rounded-xs bg-foreground" />
          <span>Color</span>
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-border p-6 h-screen overflow-y-auto">
        {SidebarContent}
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-background border-r border-border p-6 shadow-2xl z-50">
            <div className="flex justify-end pb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {SidebarContent}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="flex md:hidden items-center justify-between border-b border-border px-4 py-3 bg-background/80 backdrop-blur-xs sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="h-8 w-8 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <span className="text-sm font-semibold capitalize">{activeTab}</span>

          <button
            onClick={() => router.push("/dashboard/projects")}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10 max-w-3xl w-full mx-auto space-y-8">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Profile
              </h1>

              <Card className="rounded-2xl border border-border/70 bg-card shadow-none overflow-hidden divide-y divide-border/60">
                <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
                  <span className="text-xs font-medium text-foreground">
                    Profile picture
                  </span>
                  <Avatar className="h-10 w-10 border border-border/80">
                    <AvatarImage
                      src={user?.avatar_url || "https://github.com/shadcn.png"}
                      alt={fullName}
                    />
                    <AvatarFallback className="text-xs font-medium bg-muted text-foreground">
                      {user?.fallback_initials || "DX"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 gap-3">
                  <span className="text-xs font-medium text-foreground shrink-0">
                    Email
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                    <span className="truncate">
                      {user?.email || "dexter@gmail.com"}
                    </span>
                    <button className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 gap-4">
                  <span className="text-xs font-medium text-foreground shrink-0">
                    Full name
                  </span>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 w-44 sm:w-64 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 gap-4">
                  <div className="pr-2">
                    <div className="text-xs font-medium text-foreground">
                      Title
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      Your job title or role
                    </p>
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Designer"
                    className="h-10 w-44 sm:w-64 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all shrink-0"
                  />
                </div>

                <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 gap-4">
                  <div className="pr-2">
                    <div className="text-xs font-medium text-foreground">
                      Username
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      One word, like a nickname or first name
                    </p>
                  </div>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Dexuser"
                    className="h-10 w-44 sm:w-64 rounded-xl border-0 bg-neutral-100 dark:bg-neutral-800 px-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all shrink-0"
                  />
                </div>
              </Card>

              <div className="space-y-3 pt-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Workspace access
                </h2>

                <Card className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 rounded-2xl border border-border/70 bg-card shadow-none">
                  <span className="text-xs text-muted-foreground">
                    Remove yourself from the workspace
                  </span>
                  <Button
                    variant="ghost"
                    onClick={handleLeaveWorkspace}
                    className="h-8 rounded-xl bg-rose-50 px-3.5 text-xs font-medium text-rose-500 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60 transition-colors"
                  >
                    Leave Workspace
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Theme Settings
              </h1>

              <Card className="p-6 rounded-2xl border border-border/70 bg-card shadow-none space-y-4">
                <span className="text-xs font-medium text-foreground">
                  Select application theme
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      theme === "light"
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 w-5 text-amber-500" />
                      <span className="text-xs font-semibold">Light Mode</span>
                    </div>
                    {theme === "light" && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>

                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      theme === "dark"
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-indigo-400" />
                      <span className="text-xs font-semibold">Dark Mode</span>
                    </div>
                    {theme === "dark" && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "color" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Color Mode
              </h1>
              <Card className="p-6 rounded-2xl border border-border/70 bg-card shadow-none">
                <p className="text-xs text-muted-foreground">
                  System Default color mode is currently active.
                </p>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsProfileView;
