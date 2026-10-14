import React from 'react';

export const EditorialBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. LAYER ONE: Continuous Tonal Scroll Gradient (Champagne -> Soft Coral Warmth -> Lavender -> Dusty Lavender) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: `
            linear-gradient(
              180deg,
              #FFF6EE 0%,
              #FDF3E9 18%,
              #FBF4EC 32%,
              #F8F1F9 52%,
              #F5EDF8 72%,
              #F8F1FA 88%,
              #FAF3EB 100%
            )
          `
        }}
      />

      {/* 2. LAYER TWO: Depth Through Natural Light (Soft daylight falling across paper, NOT neon glow) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `
            radial-gradient(1200px 900px at 18% 10%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 246, 238, 0.35) 55%, transparent 100%),
            radial-gradient(1000px 800px at 85% 42%, rgba(255, 255, 255, 0.6) 0%, rgba(247, 241, 249, 0.2) 60%, transparent 100%),
            radial-gradient(1100px 900px at 22% 76%, rgba(255, 255, 255, 0.5) 0%, transparent 80%)
          `
        }}
      />

      {/* 3. LAYER THREE: 2-3 VERY LARGE Organic Abstract Forms (Translucent, Asymmetrical, Extending Off-Screen) */}
      {/* Form 1: Oversized Lavender-Plum Atmospheric Shape (Top-Right extending off-screen) */}
      <div 
        className="absolute -top-[15%] -right-[15%] w-[950px] h-[950px] rounded-[48%_52%_62%_38%_/_42%_58%_42%_58%] opacity-70 blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgba(201, 182, 228, 0.32) 0%, rgba(91, 58, 109, 0.12) 65%, transparent 100%)',
          transform: 'rotate(-15deg)',
        }}
      />

      {/* Form 2: Muted Coral Warmth Shape (Mid-Left extending beyond viewport) */}
      <div 
        className="absolute top-[32%] -left-[18%] w-[880px] h-[920px] rounded-[55%_45%_38%_62%_/_48%_42%_58%_52%] opacity-60 blur-[125px]"
        style={{
          background: 'radial-gradient(circle, rgba(232, 106, 103, 0.16) 0%, rgba(244, 215, 125, 0.08) 55%, transparent 100%)',
          transform: 'rotate(25deg)',
        }}
      />

      {/* Form 3: Dusty Lavender & Soft Plum Shadow (Lower-Page / Reviews extending off-screen) */}
      <div 
        className="absolute top-[64%] -right-[12%] w-[900px] h-[850px] rounded-[42%_58%_52%_48%_/_58%_38%_62%_42%] opacity-65 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(201, 182, 228, 0.28) 0%, rgba(91, 58, 109, 0.14) 70%, transparent 100%)',
          transform: 'rotate(40deg)',
        }}
      />

      {/* 4. LAYER FOUR: Fine Art-Direction Contour Lines (Ultra-thin 0.6px flowing curves) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-25" 
        viewBox="0 0 1440 3200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Upper flowing contour near Hero/About */}
        <path 
          d="M 1440 240 C 1120 380, 860 180, 520 420 C 240 620, 120 940, -100 1080" 
          stroke="#C9B6E4" 
          strokeWidth="0.75" 
          strokeDasharray="4 2"
          opacity="0.6"
        />
        <path 
          d="M 1480 320 C 1180 440, 920 280, 580 500 C 300 700, 160 1000, -60 1140" 
          stroke="#5B3A6D" 
          strokeWidth="0.5" 
          opacity="0.4"
        />

        {/* Mid-page delicate wave near Coaching */}
        <path 
          d="M -80 1480 C 280 1340, 680 1620, 1080 1420 C 1320 1300, 1460 1380, 1520 1440" 
          stroke="#C9B6E4" 
          strokeWidth="0.65" 
          opacity="0.5"
        />

        {/* Lower contour leading toward Reviews and Booking */}
        <path 
          d="M 1520 2200 C 1200 2400, 780 2150, 380 2380 C 120 2520, -40 2700, -80 2880" 
          stroke="#E86A67" 
          strokeWidth="0.6" 
          opacity="0.35"
        />
      </svg>

      {/* 5. LAYER FIVE: High-Quality Luxury Paper / Fibrous Texture (Not digital filter noise) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="luxury-paper-fibers" x="0%" y="0%" width="100%" height="100%">
          {/* Multi-frequency gentle turbulence simulating natural cotton & linen fibers */}
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.04 0.04" 
            numOctaves="4" 
            result="noise" 
          />
          <feColorMatrix 
            type="matrix" 
            values="
              0 0 0 0 0.22
              0 0 0 0 0.18
              0 0 0 0 0.24
              0 0 0 0.042 0
            " 
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#luxury-paper-fibers)" />
      </svg>

      {/* Ultra-subtle secondary tactile tooth */}
      <div 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(91, 58, 109, 0.02) 1px, transparent 1px),
            radial-gradient(circle at 0% 0%, rgba(232, 106, 103, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px, 48px 48px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />
    </div>
  );
};
