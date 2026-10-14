import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onBookClick: () => void;
  onExploreAbout: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onExploreAbout }) => {
  return (
    <section className="relative pt-10 sm:pt-16 pb-20 sm:pb-28 overflow-hidden bg-transparent">
      {/* Atmosphere Gradients: soft lavender haze to one edge, warm coral glow to another */}
      <div 
        className="absolute -top-24 -left-24 w-[560px] h-[560px] rounded-full bg-[#C9B6E4]/15 blur-[130px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-28 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#E86A67]/10 blur-[140px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/3 left-1/4 w-[420px] h-[420px] rounded-full bg-[#FCF2E6]/60 blur-[100px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Delicate thin editorial line detail */}
      <svg 
        className="absolute top-12 right-0 w-80 h-80 opacity-20 pointer-events-none -z-10 text-[#C9B6E4]" 
        viewBox="0 0 320 320" 
        fill="none" 
        stroke="currentColor" 
        aria-hidden="true"
      >
        <path d="M 320 0 C 220 60 140 160 80 320" strokeWidth="0.75" />
      </svg>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT SIDE: Narrative & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F4D77D]" aria-hidden="true" />
                <span className="text-xs uppercase tracking-[0.24em] text-[#E86A67] font-semibold">
                  Tanishqa Bhosale
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-serif text-[#29232B] leading-[1.08] font-normal tracking-tight [text-wrap:balance]">
                You don’t have to figure it all out alone.
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-[#6B5E70] font-normal leading-relaxed max-w-xl">
              Coaching conversations to help you find clarity, navigate change and take your next step.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              <button
                onClick={onBookClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#5B3A6D] text-[#FFF8F1] text-sm sm:text-base font-medium tracking-wide hover:bg-[#472C56] transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                Book a session
              </button>

              <button
                onClick={onExploreAbout}
                className="group inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#29232B] hover:text-[#5B3A6D] transition-colors py-2 cursor-pointer"
              >
                <span>Get to know Tanishqa</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#E86A67]" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: White-shirt photograph with calm natural framing */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Soft lavender subtle backdrop accent */}
              <div 
                className="absolute inset-0 -rotate-2 rounded-[2.5rem] bg-[#C9B6E4]/25 -z-10 translate-y-3 translate-x-2 transition-transform duration-500"
                aria-hidden="true" 
              />
              
              <div className="overflow-hidden rounded-[2.25rem] shadow-xl shadow-[#29232B]/6 border border-[#EFE4DE] bg-[#FFFFFF]">
                <img
                  src="/tanishqa-white-shirt.jpg"
                  alt="Tanishqa Bhosale resting her chin on her hand at an outdoor table with a chess board"
                  className="w-full h-auto max-h-[580px] object-cover object-top hover:scale-[1.02] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
