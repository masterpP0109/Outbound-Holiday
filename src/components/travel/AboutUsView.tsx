import React from 'react';
import { ShieldCheck, HeartHandshake, MapPin, Award, CheckCircle, Sparkles, PhoneCall } from 'lucide-react';

interface AboutUsViewProps {
  onOpenPlanHoliday: () => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onOpenPlanHoliday }) => {
  return (
    <div id="about-us" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Zimbabwe's Dedicated Travel Partner</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[#0B5E8E] leading-tight">
              Bridging Natural Wonder with Local Heart
            </h2>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Outbound Holidays was founded in Victoria Falls, Zimbabwe, with a simple yet profound mission: to enable travelers from across Zimbabwe and the world to experience the majesty of Mosi-oa-Tunya with absolute confidence.
            </p>

            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              We eliminate travel anxiety by offering transparent pricing, curated lodge partnerships, and on-the-ground Zimbabwean concierges who ensure every detail—from airport pickup to sunset river cruises—is handled flawlessly.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
              <div>
                <span className="block text-2xl font-bold text-[#0B5E8E] font-serif">10+ Years</span>
                <span className="text-gray-500 font-semibold">Local Experience</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#3F6B3C] font-serif">12,000+</span>
                <span className="text-gray-500 font-semibold">Happy Travellers</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#E67E22] font-serif">4.9 ★</span>
                <span className="text-gray-500 font-semibold">Google Rating</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=1000"
                alt="Victoria Falls Mosi-oa-Tunya"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <p className="font-serif italic text-xs sm:text-sm">
                  "Travel with confidence. Experience Mosi-oa-Tunya through genuine Zimbabwean eyes."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Outbound Promises */}
        <div className="bg-[#FAFAFA] p-8 sm:p-12 rounded-3xl border border-gray-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold font-serif text-[#0B5E8E]">The Outbound Holidays Promise</h3>
            <p className="text-xs text-gray-600 mt-1">Four pillars that define every itinerary we craft</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Verified Partners',
                desc: 'We only recommend hotels and guides we personally inspect and know intimately.',
                icon: <ShieldCheck className="w-6 h-6 text-[#0B5E8E]" />,
              },
              {
                title: 'Transparent Pricing',
                desc: 'No hidden resort fees or surprise levies. You see exact itemized costs before booking.',
                icon: <Award className="w-6 h-6 text-[#3F6B3C]" />,
              },
              {
                title: '24/7 On-Ground Concierge',
                desc: 'Our Victoria Falls office team is available around the clock while you are traveling.',
                icon: <MapPin className="w-6 h-6 text-[#E67E22]" />,
              },
              {
                title: 'Authentic Impact',
                desc: 'Every booking directly supports local Zimbabwean safari rangers and art artisans.',
                icon: <HeartHandshake className="w-6 h-6 text-[#C9A66B]" />,
              },
            ].map((pillar, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div className="p-3 bg-gray-50 rounded-xl inline-block mb-3">{pillar.icon}</div>
                <h4 className="font-bold text-sm text-[#0B5E8E] mb-1">{pillar.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#0B5E8E] text-white p-8 sm:p-12 rounded-3xl space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif">Ready to Experience Victoria Falls?</h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
            Speak with our local travel team today for a free planning consultation and personalized itinerary quote.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={onOpenPlanHoliday}
              className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-7 py-3 rounded-md shadow-md"
            >
              Plan My Holiday Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
