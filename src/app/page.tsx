"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { CalendarView } from "@/components/calendar/CalendarView";
import { EventModal } from "@/components/calendar/EventModal";
import { useEvents } from "@/hooks/useEvents";
import { useCategories } from "@/hooks/useCategories";
import type { CalendarEvent, EventFormData } from "@/types";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const {
    events,
    fetchEvents,
    createEvent,
    updateEvent,
    moveEvent,
    deleteEvent,
  } = useEvents();

  const { categories, fetchCategories } = useCategories();

  // Auth check
  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/login");
        } else {
          setReady(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Load data once authenticated
  useEffect(() => {
    if (ready) {
      fetchEvents();
      fetchCategories();
    }
  }, [ready, fetchEvents, fetchCategories]);

  const handleDateClick = useCallback(
    (date: string) => {
      setEditingEvent(null);
      // Pre-set date on form by creating a temp event-like shape
      // The modal will use EMPTY_FORM defaults; we pass date via the event prop trick:
      // Instead, we store the date and pass it another way.
      setModalOpen(true);
      // We'll use a small trick: set a "template" event with just the date
      setEditingEvent({
        id: "",
        title: "",
        date,
        allDay: false,
        productionDuration: 1,
        productionDurationUnit: "hours",
        keyPerson: "",
        content: "settings",
        category: "",
        syncStatus: "local_only",
        localUpdatedAt: "",
        createdAt: "",
        updatedAt: "",
      } as CalendarEvent);
    },
    []
  );

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setModalOpen(true);
  }, []);

  const handleEventDrop = useCallback(
    (id: string, date: string, startTime?: string, endTime?: string) => {
      moveEvent(id, date, startTime, endTime);
    },
    [moveEvent]
  );

  const handleSave = useCallback(
    async (data: EventFormData) => {
      try {
        if (editingEvent && editingEvent.id) {
          await updateEvent(editingEvent.id, data);
        } else {
          await createEvent(data);
        }
        setModalOpen(false);
        setEditingEvent(null);
      } catch {
        // Error toast handled in hooks
      }
    },
    [editingEvent, updateEvent, createEvent]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteEvent(id);
        setModalOpen(false);
        setEditingEvent(null);
      } catch {
        // Error toast handled in hooks
      }
    },
    [deleteEvent]
  );

  function handleNewEvent() {
    setEditingEvent(null);
    setModalOpen(true);
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex-1 overflow-hidden pt-4">
        <CalendarView
          events={events}
          categories={categories}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
          onEventDrop={handleEventDrop}
        />
      </div>

      {/* Floating new event button */}
      <Button
        onClick={handleNewEvent}
        className="fixed bottom-6 right-6 z-40 size-12 rounded-full bg-[#FEF991] text-[#222222] shadow-lg hover:bg-[#fef460] border-none"
        size="icon-lg"
        aria-label="New event"
      >
        <Plus className="size-5" />
      </Button>

      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={editingEvent}
        categories={categories}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
