import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';

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
    <section className="bg-[#0B5E8E] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-white/10">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex p-3 rounded-full bg-white/10 text-[#C9A66B]">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold font-serif">
          Join the Cultural Collector Circle
        </h2>

        <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-sans">
          Subscribe for early access to new African art arrivals, exclusive Victoria Falls travel packages, and inspiring stories from master sculptors and weavers.
        </p>

        {subscribed ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md mx-auto space-y-2">
            <div className="w-10 h-10 bg-[#3F6B3C] rounded-full flex items-center justify-center mx-auto text-white">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Welcome to the Circle!</h3>
            <p className="text-xs text-white/90">
              Use promo code <strong className="text-[#C9A66B] font-extrabold">OUTBOUND10</strong> for 10% off your first artwork or travel package.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-[#2F3A44] py-3.5 pl-10 pr-4 rounded-md text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C9A66B] placeholder-gray-400 font-medium"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-md transition-colors shadow-md whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
