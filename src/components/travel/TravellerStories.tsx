import React from 'react';
import { Star, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';

export const TravellerStories: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200/80">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/10 text-[#C9A66B] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>Google Verified Reviews</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight">
            What Our Guests Say
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Verified local Victoria Falls holiday experiences. Check our live reviews on Google or share your own journey with us.
          </p>
        </div>

        {/* Google Verified Review Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-12 shadow-xs hover:shadow-md transition-all text-center">
          <div className="max-w-xl mx-auto space-y-6">
            
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
                <span className="font-extrabold text-gray-900 text-4xl tracking-tight">5.0</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Google Verified Reviews
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34A853] shrink-0" />
                <span>Verified local Victoria Falls holiday experiences</span>
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <a
                href="https://g.page/r/CW8xeS7qssHkECE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-[#0B5E8E] hover:bg-[#094c73] active:bg-[#073c5b] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <span>Read & Review on Google</span>
                <ExternalLink className="w-4 h-4 text-[#C9A66B]" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
