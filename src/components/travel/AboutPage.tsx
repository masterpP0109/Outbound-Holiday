import { useState } from 'react';
import { BedDouble, Compass, MapPin, MessageCircle, Route, ShieldCheck, Trees, Truck, UserRound } from 'lucide-react';
import { PageLink } from '../common/PageLink';
import { clientGalleryImages } from '../../data/clientGalleryImages';
import { getWhatsAppUrl } from '../../utils/whatsapp';

// Replace this initials placeholder with /images/about/fungai-mtetwa.webp only after the owner verifies the portrait.
const founderImage = '/images/about/fungai-mtetwa-placeholder.svg';
const services = [
  { icon: BedDouble, title: 'Accommodation', copy: 'I help you compare location, facilities and room options against your budget, travel style and the people coming with you.' },
  { icon: Compass, title: 'Activities & Experiences', copy: 'Together we choose the experiences that suit your interests, rather than trying to fit everything into one trip.' },
  { icon: Truck, title: 'Transfers', copy: 'I can help organise airport transfers and the transport you need between the different parts of your holiday.' },
  { icon: Route, title: 'Itinerary Planning', copy: 'I put accommodation, activities and travel time into a practical order, with room to slow down and enjoy being here.' },
  { icon: Trees, title: 'Safari Extensions', copy: 'If a safari fits your plans, I can help you combine Victoria Falls with time in Hwange or Chobe.' },
];
const principles = [
  { icon: ShieldCheck, title: 'Honest Advice', copy: 'I recommend what makes sense for your trip. That may mean a simpler lodge, fewer activities or leaving something out altogether.' },
  { icon: MapPin, title: 'Local Knowledge', copy: 'Victoria Falls is home. My recommendations come from first-hand knowledge of the destination and more than nine years in tourism.' },
  { icon: UserRound, title: 'Personal Service', copy: 'You speak directly with me, the person helping to plan your holiday, so your preferences stay part of the conversation.' },
  { icon: Compass, title: 'Thoughtful Recommendations', copy: 'I look at how the whole trip will feel: the pace, the travel time and the balance between experiences and time to yourselves.' },
];

export function AboutPage({ onOpenPlanHoliday, onNavigateSection }: {
  onOpenPlanHoliday: () => void;
  onNavigateSection: (section: string) => void;
}) {
  const [portraitUnavailable, setPortraitUnavailable] = useState(false);
  const memories = [0, 20, 40].map(index => clientGalleryImages[index]).filter(Boolean);
  return (
    <div className="text-[#2F3A44]">
      <section className="bg-[#FDFBF7] border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-8 flex flex-wrap gap-2">
            <PageLink href="/" onClick={() => onNavigateSection('home')} className="text-[#0B5E8E] hover:underline">Home</PageLink>
            <span aria-hidden="true">/</span><span aria-current="page">About Outbound Holidays</span>
          </nav>
          <div className="max-w-3xl space-y-5">
            <span className="inline-block rounded-full bg-[#0B5E8E]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0B5E8E]">About Outbound Holidays</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0B5E8E] leading-tight">Local Knowledge. Personal Service. Better Victoria Falls Holidays.</h1>
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl">Plan your Victoria Falls holiday with someone who lives here, knows the local options and personally helps you decide what works for your trip.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-16 sm:space-y-20">
        <section aria-labelledby="meet-fungai" className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 rounded-[28px] overflow-hidden border border-gray-100 bg-[#FDFBF7] shadow-[0_20px_50px_rgba(11,94,142,0.12)]">
            {portraitUnavailable ? <div className="h-80 sm:h-[420px] flex items-center justify-center font-serif text-7xl text-[#0B5E8E]" aria-label="Fungai Mtetwa portrait placeholder">FM</div> :
              <img src={founderImage} onError={() => setPortraitUnavailable(true)} alt="Initials placeholder for Fungai Mtetwa; founder portrait to be added" className="w-full h-80 sm:h-[420px] object-contain" />}
            <div className="p-6 border-t border-gray-100"><p className="font-serif text-2xl font-bold text-[#0B5E8E]">Fungai Mtetwa</p><p className="text-sm mt-1">Founder & Travel Advisor ? Victoria Falls, Zimbabwe</p></div>
          </div>
          <div className="lg:col-span-7 space-y-5 max-w-2xl">
            <h2 id="meet-fungai" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">Hi, I?m Fungai.</h2>
            <p className="leading-relaxed">I?m Fungai Mtetwa, the travel advisor behind Outbound Holidays. Victoria Falls is home, and I?ve spent more than nine years working in tourism here.</p>
            <p className="leading-relaxed">I know how exciting planning a trip here can be. I also know how quickly it can become confusing when you start comparing accommodation, activities, transfers, prices and different recommendations online.</p>
            <p className="leading-relaxed">My job is to make those decisions easier. I personally help you understand your options and put together a holiday that suits your budget, interests, pace and the people you?re travelling with.</p>
            <p className="leading-relaxed">That starts with listening. A family holiday, a couple?s getaway and a first safari need different things, and I want to understand yours before recommending anything.</p>
          </div>
        </section>

        <section aria-labelledby="why-outbound" className="max-w-3xl space-y-5">
          <h2 id="why-outbound" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">Why I Started Outbound Holidays</h2>
          <p className="leading-relaxed">Travellers rarely struggle because there is too little information about Victoria Falls. Often, there is too much. You can find plenty of hotels, activities, packages and opinions, but knowing which ones make sense for your own trip is harder.</p>
          <p className="leading-relaxed">Which accommodation suits your budget and the way you want to travel? What should you prioritise in a short stay? How much can you comfortably fit in, and what can you skip?</p>
          <p className="leading-relaxed">I started Outbound Holidays to help bridge that gap. I bring local knowledge and personal guidance to those choices, then help accommodation, activities and transfers fit together without rushing your holiday or spending unnecessarily.</p>
        </section>

        <section aria-labelledby="how-i-help">
          <h2 id="how-i-help" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] mb-8">What I Can Help You With</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><Icon className="w-6 h-6 text-[#0B5E8E] mb-4" aria-hidden="true" /><h3 className="font-serif text-2xl font-bold text-[#0B5E8E] mb-3">{title}</h3><p className="text-sm leading-relaxed">{copy}</p></article>)}
          </div>
        </section>

        <section aria-labelledby="outbound-approach" className="rounded-[28px] border border-gray-200/80 bg-[#FDFBF7] p-6 sm:p-10">
          <h2 id="outbound-approach" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] mb-8">How I Approach Travel Planning</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {principles.map(({ icon: Icon, title, copy }) => <div key={title}><Icon className="w-6 h-6 text-[#3F6B3C] mb-3" aria-hidden="true" /><h3 className="font-serif text-2xl font-bold text-[#0B5E8E] mb-2">{title}</h3><p className="text-sm leading-relaxed max-w-lg">{copy}</p></div>)}
          </div>
        </section>

        <section aria-labelledby="personal-message" className="max-w-3xl space-y-5">
          <h2 id="personal-message" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">Personal From the First Message</h2>
          <p className="leading-relaxed">When you contact Outbound Holidays, you?re speaking directly with me. I get to understand what you?re looking for, what matters to you and the kind of holiday you want before making recommendations.</p>
          <p className="leading-relaxed">You don?t need to arrive with a finished itinerary. Bring your questions, a few ideas or simply a budget and some dates. We can work through the options together.</p>
        </section>

        <section aria-labelledby="outbound-memories" className="space-y-6">
          <div className="max-w-2xl space-y-3"><h2 id="outbound-memories" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">A Few Outbound Holidays Memories</h2><p className="leading-relaxed">These photos from our Client Gallery give you a glimpse of the destination and the travellers who have enjoyed it. There?s more to explore in the full gallery.</p></div>
          <div className="grid sm:grid-cols-3 gap-4">{memories.map((src, index) => <img key={src} src={src} alt={`Client travel memory from the Outbound Holidays gallery, photo ${index + 1}`} loading="lazy" className="w-full h-72 sm:h-80 object-cover rounded-2xl shadow-sm" />)}</div>
          <PageLink href="/client-gallery" onClick={() => onNavigateSection('client-gallery')} className="inline-block text-[#0B5E8E] font-bold hover:underline rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5E8E]">Explore the Client Gallery ?</PageLink>
        </section>

        <section aria-labelledby="about-plan-trip" className="rounded-[28px] bg-[#0B5E8E] p-6 sm:p-12 text-white">
          <div className="max-w-2xl space-y-5"><h2 id="about-plan-trip" className="font-serif text-3xl sm:text-4xl font-bold">Planning a Victoria Falls Trip?</h2><p className="leading-relaxed">Tell me what you have in mind. Whether you know exactly what you want or you?re still figuring things out, I can help you work through the options.</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2"><button type="button" onClick={onOpenPlanHoliday} className="rounded-xl bg-white text-[#0B5E8E] px-6 py-3.5 font-bold text-sm hover:bg-gray-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Plan My Victoria Falls Holiday</button><a href={getWhatsAppUrl('Hello Fungai, I?d like help planning a Victoria Falls holiday.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 px-6 py-3.5 font-bold text-sm hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><MessageCircle className="w-4 h-4" aria-hidden="true" />Chat on WhatsApp</a></div></div>
        </section>
      </div>
    </div>
  );
}
