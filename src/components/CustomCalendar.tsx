import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose?: () => void;
  bookedSlots?: string[];
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selectedDate,
  onSelectDate,
  onClose,
}) => {
  // Current viewed month & year in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const viewYear = currentMonth.getFullYear();
  const viewMonth = currentMonth.getMonth();

  // Month name e.g. "October 2026"
  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in month
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Check if we can go to previous month (cannot go earlier than current month)
  const isCurrentOrPastMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const handlePrevMonth = () => {
    if (isCurrentOrPastMonth) return;
    setCurrentMonth(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    // Limit to next 6 months
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    if (currentMonth >= maxDate) return;
    setCurrentMonth(new Date(viewYear, viewMonth + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  return (
    <div className="w-full bg-[#FFFDFB] rounded-2xl p-4 sm:p-5 border border-[#EADFF7] shadow-xs text-[#29232B] animate-in fade-in duration-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EFE4DE]">
        <div className="flex items-center gap-2">
          <h4 className="font-serif text-lg sm:text-xl text-[#29232B] font-medium tracking-tight">
            {monthName}
          </h4>
          <span className="text-[11px] text-[#6B5E70] font-sans">
            (Select any date)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isCurrentOrPastMonth}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isCurrentOrPastMonth
                ? 'text-[#C9B6E4]/40 cursor-not-allowed'
                : 'text-[#5B3A6D] hover:bg-[#F7F3FC] hover:text-[#29232B]'
            }`}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-full text-[#5B3A6D] hover:bg-[#F7F3FC] hover:text-[#29232B] transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-1 p-1.5 rounded-full text-[#6B5E70] hover:text-[#29232B] hover:bg-[#F7F3FC] transition-colors cursor-pointer"
              aria-label="Close calendar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-semibold tracking-wider text-[#6B5E70] uppercase py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Empty cells before month begins */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9 sm:h-10" />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dayDate = new Date(viewYear, viewMonth, dayNumber);
          dayDate.setHours(0, 0, 0, 0);

          const isPast = dayDate < today;
          const isUnavailable = isPast;
          const isToday = isSameDay(dayDate, today);
          const isSelected = isSameDay(dayDate, selectedDate);

          return (
            <div key={`day-${dayNumber}`} className="flex justify-center items-center">
              <button
                type="button"
                disabled={isUnavailable}
                onClick={() => {
                  if (!isUnavailable) {
                    onSelectDate(dayDate);
                  }
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center text-xs sm:text-sm transition-all relative ${
                  isSelected
                    ? 'bg-[#5B3A6D] text-[#FFF9F4] font-semibold shadow-xs cursor-pointer'
                    : isUnavailable
                    ? 'text-[#C9B6E4]/40 cursor-not-allowed bg-transparent'
                    : 'text-[#29232B] hover:bg-[#F7F3FC] hover:text-[#5B3A6D] cursor-pointer'
                }`}
                aria-label={dayDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              >
                <span>{dayNumber}</span>
                {/* Subtle today indicator if not selected */}
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#E86A67] absolute bottom-1" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Calendar Footer Helper */}
      <div className="mt-4 pt-3 border-t border-[#EFE4DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#6B5E70]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B3A6D]" />
            <span>Selected</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E86A67]" />
            <span>Today</span>
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#5B3A6D] hover:underline cursor-pointer"
          >
            Confirm date
          </button>
        )}
      </div>
    </div>
  );
};
