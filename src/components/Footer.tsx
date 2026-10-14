import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

interface FooterProps {
  onBookClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onBookClick }) => {
  return (
    <footer className="bg-[#FFF8F1]/90 backdrop-blur-xs border-t border-[#EFE4DE] py-14 sm:py-16 relative z-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-[#EFE4DE]">
          
          {/* Identity */}
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-serif text-[#29232B] font-medium">
              Tanishqa Bhosale
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#6B5E70]">
              Personal & Life Coaching
            </p>
          </div>

          {/* Clean Links with Official Social Profiles */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-sm text-[#6B5E70]">
            <a
              href="https://www.instagram.com/evolvewithtanishqa/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#5B3A6D] transition-colors group"
            >
              <Instagram className="w-4 h-4 text-[#E86A67] transition-transform group-hover:scale-110" />
              <span>@evolvewithtanishqa</span>
            </a>

            <a
              href="https://www.linkedin.com/in/tanishqabhosale/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-[#5B3A6D] transition-colors group"
            >
              <Linkedin className="w-4 h-4 text-[#5B3A6D] transition-transform group-hover:scale-110" />
              <span>LinkedIn</span>
            </a>

            <a
              href="mailto:Tanishqabhosale99@gmail.com"
              className="inline-flex items-center gap-1.5 hover:text-[#5B3A6D] transition-colors group"
            >
              <Mail className="w-4 h-4 text-[#6B5E70] transition-transform group-hover:scale-110" />
              <span>Contact</span>
            </a>

            <button
              onClick={onBookClick}
              className="text-[#29232B] font-medium hover:text-[#5B3A6D] transition-colors cursor-pointer ml-1"
            >
              Book a session
            </button>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6B5E70]">
          <p>© 2026 Tanishqa Bhosale Coaching. All rights reserved.</p>
          <p className="max-w-md sm:text-right">
            Coaching is not a substitute for therapy or medical care.
          </p>
        </div>
      </div>
    </footer>
  );
};
