import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, CheckCircle, Clock, Sparkles, Calendar, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { CustomCalendar } from './CustomCalendar';
import { getSlotId } from '../utils/bookingUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

const TIME_SLOTS = [
  { time: '10:00 AM', period: 'Morning' },
  { time: '11:30 AM', period: 'Morning' },
  { time: '2:00 PM', period: 'Afternoon' },
  { time: '3:30 PM', period: 'Afternoon' },
  { time: '5:00 PM', period: 'Evening' },
  { time: '6:30 PM', period: 'Evening' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = '',
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [sessionType, setSessionType] = useState<'intro' | 'full'>('intro');
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [customSelectedDate, setCustomSelectedDate] = useState<Date | null>(null);
  const [showCustomCalendar, setShowCustomCalendar] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('2:00 PM');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(defaultTopic);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [confirmedDetails, setConfirmedDetails] = useState<{
    name: string;
    sessionType: string;
    date: string;
    time: string;
  } | null>(null);

  // Real-time backend booked slot IDs (single-occupancy)
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
            console.warn('[BOOKING API] Non-JSON payload from booked-slots:', e);
          }
        }
      }
    } catch (err) {
      console.warn('[BOOKING API] Could not refresh booked slots:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBookedSlots();
    }
  }, [isOpen, fetchBookedSlots]);

  // Generate upcoming available dates (next 7 consecutive days starting tomorrow)
  const availableDates = useMemo(() => {
    const list: Array<{
      fullDateStr: string;
      dayOfWeek: string;
      dateNumber: string;
      monthName: string;
      isoDate: string;
    }> = [];
    const now = new Date();
    for (let i = 1; i <= 7; i++) {
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

  if (!isOpen) return null;

  const handleProceedToDetails = () => {
    if (!selectedTime) {
      setValidationError('Please select a preferred time slot.');
      return;
    }
    if (bookedSlots.includes(currentSlotId)) {
      setValidationError('This time has just been booked. Please choose another available slot.');
      return;
    }
    setValidationError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setValidationError('Please provide your name and email address.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setValidationError('');

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
          notes: (topic ? `[${topic}] ` : '') + message.trim(),
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
        // Slot is already booked
        fetchBookedSlots().catch(() => {});
        setStep(1); // Return to slot selection
        setValidationError(
          result.error || 'This time has just been booked. Please choose another available slot.'
        );
        setIsSubmitting(false);
        return;
      }

      setConfirmedDetails({
        name: name.trim(),
        sessionType: sessionLabel,
        date: activeDateLabel,
        time: selectedTime,
      });
      setSubmitted(true);
      fetchBookedSlots().catch(() => {});
    } catch (err: any) {
      console.error('[BOOKING CLIENT ERROR]', err?.message || err);
      setValidationError('A network error occurred while reserving your session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setStep(1);
    setCustomSelectedDate(null);
    setShowCustomCalendar(false);
    setSelectedDateIndex(0);
    setSubmitted(false);
    setConfirmedDetails(null);
    setValidationError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#29232B]/55 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-xl bg-[#FFF8F1] rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#EFE4DE] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#6B5E70] hover:text-[#29232B] hover:bg-[#F7F3FC] transition-colors cursor-pointer"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted && confirmedDetails ? (
          /* Clean confirmation screen */
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F7F3FC] text-[#5B3A6D] flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 id="booking-modal-title" className="text-2xl sm:text-3xl font-serif text-[#29232B] font-medium">
              Your session is booked.
            </h3>
            <p className="text-base sm:text-lg text-[#29232B] font-medium max-w-md mx-auto leading-relaxed">
              Thank you, {confirmedDetails.name}. Your {confirmedDetails.sessionType} is scheduled for{' '}
              {confirmedDetails.date} at {confirmedDetails.time}.
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
            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-[#E86A67] font-semibold block mb-1">
                Booking with Tanishqa
              </span>
              <div className="flex items-center justify-between">
                <h2 id="booking-modal-title" className="text-2xl sm:text-3xl font-serif text-[#29232B] font-medium">
                  Book a session
                </h2>
                <span className="text-xs font-mono text-[#5B3A6D] bg-[#F7F3FC] px-2.5 py-1 rounded-full border border-[#EADFF7]">
                  Step {step} of 2
                </span>
              </div>
            </div>

            {/* Error Message */}
            {validationError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#FFF0F0] border border-[#F8D7DA] text-[#E86A67] text-xs sm:text-sm">
                {validationError}
              </div>
            )}

            {step === 1 ? (
              /* Step 1: Session Type, Date & Time Selection */
              <div className="space-y-6">
                {/* Session Type Switcher */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-2.5">
                    1. Select Session Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSessionType('intro')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        sessionType === 'intro'
                          ? 'border-[#5B3A6D] bg-[#F7F3FC] shadow-sm ring-1 ring-[#5B3A6D]'
                          : 'border-[#EFE4DE] bg-white hover:border-[#C9B6E4]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-[#29232B]">Free Intro Call</span>
                        <span className="text-xs font-semibold text-[#E86A67] bg-[#E86A67]/10 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5E70] leading-relaxed">
                        30 min · A quiet space to share where you are and see how we work together.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSessionType('full')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        sessionType === 'full'
                          ? 'border-[#5B3A6D] bg-[#F7F3FC] shadow-sm ring-1 ring-[#5B3A6D]'
                          : 'border-[#EFE4DE] bg-white hover:border-[#C9B6E4]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-[#29232B]">Coaching Session</span>
                        <span className="text-xs font-medium text-[#6B5E70]">60 min</span>
                      </div>
                      <p className="text-xs text-[#6B5E70] leading-relaxed">
                        Online via Video · Session fees will be shared before your booking is confirmed.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6B5E70]">
                      2. Choose a Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomCalendar(!showCustomCalendar)}
                      className="text-xs font-medium text-[#5B3A6D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#E86A67]" />
                      <span>{showCustomCalendar ? 'Hide calendar' : 'Other date'}</span>
                    </button>
                  </div>

                  {/* Horizontal Scroll of Upcoming Dates */}
                  {!showCustomCalendar ? (
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                                ? 'bg-[#5B3A6D] text-[#FFF9F4] border-[#5B3A6D] shadow-sm font-medium scale-[1.02]'
                                : 'bg-white text-[#29232B] border-[#EFE4DE] hover:border-[#C9B6E4]'
                            }`}
                          >
                            <span className={`text-[11px] uppercase tracking-wider ${isSelected ? 'text-[#FFF9F4]/80' : 'text-[#6B5E70]'}`}>
                              {item.dayOfWeek}
                            </span>
                            <span className="text-base sm:text-lg font-serif font-semibold my-0.5">
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
                    <div className="bg-white p-4 rounded-2xl border border-[#EFE4DE] shadow-xs">
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

                {/* Time Slot Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6B5E70]">
                      3. Select a Time Slot
                    </label>
                    <span className="text-[11px] text-[#6B5E70]">
                      Your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const slotId = getSlotId(activeDateValue, slot.time);
                      const isBooked = bookedSlots.includes(slotId);
                      const isSelected = selectedTime === slot.time && !isBooked;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`px-3 py-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 ${
                            isBooked
                              ? 'bg-[#F9F7FA] text-[#A89CAE] border-[#EFE4DE] cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-[#5B3A6D] text-[#FFF9F4] border-[#5B3A6D] shadow-xs font-medium cursor-pointer'
                              : 'bg-white text-[#29232B] border-[#EFE4DE] hover:border-[#C9B6E4] text-xs cursor-pointer'
                          }`}
                        >
                          <span className="text-xs">{slot.time}</span>
                          {isBooked ? (
                            <span className="text-[10px] font-semibold text-[#8C7A92] bg-[#EFE4DE]/70 px-1.5 py-0.5 rounded-md">
                              Booked
                            </span>
                          ) : (
                            <span className={`text-[10px] ${isSelected ? 'text-[#FFF9F4]/70' : 'text-[#6B5E70]'}`}>
                              ({slot.period})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Slot Summary Badge */}
                <div className="p-3.5 rounded-2xl bg-[#F7F3FC] border border-[#EADFF7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-[#29232B]">
                    <span className="font-semibold text-[#5B3A6D]">Chosen Slot:</span>
                    <span>{activeDateLabel} at {selectedTime}</span>
                  </div>
                  <span className="text-[11px] text-[#6B5E70]">
                    {sessionType === 'intro' ? 'Free 30-min Intro Call' : '1-Hour Coaching Session'}
                  </span>
                </div>

                {/* Continue Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-full text-xs font-medium text-[#6B5E70] hover:text-[#29232B] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToDetails}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
                  >
                    <span>Continue to your details</span>
                    <ArrowRight className="w-4 h-4 text-[#E86A67]" />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Contact Details */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Summary of Chosen Slot with Back Option */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#EFE4DE] flex items-center justify-between text-xs text-[#29232B]">
                  <div>
                    <span className="text-[#6B5E70] block text-[11px]">Selected Session & Time:</span>
                    <span className="font-medium text-[#5B3A6D]">
                      {sessionType === 'intro' ? 'Free Intro Call (30 min)' : 'Coaching Session (60 min)'}
                    </span>
                    <span className="text-[#29232B] block mt-0.5">
                      {activeDateLabel} at {selectedTime}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-[#E86A67] hover:underline cursor-pointer px-2 py-1"
                  >
                    Change slot
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label
                    htmlFor="modal-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1"
                  >
                    Your Name <span className="text-[#E86A67]">*</span>
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="modal-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1"
                  >
                    Email Address <span className="text-[#E86A67]">*</span>
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
                  />
                </div>

                {/* What would you like help with */}
                <div>
                  <label
                    htmlFor="modal-msg"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1"
                  >
                    What would you like help with?{' '}
                    <span className="text-xs font-normal normal-case text-[#6B5E70]">(optional)</span>
                  </label>
                  <textarea
                    id="modal-msg"
                    rows={3}
                    disabled={isSubmitting}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell me briefly about what you're feeling stuck on, navigating, or hoping to explore..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D] resize-none"
                  />
                </div>

                {/* Clear Session Notes */}
                <div className="text-xs text-[#6B5E70] bg-[#F7F3FC] p-3 rounded-xl border border-[#EADFF7] space-y-1">
                  <p>• Sessions are held online via video call.</p>
                  <p>• Session fees will be shared before your booking is confirmed.</p>
                  <p>• Only one person can reserve each appointment slot.</p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-medium text-[#6B5E70] hover:text-[#29232B] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-[#E86A67]" />}
                    <span>{isSubmitting ? 'Reserving slot...' : 'Book a session'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
