import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { useState } from 'react';
import { BedDouble, Compass, MapPin, MessageCircle, Route, ShieldCheck, Trees, Truck, UserRound } from 'lucide-react';
import { PageLink } from '../common/PageLink';
import { clientGalleryImages } from '../../data/clientGalleryImages';
import { getWhatsAppUrl } from '../../utils/whatsapp';

let founderImage:string;registerContent(()=>{founderImage=editorialValue('travel/AboutPage.founderImage');});
let fungaiMemories:any[];registerContent(()=>{fungaiMemories=editorialValue('travel/AboutPage.fungaiMemories');});
let services: any;
registerContent(() => { services = editorialValue("travel/AboutPage.services", {BedDouble,Compass,Route,Trees,Truck}); });
let principles: any;
registerContent(() => { principles = editorialValue("travel/AboutPage.principles", {Compass,MapPin,ShieldCheck,UserRound}); });

export function AboutPage({ onOpenPlanHoliday, onNavigateSection }: {
  onOpenPlanHoliday: () => void;
  onNavigateSection: (section: string) => void;
}) {
  const [portraitUnavailable, setPortraitUnavailable] = useState(false);
  const memories = clientGalleryImages.filter((_, index) =>
    [0, Math.floor(clientGalleryImages.length / 2), clientGalleryImages.length - 1].includes(index)
  );
  return (
    <div className="text-[#2F3A44]">
      <section className="bg-[#FDFBF7] border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-8 flex flex-wrap gap-2">
            <PageLink href="/" onClick={() => onNavigateSection('home')} className="text-[#0B5E8E] hover:underline">{editorial("travel/AboutPage.text7")}</PageLink>
            <span aria-hidden="true">/</span><span aria-current="page">{editorial("travel/AboutPage.text8")}</span>
          </nav>
          <div className="max-w-3xl space-y-5">
            <span className="inline-block rounded-full bg-[#0B5E8E]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#0B5E8E]">{editorial("travel/AboutPage.text9")}</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#0B5E8E] leading-tight">{editorial("travel/AboutPage.text10")}</h1>
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl">{editorial("travel/AboutPage.text11")}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-16 sm:space-y-20">
        <section aria-labelledby="meet-fungai" className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-5 rounded-[28px] overflow-hidden border border-gray-100 bg-[#FDFBF7] shadow-[0_20px_50px_rgba(11,94,142,0.12)]">
            {portraitUnavailable ? <div className="h-80 sm:h-[420px] flex items-center justify-center font-serif text-7xl text-[#0B5E8E]" aria-label={editorialFormat("travel/AboutPage.copy1")}>{editorial("travel/AboutPage.text12")}</div> :
              <img src={founderImage} onError={() => setPortraitUnavailable(true)} alt={editorial("travel/AboutPage.text13")} width={810} height={1080} fetchPriority="high" className="w-full aspect-[3/4] max-h-[560px] object-cover object-center" />}
            <div className="p-6 border-t border-gray-100"><p className="font-serif text-2xl font-bold text-[#0B5E8E]">{editorial("travel/AboutPage.text14")}</p><p className="text-sm mt-1">{editorial("travel/AboutPage.text15")}</p></div>
          </div>
          <div className="lg:col-span-7 space-y-5 max-w-2xl">
            <h2 id="meet-fungai" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]"><span className="block">{editorial("travel/AboutPage.text16")}</span><span className="block">{editorial("travel/AboutPage.text17")}</span></h2>
            <p className="leading-relaxed">{editorial("travel/AboutPage.text18")}</p>
            <p className="leading-relaxed">{editorial("travel/AboutPage.text19")}</p>
            <p className="leading-relaxed">{editorial("travel/AboutPage.text20")}</p>
            <p className="leading-relaxed">{editorial("travel/AboutPage.text21")}</p>
          </div>
        </section>

        <section aria-labelledby="why-outbound" className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 max-w-2xl space-y-5">
          <h2 id="why-outbound" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">{editorial("travel/AboutPage.text22")}</h2>
          <p className="leading-relaxed">{editorial("travel/AboutPage.text23")}</p>
          <p className="leading-relaxed">{editorial("travel/AboutPage.text24")}</p>
          <p className="leading-relaxed">{editorial("travel/AboutPage.text25")}</p>
          </div>
          <figure className="lg:col-span-5 overflow-hidden rounded-[28px] bg-[#FDFBF7] border border-gray-100 shadow-sm">
            <img src={editorialValue('travel/AboutPage.photo6')} alt={editorial("travel/AboutPage.text26")} width={810} height={1080} loading="lazy" className="w-full aspect-[3/4] max-h-[520px] object-cover" />
            <figcaption className="px-6 py-4 text-sm text-[#0B5E8E]">{editorial("travel/AboutPage.text27")}</figcaption>
          </figure>
        </section>

        <section aria-labelledby="how-i-help">
          <h2 id="how-i-help" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] mb-8">{editorial("travel/AboutPage.text28")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, copy }) => <article key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><Icon className="w-6 h-6 text-[#0B5E8E] mb-4" aria-hidden="true" /><h3 className="font-serif text-2xl font-bold text-[#0B5E8E] mb-3">{title}</h3><p className="text-sm leading-relaxed">{copy}</p></article>)}
          </div>
        </section>

        <section aria-labelledby="outbound-approach" className="rounded-[28px] border border-gray-200/80 bg-[#FDFBF7] p-6 sm:p-10">
          <h2 id="outbound-approach" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E] mb-8">{editorial("travel/AboutPage.text29")}</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {principles.map(({ icon: Icon, title, copy }) => <div key={title}><Icon className="w-6 h-6 text-[#3F6B3C] mb-3" aria-hidden="true" /><h3 className="font-serif text-2xl font-bold text-[#0B5E8E] mb-2">{title}</h3><p className="text-sm leading-relaxed max-w-lg">{copy}</p></div>)}
          </div>
        </section>

        <section aria-labelledby="personal-message" className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 max-w-2xl space-y-5">
          <h2 id="personal-message" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">{editorial("travel/AboutPage.text30")}</h2>
          <p className="leading-relaxed">{editorial("travel/AboutPage.text31")}</p>
          <p className="leading-relaxed">{editorial("travel/AboutPage.text32")}</p>
          </div>
          <figure className="lg:col-span-5 lg:col-start-1 lg:row-start-1 overflow-hidden rounded-[28px] bg-[#FDFBF7] border border-gray-100 shadow-sm">
            <img src={editorialValue('travel/AboutPage.photo3')} alt={editorial("travel/AboutPage.text33")} width={810} height={1080} loading="lazy" className="w-full aspect-[3/4] max-h-[520px] object-cover" />
            <figcaption className="px-6 py-4 text-sm text-[#0B5E8E]">{editorial("travel/AboutPage.text34")}</figcaption>
          </figure>
        </section>

        <section aria-labelledby="fungai-memories" className="space-y-6">
          <div className="max-w-2xl space-y-3">
            <h2 id="fungai-memories" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">{editorial("travel/AboutPage.text35")}</h2>
            <p className="leading-relaxed">{editorial("travel/AboutPage.text36")}</p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
            {fungaiMemories.map(({ src, alt, width, height }) => (
              <a key={src} href={src} target="_blank" rel="noopener noreferrer" aria-label={`View full photo: ${alt}`} className="block mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-[#FDFBF7] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5E8E]">
                <img src={src} alt={alt} width={width} height={height} loading="lazy" className="w-full h-auto transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none" />
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="outbound-memories" className="space-y-6">
          <div className="max-w-2xl space-y-3"><h2 id="outbound-memories" className="font-serif text-3xl sm:text-4xl font-bold text-[#0B5E8E]">{editorial("travel/AboutPage.text37")}</h2><p className="leading-relaxed">{editorial("travel/AboutPage.text38")}</p></div>
          <div className="grid sm:grid-cols-3 gap-4">{memories.map((src, index) => <img key={src} src={src} alt={editorialFormat("travel/AboutPage.copy2", [index + 1])} loading="lazy" className="w-full h-72 sm:h-80 object-cover rounded-2xl shadow-sm" />)}</div>
          <PageLink href="/client-gallery" onClick={() => onNavigateSection('client-gallery')} className="inline-block text-[#0B5E8E] font-bold hover:underline rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5E8E]">{editorial("travel/AboutPage.text39")}</PageLink>
        </section>

        <section aria-labelledby="about-plan-trip" className="rounded-[28px] bg-[#0B5E8E] p-6 sm:p-12 text-white">
          <div className="max-w-2xl space-y-5"><h2 id="about-plan-trip" className="font-serif text-3xl sm:text-4xl font-bold">{editorial("travel/AboutPage.text40")}</h2><p className="leading-relaxed">{editorial("travel/AboutPage.text41")}</p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2"><button type="button" onClick={onOpenPlanHoliday} className="rounded-xl bg-white text-[#0B5E8E] px-6 py-3.5 font-bold text-sm hover:bg-gray-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{editorial("travel/AboutPage.text42")}</button><a href={getWhatsAppUrl(editorialFormat("travel/AboutPage.copy3"))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 px-6 py-3.5 font-bold text-sm hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><MessageCircle className="w-4 h-4" aria-hidden="true" />{editorial("travel/AboutPage.text43")}</a></div></div>
        </section>
      </div>
    </div>
  );
}
