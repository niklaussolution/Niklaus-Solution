import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Star, CheckCircle2 } from 'lucide-react';
import { submitReview } from '../lib/reviews';
import { siteContent } from '../content/siteContent';
import logoIcon from '../assets/logo-icon.png';

interface FormValues {
  name: string;
  role: string;
  comment: string;
}

export default function ReviewPage() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await submitReview({ ...values, rating });
      setSubmitted(true);
    } catch {
      setError('Something went wrong on our end. Please try again in a moment.');
    }
  }

  return (
    <div className="workshop-page flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src={logoIcon} alt={siteContent.brand} className="mx-auto h-12 w-auto rounded-lg bg-white p-1.5 ring-1 ring-brand-navy/10" />
          <h1 className="font-display mt-4 text-2xl font-bold text-brand-navy">Share Your Experience</h1>
          <p className="mt-1 text-sm text-brand-navy/60">
            Attended the workshop? Let others know what it was like.
          </p>
        </div>

        {submitted ? (
          <div className="ticket p-7 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-brand-orange" />
            <h2 className="font-display text-xl font-bold text-brand-navy">Thank you!</h2>
            <p className="mt-2 text-sm text-brand-navy/70">
              Your review has been submitted and will appear on the site once approved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="ticket space-y-4 p-7">
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-navy/70">Your Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating) ? 'fill-brand-orange text-brand-orange' : 'text-brand-navy/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy/70">Your Name</label>
              <input
                {...register('name', { required: 'Please enter your name' })}
                placeholder="Full Name"
                className="w-full rounded-lg border border-brand-navy/15 bg-paper px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/25"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy/70">
                Role / Occupation <span className="text-brand-navy/40">(optional)</span>
              </label>
              <input
                {...register('role')}
                placeholder="e.g. Small Business Owner"
                className="w-full rounded-lg border border-brand-navy/15 bg-paper px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/25"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-brand-navy/70">Your Review</label>
              <textarea
                {...register('comment', { required: 'Please share a few words about your experience' })}
                placeholder="What did you think of the workshop?"
                rows={4}
                className="w-full resize-none rounded-lg border border-brand-navy/15 bg-paper px-4 py-3 text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/25"
              />
              {errors.comment && <p className="mt-1 text-xs text-red-600">{errors.comment.message}</p>}
            </div>

            {error && <p className="text-center text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-sweep w-full rounded-lg bg-brand-orange px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-orange/30 transition hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
