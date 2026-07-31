import React from 'react';
import { ShieldCheck, HeartHandshake, MapPin, Award, Sparkles } from 'lucide-react';
import { useScrollReveal, useStaggerReveal } from '../../hooks';

interface AboutUsViewProps {
  onOpenPlanHoliday: () => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onOpenPlanHoliday }) => {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <div id="about-us" className="py-20 md:py-24 bg-white">
      <div
        ref={ref}
        className={`container-center space-y-24 ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        {/* Hero Section - Image Left, Content Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-card">
              <img
                src="https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=1000"
                alt="Victoria Falls Mosi-oa-Tunya"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                <p className="font-serif italic text-sm sm:text-base">
                  "Travel with confidence. Experience Mosi-oa-Tunya through genuine Zimbabwean eyes."
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Zimbabwe's Dedicated Travel Partner</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-[#0B5E8E] leading-tight">
              Bridging Natural Wonder with Local Heart
            </h2>

            <div className="space-y-4 max-w-xl">
              <p className="text-[#2F3A44] text-sm sm:text-base leading-relaxed">
                Outbound Holidays was founded in Victoria Falls, Zimbabwe, with a simple yet profound mission: to enable travelers from across Zimbabwe and the world to experience the majesty of Mosi-oa-Tunya with absolute confidence.
              </p>

              <p className="text-[#2F3A44] text-sm sm:text-base leading-relaxed">
                We eliminate travel anxiety by offering transparent pricing, curated lodge partnerships, and on-the-ground Zimbabwean concierges who ensure every detail—from airport pickup to sunset river cruises—is handled flawlessly.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
              <div>
                <span className="block text-2xl font-bold text-[#0B5E8E] font-serif">10+ Years</span>
                <span className="text-sm text-gray-500 font-medium">Local Experience</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#3F6B3C] font-serif">12,000+</span>
                <span className="text-sm text-gray-500 font-medium">Happy Travellers</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-[#E67E22] font-serif">4.9 &starf;</span>
                <span className="text-sm text-gray-500 font-medium">Google Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Outbound Promises */}
        <div className="bg-[#FAFAFA] p-8 sm:p-12 rounded-3xl border border-gray-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="section-label">Our Commitment</span>
            <h3 className="text-2xl font-bold font-serif text-[#0B5E8E]">The Outbound Holidays Promise</h3>
            <p className="text-xs text-gray-600 mt-2">Four pillars that define every itinerary we craft</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Verified Partners',
                desc: 'We only recommend hotels and guides we personally inspect and know intimately.',
                icon: <ShieldCheck className="w-6 h-6" />,
                color: '#0B5E8E',
              },
              {
                title: 'Transparent Pricing',
                desc: 'No hidden resort fees or surprise levies. You see exact itemized costs before booking.',
                icon: <Award className="w-6 h-6" />,
                color: '#3F6B3C',
              },
              {
                title: '24/7 On-Ground Concierge',
                desc: 'Our Victoria Falls office team is available around the clock while you are traveling.',
                icon: <MapPin className="w-6 h-6" />,
                color: '#E67E22',
              },
              {
                title: 'Authentic Impact',
                desc: 'Every booking directly supports local Zimbabwean safari rangers and artisans.',
                icon: <HeartHandshake className="w-6 h-6" />,
                color: '#C9A66B',
              },
            ].map((pillar, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200/80 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ color: pillar.color, backgroundColor: `${pillar.color}12` }}>
                  {pillar.icon}
                </div>
                <h4 className="font-bold text-sm text-[#0B5E8E] mb-2 font-serif">{pillar.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-[#0B5E8E] text-white p-10 sm:p-14 rounded-3xl space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold font-serif">Ready to Experience Victoria Falls?</h3>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Speak with our local travel team today for a free planning consultation and personalized itinerary quote.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenPlanHoliday}
              className="inline-flex items-center gap-2 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-7 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Plan My Holiday Now
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
