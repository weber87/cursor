"use client";

import { format, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const current = new Date(date + "T12:00:00");
  const today = format(new Date(), "yyyy-MM-dd");
  const isToday = date === today;

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(format(subDays(current, 1), "yyyy-MM-dd"))}
        className="rounded-xl p-2 transition-colors hover:bg-primary-light"
        aria-label="Previous day"
      >
        <ChevronLeft size={20} />
      </button>
      <div className="text-center">
        <p className="text-lg font-bold">
          {isToday ? "Today" : format(current, "EEEE")}
        </p>
        <p className="text-xs text-muted">{format(current, "MMMM d, yyyy")}</p>
      </div>
      <button
        onClick={() => onChange(format(addDays(current, 1), "yyyy-MM-dd"))}
        disabled={isToday}
        className="rounded-xl p-2 transition-colors hover:bg-primary-light disabled:opacity-30"
        aria-label="Next day"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
