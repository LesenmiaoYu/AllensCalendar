"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { CalendarEvent, EventFormData } from "@/types";

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(
    async (start?: string, end?: string): Promise<CalendarEvent[]> => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (start) params.set("start", start);
        if (end) params.set("end", end);

        const url = `/api/events${params.toString() ? `?${params}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();
        setEvents(data.events);
        return data.events;
      } catch (err) {
        toast.error("Failed to load events");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createEvent = useCallback(
    async (formData: EventFormData): Promise<CalendarEvent> => {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create event");
        }

        const data = await res.json();
        setEvents((prev) => [...prev, data.event]);
        toast.success("Event created");
        return data.event;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create event"
        );
        throw err;
      }
    },
    []
  );

  const updateEvent = useCallback(
    async (
      id: string,
      formData: Partial<EventFormData>
    ): Promise<CalendarEvent> => {
      try {
        const res = await fetch(`/api/events/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update event");
        }

        const data = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? data.event : e))
        );
        toast.success("Event updated");
        return data.event;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update event"
        );
        throw err;
      }
    },
    []
  );

  const moveEvent = useCallback(
    async (
      id: string,
      date: string,
      startTime?: string,
      endTime?: string
    ): Promise<CalendarEvent> => {
      try {
        const body: Record<string, string> = { date };
        if (startTime) body.startTime = startTime;
        if (endTime) body.endTime = endTime;

        const res = await fetch(`/api/events/${id}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to move event");
        }

        const data = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? data.event : e))
        );
        toast.success("Event moved");
        return data.event;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to move event"
        );
        throw err;
      }
    },
    []
  );

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete event");
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Event deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete event"
      );
      throw err;
    }
  }, []);

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    moveEvent,
    deleteEvent,
  };
}
