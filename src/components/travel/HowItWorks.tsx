import React, { useState } from 'react';
import fallsTour1 from '../../assets/Experiences/Guided Tour of the Falls_/Tour-of-the-Falls-1-scaled.jpg';
import cruise1 from '../../assets/Experiences/Standard Cruise_/Standard-1-scaled.jpg';
import simunyeShow from '../../assets/Experiences/Simunye_/Simunye-Spirit-Of-Africa-31.jpg';
import { ClipboardList, Sparkles, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksProps {
  onStartPlanning: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartPlanning }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'Tell us about your trip',
      desc: 'Dates, party size, travel interests, and your approximate budget.',
      detail: 'Specify whether you want a weekend getaway or a 5-day safari combo. Our builder adapts to couples, families, or solo explorers.',
      imageUrl: fallsTour1,
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      num: '02',
      title: 'Receive personalised recommendations',
      desc: 'We create options that genuinely suit your travel style and expectations.',
      detail: 'Our intelligent concierge matches your stay tier with essential Victoria Falls activities, sunset river cruises, and safari extensions.',
      imageUrl: cruise1,
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      num: '03',
      title: 'Book with confidence',
      desc: 'We confirm availability, handle logistics, and support you on the ground.',
      detail: 'Connect directly with our local concierges in Victoria Falls via WhatsApp or email to lock in your booking effortlessly.',
      imageUrl: simunyeShow,
      icon: <UserCheck className="w-5 h-5" />,
    },
  ];

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7] border-b border-gray-200/60">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-2">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E] leading-tight mb-3">
            Planning your holiday is simple.
          </h2>
          <p className="text-sm sm:text-base text-[#2F3A44] leading-relaxed">
            Zero stress, no hidden surprises, guided by genuine Zimbabwean hospitality.
          </p>
        </div>

        {/* 3 Interactive Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 items-stretch">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveStep(idx)}
                className={`rounded-[24px] p-6 sm:p-8 cursor-pointer transition-all duration-500 flex flex-col justify-between border ${
                  isActive
                    ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-[0_20px_50px_rgba(11,94,142,0.22)] transform -translate-y-2 lg:scale-[1.03] z-10'
                    : 'bg-white text-[#2F3A44] border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-colors ${
                        isActive
                          ? 'bg-white text-[#0B5E8E]'
                          : 'bg-[#0B5E8E]/10 text-[#0B5E8E]'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`font-serif font-bold text-2xl tracking-tight ${
                        isActive ? 'text-[#C9A66B]' : 'text-gray-300'
                      }`}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3
                    className={`text-xl font-bold font-serif mb-2 leading-snug ${
                      isActive ? 'text-white' : 'text-[#0B5E8E]'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                      isActive ? 'text-white/90' : 'text-[#2F3A44]/80'
                    }`}
                  >
                    {step.desc}
                  </p>

                  {/* Active Preview Details & Supporting Image */}
                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-white/20 animate-fade-in space-y-3">
                      <p className="text-xs text-white/80 leading-relaxed italic">
                        "{step.detail}"
                      </p>
                      <div className="h-32 rounded-xl overflow-hidden relative border border-white/20">
                        <img
                          src={step.imageUrl}
                          alt={step.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A66B]" />
                            Step {step.num} Preview Active
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status / click prompt */}
                <div className="pt-6 mt-4 border-t border-gray-100/20 text-xs font-semibold flex items-center justify-between">
                  <span className={isActive ? 'text-[#C9A66B]' : 'text-gray-400'}>
                    {isActive ? 'Currently Viewing' : 'Click to preview step'}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-[#C9A66B] text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary CTA */}
        <div className="text-center">
          <button
            onClick={onStartPlanning}
            className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm sm:text-base px-10 py-4 rounded-xl shadow-lg hover:shadow-xl inline-flex items-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Start Planning with Confidence</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};
