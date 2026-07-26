import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  Sparkles, 
  UserCheck, 
  Award 
} from 'lucide-react';

export const WhyShopWithUs: React.FC = () => {
  const benefits = [
    {
      title: 'Authentic African Artwork',
      desc: '100% genuine pieces sourced directly from artists and official African craft co-operatives.',
      icon: <Award className="w-7 h-7 text-[#0B5E8E]" />,
    },
    {
      title: 'Secure Payments',
      desc: 'Bank-grade SSL encryption supporting Visa, Mastercard, Mobile Money, and PayPal.',
      icon: <Lock className="w-7 h-7 text-[#0B5E8E]" />,
    },
    {
      title: 'Worldwide Shipping',
      desc: 'Insured international express delivery in reinforced wooden safety crates.',
      icon: <Truck className="w-7 h-7 text-[#0B5E8E]" />,
    },
    {
      title: 'Handmade Products',
      desc: 'Every piece is uniquely hand-carved, handwoven, or hand-painted with artisanal passion.',
      icon: <Sparkles className="w-7 h-7 text-[#0B5E8E]" />,
    },
    {
      title: 'Verified Artists',
      desc: 'Fair-trade direct compensation ensuring artists receive true market value for their talent.',
      icon: <UserCheck className="w-7 h-7 text-[#0B5E8E]" />,
    },
    {
      title: 'Quality Guarantee',
      desc: '30-day money-back guarantee with free returns if an item does not match expectations.',
      icon: <ShieldCheck className="w-7 h-7 text-[#0B5E8E]" />,
    },
  ];

  return (
    <section id="art-why-us" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#3F6B3C] uppercase tracking-widest block mb-2">
            The Marketplace Promise
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0B5E8E] font-serif mb-3">
            Why Shop With Us?
          </h2>
          <p className="text-[#2F3A44] text-base">
            We bridge global art collectors with verified African creators through trust, authenticity, and seamless international shipping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex items-start gap-5"
            >
              <div className="p-3.5 rounded-xl bg-[#0B5E8E]/10 shrink-0">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#0B5E8E] mb-1.5">
                  {benefit.title}
                </h3>
                <p className="text-xs text-[#2F3A44] leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
