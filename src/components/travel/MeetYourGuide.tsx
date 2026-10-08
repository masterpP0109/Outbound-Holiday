import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { getWhatsAppUrl } from '../../utils/whatsapp';
import React from 'react';
import { CheckCircle2,MessageSquare,PhoneCall } from 'lucide-react';

// Public image paths for experiences
let elephantExperienceImg: any;
registerContent(() => { elephantExperienceImg = editorialValue("travel/MeetYourGuide.elephantExperienceImg", {}); });

interface MeetYourGuideProps {
  onOpenConsultation: () => void;
}

export const MeetYourGuide: React.FC<MeetYourGuideProps> = ({ onOpenConsultation }) => {
  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Experience photo; replace with a verified team portrait when available. */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src={elephantExperienceImg}
                alt={editorial("travel/MeetYourGuide.text1")}
                className="w-full h-[380px] object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-white/40 shadow-lg text-[#1A2E35]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D5C75] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {editorial("travel/MeetYourGuide.text2")}</div>
                  <div>
                    <h4 className="font-bold text-xs text-[#0D5C75]">{editorial("travel/MeetYourGuide.text3")}</h4>
                    <p className="text-[11px] text-gray-600">{editorial("travel/MeetYourGuide.text4")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Conversational Pitch */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block">
              {editorial("travel/MeetYourGuide.text5")}</span>

            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#0D5C75] leading-tight">
              {editorial("travel/MeetYourGuide.text6")}</h2>

            <p className="text-gray-700 text-xs sm:text-base leading-relaxed">
              {editorial("travel/MeetYourGuide.text7")}</p>

            <p className="text-xs sm:text-sm font-semibold text-[#0D5C75] bg-[#0D5C75]/5 p-3 rounded-lg border-l-4 border-[#D97706]">
              {editorial("travel/MeetYourGuide.text8")}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {editorialValue("travel/MeetYourGuide.section1", {}).map((item, idx) => (
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
                <span>{editorial("travel/MeetYourGuide.text12")}</span>
              </button>

              <a
                href={getWhatsAppUrl(editorialFormat("travel/MeetYourGuide.copy1"))}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-md transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{editorial("travel/MeetYourGuide.text13")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
