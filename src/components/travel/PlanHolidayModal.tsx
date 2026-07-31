import React, { useState } from 'react';
import { TravelPackage } from '../../types';
import { X, Check, Calendar, Users, DollarSign, Sparkles, Send, Plane, ShieldCheck } from 'lucide-react';

interface PlanHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPackage?: TravelPackage | null;
}

export const PlanHolidayModal: React.FC<PlanHolidayModalProps> = ({
  isOpen,
  onClose,
  preselectedPackage,
}) => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [travelerType, setTravelerType] = useState<'couple' | 'family' | 'group' | 'solo'>('couple');
  const [guestCount, setGuestCount] = useState(2);
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState<'comfort' | 'luxury' | 'ultra-luxury'>('luxury');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(
    preselectedPackage ? [preselectedPackage.title] : ['Guided Falls Walk', 'Zambezi Sunset Cruise']
  );
  const [travelDate, setTravelDate] = useState('2026-09-15');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const toggleAddon = (addon: string) => {
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addon));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateEstimatedQuote = () => {
    let basePerNight = budgetTier === 'comfort' ? 220 : budgetTier === 'luxury' ? 480 : 850;
    let subtotal = basePerNight * durationDays * guestCount;
    let addonsTotal = selectedAddons.length * 150 * guestCount;
    return Math.round(subtotal + addonsTotal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const travelerImages: Record<string, string> = {
    couple: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=600',
    family: 'https://images.unsplash.com/photo-1547471080-77a8b3014d23?auto=format&fit=crop&q=80&w=600',
    group: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600',
    solo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600',
  };

  const experienceImages: Record<string, string> = {
    'Guided Rainforest Walk': 'https://images.unsplash.com/photo-1614527961817-21789c629fb4?auto=format&fit=crop&q=80&w=400',
    'Zambezi Sunset River Cruise': 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=400',
    '13-Min Helicopter Flight of Angels': 'https://images.unsplash.com/photo-1469854523086-cc02e5f4f009?auto=format&fit=crop&q=80&w=400',
    'The BOMA Dinner & Drum Show': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=400',
    'Chobe National Park Day Trip': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=400',
    'Devil\'s Pool Swimming Excursion': 'https://images.unsplash.com/photo-1547471080-77a8b3014d23?auto=format&fit=crop&q=80&w=400',
    'Batoka Gorge Zipline & Swing': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=400',
    'Hwange Safari 2-Night Extension': 'https://images.unsplash.com/photo-1549472346-607ef3a33904?auto=format&fit=crop&q=80&w=400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {submitted ? (
          <div className="p-10 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#0B5E8E] font-serif">Inquiry Received!</h3>
            <p className="text-sm text-[#2F3A44] max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-[#0B5E8E]">{fullName || 'Valued Guest'}</strong>. Our senior Zimbabwean travel concierge will review your preferences and email your custom itinerary quote within 2 hours.
            </p>
            <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-gray-200 text-left text-xs text-gray-700 space-y-2 max-w-md mx-auto">
              <p><strong>Travelers:</strong> {guestCount} ({travelerType})</p>
              <p><strong>Duration:</strong> {durationDays} Days</p>
              <p><strong>Estimated Budget Range:</strong> ~${calculateEstimatedQuote()} USD total</p>
              <p><strong>Target Date:</strong> {travelDate}</p>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                onClose();
              }}
              className="bg-[#E67E22] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#d67118] transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-[#0B5E8E] text-white px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#E67E22]" />
                <div>
                  <h3 className="font-bold text-lg leading-tight font-serif">Plan My Victoria Falls Holiday</h3>
                  <p className="text-xs text-white/70">Tailored by Zimbabwe's trusted local travel specialists</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-600 shrink-0">
              <span className={step >= 1 ? 'text-[#0B5E8E] font-bold' : ''}>1. Party & Style</span>
              <span className="text-gray-300">&rarr;</span>
              <span className={step >= 2 ? 'text-[#0B5E8E] font-bold' : ''}>2. Experiences</span>
              <span className="text-gray-300">&rarr;</span>
              <span className={step >= 3 ? 'text-[#0B5E8E] font-bold' : ''}>3. Custom Quote & Contact</span>
            </div>

            {/* Form Body with Image */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                {/* Visual Side */}
                <div className="relative h-64 lg:h-full overflow-hidden bg-[#FAFAFA]">
                  {step === 1 && (
                    <img
                      src={travelerImages[travelerType]}
                      alt={travelerType}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  )}
                  {step === 2 && (
                    <div className="grid grid-cols-2 grid-rows-2 h-full">
                      {selectedAddons.slice(0, 4).map((addon, i) => (
                        <div key={i} className="relative overflow-hidden">
                          <img
                            src={experienceImages[addon] || experienceImages['Guided Rainforest Walk']}
                            alt={addon}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <span className="absolute bottom-2 left-2 text-white text-[10px] font-bold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                            {addon.split(' ').slice(0, 3).join(' ')}
                          </span>
                        </div>
                      ))}
                      {selectedAddons.length === 0 && (
                        <div className="flex items-center justify-center text-gray-400 text-sm col-span-2 row-span-2">
                          Select experiences to see visuals
                        </div>
                      )}
                    </div>
                  )}
                  {step === 3 && (
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
                      alt="Victoria Falls luxury lodge"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C9A66B] px-3 py-1 rounded-lg inline-block mb-2">
                      My Holiday Builder
                    </span>
                    <p className="text-sm font-semibold">
                      {travelerType === 'couple' ? 'Romantic getaway' :
                       travelerType === 'family' ? 'Family adventure' :
                       travelerType === 'group' ? 'Group exploration' : 'Solo journey'}
                      &bull; {guestCount} guests &bull; {durationDays} days &bull; {selectedAddons.length} experiences
                    </p>
                  </div>
                </div>

                {/* Interaction Side */}
                <div className="p-6 sm:p-8 overflow-y-auto">
                  {/* Step 1: Party & Style */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-3">
                          Who is traveling?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'couple', label: 'Couple / Romance', img: travelerImages.couple },
                            { id: 'family', label: 'Family with Kids', img: travelerImages.family },
                            { id: 'group', label: 'Group of Friends', img: travelerImages.group },
                            { id: 'solo', label: 'Solo Traveler', img: travelerImages.solo },
                          ].map((type) => (
                            <button
                              type="button"
                              key={type.id}
                              onClick={() => setTravelerType(type.id as any)}
                              className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center gap-3 ${
                                travelerType === type.id
                                  ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-md'
                                  : 'bg-white border-gray-200 text-[#2F3A44] hover:border-gray-300'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                                <img src={type.img} alt={type.label} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs font-bold block leading-tight">{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Number of Guests
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Trip Duration (Days)
                          </label>
                          <input
                            type="number"
                            min="2"
                            max="14"
                            value={durationDays}
                            onChange={(e) => setDurationDays(Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-3">
                          Preferred Accommodation & Service Tier
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'comfort', label: 'Comfort & Value', desc: 'Clean 3-4 star lodges' },
                            { id: 'luxury', label: '5 Star Luxury Lodge', desc: 'Riverfront suites & full board' },
                            { id: 'ultra-luxury', label: 'Ultra Private Villa', desc: 'Private butler & helicopter' },
                          ].map((tier) => (
                            <button
                              type="button"
                              key={tier.id}
                              onClick={() => setBudgetTier(tier.id as any)}
                              className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                                budgetTier === tier.id
                                  ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]'
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="block text-xs font-bold text-[#0B5E8E]">{tier.label}</span>
                              <span className="block text-[10px] text-gray-500 mt-1 leading-relaxed">{tier.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="inline-flex items-center gap-1.5 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-300"
                        >
                          Next: Choose Experiences &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Add-on Experiences */}
                  {step === 2 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-1">
                          Select Your Must-Have Activities
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                          Check the activities you want included in your custom travel quote:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          'Guided Rainforest Walk',
                          'Zambezi Sunset River Cruise',
                          '13-Min Helicopter Flight of Angels',
                          'The BOMA Dinner & Drum Show',
                          'Chobe National Park Day Trip',
                          'Devil\'s Pool Swimming Excursion',
                          'Batoka Gorge Zipline & Swing',
                          'Hwange Safari 2-Night Extension',
                        ].map((addon) => {
                          const isSelected = selectedAddons.includes(addon);
                          return (
                            <button
                              type="button"
                              key={addon}
                              onClick={() => toggleAddon(addon)}
                              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-300 ${
                                isSelected
                                  ? 'bg-[#3F6B3C]/10 border-[#3F6B3C] text-[#3F6B3C]'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-xs font-bold">{addon}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#3F6B3C]" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-4 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-gray-600 font-bold text-xs py-2.5 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          &larr; Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="inline-flex items-center gap-1.5 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-300"
                        >
                          Next: Contact & Quote &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Contact & Instant Dynamic Estimate */}
                  {step === 3 && (
                    <div className="space-y-5">
                      {/* Dynamic Estimate Card */}
                      <div className="bg-[#0B5E8E]/10 border border-[#0B5E8E]/30 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs text-[#0B5E8E] font-bold block uppercase tracking-wider mb-1">
                            Estimated Custom Quote
                          </span>
                          <span className="text-2xl font-extrabold text-[#0B5E8E]">
                            ~${calculateEstimatedQuote()} USD
                          </span>
                          <span className="text-xs text-gray-500 block">
                            Includes {durationDays} days for {guestCount} guests + {selectedAddons.length} activities
                          </span>
                        </div>
                        <div className="text-right hidden sm:block">
                          <span className="inline-block bg-[#3F6B3C] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">
                            Best Rate Guaranteed
                          </span>
                        </div>
                      </div>

                      {/* Selected Experience Summary */}
                      {selectedAddons.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedAddons.map((addon, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 bg-[#C9A66B]/10 text-[#0B5E8E] text-[10px] font-bold px-2.5 py-1 rounded-lg"
                            >
                              {addon}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ruvarashe Ndlovu"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Target Travel Date
                          </label>
                          <input
                            type="date"
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            Phone / WhatsApp Number
                          </label>
                          <input
                            type="tel"
                            placeholder="+263 77 000 0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Special Requests or Questions
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g., Honeymoon surprise, vegetarian meal preferences, dietary requirements..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] transition-all resize-none"
                        />
                      </div>

                      <div className="pt-4 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-gray-600 font-bold text-xs py-2.5 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          &larr; Back
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-7 py-2.5 rounded-xl transition-all duration-300"
                        >
                          <Send className="w-4 h-4" />
                          Submit Holiday Request
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
