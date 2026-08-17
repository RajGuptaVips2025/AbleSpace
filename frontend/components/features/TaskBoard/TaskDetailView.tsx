"use client";

import React, { useState } from "react";
import {
  Lock,
  Eye,
  Share2,
  MoreHorizontal,
  Sidebar,
  Calendar,
  Tag,
  Paperclip,
  ChevronDown,
  Plus,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero,
  Send,
  Smile,
  Settings,
  Users,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export const TaskDetailView: React.FC = () => {
  const [priority, setPriority] = useState<string>("Urgent");

  const renderPriorityIcon = (level: string) => {
    switch (level) {
      case "Urgent":
      case "High":
        return <SignalHigh className="h-3.5 w-3.5 text-rose-500" />;
      case "Medium":
        return <SignalMedium className="h-3.5 w-3.5 text-amber-500" />;
      case "Low":
        return <SignalLow className="h-3.5 w-3.5 text-slate-400" />;
      default:
        return <SignalZero className="h-3.5 w-3.5 text-slate-300" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full bg-background overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Write API Documentation
        </h1>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Eye className="h-3.5 w-3.5 text-indigo-500" />
            <span>1</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Sidebar className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
        Create clear and detailed API documentation to guide developers in using the
        inventory and sales metrics features effectively.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">Properties</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5 font-normal py-0.5">
                  <span className="font-semibold text-foreground">A</span>
                  <span>Designer</span>
                </Badge>
                <Badge variant="secondary" className="gap-1 font-normal text-rose-500 bg-rose-500/10">
                  <Calendar className="h-3 w-3" />
                  <span>31 Jul</span>
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">Labels</span>
              <div className="flex flex-wrap gap-1.5">
                {["Research", "Design", "Development", "Testing", "Deployment"].map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="gap-1 font-normal text-[11px] text-muted-foreground bg-muted hover:bg-muted/80"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-20 text-muted-foreground font-medium">Resources</span>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Add document or link...</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              <ChevronDown className="h-4 w-4" />
              <span>Subtasks</span>
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-foreground">Task</TableHead>
                    <TableHead className="text-xs font-medium text-foreground">Priority</TableHead>
                    <TableHead className="text-xs font-medium text-foreground">Members</TableHead>
                    <TableHead className="text-xs font-medium text-foreground">Due Date</TableHead>
                    <TableHead className="text-right text-xs font-medium text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-xs">Subtask 1</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-rose-500 font-medium">
                        <SignalHigh className="h-3.5 w-3.5" /> High
                      </div>
                    </TableCell>
                    <TableCell>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>DX</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">12 Sep 2026</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium text-xs">Subtask 2</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <SignalLow className="h-3.5 w-3.5" /> Low
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">CN</TableCell>
                    <TableCell className="text-xs text-muted-foreground">15 Sep 2026</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium text-xs">Subtask 3</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                        <SignalMedium className="h-3.5 w-3.5" /> Medium
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">+</TableCell>
                    <TableCell className="text-xs text-muted-foreground">18 Sep 2026</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="p-2">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                        <Plus className="h-3.5 w-3.5" /> Add Subtasks
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-semibold text-foreground">Activity</h2>

            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="p-3 pb-0 flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground">Ankit Dutta</span>
                  <span className="text-[11px] text-muted-foreground">just now</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <Smile className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-3 space-y-3">
                <p className="text-xs text-foreground">dsds</p>

                <div className="flex items-center gap-2 border-t border-border/60 pt-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>DX</AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Leave a reply..."
                    className="h-8 text-xs border-0 focus-visible:ring-0 shadow-none px-1"
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-card p-2 shadow-xs">
              <Input
                placeholder="Add a comment..."
                className="h-8 text-xs border-0 focus-visible:ring-0 shadow-none px-2"
              />
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground shrink-0">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border border-border/80 shadow-xs relative">
            <CardHeader className="p-3.5 pb-2 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Details</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 pt-0 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5 font-medium text-amber-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Backlog</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Priority</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-medium text-rose-500 hover:bg-muted">
                      <SignalHigh className="h-3.5 w-3.5" />
                      <span>{priority}</span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-48 p-2 shadow-lg" align="end">
                    <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 block">
                      Priority
                    </span>
                    <div className="space-y-0.5 pt-1">
                      {[
                        { label: "No Priority", icon: SignalZero, color: "text-slate-400" },
                        { label: "Urgent", icon: SignalHigh, color: "text-rose-500" },
                        { label: "High", icon: SignalHigh, color: "text-orange-500" },
                        { label: "Medium", icon: SignalMedium, color: "text-amber-500" },
                        { label: "Low", icon: SignalLow, color: "text-slate-400" },
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        const isSelected = priority === item.label;

                        return (
                          <button
                            key={item.label}
                            onClick={() => setPriority(item.label)}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                              isSelected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ItemIcon className={`h-3.5 w-3.5 ${item.color}`} />
                              <span className={item.color}>{item.label}</span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-foreground" />}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Members</span>
                <button className="flex items-center gap-1 text-foreground font-medium hover:underline">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Add members</span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Dates</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="gap-1 font-normal py-0.5 text-[11px]">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Jan 10
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="gap-1 font-normal py-0.5 text-[11px]">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> End
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Labels</span>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="gap-1 font-normal text-[11px]">
                    <Tag className="h-2.5 w-2.5" /> Research
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Teams</span>
                <button className="flex items-center gap-1 text-foreground font-medium hover:underline">
                  <Plus className="h-3 w-3 text-muted-foreground" />
                  <span>New workspace</span>
                </button>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Reporter</span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">You</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="p-3.5 pb-2 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Updates</span>
              </div>
            </CardHeader>

            <CardContent className="p-3.5 pt-1 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 shrink-0">
                  <SignalHigh className="h-3.5 w-3.5 text-rose-500" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">You</div>
                  <p className="text-muted-foreground text-[11px]">
                    changed priority from No priority to Ur...
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">You</div>
                  <p className="text-muted-foreground text-[11px]">
                    posted an update · Aug 2026
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;