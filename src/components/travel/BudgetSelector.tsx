import { editorial, editorialValue } from "../../runtime/catalog";
import React from 'react';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { Check,ArrowRight,ShieldCheck,Sparkles,Crown } from 'lucide-react';

interface BudgetSelectorProps {
  currency: Currency;
  onSelectBudgetStyle: (styleName: string) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  currency,
  onSelectBudgetStyle,
}) => {
  const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];

  const formatPrice = (usd: number) => {
    const val = Math.round(usd * rateObj.rate);
    return `${rateObj.symbol}${val.toLocaleString()}`;
  };

  const tiers = [
    {
      id: 'smart-value',
      name: editorial("travel/BudgetSelector.text1"),
      icon: <ShieldCheck className="w-5 h-5 text-[#0D5C75]" />,
      tagline: editorial("travel/BudgetSelector.text2"),
      priceRangeUSD: 650,
      priceLabel: `From ${formatPrice(650)} per person`,
      perfectFor: editorialValue("travel/BudgetSelector.section1", {}),
      stayLevel: '3-Star Boutique Lodge / Safari Chalet',
      experiences: editorialValue("travel/BudgetSelector.section2", {}),
      badge: 'Popular Value',
    },
    {
      id: 'signature-comfort',
      name: editorial("travel/BudgetSelector.text5"),
      icon: <Sparkles className="w-5 h-5 text-[#D97706]" />,
      tagline: editorial("travel/BudgetSelector.text6"),
      priceRangeUSD: 1250,
      priceLabel: `From ${formatPrice(1250)} per person`,
      perfectFor: editorialValue("travel/BudgetSelector.section3", {}),
      stayLevel: '4-Star Luxury Lodge / Riverfront Hotel',
      experiences: editorialValue("travel/BudgetSelector.section4", {}),
      badge: 'Recommended',
    },
    {
      id: 'premium-escape',
      name: editorial("travel/BudgetSelector.text10"),
      icon: <Crown className="w-5 h-5 text-[#0D5C75]" />,
      tagline: editorial("travel/BudgetSelector.text11"),
      priceRangeUSD: 2150,
      priceLabel: `From ${formatPrice(2150)} per person`,
      perfectFor: editorialValue("travel/BudgetSelector.section5", {}),
      stayLevel: '5-Star Ultra-Luxury River Suite / Villa',
      experiences: editorialValue("travel/BudgetSelector.section6", {}),
      badge: 'VIP Luxury',
    },
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
            {editorial("travel/BudgetSelector.text14")}</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75] mb-2">
            {editorial("travel/BudgetSelector.text15")}</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            {editorial("travel/BudgetSelector.text16")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#0D5C75]/10 transition-colors">
                    {tier.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[#D97706] bg-[#D97706]/10 px-2.5 py-0.5 rounded-full uppercase">
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif text-[#0D5C75] mb-1">
                  {tier.name}
                </h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  {tier.tagline}
                </p>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 mb-5">
                  <span className="text-lg font-bold text-[#0D5C75] block">
                    {tier.priceLabel}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {editorial("travel/BudgetSelector.text17")}</span>
                </div>

                <div className="space-y-3.5 text-xs text-gray-700 mb-6">
                  <div>
                    <strong className="block text-[#1A2E35] text-[11px] uppercase tracking-wider mb-1">
                      {editorial("travel/BudgetSelector.text18")}</strong>
                    <ul className="space-y-1">
                      {tier.perfectFor.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <Check className="w-3.5 h-3.5 text-[#3F6B3C] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <strong className="block text-[#1A2E35] text-[11px] uppercase tracking-wider mb-0.5">
                      {editorial("travel/BudgetSelector.text19")}</strong>
                    <span className="text-gray-600">{tier.stayLevel}</span>
                  </div>

                  <div>
                    <strong className="block text-[#1A2E35] text-[11px] uppercase tracking-wider mb-1">
                      {editorial("travel/BudgetSelector.text20")}</strong>
                    <ul className="space-y-1">
                      {tier.experiences.map((exp, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-gray-600">
                          <Check className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectBudgetStyle(tier.name)}
                className="w-full bg-[#0D5C75] hover:bg-[#0A485C] text-white font-bold text-xs py-3 rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <span>{editorial("travel/BudgetSelector.text21")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
