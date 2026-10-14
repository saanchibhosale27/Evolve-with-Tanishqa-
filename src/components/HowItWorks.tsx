import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'BOOK',
      description: 'Choose a time that works for you.',
    },
    {
      step: '02',
      title: 'TALK',
      description: 'Come as you are. No preparation needed.',
    },
    {
      step: '03',
      title: 'MOVE FORWARD',
      description: 'Leave with greater clarity and a direction that feels right for you.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-transparent">
      {/* Soft warm ivory glow */}
      <div 
        className="absolute -bottom-10 right-1/4 w-[460px] h-[460px] rounded-full bg-[#FCEDE0]/60 blur-[130px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute top-10 -left-10 w-[360px] h-[360px] rounded-full bg-[#C9B6E4]/10 blur-[120px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Thin abstract curved line */}
      <svg 
        className="absolute bottom-0 left-1/3 w-80 h-80 opacity-15 pointer-events-none -z-10 text-[#C9B6E4]" 
        viewBox="0 0 320 320" 
        fill="none" 
        stroke="currentColor" 
        aria-hidden="true"
      >
        <path d="M 0 300 C 100 200 220 180 320 280" strokeWidth="0.75" />
      </svg>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">
        
        {/* Section Header */}
        <div className="max-w-xl mb-12 sm:mb-16">
          <span className="inline-block text-xs uppercase tracking-[0.24em] text-[#E86A67] font-semibold mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#29232B] font-normal leading-tight">
            How it works
          </h2>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {steps.map((item) => (
            <div
              key={item.step}
              className="pt-6 border-t border-[#C9B6E4]/60 flex flex-col justify-between"
            >
              <div>
                <span className="text-sm font-mono text-[#5B3A6D] font-bold tracking-wider mb-3 block">
                  {item.step}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif text-[#29232B] font-normal tracking-wide mb-3">
                  {item.title}
                </h3>
                <p className="text-[#6B5E70] text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
