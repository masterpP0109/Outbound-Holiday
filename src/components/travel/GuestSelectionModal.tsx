import React, { useEffect, useRef } from 'react';
import { Minus, Plus, Users, X, AlertCircle } from 'lucide-react';
import {
  CHILD_AGE_CATEGORIES,
  formatChildBreakdown,
  formatGuestSummary,
  resizeChildrenList,
  type ChildAgeCategoryId,
  type GuestSelection,
} from '../../utils/enquiry';

interface GuestSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: GuestSelection;
  onChange: (next: GuestSelection) => void;
  minAdults?: number;
  maxGuests?: number;
  capacityWarning?: string | null;
  ageNotice?: string | null;
}

export const GuestSelectionModal: React.FC<GuestSelectionModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  minAdults = 1,
  maxGuests = 20,
  capacityWarning,
  ageNotice,
}) => {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const t = window.setTimeout(() => closeRef.current?.focus(), 10);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalGuests = value.adults + value.children.length;
  const childLines = formatChildBreakdown(value.children);

  const setAdults = (delta: number) => {
    const next = Math.max(minAdults, Math.min(maxGuests, value.adults + delta));
    onChange({ ...value, adults: next });
  };

  const setChildrenCount = (delta: number) => {
    const nextCount = Math.max(0, Math.min(10, value.children.length + delta));
    onChange({
      ...value,
      children: resizeChildrenList(value.children, nextCount),
    });
  };

  const setChildAge = (idx: number, ageCategory: ChildAgeCategoryId) => {
    const next = value.children.map((c, i) =>
      i === idx ? { ...c, ageCategory } : c
    );
    onChange({ ...value, children: next });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-gray-200 shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto space-y-5"
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0B5E8E]" aria-hidden="true" />
            <h2
              id="guest-modal-title"
              className="font-serif text-xl font-bold text-[#0B5E8E]"
            >
              Select Guests
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close guest selection"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Adults Counter */}
        <div className="flex items-center justify-between gap-4 py-1">
          <div>
            <p className="font-bold text-sm text-gray-900">Adults</p>
            <p className="text-xs text-gray-500">Ages 12+ (or standard adult rate)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAdults(-1)}
              disabled={value.adults <= minAdults}
              aria-label="Decrease adults"
              className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-[#0B5E8E] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-bold text-base text-gray-900">
              {value.adults}
            </span>
            <button
              type="button"
              onClick={() => setAdults(1)}
              disabled={value.adults >= maxGuests}
              aria-label="Increase adults"
              className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-[#0B5E8E] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children Counter */}
        <div className="flex items-center justify-between gap-4 py-1 border-t border-gray-100 pt-4">
          <div>
            <p className="font-bold text-sm text-gray-900">Children</p>
            <p className="text-xs text-gray-500">Select age category for each child</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setChildrenCount(-1)}
              disabled={value.children.length <= 0}
              aria-label="Decrease children"
              className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-[#0B5E8E] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-bold text-base text-gray-900">
              {value.children.length}
            </span>
            <button
              type="button"
              onClick={() => setChildrenCount(1)}
              disabled={value.children.length >= 10}
              aria-label="Increase children"
              className="w-11 h-11 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-[#0B5E8E] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Individual Child Age Category Selectors */}
        {value.children.length > 0 && (
          <div className="space-y-3 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B5E8E]">
              Child Age Categories
            </p>
            <div className="space-y-2.5">
              {value.children.map((child, idx) => (
                <div
                  key={child.id}
                  className="flex flex-col xs:flex-row xs:items-center justify-between gap-2"
                >
                  <label
                    htmlFor={`child-age-${idx}`}
                    className="text-xs font-semibold text-gray-700"
                  >
                    Child {idx + 1}
                  </label>
                  <select
                    id={`child-age-${idx}`}
                    value={child.ageCategory}
                    onChange={(e) =>
                      setChildAge(idx, e.target.value as ChildAgeCategoryId)
                    }
                    className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  >
                    {CHILD_AGE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {(capacityWarning || ageNotice) && (
          <div className="space-y-2">
            {capacityWarning && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>{capacityWarning}</span>
              </div>
            )}
            {ageNotice && (
              <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#0B5E8E] mt-0.5" />
                <span>{ageNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/15 p-3.5 text-xs space-y-1">
          <p className="font-bold text-[#0B5E8E]">
            {formatGuestSummary(value)} ({totalGuests}{' '}
            {totalGuests === 1 ? 'Guest' : 'Guests'})
          </p>
          {childLines.length > 0 && (
            <ul className="text-gray-600 space-y-0.5 pt-1">
              {childLines.map((line) => (
                <li key={line}>• {line}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[46px] rounded-xl bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-sm py-3 transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
