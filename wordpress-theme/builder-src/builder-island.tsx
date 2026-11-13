import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { X, ArrowRight, ArrowLeft, Check, CalendarCheck, Sparkles } from 'lucide-react';

interface StayTier {
  id: string;
  name: string;
  tagline: string;
  startingPrice: number;
}

interface BuilderActivity {
  id: string;
  title: string;
  duration: string;
  priceAmount: number;
  image?: string;
}

interface BuilderDataPayload {
  restEndpoint: string;
  nonce: string;
  whatsappNumber: string;
  logoUrl: string;
  stayTiers: StayTier[];
  activities: BuilderActivity[];
  packages: Array<{ id: string; title: string; duration: string; priceUSD: number; category: string }>;
  accommodations: Array<{ id: string; name: string; priceFromUSD: number; categoryId: string }>;
  turnstileSiteKey?: string;
}

declare global {
  interface Window {
    OUTBOUND_BUILDER_DATA?: BuilderDataPayload;
  }
}

const DEFAULT_DATA: BuilderDataPayload = {
  restEndpoint: '/wp-json/outbound/v1/enquiries',
  nonce: '',
  whatsappNumber: '263714701721',
  logoUrl: '',
  stayTiers: [
    { id: 'smart-value', name: 'Smart Value Guest Houses & Town Stays', tagline: 'Clean comfort near town', startingPrice: 145 },
    { id: 'comfort-plus', name: 'Comfort Plus Hotels & Lodges', tagline: 'Signature Victoria Falls hospitality', startingPrice: 235 },
    { id: 'premium-escape', name: 'Luxury River & Bush Sanctuaries', tagline: 'Zambezi frontage & suites', startingPrice: 520 },
    { id: 'family-villa', name: 'Family Apartments & Villas', tagline: 'Multi-room self-catering stays', startingPrice: 195 },
  ],
  activities: [
    { id: 'act-guided-falls', title: 'Guided Tour of the Victoria Falls', duration: '2.5 Hours', priceAmount: 45 },
    { id: 'act-sunset-cruise', title: 'Zambezi Sunset Boat Cruise', duration: '3 Hours', priceAmount: 65 },
    { id: 'act-helicopter', title: '15-Minute Flight of Angels Helicopter', duration: '15 Mins', priceAmount: 165 },
    { id: 'act-chobe', title: 'Chobe Full Day Safari (Botswana)', duration: 'Full Day', priceAmount: 195 },
    { id: 'act-boma', title: 'The Boma Dinner & Drum Show', duration: 'Evening', priceAmount: 65 },
    { id: 'act-bungee', title: 'Victoria Falls Bridge Bungee Jump', duration: '2 Hours', priceAmount: 168 },
  ],
  packages: [],
  accommodations: [],
};

const HolidayBuilderIsland: React.FC = () => {
  const data = window.OUTBOUND_BUILDER_DATA || DEFAULT_DATA;
  const stayTiers = data.stayTiers.length > 0 ? data.stayTiers : DEFAULT_DATA.stayTiers;
  const activities = data.activities.length > 0 ? data.activities : DEFAULT_DATA.activities;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Party & Nights, 2: Accommodation Tier, 3: Activities, 4: Logistics & Contact
  const [tripIntent, setTripIntent] = useState('first-time');
  const [partyType, setPartyType] = useState('couple');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [nights, setNights] = useState(3);
  const [travelSeason, setTravelSeason] = useState('flexible');
  const [stayTierId, setStayTierId] = useState(stayTiers[1]?.id || stayTiers[0].id);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([
    activities[0]?.id,
    activities[1]?.id,
  ].filter(Boolean));
  const [transportType, setTransportType] = useState('private-transfers');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultRef, setResultRef] = useState<string | null>(null);
  const [preselectedLabel, setPreselectedLabel] = useState<string | null>(null);

  useEffect(() => {
    const handler = (ev: Event) => {
      const custom = ev as CustomEvent<{ packageSlug?: string; activitySlug?: string; staySlug?: string }>;
      const detail = custom.detail || {};
      if (detail.activitySlug && activities.some((a) => a.id === detail.activitySlug)) {
        setSelectedActivityIds((prev) => (prev.includes(detail.activitySlug!) ? prev : [...prev, detail.activitySlug!]));
        setPreselectedLabel(`Added activity: ${detail.activitySlug}`);
      }
      if (detail.packageSlug) {
        setPreselectedLabel(`Customising package: ${detail.packageSlug}`);
      }
      if (detail.staySlug) {
        setPreselectedLabel(`Preferred property: ${detail.staySlug}`);
      }
      setResultRef(null);
      setErrorMsg(null);
      setStep(1);
      setIsOpen(true);
    };

    window.addEventListener('outbound:openBuilder', handler);
    return () => window.removeEventListener('outbound:openBuilder', handler);
  }, [activities]);

  const estimate = useMemo(() => {
    const tier = stayTiers.find((t) => t.id === stayTierId) || stayTiers[0];
    const stayRate = Number(tier?.startingPrice || 220);
    const rooms = Math.max(1, Math.ceil((adults + children) / 2));
    const actTotal = activities
      .filter((a) => selectedActivityIds.includes(a.id))
      .reduce((acc, a) => acc + Number(a.priceAmount || 0), 0);
    const transportCost = transportType === 'private-transfers' ? 120 : transportType === 'shared-shuttle' ? 60 : 0;
    const minUSD = Math.round(stayRate * nights * rooms + actTotal * (adults + children * 0.8) + transportCost);
    const maxUSD = Math.round(minUSD * 1.18);
    return { minUSD, maxUSD, rooms };
  }, [stayTiers, stayTierId, adults, children, nights, activities, selectedActivityIds, transportType]);

  const toggleActivity = (id: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(data.restEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'holiday-builder',
          tripIntent,
          partyType,
          adultsCount: adults,
          kidsCount: children,
          nightsCount: nights,
          travelSeason,
          stayTierId,
          selectedActivityIds,
          transportType,
          fullName,
          email,
          phone,
          notes: preselectedLabel ? `${preselectedLabel}\n${notes}`.trim() : notes,
          marketingConsent,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || 'Could not submit holiday plan. Please check fields and retry.');
      } else {
        setResultRef(json.referenceCode || 'OH-CONFIRMED');
      }
    } catch {
      setErrorMsg('Network error submitting enquiry. You can still send via WhatsApp directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const waSummary = encodeURIComponent(
    `Hi Outbound Holidays, my custom Victoria Falls plan (${nights} nights, ${adults}A/${children}C, est. $${estimate.minUSD}-$${estimate.maxUSD} USD). Ref: ${resultRef || 'Draft'}.`,
  );

  return (
    <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF9F6] w-full max-w-4xl rounded-3xl shadow-2xl border border-[#C9A66B]/40 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#0D2833] text-white px-6 py-4 flex items-center justify-between border-b border-[#C9A66B]/30">
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-[#C9A66B]" />
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-none">Victoria Falls Holiday Builder</h2>
              <p className="text-[11px] text-[#E5C989] mt-1">
                {resultRef ? `Enquiry Logged • ${resultRef}` : `Step ${step} of 4 • Guide Est. $${estimate.minUSD.toLocaleString()}–$${estimate.maxUSD.toLocaleString()} USD`}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Close Holiday Builder" className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto space-y-6">
          {preselectedLabel && !resultRef && (
            <div className="px-4 py-2.5 rounded-xl bg-[#0B5E8E]/10 text-[#0B5E8E] text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{preselectedLabel}</span>
            </div>
          )}

          {resultRef ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#3F6B3C]/15 text-[#3F6B3C] flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#0D2833]">Your Victoria Falls Plan is Logged!</h3>
              <p className="text-sm text-gray-600 max-w-lg mx-auto">
                Enquiry Reference <strong className="text-[#0B5E8E]">{resultRef}</strong> has been saved to our Victoria Falls specialist desk. Estimated guide budget: <strong>${estimate.minUSD.toLocaleString()}–${estimate.maxUSD.toLocaleString()} USD</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a href={`https://wa.me/${data.whatsappNumber}?text=${waSummary}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold">
                  Fast-Track on WhatsApp
                </a>
                <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 rounded-xl bg-[#0D2833] text-white text-xs font-bold cursor-pointer">
                  Back to Website
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="font-serif text-2xl font-bold text-[#0D2833]">1. Party Size, Stay Length &amp; Timing</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['couple', 'family', 'friends', 'solo'] as const).map((pt) => (
                      <button type="button" key={pt} onClick={() => setPartyType(pt)}
                        className={`p-3 rounded-xl border text-xs font-bold capitalize cursor-pointer ${partyType === pt ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]' : 'bg-white text-[#0D2833] border-gray-200'}`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="block bg-white p-4 rounded-xl border border-gray-200 text-xs font-bold">
                      Adults
                      <input type="number" min={1} max={20} value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </label>
                    <label className="block bg-white p-4 rounded-xl border border-gray-200 text-xs font-bold">
                      Children (u/12)
                      <input type="number" min={0} max={15} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value)))} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </label>
                    <label className="block bg-white p-4 rounded-xl border border-gray-200 text-xs font-bold">
                      Nights in Victoria Falls
                      <input type="number" min={1} max={14} value={nights} onChange={(e) => setNights(Math.max(1, Number(e.target.value)))} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block bg-white p-4 rounded-xl border border-gray-200 text-xs font-bold">
                      Trip Focus
                      <select value={tripIntent} onChange={(e) => setTripIntent(e.target.value)} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option value="first-time">First Time in Victoria Falls</option>
                        <option value="safari-falls">Falls + Chobe / Hwange Safari</option>
                        <option value="luxury-romance">Honeymoon / River Sanctuary</option>
                        <option value="family-adventure">Family Adventure</option>
                      </select>
                    </label>
                    <label className="block bg-white p-4 rounded-xl border border-gray-200 text-xs font-bold">
                      Preferred Season / Month
                      <input type="text" value={travelSeason} onChange={(e) => setTravelSeason(e.target.value)} placeholder="e.g. July / Flexible" className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold text-[#0D2833]">2. Choose Accommodation Style ({estimate.rooms} room/s estimated)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stayTiers.map((tier) => (
                      <button type="button" key={tier.id} onClick={() => setStayTierId(tier.id)}
                        className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${stayTierId === tier.id ? 'bg-[#0B5E8E] text-white border-[#0B5E8E] shadow-md' : 'bg-white text-[#0D2833] border-gray-200 hover:border-[#0B5E8E]'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <strong className="font-serif text-lg block">{tier.name}</strong>
                          <span className={`text-xs font-extrabold ${stayTierId === tier.id ? 'text-[#E5C989]' : 'text-[#0B5E8E]'}`}>~${tier.startingPrice}/night</span>
                        </div>
                        <p className={`text-xs mt-1.5 ${stayTierId === tier.id ? 'text-white/85' : 'text-gray-500'}`}>{tier.tagline}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold text-[#0D2833]">3. Tick Experiences You Would Love Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activities.map((act) => {
                      const checked = selectedActivityIds.includes(act.id);
                      return (
                        <button type="button" key={act.id} onClick={() => toggleActivity(act.id)}
                          className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer ${checked ? 'bg-[#0D2833] text-white border-[#0D2833]' : 'bg-white text-[#0D2833] border-gray-200'}`}>
                          <div>
                            <strong className="text-sm block">{act.title}</strong>
                            <span className={`text-xs ${checked ? 'text-[#E5C989]' : 'text-gray-500'}`}>{act.duration} • ${act.priceAmount} pp</span>
                          </div>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${checked ? 'bg-[#C9A66B] text-[#0D2833]' : 'bg-gray-100 text-gray-500'}`}>
                            {checked ? '✓' : '+'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="font-serif text-2xl font-bold text-[#0D2833]">4. Transfers &amp; Specialist Quote Delivery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'private-transfers', label: 'Private Airport & Activity Transfers (+$120)' },
                      { id: 'shared-shuttle', label: 'Shared Lodge Transfers (+$60)' },
                      { id: 'self-drive', label: 'Own Transport / None ($0)' },
                    ].map((tr) => (
                      <button type="button" key={tr.id} onClick={() => setTransportType(tr.id)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left cursor-pointer ${transportType === tr.id ? 'bg-[#0B5E8E] text-white border-[#0B5E8E]' : 'bg-white text-[#0D2833] border-gray-200'}`}>
                        {tr.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" required placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm" />
                    <input type="email" required placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm" />
                    <input type="text" placeholder="WhatsApp / Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm" />
                  </div>
                  <textarea rows={3} placeholder="Any lodge preferences, flight dates, or dietary/celebration notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm" />
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} />
                    <span>Also send me seasonal Victoria Falls Travel Club updates (double opt-in).</span>
                  </label>
                  {errorMsg && <p className="text-xs font-bold text-red-700 bg-red-50 p-3 rounded-xl">{errorMsg}</p>}
                </div>
              )}

              {/* Footer Nav Controls */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep((s) => s - 1)} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#0D2833] inline-flex items-center gap-1.5 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button type="button" onClick={() => setStep((s) => s + 1)} className="px-6 py-3 rounded-xl bg-[#0B5E8E] hover:bg-[#094c73] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="px-7 py-3 rounded-xl bg-[#3F6B3C] hover:bg-[#31542e] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer disabled:opacity-60">
                    {submitting ? 'Saving Your Plan...' : 'Submit Holiday Plan'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const mountEl = document.getElementById('outbound-holiday-builder-root');
if (mountEl) {
  createRoot(mountEl).render(<HolidayBuilderIsland />);
}
