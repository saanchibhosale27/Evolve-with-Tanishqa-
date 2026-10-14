import React from 'react';
import { X, Compass } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookClick: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onBookClick }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#29232B]/55 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FFF8F1] rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#EFE4DE] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6B5E70] hover:text-[#29232B] hover:bg-[#F7F3FC] transition-colors"
          aria-label="Close story"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#E86A67] font-semibold block mb-1">
              My Journey
            </span>
            <h2 id="story-modal-title" className="text-2xl sm:text-3xl font-serif text-[#29232B] font-medium">
              "My journey was never a straight line."
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center bg-[#F7F3FC] p-5 rounded-2xl border border-[#EADFF7]">
            <img
              src="/tanishqa-red-outfit.jpg"
              alt="Tanishqa Bhosale smiling warmly"
              className="w-28 h-36 object-cover rounded-xl shadow-sm shrink-0 border border-[#EFE4DE]"
              referrerPolicy="no-referrer"
            />
            <blockquote className="text-sm italic text-[#29232B] leading-relaxed border-l-2 border-[#E86A67] pl-4 py-1">
              "Not becoming someone else. Becoming more aware of who I am, and having the courage to keep evolving."
              <span className="block mt-2 font-normal not-italic text-xs text-[#6B5E70] font-sans">
                — Tanishqa Bhosale
              </span>
            </blockquote>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-[#29232B] leading-relaxed">
            <p>
              Today I see that was the point. For years I thought living in the moment meant I was behind. It turned out to be the beginning of everything.
            </p>
            <p>
              In 2018, the Miss India stage taught me how to hold myself in rooms I had never been in before. Then I moved to Canada for a post-graduate degree: a new country, a new chapter, and so much room to grow.
            </p>
            <p>
              If you’ve ever found yourself in an unexpected space while doing all the "right" things, I understand, and I know it can become the start of something new.
            </p>
            <p>
              I earned my own way while I was there, and standing on my own feet taught me things no classroom could. Social work then brought me close to people living very different realities, and meeting people from so many places changed how I see people and life.
            </p>
            <p>
              I don’t have it all figured out. But I’ve lived enough versions of uncertainty to know how to sit with someone else’s.
            </p>
          </div>

          <div className="pt-4 border-t border-[#EFE4DE] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#6B5E70] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#5B3A6D]" />
              <span>Available for online 1-on-1 sessions worldwide</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onBookClick();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-colors"
            >
              Book a session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
