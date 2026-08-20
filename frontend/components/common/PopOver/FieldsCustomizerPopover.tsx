"use client";

import React, { useState, useEffect } from "react";
import { Columns3, List, LayoutGrid, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface VisibleFields {
  priority: boolean;
  dueDate: boolean;
  labels: boolean;
  status: boolean;
}

export const DEFAULT_VISIBLE_FIELDS: VisibleFields = {
  priority: false,
  dueDate: true,
  labels: true,
  status: false,
};

export interface FieldsCustomizerPopoverProps {
  currentView?: "list" | "board";
  onViewChange?: (view: "list" | "board") => void;
  visibleFields?: VisibleFields;
  onToggleField?: (fieldKey: keyof VisibleFields) => void;
}

export const FieldsCustomizerPopover: React.FC<
  FieldsCustomizerPopoverProps
> = ({
  currentView = "board",
  onViewChange,
  visibleFields = DEFAULT_VISIBLE_FIELDS,
  onToggleField,
}) => {
  const [selectedView, setSelectedView] = useState<"list" | "board">(
    currentView,
  );

  useEffect(() => {
    if (currentView) {
      setSelectedView(currentView);
    }
  }, [currentView]);

  const fieldsList: { key: keyof VisibleFields; label: string }[] = [
    { key: "priority", label: "Priority" },
    { key: "dueDate", label: "Due Date" },
    { key: "labels", label: "Labels" },
    { key: "status", label: "Status" },
  ];

  const handleViewSelect = (view: "list" | "board") => {
    setSelectedView(view);
    if (onViewChange) onViewChange(view);
  };

  return (
    <Popover>
      {/* <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2.5 sm:px-3 text-xs font-medium text-foreground hover:bg-muted"
        >
          <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Fields</span>
        </Button>
      </PopoverTrigger> */}

      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-medium rounded-lg border border-input bg-background hover:bg-muted text-foreground cursor-pointer outline-none transition-colors">
        <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
        <span>Fields</span>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-2xl p-2.5 shadow-xl border border-border bg-popover"
      >
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/80 p-1 mb-2">
          <button
            type="button"
            onClick={() => handleViewSelect("list")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
              selectedView === "list"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List</span>
          </button>

          <button
            type="button"
            onClick={() => handleViewSelect("board")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
              selectedView === "board"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Board</span>
          </button>
        </div>

        <div className="space-y-0.5 pt-1">
          {fieldsList.map((field) => {
            const isChecked = !!visibleFields[field.key];

            return (
              <button
                key={field.key}
                type="button"
                onClick={() => onToggleField && onToggleField(field.key)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors select-none"
              >
                <span className="text-muted-foreground hover:text-foreground">
                  {field.label}
                </span>

                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-[5px] border transition-all duration-150 ${
                    isChecked
                      ? "bg-neutral-900 border-neutral-900 text-white dark:bg-neutral-100 dark:border-neutral-100 dark:text-neutral-900"
                      : "border-muted-foreground/30 bg-muted/40"
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FieldsCustomizerPopover;
