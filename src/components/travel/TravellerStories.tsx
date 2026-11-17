import React, { useEffect, useState } from 'react';
import { Star, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { editorialOptional, TRAVEL_REVIEWS } from '../../runtime/catalog';

const DEFAULT_GOOGLE_REVIEWS = [
  {
    id: 'google-rev-1',
    author: 'Roslyn Learmond',
    roleOrCity: 'Google Review',
    date: 'November 2026',
    rating: 5,
    title: '',
    comment:
      'Fungai was exceptionally helpful and very organised. Our early morning tour of Victoria Falls was fantastic. We watched the sunrise and our tour guide Wayne was really good. We captured some really beautiful aspects of the Falls. I would highly recommend Fungai and if we ever planned to visit the Falls again we would trust him 100% to arrange our trip.',
    verifiedBuyer: true,
  },
  {
    id: 'google-rev-2',
    author: 'masundadem4',
    roleOrCity: 'Google Review',
    date: 'November 2026',
    rating: 5,
    title: '',
    comment:
      'The experience was pleasant. The team was helpful and helped us get value for our money. We are grateful and will still choose Outbound if we travel to Vic Falls.',
    verifiedBuyer: true,
  },
  {
    id: 'google-rev-3',
    author: 'tapiwanashe nyawo',
    roleOrCity: 'Google Review',
    date: 'November 2026',
    rating: 5,
    title: '',
    comment:
      'Lifetime moments and experiences all thanks to Outbound Holidays who made our family trip worthwhile. Special mention to Fungai, reliable and always checking up on us. The experience was smooth from bookings whilst in the UK to landing in our motherland ZW. Thank you Outbound Holidays for a tailor made adventure and very affordable pricing with professional customer service.',
    verifiedBuyer: true,
  },
  {
    id: 'google-rev-4',
    author: 'Priviledge Mukunga',
    roleOrCity: 'Google Review',
    date: 'November 2026',
    rating: 5,
    title: '',
    comment:
      "Planning the trip was completely stress-free. Their team took care of all the small details, from smooth airport and local transfers to well-paced daily activities, so we didn't have to worry about a single thing. The accommodations and local guides they arranged were top-notch, offering great local insights and genuine hospitality. Whether it was relaxing during the downtime or heading out on scheduled excursions, everything ran right on time and felt wonderfully personalized.",
    verifiedBuyer: true,
  },
];

export const TravellerStories: React.FC = () => {
  const badge = editorialOptional('travel/TravellerStories.badge', 'Google Verified Reviews');
  const heading = editorialOptional('travel/TravellerStories.heading', 'What Our Guests Say');
  const subheading = editorialOptional(
    'travel/TravellerStories.subheading',
    'Verified local Victoria Falls holiday experiences. Check our live reviews on Google or share your own journey with us.'
  );
  const ratingScore = editorialOptional('travel/TravellerStories.score', '5.0');
  const cardTitle = editorialOptional(
    'travel/TravellerStories.cardTitle',
    '5.0 Google Rating · Outbound Holidays'
  );
  const verifiedNote = editorialOptional(
    'travel/TravellerStories.verifiedNote',
    'Verified local Victoria Falls holiday experiences'
  );
  const ctaLabel = editorialOptional('travel/TravellerStories.ctaLabel', 'Read Google Reviews');
  const reviewUrl = editorialOptional(
    'travel/TravellerStories.reviewUrl',
    'https://g.page/r/CW8xeS7qssHkECE/review'
  );

  const reviews =
    Array.isArray(TRAVEL_REVIEWS) && TRAVEL_REVIEWS.length > 0
      ? TRAVEL_REVIEWS
      : DEFAULT_GOOGLE_REVIEWS;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeIndex = activeIndex % reviews.length;
  const currentReview = reviews[safeIndex];

  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [reviews.length, isPaused]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200/80">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
            {heading}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Google Verified Review Card with Clean White Auto-Play Carousel */}
        <div
          className="bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-12 shadow-xs hover:shadow-md transition-all text-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Google G Icon Box */}
            <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 shadow-xs flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" viewBox="0 0 24 24" aria-label="Google">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            {/* Score & Stars */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2.5">
                <span className="font-extrabold text-gray-900 text-4xl tracking-tight">
                  {ratingScore}
                </span>
                <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{cardTitle}</h3>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                <span>{verifiedNote}</span>
              </p>
            </div>

            {/* Clean White Auto-Play Review Carousel (no box, no buttons, no headings) */}
            {currentReview && (
              <div
                role="region"
                aria-roledescription="carousel"
                aria-label="Customer Google Reviews"
                className="bg-white py-2 px-2 sm:px-6 space-y-3"
                aria-live="polite"
              >
                <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed max-w-xl mx-auto">
                  “{currentReview.comment}”
                </p>

                <div className="text-xs text-gray-500 flex flex-wrap items-center justify-center gap-x-2">
                  <span className="font-bold text-gray-900">{currentReview.author}</span>
                  {currentReview.date && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{currentReview.date}</span>
                    </>
                  )}
                </div>

                {reviews.length > 1 && (
                  <div className="pt-1 flex items-center justify-center gap-2">
                    {reviews.map((rev, idx) => (
                      <button
                        key={rev.id || idx}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        aria-label={`Show review ${idx + 1} of ${reviews.length}`}
                        aria-current={idx === safeIndex ? 'true' : undefined}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === safeIndex
                            ? 'w-5 bg-[#0B5E8E]'
                            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-2">
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#0B5E8E] hover:bg-[#094c73] active:bg-[#073c5b] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>{ctaLabel}</span>
                <ExternalLink className="w-4 h-4 text-[#C9A66B]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
