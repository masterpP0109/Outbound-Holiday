import React from 'react';
import { ClipboardList, Sparkles, UserCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartPlanning: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartPlanning }) => {
  const steps = [
    {
      num: '01',
      title: 'Tell Us About Your Trip',
      desc: 'Use our 3-minute Holiday Builder™ to specify your travel dates, party size, preferred comfort tier, and must-see activities.',
      icon: <ClipboardList className="w-6 h-6 text-[#0B5E8E]" />,
    },
    {
      num: '02',
      title: 'Receive Personalised Plan',
      desc: 'Get an immediate estimated budget and custom itinerary breakdown tailored to your dates and preferences.',
      icon: <Sparkles className="w-6 h-6 text-[#E67E22]" />,
    },
    {
      num: '03',
      title: 'Finalise With Local Specialist',
      desc: 'Connect via WhatsApp or phone with a Victoria Falls travel concierge to refine details, confirm availability, and secure your deposit.',
      icon: <UserCheck className="w-6 h-6 text-[#3F6B3C]" />,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0B5E8E] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Seamless & Stress-Free
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-3">
            How Outbound Holidays Works
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            We simplify travel planning into three effortless steps—guided by genuine Zimbabwean hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-xs p-7 rounded-2xl border border-white/15 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white text-[#0B5E8E] rounded-xl shadow-xs">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-extrabold font-serif text-[#C9A66B]/60">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onStartPlanning}
            className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-8 py-3.5 rounded-md shadow-lg inline-flex items-center gap-2 transition-all"
          >
            <span>Start Building My Holiday</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-white/70 mt-2 font-medium">
            Complimentary consultation • Zero obligation to book
          </p>
        </div>
      </div>
    </section>
  );
};
