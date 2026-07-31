import React from 'react';
import { Star, Quote, CheckCircle2, MapPin } from 'lucide-react';

export const TravellerStories: React.FC = () => {
  const reviews = [
    {
      name: 'Tarisai & Farai M.',
      location: 'Harare, Zimbabwe',
      rating: 5,
      date: 'Visited June 2026',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      text: 'Outbound Holidays handled everything from our Victoria Falls airport pickup to the Boma dinner and helicopter tour. We didn’t have to stress about a single detail.',
      tripType: 'First-time Victoria Falls Trip',
    },
    {
      name: 'David & Sarah L.',
      location: 'London, United Kingdom',
      rating: 5,
      date: 'Visited May 2026',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      text: 'Having a local concierge team on WhatsApp while in Victoria Falls made all the difference. Fungai gave us honest advice on which activities were worth our money.',
      tripType: 'Honeymoon Package',
    },
    {
      name: 'The Ndlovu Family',
      location: 'Bulawayo, Zimbabwe',
      rating: 5,
      date: 'Visited April 2026',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      text: 'Traveling with three kids can be stressful, but the family-friendly itinerary was paced perfectly. The kids loved the sunset cruise and rainforest walk!',
      tripType: 'Family Getaway',
    },
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#D97706]/10 text-[#D97706] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Star className="w-3.5 h-3.5 fill-[#D97706]" />
            <span>4.9 ★ Google Rating • 120+ Verified Reviews</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75] mb-2">
            Why travellers choose Outbound Holidays
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Read how fellow Zimbabweans and international visitors experience Victoria Falls with our local specialist team.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between relative"
            >
              <div>
                <Quote className="w-8 h-8 text-[#D97706]/20 mb-3" />

                <div className="flex items-center gap-1 text-[#D97706] mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D97706]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-normal italic mb-6">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <img
                  src={rev.photo}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#0D5C75]"
                />
                <div>
                  <h4 className="font-bold text-xs text-[#0D5C75] flex items-center gap-1">
                    <span>{rev.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3F6B3C]" />
                  </h4>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#D97706]" />
                    <span>{rev.location} • {rev.tripType}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
