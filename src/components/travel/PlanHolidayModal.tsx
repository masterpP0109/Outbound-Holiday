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

  // Form State
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

  // Estimated budget calculator
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B5E8E] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E67E22]" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Plan My Victoria Falls Holiday</h3>
              <p className="text-xs text-white/80">Tailored by Zimbabwe's trusted local travel specialists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {!submitted && (
          <div className="bg-gray-100 px-6 py-2 border-b border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-600">
            <span className={step >= 1 ? 'text-[#0B5E8E] font-bold' : ''}>1. Party & Style</span>
            <span>&rarr;</span>
            <span className={step >= 2 ? 'text-[#0B5E8E] font-bold' : ''}>2. Experiences</span>
            <span>&rarr;</span>
            <span className={step >= 3 ? 'text-[#0B5E8E] font-bold' : ''}>3. Custom Quote & Contact</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#0B5E8E]">Inquiry Received!</h3>
              <p className="text-sm text-[#2F3A44] max-w-md mx-auto">
                Thank you, <strong className="text-[#0B5E8E]">{fullName || 'Valued Guest'}</strong>. Our senior Zimbabwean travel concierge will review your preferences and email your custom itinerary quote within 2 hours.
              </p>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-gray-200 text-left text-xs text-gray-700 space-y-1.5 max-w-md mx-auto">
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
                className="mt-4 bg-[#E67E22] text-white font-bold text-sm px-6 py-2.5 rounded-md hover:bg-[#d67118]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Party & Budget */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-2">
                      Who is traveling?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'couple', label: 'Couple / Romance' },
                        { id: 'family', label: 'Family with Kids' },
                        { id: 'group', label: 'Group of Friends' },
                        { id: 'solo', label: 'Solo Traveler' },
                      ].map((type) => (
                        <button
                          type="button"
                          key={type.id}
                          onClick={() => setTravelerType(type.id as any)}
                          className={`p-3 rounded-lg border text-xs font-bold transition-all ${
                            travelerType === type.id
                              ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-xs'
                              : 'bg-white border-gray-200 text-[#2F3A44] hover:border-gray-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Trip Duration (Days)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="14"
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-2">
                      Preferred Accommodation & Service Tier
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'comfort', label: 'Comfort & Value', desc: 'Clean 3★/4★ lodges & hotels' },
                        { id: 'luxury', label: '5★ Luxury Lodge', desc: 'Riverfront suites & full board' },
                        { id: 'ultra-luxury', label: 'Ultra Private Villa', desc: 'Private butler & helicopter' },
                      ].map((tier) => (
                        <button
                          type="button"
                          key={tier.id}
                          onClick={() => setBudgetTier(tier.id as any)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            budgetTier === tier.id
                              ? 'bg-[#0B5E8E]/10 border-[#0B5E8E] ring-2 ring-[#0B5E8E]'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="block text-xs font-bold text-[#0B5E8E]">{tier.label}</span>
                          <span className="block text-[10px] text-gray-500 mt-0.5">{tier.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-6 py-2.5 rounded-md flex items-center gap-1.5"
                    >
                      Next: Choose Experiences &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Add-on Experiences */}
              {step === 2 && (
                <div className="space-y-5">
                  <label className="block text-xs font-bold text-[#0B5E8E] uppercase tracking-wider mb-1">
                    Select Your Must-Have Activities
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Check the activities you want included in your custom travel quote:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Guided Rainforest Walk',
                      'Zambezi Sunset River Cruise',
                      '13-Min Helicopter Flight of Angels',
                      'The BOMA Dinner & Drum Show',
                      'Chobe National Park Day Trip',
                      'Devil’s Pool Swimming Excursion',
                      'Batoka Gorge Zipline & Swing',
                      'Hwange Safari 2-Night Extension',
                    ].map((addon) => {
                      const isSelected = selectedAddons.includes(addon);
                      return (
                        <button
                          type="button"
                          key={addon}
                          onClick={() => toggleAddon(addon)}
                          className={`p-3 rounded-lg border text-left flex items-center justify-between text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#3F6B3C]/10 border-[#3F6B3C] text-[#3F6B3C]'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>{addon}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#3F6B3C]" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 font-bold text-xs py-2 px-3 border border-gray-300 rounded-md"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-6 py-2.5 rounded-md flex items-center gap-1.5"
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
                  <div className="bg-[#0B5E8E]/10 border border-[#0B5E8E]/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#0B5E8E] font-bold block uppercase tracking-wider">
                        Estimated Custom Quote
                      </span>
                      <span className="text-2xl font-extrabold text-[#0B5E8E]">
                        ~${calculateEstimatedQuote()} USD
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Includes {durationDays} days for {guestCount} guests + {selectedAddons.length} activities
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-[#3F6B3C] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        Best Rate Guaranteed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ruvarashe Ndlovu"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Target Travel Date
                      </label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+263 77 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Special Requests or Questions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Honeymoon surprise, vegetarian meal preferences, dietary requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-gray-600 font-bold text-xs py-2 px-3 border border-gray-300 rounded-md"
                    >
                      &larr; Back
                    </button>
                    <button
                      type="submit"
                      className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm px-8 py-3 rounded-md shadow-md flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Holiday Request
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
