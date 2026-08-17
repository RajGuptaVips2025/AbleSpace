"use client";

import React, { useState } from "react";
import { Columns3, LayoutList, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FieldToggleOption {
  id: string;
  label: string;
  enabled: boolean;
}

interface FieldsCustomizerPopoverProps {
  currentView?: "list" | "board";
  onViewChange?: (view: "list" | "board") => void;
  onFieldToggle?: (fieldId: string, enabled: boolean) => void;
}

const initialFields: FieldToggleOption[] = [
  { id: "priority", label: "Priority", enabled: false },
  { id: "members-1", label: "Members", enabled: true },
  { id: "dueDate", label: "Due Date", enabled: false },
  { id: "members-2", label: "Members", enabled: true },
  { id: "labels", label: "Labels", enabled: false },
  { id: "status", label: "Status", enabled: false },
  { id: "reporter", label: "Reporter", enabled: false },
];

export const FieldsCustomizerPopover: React.FC<
  FieldsCustomizerPopoverProps
> = ({ currentView = "board", onViewChange, onFieldToggle }) => {
  const [selectedView, setSelectedView] = useState<"list" | "board">(
    currentView,
  );
  const [fields, setFields] = useState<FieldToggleOption[]>(initialFields);

  const handleViewSelect = (view: "list" | "board") => {
    setSelectedView(view);
    if (onViewChange) onViewChange(view);
  };

  const handleCheckboxChange = (fieldId: string, checked: boolean) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, enabled: checked } : field,
      ),
    );
    if (onFieldToggle) onFieldToggle(fieldId, checked);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Columns3 className="h-3.5 w-3.5 text-muted-foreground" />
          Fields
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-3 shadow-md" align="end">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 mb-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleViewSelect("list")}
            className={`h-7 text-xs font-medium transition-colors ${
              selectedView === "list"
                ? "bg-background text-foreground shadow-xs hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="mr-1.5 h-3.5 w-3.5" />
            List
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleViewSelect("board")}
            className={`h-7 text-xs font-medium transition-colors ${
              selectedView === "board"
                ? "bg-background text-foreground shadow-xs hover:bg-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
            Board
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between py-1 hover:bg-muted/50 px-1 rounded-md transition-colors cursor-pointer"
              onClick={() => handleCheckboxChange(field.id, !field.enabled)}
            >
              <Label
                htmlFor={`field-${field.id}`}
                className="text-xs font-normal text-muted-foreground cursor-pointer"
              >
                {field.label}
              </Label>
              <Checkbox
                id={`field-${field.id}`}
                checked={field.enabled}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(field.id, Boolean(checked))
                }
                className="h-4 w-4 rounded-[4px] data-[state=checked]:bg-black data-[state=checked]:text-white border-muted-foreground/30"
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FieldsCustomizerPopover;
