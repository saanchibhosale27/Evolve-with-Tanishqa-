import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  descriptor?: string;
  rating?: number;
}

interface ReviewsProps {
  onOpenReviewModal: () => void;
  customReviews?: TestimonialItem[];
}

export const Reviews: React.FC<ReviewsProps> = ({ onOpenReviewModal, customReviews = [] }) => {
  // CRITICAL REQUIREMENT:
  // - NEVER fabricate, invent or use sample/placeholder testimonials.
  // - NEVER say "reviews will appear here", "coming soon", or suggest a new/empty practice.
  // - Established, mature, editorial presence.
  const allReviews = customReviews;
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    if (allReviews.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? allReviews.length - 1 : prev - 1));
  };

  const nextReview = () => {
    if (allReviews.length <= 1) return;
    setCurrentIndex((prev) => (prev === allReviews.length - 1 ? 0 : prev + 1));
  };

  const hasReviews = allReviews.length > 0;
  const current = hasReviews ? allReviews[currentIndex] : null;

  return (
    <section 
      id="reviews" 
      className="py-20 sm:py-28 relative overflow-hidden bg-transparent"
    >
      {/* Subtle atmospheric tint */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[340px] rounded-full bg-[#C9B6E4]/12 blur-[130px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 relative z-10 text-center">
        
        {/* Section Heading & Supporting Line */}
        <div className="space-y-4 mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#29232B] font-normal leading-tight tracking-tight">
            Client reflections
          </h2>
          <p className="text-base sm:text-lg text-[#6B5E70] font-normal leading-relaxed max-w-xl mx-auto">
            If we’ve worked together, I’d love to hear about your experience.
          </p>
        </div>

        {/* Display genuine client reviews when available */}
        {hasReviews && current && (
          <div className="mb-10 bg-[#FFFFFF]/90 backdrop-blur-xs rounded-[2rem] p-8 sm:p-12 border border-[#EADFF7] shadow-sm max-w-2xl mx-auto text-left transition-all">
            {current.rating && (
              <div className="flex items-center gap-1 mb-4">
                {[...Array(current.rating)].map((_, i) => (
                  <span key={i} className="text-[#F4D77D] text-base leading-none">★</span>
                ))}
              </div>
            )}

            <blockquote className="text-xl sm:text-2xl font-serif text-[#29232B] font-normal leading-relaxed italic mb-6">
              “{current.quote}”
            </blockquote>

            <div className="pt-5 border-t border-[#EFE4DE] flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-medium text-[#29232B]">
                  {current.name}
                </p>
                {current.descriptor && (
                  <p className="text-xs text-[#6B5E70] mt-0.5">
                    {current.descriptor}
                  </p>
                )}
              </div>

              {allReviews.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#5B3A6D]/70 mr-1">
                    0{currentIndex + 1} / 0{allReviews.length}
                  </span>
                  <button
                    onClick={prevReview}
                    className="p-2 rounded-full border border-[#C9B6E4] hover:bg-[#5B3A6D] hover:text-[#FFF8F1] text-[#5B3A6D] transition-colors cursor-pointer"
                    aria-label="Previous reflection"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextReview}
                    className="p-2 rounded-full border border-[#C9B6E4] hover:bg-[#5B3A6D] hover:text-[#FFF8F1] text-[#5B3A6D] transition-colors cursor-pointer"
                    aria-label="Next reflection"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subtle secondary CTA */}
        <div>
          <button
            onClick={onOpenReviewModal}
            className="group inline-flex items-center gap-2 text-sm sm:text-base font-medium text-[#5B3A6D] hover:text-[#29232B] transition-colors py-1 cursor-pointer"
          >
            <span>Share your experience</span>
            <span className="text-[#E86A67] transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Quiet, discreet confidentiality note */}
        <div className="mt-8">
          <p className="text-xs text-[#6B5E70]/70 max-w-md mx-auto">
            Coaching conversations are strictly confidential. Client reflections are shared only with gracious permission.
          </p>
        </div>

      </div>
    </section>
  );
};
