import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: (review: { name: string; rating: number; text: string; role?: string }) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onReviewSubmitted }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const starsText = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const emailSubject = encodeURIComponent(`New review from ${name}`);
    const emailBody = encodeURIComponent(
      `Name: ${name}\n` +
      (role ? `Role / Context: ${role}\n` : '') +
      `Rating: ${starsText} (${rating}/5)\n\n` +
      `Review:\n${review}`
    );

    window.location.href = `mailto:Tanishqabhosale99@gmail.com?subject=${emailSubject}&body=${emailBody}`;

    if (onReviewSubmitted) {
      onReviewSubmitted({
        name,
        role: role || undefined,
        rating,
        text: review,
      });
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setRole('');
    setReview('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#29232B]/50 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#FFF8F1] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EFE4DE] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6B5E70] hover:text-[#29232B] hover:bg-[#F7F3FC] transition-colors"
          aria-label="Close review modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#F7F3FC] text-[#5B3A6D] flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 id="review-modal-title" className="text-2xl font-serif text-[#29232B] font-medium">
              Thank you for sharing your experience
            </h3>
            <p className="text-[#6B5E70] text-sm leading-relaxed max-w-md mx-auto">
              Your email app has been opened with your review ready to send to <span className="font-semibold text-[#29232B]">Tanishqabhosale99@gmail.com</span>. Once sent, Tanishqa will review it for the website.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-xs uppercase tracking-widest text-[#E86A67] font-semibold block mb-1">
                Client Reflection
              </span>
              <h2 id="review-modal-title" className="text-2xl sm:text-3xl font-serif text-[#29232B] font-medium">
                Share your experience
              </h2>
              <p className="text-sm text-[#6B5E70] mt-1.5 leading-relaxed">
                If we’ve worked together, I’d love to hear about your experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'fill-[#F4D77D] text-[#F4D77D]'
                            : 'text-[#EFE4DE]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-[#6B5E70] font-medium">
                    {rating} of 5 stars
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="review-name" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1">
                  Your Name <span className="text-[#E86A67]">*</span>
                </label>
                <input
                  id="review-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya M."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
                />
              </div>

              {/* Optional context */}
              <div>
                <label htmlFor="review-role" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1">
                  Context or Focus Area <span className="text-xs font-normal normal-case text-[#6B5E70]">(optional, e.g. Career Transition, Life Decision)</span>
                </label>
                <input
                  id="review-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Career Direction & Confidence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D]"
                />
              </div>

              {/* Review Text */}
              <div>
                <label htmlFor="review-text" className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E70] mb-1">
                  Your Review <span className="text-[#E86A67]">*</span>
                </label>
                <textarea
                  id="review-text"
                  required
                  rows={4}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="How did the session feel? What shifted for you?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE4DE] bg-white text-sm text-[#29232B] placeholder:text-[#6B5E70]/50 focus:outline-none focus:ring-2 focus:ring-[#5B3A6D]/20 focus:border-[#5B3A6D] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full text-xs font-medium text-[#6B5E70] hover:text-[#29232B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#5B3A6D] text-[#FFF9F4] text-sm font-medium hover:bg-[#472C56] transition-all shadow-sm hover:shadow active:scale-[0.99] cursor-pointer"
                >
                  Submit review
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
