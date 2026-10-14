import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Calendar, Sparkles, Instagram, Linkedin, Loader2 } from 'lucide-react';
import { CustomCalendar } from './CustomCalendar';
import { getSlotId } from '../utils/bookingUtils';

interface BookingSectionProps {
  onBookClick: () => void;
}

const SECTION_TIME_SLOTS = ['10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM', '5:00 PM', '6:30 PM'];

export const BookingSection: React.FC<BookingSectionProps> = ({ onBookClick }) => {
  const [sessionType, setSessionType] = useState<'intro' | 'full'>('intro');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [customSelectedDate, setCustomSelectedDate] = useState<Date | null>(null);
  const [showCustomCalendar, setShowCustomCalendar] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('2:00 PM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    name: string;
    sessionType: string;
    date: string;
    time: string;
  } | null>(null);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const fetchBookedSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/booked-slots', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const rawText = await res.text();
        if (rawText) {
          try {
            const data = JSON.parse(rawText);
            if (Array.isArray(data.bookedSlots)) {
              setBookedSlots(data.bookedSlots);
            }
          } catch (e) {
            console.warn('[BOOKING API] Non-JSON response from booked-slots:', e);
          }
        }
      }
    } catch (err) {
      console.warn('[BOOKING API] Could not refresh booked slots:', err);
    }
  }, []);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Generate upcoming available dates (next 5 consecutive days starting tomorrow)
  const availableDates = useMemo(() => {
    const list: Array<{
      fullDateStr: string;
      dayOfWeek: string;
      dateNumber: string;
      monthName: string;
      isoDate: string;
    }> = [];
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNumber = d.getDate().toString();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const fullDateStr = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      list.push({ fullDateStr, dayOfWeek, dateNumber, monthName, isoDate });
    }
    return list;
  }, []);

  const activeDateObj = useMemo(() => {
    if (customSelectedDate) return customSelectedDate;
    if (availableDates[selectedDateIndex]) {
      const [y, m, d] = availableDates[selectedDateIndex].isoDate.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  }, [customSelectedDate, availableDates, selectedDateIndex]);

  const activeDateValue: Date | string = useMemo(() => {
    if (customSelectedDate) return customSelectedDate;
    if (availableDates[selectedDateIndex]) {
      return availableDates[selectedDateIndex].isoDate;
    }
    return new Date();
  }, [customSelectedDate, availableDates, selectedDateIndex]);

  const activeDateLabel = useMemo(() => {
    if (customSelectedDate) {
      return customSelectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
    return availableDates[selectedDateIndex]?.fullDateStr || 'Upcoming date';
  }, [customSelectedDate, availableDates, selectedDateIndex]);

  const currentSlotId = useMemo(() => {
    return getSlotId(activeDateValue, selectedTime);
  }, [activeDateValue, selectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const sessionLabel = sessionType === 'intro' ? 'Free Intro Call' : 'Coaching Session';

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          sessionType: sessionLabel,
          date: activeDateLabel,
          time: selectedTime,
          slotId: currentSlotId,
          notes: notes.trim(),
        }),
      });

      let result: any = null;
      try {
        const rawText = await response.text();
        result = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        console.warn('[BOOKING PARSE NOTICE]', parseErr);
        result = { success: false, error: 'Could not parse reservation response.' };
      }

      if (response.status === 409 || !result.success) {
        // Slot has already been booked
        fetchBookedSlots().catch(() => {});
        setErrorMessage(
          result.error || 'This time has just been booked. Please choose another available slot.'
        );
        setIsSubmitting(false);
        return;
      }

      setConfirmedBooking({
        name: name.trim(),
        sessionType: sessionLabel,
        date: activeDateLabel,
        time: selectedTime,
      });
      setSubmitted(true);
      fetchBookedSlots().catch(() => {});
    } catch (err) {
      console.error('[BOOKING SECTION ERROR]', err);
      setErrorMessage('A network error occurred while reserving your session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setNotes('');
    setSubmitted(false);
    setConfirmedBooking(null);
    setErrorMessage('');
  };

  return (
    <section 
      id="contact" 
      className="py-20 sm:py-28 bg-gradient-to-br from-[#5B3A6D] via-[#523363] to-[#432652] text-[#FFF8F1] border-t border-[#472C56] relative overflow-hidden"
    >
      {/* Subtle atmospheric glow elements */}
      <div 
        className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-[#C9B6E4]/15 blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-32 -left-24 w-[450px] h-[450px] rounded-full bg-[#E86A67]/12 blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Thin luxury accent lines */}
      <svg 
        className="absolute top-1/4 left-0 w-72 h-72 text-white/5 pointer-events-none hidden lg:block" 
        fill="none" 
        viewBox="0 0 300 300" 
        stroke="currentColor" 
        aria-hidden="true" 
      >
        <circle cx="150" cy="150" r="140" strokeWidth="0.75" />
      </svg>
      <svg 
        className="absolute bottom-10 right-0 w-96 h-96 text-white/5 pointer-events-none hidden lg:block" 
        fill="none" 
        viewBox="0 0 400 400" 
        stroke="currentColor" 
        aria-hidden="true" 
      >
        <path d="M 0 100 C 140 80 240 220 384 260" strokeWidth="0.75" />
      </svg>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center relative z-10">
        
        {/* Visual Anchor */}
        <div className="max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F4D77D]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-[0.24em] text-[#F4D77D] font-semibold">
              Start Here
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#FFF8F1] font-normal leading-[1.1] [text-wrap:balance]">
            Ready to have the conversation?
          </h2>
          <p className="text-lg sm:text-xl text-[#FFF8F1]/80 font-normal leading-relaxed">
            You don’t need to have all the answers before you start.
          </p>
        </div>

        {/* Form Card Container in Warm Ivory */}
        <div className="bg-[#FFF8F1] text-[#29232B] rounded-[2.25rem] p-6 sm:p-12 border border-[#C9B6E4]/30 shadow-2xl max-w-2xl mx-auto text-left">
          {submitted && confirmedBooking ? (
            /* Clean confirmation screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F7F3FC] text-[#5B3A6D] flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#29232B] font-medium">
                Your session is booked.
              </h3>
              <p className="text-base sm:text-lg text-[#29232B] font-medium max-w-md mx-auto leading-relaxed">
                Thank you, {confirmedBooking.name}. Your {confirmedBooking.sessionType} is scheduled for{' '}
                {confirmedBooking.date} at {confirmedBooking.time}.
              </p>
              <p className="text-sm text-[#6B5E70] max-w-md mx-auto">
                You’ll receive the next steps by email.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Header inside Card */}
              <div className="mb-6 pb-6 border-b border-[#EFE4DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#6B5E70] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#E86A67]" />
                  <span>Free 30-min intro call or 1-hour coaching session</span>
                </div>
                <span className="text-xs font-mono text-[#5B3A6D] bg-[#F7F3FC] px-2.5 py-1 rounded-full border border-[#EADFF7] self-start sm:self-auto">
                  Direct Booking
                </span>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-[#FFF0F0] border border-[#F8D7DA] text-[#E86A67] text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Session Type Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-2.5">
                    1. Select Session Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSessionType('intro')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        sessionType === 'intro'
                          ? 'border-[#5B3A6D] bg-[#F7F3FC] ring-1 ring-[#5B3A6D] shadow-xs'
                          : 'border-[#EFE4DE] bg-white hover:border-[#C9B6E4]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#29232B]">Free Intro Call</span>
                        <span className="text-xs font-semibold text-[#E86A67] bg-[#E86A67]/10 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5E70]">30 min · A friendly, low-pressure first conversation.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSessionType('full')}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        sessionType === 'full'
                          ? 'border-[#5B3A6D] bg-[#F7F3FC] ring-1 ring-[#5B3A6D] shadow-xs'
                          : 'border-[#EFE4DE] bg-white hover:border-[#C9B6E4]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#29232B]">Coaching Session</span>
                        <span className="text-xs font-medium text-[#6B5E70]">60 min</span>
                      </div>
                      <p className="text-xs text-[#6B5E70]">Online via Video · Fees shared before confirmation.</p>
                    </button>
                  </div>
                </div>

                {/* 2. Choose Date */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6B5E70]">
                      2. Choose a Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomCalendar(!showCustomCalendar)}
                      className="text-xs font-medium text-[#5B3A6D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#E86A67]" />
                      <span>{showCustomCalendar ? 'Show list' : 'Other date'}</span>
                    </button>
                  </div>

                  {!showCustomCalendar ? (
                    <div className="grid grid-cols-5 gap-2">
                      {availableDates.map((item, idx) => {
                        const isSelected = !customSelectedDate && selectedDateIndex === idx;
                        return (
                          <button
                            key={item.isoDate}
                            type="button"
                            onClick={() => {
                              setSelectedDateIndex(idx);
                              setCustomSelectedDate(null);
                            }}
                            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-[#5B3A6D] text-[#FFF9F4] border-[#5B3A6D] shadow-xs font-medium scale-[1.02]'
                                : 'bg-white text-[#29232B] border-[#EFE4DE] hover:border-[#C9B6E4]'
                            }`}
                          >
                            <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-[#FFF9F4]/80' : 'text-[#6B5E70]'}`}>
                              {item.dayOfWeek}
                            </span>
                            <span className="text-base font-serif font-semibold my-0.5">
                              {item.dateNumber}
                            </span>
                            <span className={`text-[10px] ${isSelected ? 'text-[#FFF9F4]/70' : 'text-[#6B5E70]'}`}>
                              {item.monthName}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white p-3.5 rounded-2xl border border-[#EFE4DE] shadow-xs">
                      <CustomCalendar
                        selectedDate={activeDateObj}
                        bookedSlots={bookedSlots}
                        onSelectDate={(date) => {
                          setCustomSelectedDate(date);
                          setShowCustomCalendar(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 3. Choose Time Slot */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6B5E70]">
                      3. Select Time Slot
                    </label>
                    <span className="text-[11px] text-[#6B5E70]">
                      {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SECTION_TIME_SLOTS.map((slot) => {
                      const slotId = getSlotId(activeDateValue, slot);
                      const isBooked = bookedSlots.includes(slotId);
                      const isSelected = selectedTime === slot && !isBooked;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => {
                            if (!isBooked) {
                              setSelectedTime(slot);
                            }
                          }}
                          className={`py-2 px-1 text-center rounded-xl border text-xs transition-all flex items-center justify-center gap-1 ${
                            isBooked
                              ? 'bg-[#F9F7FA] text-[#A89CAE] border-[#EFE4DE] cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#5B3A6D] text-[#FFF9F4] border-[#5B3A6D] font-medium shadow-xs cursor-pointer'
                              : 'bg-white text-[#29232B] border-[#EFE4DE] hover:border-[#C9B6E4] cursor-pointer'
                          }`}
                        >
                          <span>{slot}</span>
                          {isBooked && (
                            <span className="text-[9px] font-semibold text-[#8C7A92] bg-[#EFE4DE]/70 px-1 rounded">
                              Booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Slot Confirmation Bar */}
                <div className="p-3 rounded-xl bg-[#F7F3FC] border border-[#EADFF7] text-xs text-[#29232B] flex items-center justify-between">
                  <div>
                    <span className="text-[#6B5E70]">Requested: </span>
                    <span className="font-semibold text-[#5B3A6D]">{activeDateLabel} at {selectedTime}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onBookClick}
                    className="text-[#E86A67] hover:underline font-medium cursor-pointer"
                  >
                    Open modal view
                  </button>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1.5">
                      Your Name <span className="text-[#E86A67]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Sharma"
                      className="w-full px-4 py-3 rounded-2xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1.5">
                      Email Address <span className="text-[#E86A67]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-2xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-notes" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1.5">
                    What would you like help with? <span className="text-xs font-normal normal-case text-[#6B5E70]">(optional)</span>
                  </label>
                  <textarea
                    id="contact-notes"
                    rows={3}
                    disabled={isSubmitting}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="A sentence or two about what's feeling uncertain, or what you'd like to talk through..."
                    className="w-full px-4 py-3 rounded-2xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D] resize-none"
                  />
                </div>

                {/* Session Fee Clarification */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9F4] border border-[#EFE4DE] text-xs text-[#6B5E70] leading-relaxed space-y-1">
                  <p>• Online via Video Call.</p>
                  <p>• Session fees will be shared before your booking is confirmed.</p>
                  <p>• Each slot is single occupancy.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#5B3A6D] text-[#FFF8F1] text-sm font-medium hover:bg-[#472C56] transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-[#E86A67]" />}
                  <span>{isSubmitting ? 'Reserving slot...' : 'Book a session'}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Quiet Footnote */}
        <p className="mt-8 text-xs text-[#FFF8F1]/60">
          Conversations are strictly confidential · Sessions held via Google Meet or Zoom
        </p>
      </div>
    </section>
  );
};
