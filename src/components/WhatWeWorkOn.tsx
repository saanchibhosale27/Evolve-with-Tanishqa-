import React from 'react';

interface WhatWeWorkOnProps {
  onCardClick: (topic: string) => void;
}

export const WhatWeWorkOn: React.FC<WhatWeWorkOnProps> = ({ onCardClick }) => {
  const areas = [
    {
      id: 'career',
      title: 'Career & Direction',
      description: 'Feeling stuck, uncertain or unsure about your next move.',
    },
    {
      id: 'transitions',
      title: 'Transitions',
      description: 'Navigating a new phase, decision or change.',
    },
    {
      id: 'confidence',
      title: 'Confidence & Clarity',
      description: 'Getting out of your head and understanding what you actually want.',
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      description: 'Building the confidence and clarity to move forward.',
    },
  ];

  return (
    <section 
      id="coaching" 
      className="py-20 sm:py-28 relative overflow-hidden bg-transparent"
    >
      {/* Soft lavender undertone glow */}
      <div 
        className="absolute -top-24 right-1/4 w-[480px] h-[480px] rounded-full bg-[#C9B6E4]/14 blur-[130px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-10 left-[-5%] w-[380px] h-[380px] rounded-full bg-[#E86A67]/06 blur-[120px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* Subtle thin curved line in top right corner */}
      <svg 
        className="absolute top-0 right-10 w-96 h-96 opacity-15 pointer-events-none -z-10 text-[#C9B6E4]" 
        viewBox="0 0 384 384" 
        fill="none" 
        stroke="currentColor" 
        aria-hidden="true"
      >
        <path d="M 384 0 C 260 80 180 200 120 384" strokeWidth="0.75" />
      </svg>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative">
        
        {/* Header */}
        <div className="max-w-xl mb-12 sm:mb-16">
          <span className="inline-block text-xs uppercase tracking-[0.24em] text-[#E86A67] font-semibold mb-3">
            Focus Areas
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#29232B] font-normal leading-tight">
            What can we work on?
          </h2>
        </div>

        {/* 4 Minimal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {areas.map((area, index) => (
            <div
              key={area.id}
              onClick={() => onCardClick(area.title)}
              className="group p-8 sm:p-10 rounded-3xl bg-[#FFFFFF]/95 border border-[#EFE4DE] hover:border-[#C9B6E4] hover:shadow-lg hover:shadow-[#5B3A6D]/5 transition-all duration-300 flex flex-col justify-start cursor-pointer"
            >
              <div>
                <span className="text-xs font-mono text-[#5B3A6D]/70 font-semibold mb-4 block">
                  0{index + 1}
                </span>
                <h3 className="text-2xl sm:text-[1.75rem] font-serif text-[#29232B] font-normal mb-3 group-hover:text-[#5B3A6D] transition-colors">
                  {area.title}
                </h3>
                <p className="text-[#6B5E70] text-base leading-relaxed">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
