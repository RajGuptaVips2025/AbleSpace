"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Calendar, Plus, X, Tag as TagIcon, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "tags" 
  | "list"; 

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ElementType;
  color?: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean | string;
  options?: SelectOption[];
  disabled?: boolean;
  disabledInEdit?: boolean;
  colSpan?: 1 | 2; 
  rows?: number;
  icon?: React.ElementType;
  defaultValue?: any;
  min?: string; 
  max?: string; 
}

export interface CreateEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  title?: string;
  description?: string;
  submitButtonText?: string;
  fields?: FieldConfig[]; 
  initialData?: Record<string, any> | null;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
}

export const CreateEntityDialog: React.FC<CreateEntityDialogProps> = ({
  isOpen,
  onClose,
  mode = "create",
  title,
  description,
  submitButtonText,
  fields = [], 
  initialData,
  onSubmit,
}) => {
  const isEdit = mode === "edit";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [arrayFieldsState, setArrayFieldsState] = useState<
    Record<string, string[]>
  >({});
  const [inputState, setInputState] = useState<Record<string, string>>({});

  // 1. Safe default form values calculation
  const defaultValues = useMemo(() => {
    const defaults: Record<string, any> = {};

    (fields || []).forEach((field) => {
      if (field.type === "tags" || field.type === "list") return;

      const rawVal =
        isEdit && initialData ? initialData[field.name] : field.defaultValue;

      if (field.type === "date" && rawVal) {
        try {
          defaults[field.name] = new Date(rawVal).toISOString().split("T")[0];
        } catch {
          defaults[field.name] = rawVal;
        }
      } else {
        defaults[field.name] = rawVal ?? "";
      }
    });

    return defaults;
  }, [fields, isEdit, initialData]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Record<string, any>>({
    values: defaultValues,
  });

  // 2. Synchronize tag/list arrays safely
  useEffect(() => {
    if (isOpen) {
      const initialArrays: Record<string, string[]> = {};
      const initialInputs: Record<string, string> = {};

      (fields || []).forEach((field) => {
        if (field.type === "tags" || field.type === "list") {
          const rawVal =
            isEdit && initialData
              ? initialData[field.name]
              : field.defaultValue;
          initialArrays[field.name] = Array.isArray(rawVal) ? [...rawVal] : [];
          initialInputs[field.name] = "";
        }
      });

      setArrayFieldsState(initialArrays);
      setInputState(initialInputs);
    }
  }, [isOpen, isEdit, initialData, fields]);

  const handleAddItem = (fieldName: string) => {
    const value = (inputState[fieldName] || "").trim();
    if (!value) return;

    setArrayFieldsState((prev) => {
      const currentList = prev[fieldName] || [];
      if (currentList.includes(value)) return prev;
      return { ...prev, [fieldName]: [...currentList, value] };
    });

    setInputState((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleRemoveItem = (fieldName: string, indexToRemove: number) => {
    setArrayFieldsState((prev) => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter(
        (_, idx) => idx !== indexToRemove,
      ),
    }));
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        ...arrayFieldsState,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTitle = isEdit ? "Edit Entity" : "Create New Entity";
  const defaultSubmitText = isSubmitting
    ? "Saving..."
    : isEdit
      ? "Save Changes"
      : "Create";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl rounded-2xl p-6 sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            {title || defaultTitle}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(fields || []).map((field) => {
              const isColSpan2 =
                field.colSpan === 2 ||
                field.type === "textarea" ||
                field.type === "tags" ||
                field.type === "list";
              const isDisabled =
                field.disabled || (isEdit && field.disabledInEdit);

              return (
                <div
                  key={field.name}
                  className={`space-y-1.5 text-left ${isColSpan2 ? "sm:col-span-2" : "sm:col-span-1"}`}
                >
                  <Label className="text-xs font-medium text-foreground">
                    {field.label}{" "}
                    {field.required && <span className="text-rose-500">*</span>}
                  </Label>

                  {(field.type === "text" || field.type === "number") && (
                    <Input
                      type={field.type}
                      disabled={isDisabled}
                      placeholder={field.placeholder}
                      className="h-10 text-xs"
                      {...register(field.name, {
                        required: field.required
                          ? typeof field.required === "string"
                            ? field.required
                            : `${field.label} is required`
                          : false,
                      })}
                    />
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      rows={field.rows || 3}
                      disabled={isDisabled}
                      placeholder={field.placeholder}
                      className="text-xs resize-none"
                      {...register(field.name, {
                        required: field.required
                          ? typeof field.required === "string"
                            ? field.required
                            : `${field.label} is required`
                          : false,
                      })}
                    />
                  )}

                  {field.type === "date" && (
                    <div className="relative">
                      <Input
                        type="date"
                        min={
                          field.min || new Date().toISOString().split("T")[0]
                        } 
                        max={field.max} 
                        disabled={isDisabled}
                        className="h-10 text-xs pl-8"
                        {...register(field.name, {
                          required: field.required
                            ? typeof field.required === "string"
                              ? field.required
                              : `${field.label} is required`
                            : false,
                          validate: (val) => {
                            if (!val) return true;
                            const selected = new Date(val);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            if (selected < today) {
                              return "Due date cannot be in the past";
                            }

                            if (field.max) {
                              const [y, m, d] = field.max
                                .split("-")
                                .map(Number);
                              const maxDate = new Date(
                                y,
                                m - 1,
                                d,
                                23,
                                59,
                                59,
                                999,
                              );
                              if (selected > maxDate) {
                                return `Due date cannot be later than project due date (${field.max})`;
                              }
                            }

                            return true;
                          },
                        })}
                      />
                      <Calendar className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  )}

                  {field.type === "select" && (
                    <Controller
                      name={field.name}
                      control={control}
                      rules={{
                        required: field.required
                          ? typeof field.required === "string"
                            ? field.required
                            : `${field.label} is required`
                          : false,
                      }}
                      render={({ field: controllerField }) => {
                        const selectedOption = field.options?.find(
                          (opt) => opt.value === controllerField.value,
                        );

                        return (
                          <Select
                            disabled={isDisabled}
                            value={controllerField.value || ""}
                            onValueChange={controllerField.onChange}
                          >
                            <SelectTrigger className="h-10 w-full text-xs">
                              <SelectValue
                                placeholder={
                                  field.placeholder || `Select ${field.label}`
                                }
                              >
                                {selectedOption ? (
                                  <div className="flex items-center gap-2">
                                    {selectedOption.icon && (
                                      <selectedOption.icon
                                        className={`h-3.5 w-3.5 ${selectedOption.color || ""}`}
                                      />
                                    )}
                                    <span>{selectedOption.label}</span>
                                  </div>
                                ) : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                  <SelectItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      {Icon && (
                                        <Icon
                                          className={`h-3.5 w-3.5 ${opt.color || ""}`}
                                        />
                                      )}
                                      <span>{opt.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                  )}

                  {field.type === "tags" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={inputState[field.name] || ""}
                          onChange={(e) =>
                            setInputState((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              handleAddItem(field.name);
                            }
                          }}
                          placeholder={
                            field.placeholder ||
                            "Type tag and press Add or Enter..."
                          }
                          className="h-9 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddItem(field.name)}
                          className="h-9 px-3 text-xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                      </div>

                      {(arrayFieldsState[field.name] || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(arrayFieldsState[field.name] || []).map(
                            (tag, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                              >
                                <TagIcon className="h-3 w-3 text-muted-foreground" />
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveItem(field.name, idx)
                                  }
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === "list" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={inputState[field.name] || ""}
                          onChange={(e) =>
                            setInputState((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddItem(field.name);
                            }
                          }}
                          placeholder={
                            field.placeholder || "Paste link and press Add..."
                          }
                          className="h-9 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddItem(field.name)}
                          className="h-9 px-3 text-xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                      </div>

                      {(arrayFieldsState[field.name] || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(arrayFieldsState[field.name] || []).map(
                            (item, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-foreground"
                              >
                                <Paperclip className="h-3 w-3 text-muted-foreground" />
                                <span className="max-w-[220px] truncate">
                                  {item}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveItem(field.name, idx)
                                  }
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {errors[field.name] && (
                    <p className="text-[11px] text-rose-500">
                      {errors[field.name]?.message as string}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
            >
              {submitButtonText || defaultSubmitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
