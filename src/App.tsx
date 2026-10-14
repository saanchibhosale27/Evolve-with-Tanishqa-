import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { WhatWeWorkOn } from './components/WhatWeWorkOn';
import { Reviews, TestimonialItem } from './components/Reviews';
import { HowItWorks } from './components/HowItWorks';
import { BookingSection } from './components/BookingSection';
import { Footer } from './components/Footer';
import { EditorialBackground } from './components/EditorialBackground';
import { BookingModal } from './components/BookingModal';
import { StoryModal } from './components/StoryModal';
import { ReviewModal } from './components/ReviewModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { subscribeToAuth, logoutUser, isEmailAuthorizedAdmin } from './auth';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

type AppRoute = 'public' | 'admin' | 'login';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('public');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customReviews, setCustomReviews] = useState<TestimonialItem[]>([]);

  // Admin authentication state
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem('tb_admin_email') || '';
  });
  const [adminToken, setAdminToken] = useState<string>(() => {
    return sessionStorage.getItem('tb_admin_token') || '';
  });
  const [currentFbUser, setCurrentFbUser] = useState<{ email: string } | null>(null);

  // Sync route with browser URL / hash
  const checkRouteFromUrl = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    if (path === '/admin' || hash === '#admin') {
      setCurrentRoute('admin');
    } else if (path === '/login' || hash === '#login') {
      setCurrentRoute('login');
    } else {
      setCurrentRoute('public');
    }
  };

  useEffect(() => {
    checkRouteFromUrl();
    window.addEventListener('popstate', checkRouteFromUrl);
    window.addEventListener('hashchange', checkRouteFromUrl);
    return () => {
      window.removeEventListener('popstate', checkRouteFromUrl);
      window.removeEventListener('hashchange', checkRouteFromUrl);
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user, isAuthorized) => {
      if (user && user.email) {
        setCurrentFbUser({ email: user.email.toLowerCase() });
        if (isAuthorized) {
          try {
            const token = await user.getIdToken();
            setAdminEmail(user.email.toLowerCase());
            setAdminToken(token);
            sessionStorage.setItem('tb_admin_email', user.email.toLowerCase());
            sessionStorage.setItem('tb_admin_token', token);
          } catch (e) {
            console.error('[AUTH SYNC ERROR]', e);
          }
        }
      } else {
        setCurrentFbUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const navigateTo = (route: AppRoute) => {
    setCurrentRoute(route);
    if (route === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (route === 'login') {
      window.history.pushState({}, '', '/login');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleAdminLoginSuccess = (email: string, token: string) => {
    setAdminEmail(email);
    setAdminToken(token);
    sessionStorage.setItem('tb_admin_email', email);
    sessionStorage.setItem('tb_admin_token', token);
    navigateTo('admin');
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {}
    }
    await logoutUser();
    setAdminEmail('');
    setAdminToken('');
    sessionStorage.removeItem('tb_admin_email');
    sessionStorage.removeItem('tb_admin_token');
    navigateTo('public');
  };

  const handleOpenBooking = (topic: string = '') => {
    setSelectedTopic(topic);
    setIsBookingOpen(true);
  };

  const handleExploreAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReviewSubmitted = (newReview: {
    name: string;
    rating: number;
    text: string;
    role?: string;
  }) => {
    const item: TestimonialItem = {
      id: `custom-${Date.now()}`,
      name: newReview.name,
      descriptor: newReview.role,
      quote: newReview.text,
      rating: newReview.rating,
    };
    setCustomReviews((prev) => [item, ...prev]);
  };

  const isAdminAuthenticated = Boolean(
    adminToken && adminEmail && isEmailAuthorizedAdmin(adminEmail)
  );

  // If viewing admin route:
  if (currentRoute === 'admin') {
    // 1. If logged out completely, redirect to login (TEST 4 requirement)
    if (!adminToken && !currentFbUser) {
      return (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onBackToWebsite={() => navigateTo('public')}
        />
      );
    }

    // 2. If logged in as normal customer (non-admin), show strict Access Denied screen (TEST 5 requirement)
    if (currentFbUser && !isEmailAuthorizedAdmin(currentFbUser.email)) {
      return (
        <div className="min-h-screen bg-[#FFF8F1] text-[#29232B] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#C9B6E4]/40 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-[#EFE4DE] text-center">
            <div className="w-12 h-12 rounded-full bg-[#FFF1F0] text-[#E86A67] flex items-center justify-center mx-auto mb-4 border border-[#FCDAD7]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif text-[#29232B] font-medium tracking-tight">
              Access Denied
            </h1>
            <p className="text-xs text-[#6B5E70] mt-2 leading-relaxed">
              You are signed in as <strong className="font-mono text-[#29232B]">{currentFbUser.email}</strong>, which is not an authorized administrator account.
            </p>
            <p className="text-xs text-[#822727] bg-[#FFF1F0] p-3 rounded-xl mt-4 border border-[#FCDAD7]">
              Only designated organization accounts have permission to view coaching session bookings.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigateTo('public')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#EFE4DE] text-xs font-medium text-[#29232B] hover:bg-[#F7F3FC] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to website</span>
              </button>
              <button
                onClick={handleAdminLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-xs font-medium hover:bg-[#472C56] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Authorized Admin: render private dashboard (TEST 1 & 2 requirement)
    if (isAdminAuthenticated) {
      return (
        <AdminDashboard
          adminEmail={adminEmail}
          authToken={adminToken}
          onLogout={handleAdminLogout}
          onBackToWebsite={() => navigateTo('public')}
        />
      );
    }

    // Fallback: render login
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onBackToWebsite={() => navigateTo('public')}
      />
    );
  }

  // If viewing login route:
  if (currentRoute === 'login') {
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onBackToWebsite={() => navigateTo('public')}
      />
    );
  }

  // Normal Public Website view: (Unmodified visual identity and flow)
  return (
    <div className="min-h-screen text-[#29232B] flex flex-col font-sans selection:bg-[#C9B6E4]/40 selection:text-[#29232B] relative">
      {/* 5-Layer Editorial Background System */}
      <EditorialBackground />

      {/* 3-Zone Navigation Top Bar (shows Bookings ONLY if admin is authenticated) */}
      <Navbar
        onBookClick={() => handleOpenBooking()}
        isAdminAuthenticated={isAdminAuthenticated}
        onNavigateToAdmin={() => navigateTo('admin')}
        onLogoutAdmin={handleAdminLogout}
      />

      <main className="flex-1">
        {/* Section 1 — Hero */}
        <Hero
          onBookClick={() => handleOpenBooking()}
          onExploreAbout={handleExploreAbout}
        />

        {/* Section 2 — Short About */}
        <About onReadStory={() => setIsStoryOpen(true)} />

        {/* Section 3 — What We Can Work On */}
        <WhatWeWorkOn onCardClick={(topic) => handleOpenBooking(topic)} />

        {/* Section 4 — Reviews */}
        <Reviews
          onOpenReviewModal={() => setIsReviewOpen(true)}
          customReviews={customReviews}
        />

        {/* Section 5 — How It Works */}
        <HowItWorks />

        {/* Section 6 — Final Booking CTA */}
        <BookingSection onBookClick={() => handleOpenBooking()} />
      </main>

      {/* Minimal Footer */}
      <Footer onBookClick={() => handleOpenBooking()} />

      {/* Interactive Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultTopic={selectedTopic}
      />

      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onBookClick={() => handleOpenBooking()}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
