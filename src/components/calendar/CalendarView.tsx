"use client";

import { useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { CalendarEvent, Category } from "@/types";
import { format } from "date-fns";

interface CalendarViewProps {
  events: CalendarEvent[];
  categories: Category[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: string) => void;
  onEventDrop: (
    id: string,
    date: string,
    startTime?: string,
    endTime?: string
  ) => void;
}

export function CalendarView({
  events,
  categories,
  onEventClick,
  onDateClick,
  onEventDrop,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.slug] = cat.color;
    }
    return map;
  }, [categories]);

  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const color = categoryColorMap[event.category] || "#222222";

      let start: string;
      let end: string | undefined;

      if (event.allDay) {
        start = event.date;
      } else {
        start = event.startTime
          ? `${event.date}T${event.startTime}`
          : event.date;
        end = event.endTime
          ? `${event.date}T${event.endTime}`
          : undefined;
      }

      return {
        id: event.id,
        title: event.title,
        start,
        end,
        allDay: event.allDay,
        backgroundColor: color,
        borderColor: color,
        textColor: isLightColor(color) ? "#222222" : "#ffffff",
        extendedProps: { ...event },
      };
    });
  }, [events, categoryColorMap]);

  function handleEventClick(info: EventClickArg) {
    const original = info.event.extendedProps as CalendarEvent;
    onEventClick(original);
  }

  function handleDateClick(info: DateClickArg) {
    onDateClick(info.dateStr);
  }

  function handleEventDrop(info: EventDropArg) {
    const id = info.event.id;
    const newDate = format(info.event.start!, "yyyy-MM-dd");

    let startTime: string | undefined;
    let endTime: string | undefined;

    if (!info.event.allDay && info.event.start) {
      startTime = format(info.event.start, "HH:mm");
      if (info.event.end) {
        endTime = format(info.event.end, "HH:mm");
      }
    }

    onEventDrop(id, newDate, startTime, endTime);
  }

  return (
    <div className="flex-1 px-4 pb-4 sm:px-6 sm:pb-6">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={calendarEvents}
        editable={true}
        droppable={true}
        selectable={true}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        height="calc(100vh - 3.5rem - 2rem)"
        dayMaxEvents={3}
        nowIndicator={true}
        eventDisplay="block"
      />
    </div>
  );
}

/** Returns true if a hex color is visually light (should use dark text). */
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160;
}
