import React from 'react';
import { Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { Check, ArrowRight, ShieldCheck, Sparkles, Crown } from 'lucide-react';

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
      name: 'Smart Value',
      icon: <ShieldCheck className="w-5 h-5 text-[#0D5C75]" />,
      tagline: 'Comfortable, memorable and carefully budgeted',
      priceRangeUSD: 650,
      priceLabel: `From ${formatPrice(650)} per person`,
      idealFor: 'First-time visitors & smart budget travellers',
      stayLevel: '3-Star Boutique Lodge / Safari Chalet',
      experiences: [
        'Guided Rainforest Falls Tour',
        'Zambezi Sundowner Cruise',
        'Airport Transfers & Park Fees',
      ],
      badge: 'Popular Value',
    },
    {
      id: 'signature-comfort',
      name: 'Signature Comfort',
      icon: <Sparkles className="w-5 h-5 text-[#D97706]" />,
      tagline: 'Prime locations and a balanced range of experiences',
      priceRangeUSD: 1250,
      priceLabel: `From ${formatPrice(1250)} per person`,
      idealFor: 'Couples, families & comfort seekers',
      stayLevel: '4-Star Luxury Lodge / Riverfront Hotel',
      experiences: [
        'All Smart Value Experiences',
        'Boma Traditional Dinner Feast',
        'Full-Day Chobe Safari (Botswana)',
      ],
      badge: 'Recommended',
    },
    {
      id: 'premium-escape',
      name: 'Premium Escape',
      icon: <Crown className="w-5 h-5 text-[#0D5C75]" />,
      tagline: 'Exceptional accommodation and private experiences',
      priceRangeUSD: 2150,
      priceLabel: `From ${formatPrice(2150)} per person`,
      idealFor: 'Honeymooners, luxury escapes & VIP milestones',
      stayLevel: '5-Star Ultra-Luxury River Suite / Villa',
      experiences: [
        'Flight of Angels Helicopter Flight',
        'Private Zambezi Pontoon Dining',
        'All-Inclusive Meals & Premium Beverages',
      ],
      badge: 'VIP Luxury',
    },
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-widest block mb-1">
            Transparent Pricing Guidance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0D5C75] mb-2">
            What kind of holiday fits your budget?
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Understand exactly what each travel tier offers before planning your itinerary.
          </p>
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
                    Typical 3-4 day package cost
                  </span>
                </div>

                <div className="space-y-3 text-xs text-gray-700 mb-6">
                  <div>
                    <strong className="block text-[#1A2E35] text-[11px] uppercase tracking-wider mb-0.5">
                      Ideal Traveller:
                    </strong>
                    <span>{tier.idealFor}</span>
                  </div>

                  <div>
                    <strong className="block text-[#1A2E35] text-[11px] uppercase tracking-wider mb-0.5">
                      Accommodation Level:
                    </strong>
                    <span>{tier.stayLevel}</span>
                  </div>

                  <div>
                    <strong className="block text-[#1A2E35] text-[11px] uppercase tracking-wider mb-1">
                      Key Inclusions:
                    </strong>
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
                <span>See what this budget can create</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
