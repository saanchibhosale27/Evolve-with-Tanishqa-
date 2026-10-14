import React, { useState } from 'react';
import { Menu, X, Instagram, Linkedin, Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  onBookClick: () => void;
  isAdminAuthenticated?: boolean;
  onNavigateToAdmin?: () => void;
  onLogoutAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookClick,
  isAdminAuthenticated = false,
  onNavigateToAdmin,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Coaching', href: '#coaching' },
    { label: 'Reflections', href: '#reviews' },
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8F1]/90 backdrop-blur-md border-b border-[#EFE4DE]/80 transition-all">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xl sm:text-2xl font-serif text-[#29232B] font-medium tracking-tight hover:text-[#5B3A6D] transition-colors"
        >
          Tanishqa Bhosale
        </a>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6B5E70]">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => handleLinkClick(item.href)}
              className="hover:text-[#29232B] transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}

          {/* Private Organization Bookings Link — visible ONLY to authenticated admins */}
          {isAdminAuthenticated && (
            <button
              onClick={onNavigateToAdmin}
              className="font-semibold text-[#5B3A6D] hover:text-[#29232B] transition-colors cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F3FC] border border-[#EADFF7]"
            >
              <Shield className="w-3.5 h-3.5 text-[#E86A67]" />
              <span>Bookings</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          {isAdminAuthenticated && onLogoutAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#6B5E70] hover:text-[#E86A67] px-3 py-1.5 rounded-full border border-[#EFE4DE] transition-colors cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          )}

          <button
            onClick={onBookClick}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-xs sm:text-sm font-medium tracking-wide hover:bg-[#472C56] transition-all shadow-sm hover:shadow active:scale-[0.98] whitespace-nowrap cursor-pointer"
          >
            Book a session
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#29232B] hover:text-[#5B3A6D] transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EFE4DE] bg-[#FFF8F1] px-6 py-6 space-y-4 shadow-lg animate-in fade-in duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleLinkClick(item.href)}
                className="text-left text-base font-medium text-[#29232B] py-2 border-b border-[#F7F3FC] hover:text-[#5B3A6D]"
              >
                {item.label}
              </button>
            ))}

            {isAdminAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToAdmin?.();
                }}
                className="text-left text-base font-semibold text-[#5B3A6D] py-2 border-b border-[#F7F3FC] flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#E86A67]" />
                <span>Private Bookings Dashboard</span>
              </button>
            )}
          </div>

          {isAdminAuthenticated && onLogoutAdmin && (
            <div className="pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogoutAdmin();
                }}
                className="w-full py-2.5 rounded-full border border-[#EFE4DE] text-xs font-medium text-[#E86A67] hover:bg-[#FFF1F0] transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out of Admin</span>
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick();
              }}
              className="w-full py-3 rounded-full bg-[#5B3A6D] text-[#FFF8F1] text-sm font-medium text-center shadow-sm hover:bg-[#472C56] transition-colors block cursor-pointer"
            >
              Book a session
            </button>
          </div>

          {/* Official Social Profiles */}
          <div className="pt-3 border-t border-[#EFE4DE] flex items-center justify-center gap-6 text-xs text-[#6B5E70]">
            <a
              href="https://www.instagram.com/evolvewithtanishqa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#5B3A6D] transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#E86A67]" />
              <span>@evolvewithtanishqa</span>
            </a>
            <a
              href="https://www.linkedin.com/in/tanishqabhosale/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#5B3A6D] transition-colors"
            >
              <Linkedin className="w-4 h-4 text-[#5B3A6D]" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
