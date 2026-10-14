import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  CheckCircle,
  Search,
  Filter,
  X,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Shield,
  FileText,
  Copy,
  Check,
  CalendarCheck,
  History,
} from 'lucide-react';

export interface BookingItem {
  id: string;
  slotId: string;
  clientName: string;
  clientEmail: string;
  sessionType: string;
  date: string;
  time: string;
  notes?: string;
  status: 'confirmed' | string;
  createdAt: string;
  emailStatus?: string;
  emailError?: string;
}

interface AdminDashboardProps {
  adminEmail: string;
  authToken: string;
  onLogout: () => void;
  onBackToWebsite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  authToken,
  onLogout,
  onBackToWebsite,
}) => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Fetch real bookings from server-side protected endpoint
  const fetchBookings = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Access denied. You do not have permission to view organization bookings.');
        }
        throw new Error('Failed to retrieve bookings from the database.');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error('[ADMIN FETCH ERROR]', err);
      setFetchError(err?.message || 'Could not load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [authToken]);

  // Helper to determine if a booking date is in the past
  const parseBookingDate = (dateStr: string): Date | null => {
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;
    } catch {}
    return null;
  };

  const isUpcoming = (booking: BookingItem): boolean => {
    // If slotId is in "YYYY-MM-DD_HH:MM" format
    if (booking.slotId && /^\d{4}-\d{2}-\d{2}/.test(booking.slotId)) {
      const datePart = booking.slotId.split('_')[0];
      const todayIso = new Date().toISOString().split('T')[0];
      return datePart >= todayIso;
    }
    const d = parseBookingDate(booking.date);
    if (!d) return true; // Default to upcoming
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  };

  // Sort and filter bookings
  const filteredBookings = useMemo(() => {
    let list = [...bookings];

    // Filter by tab
    if (activeTab === 'upcoming') {
      list = list.filter((b) => isUpcoming(b));
    } else if (activeTab === 'past') {
      list = list.filter((b) => !isUpcoming(b));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.clientName.toLowerCase().includes(q) ||
          b.clientEmail.toLowerCase().includes(q) ||
          b.sessionType.toLowerCase().includes(q) ||
          b.date.toLowerCase().includes(q) ||
          b.time.toLowerCase().includes(q) ||
          (b.notes && b.notes.toLowerCase().includes(q))
      );
    }

    // Sort: Upcoming chronologically ascending; Past chronologically descending
    list.sort((a, b) => {
      const aTime = a.slotId || a.createdAt;
      const bTime = b.slotId || b.createdAt;
      if (activeTab === 'past') {
        return bTime.localeCompare(aTime);
      }
      return aTime.localeCompare(bTime);
    });

    return list;
  }, [bookings, activeTab, searchQuery]);

  const upcomingCount = useMemo(() => bookings.filter((b) => isUpcoming(b)).length, [bookings]);
  const pastCount = useMemo(() => bookings.filter((b) => !isUpcoming(b)).length, [bookings]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formatCreationDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] text-[#29232B] flex flex-col font-sans selection:bg-[#C9B6E4]/40">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFF8F1]/95 backdrop-blur-md border-b border-[#EFE4DE]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite}
              className="text-lg sm:text-xl font-serif text-[#29232B] font-medium tracking-tight hover:text-[#5B3A6D] transition-colors cursor-pointer"
            >
              Tanishqa Bhosale
            </button>
            <span className="hidden sm:inline-block h-4 w-px bg-[#EFE4DE]" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F7F3FC] text-[#5B3A6D] text-[11px] font-semibold border border-[#EADFF7]">
              <Shield className="w-3 h-3 text-[#5B3A6D]" />
              Organization Dashboard
            </span>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToWebsite}
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#6B5E70] hover:text-[#29232B] px-3 py-1.5 rounded-full hover:bg-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Website</span>
            </button>

            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-[#6B5E70] block leading-none">Logged in as</span>
              <span className="text-xs font-semibold text-[#29232B] font-mono leading-tight">
                {adminEmail}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#EFE4DE] bg-white hover:bg-[#F7F3FC] text-xs font-medium text-[#29232B] hover:text-[#E86A67] transition-all cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Page Title & Subtitle */}
        <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E86A67] block mb-1">
              Private Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#29232B] font-medium tracking-tight">
              Bookings
            </h1>
            <p className="text-sm sm:text-base text-[#6B5E70] mt-1">
              Your upcoming and past coaching sessions.
            </p>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-full border border-[#EFE4DE] bg-white text-xs font-medium text-[#29232B] hover:bg-[#F7F3FC] transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#5B3A6D]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Alert */}
        {fetchError && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF1F0] border border-[#FCDAD7] text-xs text-[#9B2C2C] flex items-center justify-between">
            <span>{fetchError}</span>
            <button
              onClick={fetchBookings}
              className="underline font-semibold hover:text-[#822727] cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Filter Tabs & Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="inline-flex p-1 rounded-2xl bg-white border border-[#EFE4DE] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upcoming'
                  ? 'bg-[#5B3A6D] text-[#FFF9F4] shadow-xs'
                  : 'text-[#6B5E70] hover:text-[#29232B]'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Upcoming</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'upcoming' ? 'bg-white/20' : 'bg-[#EFE4DE]/60'}`}>
                {upcomingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('past')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'past'
                  ? 'bg-[#5B3A6D] text-[#FFF9F4] shadow-xs'
                  : 'text-[#6B5E70] hover:text-[#29232B]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'past' ? 'bg-white/20' : 'bg-[#EFE4DE]/60'}`}>
                {pastCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-[#5B3A6D] text-[#FFF9F4] shadow-xs'
                  : 'text-[#6B5E70] hover:text-[#29232B]'
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-white/20' : 'bg-[#EFE4DE]/60'}`}>
                {bookings.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#6B5E70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, date..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#EFE4DE] bg-white text-xs text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5E70] hover:text-[#29232B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bookings Table / List Container */}
        <div className="bg-white rounded-3xl border border-[#EFE4DE] shadow-sm overflow-hidden">
          {isLoading && bookings.length === 0 ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#5B3A6D] mx-auto mb-3" />
              <p className="text-sm text-[#6B5E70]">Loading organization bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            /* Explicit empty state per instructions */
            <div className="py-24 text-center px-4">
              <Calendar className="w-10 h-10 text-[#C9B6E4]/70 mx-auto mb-3" />
              <h3 className="text-lg font-serif font-medium text-[#29232B]">No bookings yet.</h3>
              <p className="text-xs text-[#6B5E70] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No sessions matched your search query.'
                  : activeTab === 'upcoming'
                  ? 'There are currently no upcoming sessions scheduled.'
                  : 'There are no coaching records to display.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#EFE4DE] bg-[#FFFDFB] text-[#6B5E70] uppercase font-semibold tracking-wider text-[11px]">
                    <th className="py-3.5 px-5">Date & Time</th>
                    <th className="py-3.5 px-5">Session</th>
                    <th className="py-3.5 px-5">Client Name</th>
                    <th className="py-3.5 px-5">Client Email</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-5">Booked At</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE4DE]">
                  {filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="hover:bg-[#F7F3FC]/50 transition-colors cursor-pointer group"
                    >
                      {/* Date & Time */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-medium text-[#29232B]">{b.date}</div>
                        <div className="text-[#5B3A6D] text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#E86A67]" />
                          <span>{b.time}</span>
                        </div>
                      </td>

                      {/* Session Type */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-medium text-[#29232B]">{b.sessionType}</span>
                      </td>

                      {/* Client Name */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="font-medium text-[#29232B]">{b.clientName}</div>
                      </td>

                      {/* Client Email */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="text-[#6B5E70] font-mono text-[11px]">{b.clientEmail}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#E8F5E9] text-[#2E7D32]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Confirmed</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-5 text-[#6B5E70] text-[11px] whitespace-nowrap">
                        {formatCreationDate(b.createdAt)}
                      </td>

                      {/* Arrow indicator */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <ChevronRight className="w-4 h-4 text-[#C9B6E4] group-hover:text-[#5B3A6D] group-hover:translate-x-0.5 transition-all inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-[#6B5E70] flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#5B3A6D]" />
          <span>Server-side authorized access exclusively for {adminEmail}</span>
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#29232B]/55 backdrop-blur-xs transition-opacity animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-[#FFF8F1] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EFE4DE] max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-[#6B5E70] hover:text-[#29232B] hover:bg-[#F7F3FC] transition-colors cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal header */}
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-[#E86A67] font-semibold block mb-1">
                Booking Details
              </span>
              <h2 className="text-2xl font-serif text-[#29232B] font-medium">
                {selectedBooking.clientName}
              </h2>
              <p className="text-xs text-[#6B5E70] mt-0.5 font-mono">
                Reference ID: {selectedBooking.id}
              </p>
            </div>

            {/* Key Information Cards */}
            <div className="space-y-4">
              {/* Date & Time */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE4DE]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5E70] mb-1">
                  Scheduled Appointment
                </div>
                <div className="text-base font-serif font-medium text-[#29232B]">
                  {selectedBooking.date} at {selectedBooking.time}
                </div>
                <div className="text-xs text-[#5B3A6D] font-medium mt-1">
                  {selectedBooking.sessionType}
                </div>
              </div>

              {/* Client Contact */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE4DE]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5E70] mb-1">
                  Client Information
                </div>
                <div className="text-sm font-medium text-[#29232B]">
                  {selectedBooking.clientName}
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <a
                    href={`mailto:${selectedBooking.clientEmail}`}
                    className="text-xs font-mono text-[#5B3A6D] hover:underline"
                  >
                    {selectedBooking.clientEmail}
                  </a>
                  <button
                    onClick={() => handleCopyEmail(selectedBooking.clientEmail)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#6B5E70] hover:text-[#29232B] px-2 py-1 rounded bg-[#F7F3FC] cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3 h-3 text-[#2E7D32]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* What they would like help with */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE4DE]">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B5E70] mb-1">
                  What they would like help with
                </div>
                <p className="text-xs sm:text-sm text-[#29232B] leading-relaxed whitespace-pre-wrap">
                  {selectedBooking.notes || 'No specific notes provided during booking.'}
                </p>
              </div>

              {/* Status and metadata */}
              <div className="p-4 rounded-2xl bg-[#F7F3FC] border border-[#EADFF7] text-xs space-y-1.5 text-[#29232B]">
                <div className="flex justify-between">
                  <span className="text-[#6B5E70]">Status:</span>
                  <span className="font-semibold text-[#2E7D32] capitalize">
                    {selectedBooking.status || 'Confirmed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E70]">Single-Occupancy Slot:</span>
                  <span className="font-mono text-[11px]">{selectedBooking.slotId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B5E70]">Reserved At:</span>
                  <span>{formatCreationDate(selectedBooking.createdAt)}</span>
                </div>
                {selectedBooking.emailStatus && (
                  <div className="flex justify-between">
                    <span className="text-[#6B5E70]">Notification Status:</span>
                    <span className="capitalize">{selectedBooking.emailStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex items-center justify-end gap-3">
              <a
                href={`mailto:${selectedBooking.clientEmail}?subject=${encodeURIComponent(
                  `Regarding your coaching session on ${selectedBooking.date}`
                )}`}
                className="px-5 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-xs font-medium hover:bg-[#472C56] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Client</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2.5 rounded-full border border-[#EFE4DE] text-xs font-medium text-[#6B5E70] hover:text-[#29232B] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
