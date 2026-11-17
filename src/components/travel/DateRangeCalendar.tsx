import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';

export interface DateRangeValue {
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
}

interface DateRangeCalendarProps {
  value: DateRangeValue;
  onChange: (next: DateRangeValue) => void;
  unavailableDates?: string[];
  label?: string;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const a = parseIsoDate(checkIn);
  const b = parseIsoDate(checkOut);
  if (!a || !b) return 0;
  const diff = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export function formatDisplayDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return 'Select date';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  value,
  onChange,
  unavailableDates,
  label = 'Check-in & Check-out Dates',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverIso, setHoverIso] = useState<string | null>(null);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayIso = toIsoDate(today);

  const [baseMonth, setBaseMonth] = useState(() => {
    const initial = parseIsoDate(value.checkIn) || today;
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const unavailableSet = useMemo(
    () => new Set(unavailableDates || []),
    [unavailableDates]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 10);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const nights = calculateNights(value.checkIn, value.checkOut);

  const handleSelectDay = (iso: string) => {
    if (iso < todayIso || unavailableSet.has(iso)) return;
    if (!value.checkIn || (value.checkIn && value.checkOut)) {
      onChange({ checkIn: iso, checkOut: '' });
      return;
    }
    if (iso <= value.checkIn) {
      onChange({ checkIn: iso, checkOut: '' });
      return;
    }
    // Ensure no unavailable date sits inside the chosen range
    if (unavailableSet.size > 0) {
      const start = parseIsoDate(value.checkIn)!;
      const end = parseIsoDate(iso)!;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (unavailableSet.has(toIsoDate(d))) {
          onChange({ checkIn: iso, checkOut: '' });
          return;
        }
      }
    }
    onChange({ checkIn: value.checkIn, checkOut: iso });
  };

  const renderMonth = (monthOffset: number) => {
    const monthStart = new Date(
      baseMonth.getFullYear(),
      baseMonth.getMonth() + monthOffset,
      1
    );
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startWeekday = (monthStart.getDay() + 6) % 7; // Monday = 0
    const cells: (string | null)[] = [];

    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(toIsoDate(new Date(year, month, day)));
    }

    const monthTitle = monthStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const previewEnd =
      value.checkIn && !value.checkOut && hoverIso && hoverIso > value.checkIn
        ? hoverIso
        : value.checkOut;

    return (
      <div className="space-y-3" key={monthTitle}>
        <div className="text-center font-serif font-bold text-base text-[#0B5E8E]">
          {monthTitle}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-[11px] font-bold uppercase text-gray-400 py-1"
            >
              {wd}
            </div>
          ))}
          {cells.map((iso, idx) => {
            if (!iso) return <div key={`empty-${idx}`} />;
            const isPast = iso < todayIso;
            const isUnavailable = unavailableSet.has(iso);
            const disabled = isPast || isUnavailable;
            const isStart = iso === value.checkIn;
            const isEnd = iso === value.checkOut;
            const inRange =
              Boolean(value.checkIn && previewEnd) &&
              iso > value.checkIn &&
              iso < (previewEnd as string);

            const dayNum = Number(iso.slice(8, 10));

            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => handleSelectDay(iso)}
                onMouseEnter={() => setHoverIso(iso)}
                aria-label={formatDisplayDate(iso)}
                aria-pressed={isStart || isEnd}
                className={`h-10 sm:h-9 w-full rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  disabled
                    ? 'text-gray-300 line-through'
                    : isStart || isEnd
                    ? 'bg-[#0B5E8E] text-white font-bold shadow-xs'
                    : inRange
                    ? 'bg-[#0B5E8E]/15 text-[#0B5E8E]'
                    : 'text-gray-800 hover:bg-[#FAF9F6] hover:text-[#0B5E8E]'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-[#0B5E8E] bg-white text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-4 h-4 text-[#0B5E8E] shrink-0" />
          <span className="truncate font-medium text-gray-800">
            {value.checkIn
              ? `${formatDisplayDate(value.checkIn)} → ${
                  value.checkOut ? formatDisplayDate(value.checkOut) : 'Check-out'
                }`
              : 'Select check-in & check-out'}
          </span>
        </span>
        {nights > 0 && (
          <span className="shrink-0 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] font-bold px-2.5 py-0.5 text-[11px]">
            {nights} {nights === 1 ? 'night' : 'nights'}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="presentation"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select check-in and check-out dates"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-gray-200 shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto space-y-5"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B5E8E]">
                  Select Your Stay Dates
                </h3>
                <p className="text-xs text-gray-500">
                  {nights > 0
                    ? `${formatDisplayDate(value.checkIn)} – ${formatDisplayDate(value.checkOut)} (${nights} ${nights === 1 ? 'night' : 'nights'})`
                    : value.checkIn
                    ? `Check-in: ${formatDisplayDate(value.checkIn)}. Now select check-out.`
                    : 'Choose your arrival date, then your departure date.'}
                </p>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close calendar"
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setBaseMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
                disabled={
                  baseMonth.getFullYear() === today.getFullYear() &&
                  baseMonth.getMonth() <= today.getMonth()
                }
                aria-label="Previous month"
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#0B5E8E] flex items-center justify-center text-gray-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ checkIn: '', checkOut: '' })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B5E8E] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset dates</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setBaseMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
                aria-label="Next month"
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#0B5E8E] flex items-center justify-center text-gray-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderMonth(0)}
              <div className="hidden md:block">{renderMonth(1)}</div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Apply Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
