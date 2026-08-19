"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  Sidebar,
  Tag,
  Paperclip,
  ChevronDown,
  Plus,
  SignalHigh,
  SignalMedium,
  SignalLow,
  CircleDot,
  Signal,
  Send,
  Settings,
  Check,
  Loader2,
  ExternalLink,
  X,
  Edit2,
  Trash2,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PriorityType } from "@/types/entity.types";

export interface StatusOption<T = string> {
  label: T;
  color: string;
}

export interface DetailTableRow {
  id: string;
  title: string;
  priority: PriorityType;
  creatorName?: string;
  creatorAvatar?: string | null;
  creatorFallback?: string;
  dueDate?: string | null;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface EntityDetailViewProps {
  title: string;
  description?: string | null;
  isLoading?: boolean;
  emptyMessage?: string;

  onEditClick?: () => void;
  onDeleteClick?: () => void;
  isDeleting?: boolean;
  deleteTitle?: string;
  deleteDescription?: string;

  primaryBadge?: {
    icon?: React.ElementType;
    text: string;
  };
  labels?: string[];
  resources?: string[];

  tableTitle?: string;
  tableItems?: DetailTableRow[];
  isTableLoading?: boolean;
  emptyTableMessage?: string;
  onAddTableItem?: () => void;
  addTableItemText?: string;

  comments?: string[];
  onAddComment?: (text: string) => Promise<void> | void;
  isSubmittingComment?: boolean;

  status: string;
  statusOptions: StatusOption[];
  onStatusChange: (status: any) => Promise<void> | void;

  priority: PriorityType;
  onPriorityChange: (priority: PriorityType) => Promise<void> | void;

  creatorName?: string;
  creatorAvatar?: string | null;
  creatorInitials?: string;
  createdAt?: string;

  dueDate?: string | null;
  maxDueDate?: string | null
  onDueDateChange: (dateStr: string) => Promise<void> | void;

  sidebarExtraRows?: React.ReactNode;
  children?: React.ReactNode;
}

const PRIORITIES: {
  label: PriorityType;
  icon: React.ElementType;
  color: string;
}[] = [
  { label: "No Priority", icon: CircleDot, color: "text-slate-400" },
  { label: "Urgent", icon: SignalHigh, color: "text-red-500" },
  { label: "High", icon: Signal, color: "text-orange-500" },
  { label: "Medium", icon: SignalMedium, color: "text-amber-500" },
  { label: "Low", icon: SignalLow, color: "text-blue-500" },
];

export const EntityDetailView: React.FC<EntityDetailViewProps> = ({
  title,
  description,
  isLoading = false,
  emptyMessage = "Entity not found",
  onEditClick,
  onDeleteClick,
  isDeleting = false,
  deleteTitle = "Are you absolutely sure?",
  deleteDescription = "This action cannot be undone.",
  primaryBadge,
  labels = [],
  resources = [],
  tableTitle = "Tasks",
  tableItems = [],
  isTableLoading = false,
  emptyTableMessage = "No items created yet.",
  onAddTableItem,
  addTableItemText = "Add Task",
  comments = [],
  onAddComment,
  isSubmittingComment = false,
  status,
  statusOptions,
  onStatusChange,
  priority,
  onPriorityChange,
  creatorName = "Workspace Member",
  creatorAvatar,
  creatorInitials = "U",

  createdAt,
  dueDate,
  maxDueDate,
  onDueDateChange,
  sidebarExtraRows,
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(true);
  const [newComment, setNewComment] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1025px)");
    setIsSidebarOpen(mediaQuery.matches);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const renderPriorityIcon = (level: PriorityType) => {
    const item = PRIORITIES.find((p) => p.label === level) || PRIORITIES[0];
    const Icon = item.icon;
    return <Icon className={`h-3.5 w-3.5 ${item.color}`} />;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatToLocalDateStr = (dateInput?: string | Date | null): string => {
    if (!dateInput) return "";

    if (
      typeof dateInput === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())
    ) {
      return dateInput.trim();
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !onAddComment) return;
    await onAddComment(newComment);
    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          <span>Loading details...</span>
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background">
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const currentStatusObj =
    statusOptions.find((s) => s.label === status) || statusOptions[0];
  const PrimaryBadgeIcon = primaryBadge?.icon;

  return (
    <div className="relative flex flex-1 flex-col h-full w-full bg-background overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative group flex items-center justify-center">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </Button>
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900 z-50">
              Design only · No active use
            </span>
          </div>

          <div className="relative group flex items-center justify-center">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <Eye className="h-3.5 w-3.5 text-indigo-500" />
              <span>1</span>
            </Button>
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900 z-50">
              Design only · No active use
            </span>
          </div>

          <div className="relative group flex items-center justify-center">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900 z-50">
              Design only · No active use
            </span>
          </div>

          {(onEditClick || onDeleteClick) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {onEditClick && (
                  <DropdownMenuItem
                    onClick={onEditClick}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                {onEditClick && onDeleteClick && <DropdownMenuSeparator />}
                {onDeleteClick && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`h-8 w-8 transition-colors ${
              isSidebarOpen
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <Sidebar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
        {description || "No description provided."}
      </p>

      <div className="flex flex-row gap-8 items-start relative">
        <div className="flex-1 min-w-0 w-full space-y-8">
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">
                Properties
              </span>
              <div className="flex items-center gap-2">
                {primaryBadge && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 font-normal py-0.5"
                  >
                    {PrimaryBadgeIcon && (
                      <PrimaryBadgeIcon className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>{primaryBadge.text}</span>
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="gap-1 font-normal text-rose-500 bg-rose-500/10"
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(dueDate)}</span>
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">
                Labels
              </span>
              <div className="flex flex-wrap gap-1.5">
                {labels.length > 0 ? (
                  labels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="gap-1 font-normal text-[11px] text-muted-foreground bg-muted hover:bg-muted/80"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {label}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No labels</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">
                Resources
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {resources.length > 0 ? (
                  resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.startsWith("http") ? res : `https://${res}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline max-w-[200px] truncate"
                    >
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{res}</span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No resources attached
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Collapsible
              open={isTableOpen}
              onOpenChange={setIsTableOpen}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isTableOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <span>{tableTitle}</span>
                    {tableItems.length > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">
                        ({tableItems.length})
                      </span>
                    )}
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-foreground">
                          Title
                        </TableHead>
                        <TableHead className="text-xs font-medium text-foreground">
                          Priority
                        </TableHead>
                        <TableHead className="text-xs font-medium text-foreground">
                          Assignee
                        </TableHead>
                        <TableHead className="text-xs font-medium text-foreground">
                          Due Date
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-foreground">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {isTableLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-20 text-center text-xs text-muted-foreground"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                              <span>Loading {tableTitle.toLowerCase()}...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : tableItems.length > 0 ? (
                        tableItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-xs">
                              {item.onClick ? (
                                <span
                                  onClick={item.onClick}
                                  className="font-medium text-blue-600 hover:underline cursor-pointer inline-block"
                                >
                                  {item.title}
                                </span>
                              ) : (
                                <span className="font-medium text-foreground inline-block">
                                  {item.title}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-xs font-medium">
                                {renderPriorityIcon(item.priority)}
                                <span>{item.priority}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage
                                    src={item.creatorAvatar || undefined}
                                  />
                                  <AvatarFallback className="text-[9px]">
                                    {item.creatorFallback || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {item.creatorName || "Member"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(item.dueDate)}
                            </TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-36 text-xs"
                                >
                                  {item.onEdit && (
                                    <DropdownMenuItem
                                      onClick={item.onEdit}
                                      className="gap-2 cursor-pointer text-xs"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                      <span>Edit</span>
                                    </DropdownMenuItem>
                                  )}
                                  {item.onEdit && item.onDelete && (
                                    <DropdownMenuSeparator />
                                  )}
                                  {item.onDelete && (
                                    <DropdownMenuItem
                                      onClick={item.onDelete}
                                      className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-20 text-center text-xs text-muted-foreground"
                          >
                            {emptyTableMessage}
                          </TableCell>
                        </TableRow>
                      )}

                      {onAddTableItem && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={5} className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onAddTableItem}
                              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />{" "}
                              {addTableItemText}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-4 pt-2">
            <Collapsible
              open={isCommentsOpen}
              onOpenChange={setIsCommentsOpen}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isCommentsOpen ? "" : "-rotate-90"
                      }`}
                    />
                    <span>Comments</span>
                    {comments.length > 0 && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({comments.length})
                      </span>
                    )}
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-3 transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                {comments.length > 0 ? (
                  <div className="space-y-3">
                    {comments.map((comment, index) => (
                      <Card
                        key={index}
                        className="border border-border/80 shadow-xs"
                      >
                        <CardHeader className="p-3 pb-0 flex-row items-center justify-between space-y-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={creatorAvatar || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {creatorInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-semibold text-foreground">
                              {creatorName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Comment #{index + 1}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                          <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {comment}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No comments yet. Leave a note or update below.
                    </p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {onAddComment && (
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-card p-2 shadow-xs">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                  placeholder="Add a comment... (Press Enter to post)"
                  disabled={isSubmittingComment}
                  className="h-8 text-xs border-0 focus-visible:ring-0 shadow-none px-2"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isSubmittingComment || !newComment.trim()}
                  onClick={handleCommentSubmit}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                >
                  {isSubmittingComment ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity min-[1025px]:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            <div
              className="
                fixed inset-y-0 right-0 z-50
                w-80 max-w-[85vw]
                bg-background
                border-l border-border
                p-4
                overflow-y-auto
                shadow-2xl
                space-y-6

                min-[1025px]:static
                min-[1025px]:z-0
                min-[1025px]:w-80
                min-[1025px]:max-w-none
                min-[1025px]:shadow-none
                min-[1025px]:p-0
                min-[1025px]:border-none
                min-[1025px]:overflow-visible

                shrink-0
              "
            >
              <div className="flex items-center justify-between pb-2 border-b border-border min-[1025px]:hidden">
                <span className="text-xs font-semibold text-foreground">
                  Details
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Collapsible
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                asChild
              >
                <Card className="border border-border/80 shadow-none rounded-md overflow-hidden transition-all">
                  <CardHeader
                    className={`h-9 p-0 ${isDetailsOpen ? "border-b border-border/80" : ""}`}
                  >
                    <div className="flex h-full items-center justify-between px-2.5">
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-foreground/80 cursor-pointer select-none"
                        >
                          <ChevronDown
                            className={`h-3 w-3 transition-transform duration-200 ${
                              isDetailsOpen ? "" : "-rotate-90"
                            }`}
                          />
                          <span>Details</span>
                        </button>
                      </CollapsibleTrigger>

                      <div className="flex items-center gap-0.5">
                        <div className="relative group flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-sm text-foreground hover:bg-muted"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="pointer-events-none absolute -bottom-7 right-0 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900 z-50">
                            Design only · No active use
                          </span>
                        </div>

                        <div className="relative group flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <span className="pointer-events-none absolute -bottom-7 right-0 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900 z-50">
                            Design only · No active use
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CollapsibleContent className="transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                    <CardContent className="p-3.5 space-y-3 text-xs">
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Status</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity">
                              <span
                                className={`h-2 w-2 rounded-full ${currentStatusObj?.color || "bg-amber-500"}`}
                              />
                              <span>{status}</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-40 p-1.5 shadow-lg"
                            align="end"
                          >
                            <div className="space-y-0.5">
                              {statusOptions.map((st) => (
                                <button
                                  key={st.label}
                                  onClick={() => onStatusChange(st.label)}
                                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                    status === st.label
                                      ? "bg-muted text-foreground"
                                      : "text-muted-foreground hover:bg-muted/50"
                                  }`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${st.color}`}
                                  />
                                  <span>{st.label}</span>
                                  {status === st.label && (
                                    <Check className="ml-auto h-3 w-3" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Priority</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs font-medium hover:bg-muted"
                            >
                              {renderPriorityIcon(priority)}
                              <span>{priority}</span>
                              <ChevronDown className="ml-1 h-3 w-3 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-48 p-2 shadow-lg"
                            align="end"
                          >
                            <span className="block px-2 py-1 text-[11px] font-medium text-muted-foreground">
                              Priority
                            </span>
                            <div className="space-y-0.5 pt-1">
                              {PRIORITIES.map((item) => {
                                const ItemIcon = item.icon;
                                const isSelected = priority === item.label;
                                return (
                                  <button
                                    key={item.label}
                                    onClick={() => onPriorityChange(item.label)}
                                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                      isSelected
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ItemIcon
                                        className={`h-3.5 w-3.5 ${item.color}`}
                                      />
                                      <span className={item.color}>
                                        {item.label}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Due Date</span>
                        <div className="relative inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                dateInputRef.current?.showPicker();
                              } catch {
                                dateInputRef.current?.focus();
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-normal transition-colors hover:bg-muted cursor-pointer"
                          >
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {dueDate ? formatDate(dueDate) : "Set due date"}
                            </span>
                          </button>

                          <input
                            ref={dateInputRef}
                            type="date"
                            value={formatToLocalDateStr(dueDate)}
                            min={formatToLocalDateStr(new Date())}
                            max={
                              maxDueDate
                                ? formatToLocalDateStr(maxDueDate)
                                : undefined
                            }
                            onChange={(e) => {
                              if (e.target.value) {
                                onDueDateChange(e.target.value);
                              }
                            }}
                            className="sr-only"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">
                          Created By
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={creatorAvatar || undefined} />
                            <AvatarFallback className="text-[9px]">
                              {creatorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {creatorName}
                          </span>
                        </div>
                      </div>

                      {sidebarExtraRows}

                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">Labels</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="gap-1 text-[11px] font-normal"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {labels[0] || "General"}
                          </Badge>
                          {labels.length > 1 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{labels.length - 1}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              <Collapsible
                open={isUpdatesOpen}
                onOpenChange={setIsUpdatesOpen}
                asChild
              >
                <Card className="border border-border/80 shadow-xs overflow-hidden transition-all">
                  <CardHeader
                    className={`p-3.5 flex-row items-center justify-between space-y-0 ${
                      isUpdatesOpen
                        ? "pb-2 border-b border-border/80"
                        : "pb-3.5"
                    }`}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-foreground/80 cursor-pointer select-none"
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isUpdatesOpen ? "" : "-rotate-90"
                          }`}
                        />
                        <span>Updates</span>
                      </button>
                    </CollapsibleTrigger>
                  </CardHeader>

                  <CollapsibleContent className="transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                    <CardContent className="p-3.5 pt-3 space-y-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 shrink-0">
                          {renderPriorityIcon(priority)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {creatorName}
                          </div>
                          <p className="text-muted-foreground text-[11px]">
                            set priority to {priority}
                          </p>
                        </div>
                      </div>

                      {createdAt && (
                        <div className="flex items-start gap-2.5">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarImage src={creatorAvatar || undefined} />
                            <AvatarFallback className="text-[9px]">
                              {creatorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">
                              {creatorName}
                            </div>
                            <p className="text-muted-foreground text-[11px]">
                              created item · {formatDate(createdAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (onDeleteClick) onDeleteClick();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {children}
    </div>
  );
};

export default EntityDetailView;
