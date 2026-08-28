import React from 'react';
import { CheckCircle2, MessageSquare, PhoneCall } from 'lucide-react';

import furqalFounderImg from '../../assets/Experiences/Elephant Interaction_/elecrew-5.jpg';

interface MeetYourGuideProps {
  onOpenConsultation: () => void;
}

export const MeetYourGuide: React.FC<MeetYourGuideProps> = ({ onOpenConsultation }) => {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Authentic Team / Consultation Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src={furqalFounderImg}
                alt="Furqal - Lead Victoria Falls Travel Specialist at Outbound Holidays"
                className="w-full h-[380px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/40 shadow-lg text-[#1A2E35]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D5C75] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    FK
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#0D5C75]">Furqal & The Outbound Concierge Team</h4>
                    <p className="text-[11px] text-gray-600">On-ground in Victoria Falls, Zimbabwe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conversational Pitch */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block">
              Personal Travel Specialist
            </span>

            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#0D5C75] leading-tight">
              You don’t need to plan everything alone.
            </h2>

            <p className="text-gray-700 text-xs sm:text-base leading-relaxed">
              Planning a Victoria Falls holiday shouldn't feel overwhelming. With so many accommodation options, activities, and prices online, it's hard to know what truly suits your trip. Our local travel specialists take the guesswork away, helping you plan with confidence from your first enquiry to your return home.
            </p>

            <p className="text-xs sm:text-sm font-semibold text-[#0D5C75] bg-[#0D5C75]/5 p-3 rounded-lg border-l-4 border-[#D97706]">
              Trusted by families, couples, and adventure travellers planning unforgettable Victoria Falls holidays.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                'Honest, unbiased recommendations',
                'Carefully selected and verified suppliers',
                'Personal advice based on your budget',
                'Support before, during, and after your holiday',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="text-xs font-semibold text-[#1A2E35]">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenConsultation}
                className="bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-md shadow-md transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Talk to a Travel Specialist</span>
              </button>

              <a
                href="https://wa.me/263771234567?text=Hi%20Outbound%20Holidays%2C%20I%20would%20like%20to%20talk%20to%20a%20Victoria%20Falls%20travel%20specialist."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-md transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
