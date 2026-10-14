import React from 'react';
import { ArrowRight } from 'lucide-react';

interface AboutProps {
  onReadStory: () => void;
}

export const About: React.FC<AboutProps> = ({ onReadStory }) => {
  return (
    <section 
      id="about" 
      className="py-20 sm:py-28 relative overflow-hidden bg-transparent border-y border-[#EFE4DE]/60"
    >
      {/* Subtle atmospheric glow */}
      <div 
        className="absolute top-1/4 right-0 w-[420px] h-[420px] rounded-full bg-[#FCEDE0]/60 blur-[120px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-20 left-10 w-[360px] h-[360px] rounded-full bg-[#C9B6E4]/12 blur-[130px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Thin abstract curved line */}
      <svg 
        className="absolute bottom-6 left-0 w-64 h-64 opacity-20 pointer-events-none -z-10 text-[#C9B6E4]" 
        viewBox="0 0 256 256" 
        fill="none" 
        stroke="currentColor" 
        aria-hidden="true"
      >
        <path d="M 0 200 C 80 180 140 120 200 0" strokeWidth="0.75" />
      </svg>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: RED OUTFIT Photograph */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div 
                className="absolute inset-0 rotate-1 rounded-[2.25rem] bg-[#C9B6E4]/25 -z-10 translate-y-2 -translate-x-2 transition-transform duration-500" 
                aria-hidden="true" 
              />
              <div className="overflow-hidden rounded-[2.25rem] shadow-lg shadow-[#29232B]/6 border border-[#EFE4DE] bg-[#FFFFFF]">
                <img
                  src="/tanishqa-red-outfit.jpg"
                  alt="Tanishqa Bhosale smiling warmly in a red outfit"
                  className="w-full h-auto max-h-[520px] object-cover object-center hover:scale-[1.02] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Short Narrative & Story Link */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            <div>
              <span className="inline-block text-xs uppercase tracking-[0.24em] text-[#5B3A6D] font-semibold mb-3">
                Background & Perspective
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#29232B] font-normal leading-tight">
                A little about Tanishqa
              </h2>
            </div>

            <div className="space-y-4 text-base sm:text-lg text-[#6B5E70] leading-relaxed">
              <p>
                From the Miss India stage in 2018 to moving to Canada for post-graduate studies and working in frontline social work, living across very different realities changed how I understand people and life.
              </p>
              <p>
                I don’t have it all figured out. But I’ve lived enough versions of uncertainty to know how to sit with someone else’s.
              </p>
            </div>

            {/* Authentic quote snippet */}
            <div className="pt-2">
              <p className="text-sm italic text-[#29232B] border-l-2 border-[#E86A67] pl-4 py-1">
                "Not becoming someone else. Becoming more aware of who I am, and having the courage to keep evolving."
              </p>
            </div>

            {/* Read my story link */}
            <div className="pt-2">
              <button
                onClick={onReadStory}
                className="group inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#29232B] hover:text-[#5B3A6D] transition-colors cursor-pointer"
              >
                <span>Read my story</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#E86A67]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
