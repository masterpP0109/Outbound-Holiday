import React, { useState } from 'react';
import { Mail, Check, Compass } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="bg-[#0B5E8E] text-white py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto bg-white/10 backdrop-blur-md rounded-[28px] p-8 sm:p-12 border border-white/15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Text Content (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-3 text-left">
            <div className="inline-flex items-center gap-2 text-[#C9A66B] text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#E67E22]" />
              <span>Victoria Falls Travel Club</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Stay Connected With Victoria Falls
            </h2>
            <p className="text-white/85 text-xs sm:text-sm max-w-xl leading-relaxed">
              Subscribe for exclusive seasonal lodge discounts, early access to festive Victoria Falls packages, and local insider tips from our Zimbabwean travel team.
            </p>
          </div>

          {/* Form Content (5 cols on desktop) */}
          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="bg-white/15 border border-white/20 p-5 rounded-2xl space-y-2 text-center">
                <div className="w-10 h-10 bg-[#3F6B3C] rounded-full flex items-center justify-center mx-auto text-white">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">Welcome to Outbound Holidays!</h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Check your email for your complimentary Victoria Falls Travel Guidebook and $50 voucher toward your first holiday package.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-[#2F3A44] py-3.5 pl-10 pr-4 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B] placeholder-gray-400 font-medium"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>

                <button
                  type="submit"
                  className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-colors shadow-md whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
