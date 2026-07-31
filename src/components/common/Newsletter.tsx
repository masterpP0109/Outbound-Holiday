import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../../hooks';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { ref, isVisible } = useScrollReveal(0.1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-16 md:py-20">
      <div
        ref={ref}
        className={`container-center ${isVisible ? 'animate-reveal visible' : 'animate-reveal'}`}
      >
        <div className="bg-[#0B5E8E] rounded-3xl p-8 md:p-12 lg:p-16 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex p-2.5 rounded-full bg-white/10 text-[#C9A66B] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif mb-3">
                Join the Cultural Collector Circle
              </h2>
              <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed">
                Subscribe for early access to new African art arrivals, exclusive Victoria Falls travel packages, and inspiring stories from master sculptors and weavers.
              </p>
            </div>

            <div className="lg:col-span-6">
              {subscribed ? (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl space-y-3 text-center lg:text-left">
                  <div className="w-10 h-10 bg-[#3F6B3C] rounded-full flex items-center justify-center mx-auto lg:mx-0 text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg font-serif">Welcome to the Circle!</h3>
                  <p className="text-sm text-white/90">
                    Use promo code <strong className="text-[#C9A66B] font-extrabold">OUTBOUND10</strong> for 10% off your first artwork or travel package.
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
                      className="w-full bg-white/95 text-[#2F3A44] py-3.5 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B] placeholder-gray-400 font-medium"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
