"use client";

import React, { useState } from "react";
import {
  ChevronsUpDown,
  Sun,
  Moon,
  Palette,
  Settings,
  Check,
} from "lucide-react";

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

export interface UserProfilePopoverProps {
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
    fallback?: string;
  };
  onThemeChange?: (theme: "light" | "dark") => void;
  onSettingsClick?: () => void;
}

const defaultUser = {
  name: "Dexter",
  email: "Dexter@gmail.com",
  avatarUrl: "https://github.com/shadcn.png",
  fallback: "DX",
};

export const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({
  user = defaultUser,
  onThemeChange,
  onSettingsClick,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");

  const handleThemeSelect = (theme: "light" | "dark") => {
    setSelectedTheme(theme);
    if (onThemeChange) onThemeChange(theme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-full w-full items-center justify-between gap-2 rounded-lg p-2 hover:bg-sidebar-accent"
        >
          <div className="flex items-center gap-2.5 overflow-hidden text-left">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.fallback}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {user.name}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60 rounded-2xl p-0 shadow-lg"
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Avatar className="h-12 w-12 rounded-full mb-2">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.fallback}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>

        <DropdownMenuSeparator className="m-0" />

        <div className="p-1.5 space-y-0.5">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg">
              <Sun className="h-4 w-4 text-muted-foreground" />
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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium cursor-pointer rounded-lg">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span>Color Mode</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              sideOffset={8}
              className="w-36 rounded-xl p-2 shadow-md"
            >
              <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                System Default
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                High Contrast
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            onClick={onSettingsClick}
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