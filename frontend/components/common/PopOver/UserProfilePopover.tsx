"use client";

import React, { useState, useEffect } from "react";
import { ChevronsUpDown, Sun, Moon, Settings, Check } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface UserProfilePopoverProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    fallback?: string;
  };
  onSettingsClick?: () => void;
}

const defaultUser = {
  name: "Workspace Member",
  email: "user@example.com",
  avatarUrl: "",
  fallback: "U",
};

const COLOR_MODES = [
  { label: "Amber", value: "amber", color: "bg-amber-500" },
  { label: "Blue", value: "blue", color: "bg-indigo-600" },
  { label: "Pink", value: "pink", color: "bg-pink-500" },
  { label: "Rose", value: "rose", color: "bg-rose-500" },
  { label: "Emerald", value: "emerald", color: "bg-emerald-500" },
  {
    label: "Black",
    value: "black",
    color: "bg-neutral-900 dark:bg-neutral-100",
  },
];

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({
  user = defaultUser,
  onSettingsClick,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");
  const [selectedColor, setSelectedColor] = useState<string>("blue");
  const router = useRouter();

  useEffect(() => {
    // Load Theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme === "dark") {
      setSelectedTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setSelectedTheme("light");
      document.documentElement.classList.remove("dark");
    }

    // Load Color Mode
    const savedColor = localStorage.getItem("color-mode") || "blue";
    setSelectedColor(savedColor);
    document.documentElement.setAttribute("data-color-mode", savedColor);
    COLOR_MODES.forEach((c) =>
      document.documentElement.classList.remove(`theme-${c.value}`),
    );
    document.documentElement.classList.add(`theme-${savedColor}`);
  }, []);

  const handleThemeSelect = (theme: "light" | "dark") => {
    setSelectedTheme(theme);
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    localStorage.setItem("color-mode", colorValue);
    document.documentElement.setAttribute("data-color-mode", colorValue);
    COLOR_MODES.forEach((c) =>
      document.documentElement.classList.remove(`theme-${c.value}`),
    );
    document.documentElement.classList.add(`theme-${colorValue}`);
  };

  const activeColorObj =
    COLOR_MODES.find((c) => c.value === selectedColor) || COLOR_MODES[1];

  return (
    <DropdownMenu>
      {/* <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-full w-full items-center justify-between gap-2 rounded-lg p-2 hover:bg-sidebar-accent"
        >
          <div className="flex items-center gap-2.5 overflow-hidden text-left">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
              <AvatarFallback>{user.fallback || "U"}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {user.name}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger> */}

      <DropdownMenuTrigger className="flex h-full w-full items-center justify-between gap-2 rounded-lg p-2 hover:bg-sidebar-accent transition-colors cursor-pointer outline-none">
        <div className="flex items-center gap-2.5 overflow-hidden text-left">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback>{user.fallback || "U"}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {user.name}
          </span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60 rounded-2xl p-0 shadow-lg"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        {/* User Info Header */}
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Avatar className="h-12 w-12 rounded-full mb-2">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback>{user.fallback || "U"}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1.5 space-y-0.5">
          {/* 1. Change Theme Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg">
              {selectedTheme === "dark" ? (
                <Moon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-muted-foreground" />
              )}
              <span>Change Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={8}
              className="w-36 rounded-xl p-2 shadow-md"
            >
              <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 block">
                Theme
              </span>
              <DropdownMenuItem
                onClick={() => handleThemeSelect("light")}
                className="flex items-center justify-between px-2 py-1.5 text-xs font-medium cursor-pointer rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </div>
                {selectedTheme === "light" && (
                  <Check className="h-3.5 w-3.5 text-foreground" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleThemeSelect("dark")}
                className="flex items-center justify-between px-2 py-1.5 text-xs font-medium cursor-pointer rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </div>
                {selectedTheme === "dark" && (
                  <Check className="h-3.5 w-3.5 text-foreground" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* 2. Color Mode Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg">
              <div
                className={`h-3.5 w-3.5 rounded-[4px] ${activeColorObj.color} shrink-0`}
              />
              <span>Color Mode</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={8}
              className="w-40 rounded-xl p-2 shadow-md"
            >
              <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 block">
                Color Mode
              </span>
              <div className="space-y-0.5">
                {COLOR_MODES.map((item) => {
                  const isSelected = selectedColor === item.value;
                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => handleColorSelect(item.value)}
                      className="flex items-center justify-between px-2 py-1.5 text-xs font-medium cursor-pointer rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3.5 w-3.5 rounded-[4px] ${item.color} shrink-0`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-foreground" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* 3. Settings */}
          <DropdownMenuItem
            onClick={() => {
              if (onSettingsClick) onSettingsClick();
              else router.push("/dashboard/settings");
            }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfilePopover;
