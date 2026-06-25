"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function CalendarPlanner() {
  const { calendarEvents, addCalendarEvent } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase text-violet-400">Content Calendar</p>
        <button
          type="button"
          onClick={() => addCalendarEvent("New Event", new Date().toISOString().slice(0, 10))}
          className="text-[9px] text-violet-400"
        >
          + Event
        </button>
      </div>
      <div className="mb-3 flex gap-2 text-[8px] text-slate-600">
        <span>Monthly</span>
        <span>·</span>
        <span>Weekly</span>
        <span>·</span>
        <span>Campaign Timeline</span>
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => {
          const day = i + 1;
          const events = calendarEvents.filter((e) => e.date.endsWith(`-${String(day).padStart(2, "0")}`));
          return (
            <div key={day} className="min-h-[60px] rounded border border-white/[0.04] bg-white/[0.02] p-1">
              <p className="text-[8px] text-slate-600">{day}</p>
              {events.map((e) => (
                <p key={e.id} className="truncate text-[7px] text-violet-300">{e.title}</p>
              ))}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[8px] text-slate-600">Approval workflow · Reminders — architecture stub</p>
    </div>
  );
}
