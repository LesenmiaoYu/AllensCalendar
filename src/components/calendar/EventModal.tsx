"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import type {
  CalendarEvent,
  Category,
  EventFormData,
  ContentType,
  DurationUnit,
} from "@/types";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  categories: Category[];
  onSave: (data: EventFormData) => void;
  onDelete?: (id: string) => void;
}

const EMPTY_FORM: EventFormData = {
  title: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "10:00",
  allDay: false,
  productionDuration: 1,
  productionDurationUnit: "hours",
  keyPerson: "",
  content: "settings",
  category: "",
};

export function EventModal({
  open,
  onOpenChange,
  event,
  categories,
  onSave,
  onDelete,
}: EventModalProps) {
  const isEditing = !!event;
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setConfirmDelete(false);
      if (event) {
        setForm({
          title: event.title,
          description: event.description || "",
          date: event.date,
          startTime: event.startTime || "09:00",
          endTime: event.endTime || "10:00",
          allDay: event.allDay,
          productionDuration: event.productionDuration,
          productionDurationUnit: event.productionDurationUnit,
          keyPerson: event.keyPerson,
          content: event.content,
          category: event.category,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, event]);

  function handleChange(
    field: keyof EventFormData,
    value: string | number | boolean
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form };
    if (data.allDay) {
      data.startTime = undefined;
      data.endTime = undefined;
    }
    onSave(data);
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (event && onDelete) {
      onDelete(event.id);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event" : "New Event"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          {/* All Day toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) => handleChange("allDay", e.target.checked)}
              className="size-4 rounded border-[#E5E5E5] accent-[#FEF991]"
            />
            All day event
          </label>

          {/* Time fields */}
          {!form.allDay && (
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime || ""}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="endTime">End time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={form.endTime || ""}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Production Duration */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="productionDuration">Production duration</Label>
              <Input
                id="productionDuration"
                type="number"
                min={0}
                step={0.5}
                value={form.productionDuration}
                onChange={(e) =>
                  handleChange(
                    "productionDuration",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="durationUnit">Unit</Label>
              <select
                id="durationUnit"
                value={form.productionDurationUnit}
                onChange={(e) =>
                  handleChange(
                    "productionDurationUnit",
                    e.target.value as DurationUnit
                  )
                }
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          {/* Key Person */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="keyPerson">Key person</Label>
            <Input
              id="keyPerson"
              value={form.keyPerson}
              onChange={(e) => handleChange("keyPerson", e.target.value)}
              placeholder="Name"
              required
            />
          </div>

          {/* Content Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="content">Content type</Label>
            <select
              id="content"
              value={form.content}
              onChange={(e) =>
                handleChange("content", e.target.value as ContentType)
              }
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="settings">Settings</option>
              <option value="models">Models</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              required
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none resize-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <Separator />

          <DialogFooter className="flex-row justify-between sm:justify-between">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="size-3.5" />
                {confirmDelete ? "Confirm delete" : "Delete"}
              </Button>
            ) : (
              <div />
            )}
            <Button
              type="submit"
              size="sm"
              className="bg-[#FEF991] text-[#222222] hover:bg-[#fef460] border-[#FEF991]"
            >
              {isEditing ? "Save changes" : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
