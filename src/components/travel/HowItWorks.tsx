import React, { useState, useRef } from 'react';
import { ClipboardList, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

interface HowItWorksProps {
  onStartPlanning: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartPlanning }) => {
  const [activeStep, setActiveStep] = useState(0);
  const { ref, isVisible } = useScrollReveal(0.1);
  const staggerRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      num: '01',
      title: 'Tell Us About Your Trip',
      desc: 'Use our 3-minute Holiday Builder\u2122 to specify your travel dates, party size, preferred comfort tier, and must-see activities.',
      icon: <ClipboardList className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800',
    },
    {
      num: '02',
      title: 'Receive Personalised Plan',
      desc: 'Get an immediate estimated budget and custom itinerary breakdown tailored to your dates and preferences.',
      icon: <Sparkles className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1469854523086-cc02e5f4f009?auto=format&fit=crop&q=80&w=800',
    },
    {
      num: '03',
      title: 'Finalise With Local Specialist',
      desc: 'Connect via WhatsApp or phone with a Victoria Falls travel concierge to refine details, confirm availability, and secure your deposit.',
      icon: <UserCheck className="w-6 h-6" />,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-white">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="section-label">Seamless & Stress-Free</span>
          <h2 className="section-heading text-[#0B5E8E]">
            How Outbound Holidays Works
          </h2>
          <p className="text-[#2F3A44] text-base sm:text-lg mx-auto">
            We simplify travel planning into three effortless steps—guided by genuine Zimbabwean hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
          {/* Step Tabs */}
          <div className="lg:col-span-4 space-y-4">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-500 group ${
                  activeStep === idx
                    ? 'bg-[#0B5E8E] border-[#0B5E8E] text-white shadow-card'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-[#2F3A44]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    activeStep === idx
                      ? 'bg-white/20 text-white'
                      : 'bg-[#0B5E8E]/10 text-[#0B5E8E]'
                  }`}>
                    {step.icon}
                  </div>
                  <div>
                    <span className={`text-2xl font-extrabold font-serif block mb-1 ${
                      activeStep === idx ? 'text-white/60' : 'text-gray-300'
                    }`}>
                      {step.num}
                    </span>
                    <h3 className={`font-bold text-base mb-1 transition-colors ${
                      activeStep === idx ? 'text-white' : 'text-[#0B5E8E]'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${
                      activeStep === idx ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Step Showcase */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-card">
            <div key={steps[activeStep].num} className="relative h-72 sm:h-80 md:h-96 overflow-hidden">
              <img
                src={steps[activeStep].image}
                alt={steps[activeStep].title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B5E8E]/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 sm:left-8 text-white">
                <span className="inline-block bg-[#C9A66B] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg mb-2">
                  Step {steps[activeStep].num}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif">
                  {steps[activeStep].title}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onStartPlanning}
            className="inline-flex items-center gap-2 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span>Start Building My Holiday</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-gray-500 mt-3 font-medium">
            Complimentary consultation &bull; Zero obligation to book
          </p>
        </div>
      </div>
    </section>
  );
};
