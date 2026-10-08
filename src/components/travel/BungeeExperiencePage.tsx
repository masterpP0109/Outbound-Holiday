import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { experiencePath,sectionPath } from '../../routes';
import React,{ useState,useEffect } from 'react';
import { WhatsAppEnquiryButton,WhatsAppSpecialistCTA,WhatsAppIcon } from '../common/WhatsAppButton';
import {
Clock,
MapPin,
Star,
CheckCircle2,
ShieldCheck,
Sparkles,ChevronDown,
ChevronUp,
ArrowLeft,
Share2,
Users,
Check,XCircle,
Zap,
Award,
Compass,
FileCheck
} from 'lucide-react';
import { GalleryLightbox } from './GalleryLightbox';
import { Experience,getExperienceById } from '../../data/experiencesData';
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';

// Public image paths for experiences
let bungeeImg: any;
registerContent(() => { bungeeImg = editorialValue("travel/BungeeExperiencePage.bungeeImg", {}); });





interface BungeeExperiencePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onSelectRelatedExperience?: (exp: Experience) => void;
  onBackToDirectory?: () => void;
}

export const BungeeExperiencePage: React.FC<BungeeExperiencePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
  onSelectRelatedExperience,
  onBackToDirectory
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [jumperCount, setJumperCount] = useState(1);
  const [includeTransfers, setIncludeTransfers] = useState(true);
  const [includeVideoPackage, setIncludeVideoPackage] = useState(false);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1, 2]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const bungeePricePerPerson = 160;
  const transferCostPerPerson = includeTransfers ? 15 : 0;
  const videoPackageCost = includeVideoPackage ? 55 : 0;
  const totalEstimatedCost = (bungeePricePerPerson + transferCostPerPerson) * jumperCount + (includeVideoPackage ? videoPackageCost : 0);

  const steps = editorialValue("travel/BungeeExperiencePage.section1", {});

  const faqs = editorialValue("travel/BungeeExperiencePage.section2", {});

  const relatedList = editorialValue("travel/BungeeExperiencePage.section3", {})
    .map(id => getExperienceById(id))
    .filter((e): e is Experience => e !== undefined);

  return (
    <div className="bg-[#FAF9F6] text-[#1A2E35] min-h-screen selection:bg-[#C9A66B]/30 selection:text-[#0B5E8E]">
      
      {/* 1. Sub-Header Navigation Bar */}
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <PageLink href={'/'}
              onClick={onNavigateHome}
              className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{editorial("travel/BungeeExperiencePage.text27")}</span>
            </PageLink>
            {onBackToDirectory && (
              <>
                <span className="text-gray-500">/</span>
                <PageLink href={sectionPath('experiences')}
                  onClick={onBackToDirectory}
                  className="hover:text-[#C9A66B] transition-colors font-semibold text-gray-300 cursor-pointer text-[11px]"
                >
                  {editorial("travel/BungeeExperiencePage.text28")}</PageLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/BungeeExperiencePage.text29")}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full Width Magazine Hero */}
      <section className="relative bg-[#0D2833] text-white overflow-hidden py-16 sm:py-24 lg:py-28">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bungeeImg} 
            alt={editorial("travel/BungeeExperiencePage.text30")}
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/70 to-[#0D2833]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Category Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 backdrop-blur-md border border-[#C9A66B]/50 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/BungeeExperiencePage.text31")}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              {editorial("travel/BungeeExperiencePage.text32")}</h1>

            {/* Subtitle / Excerpt */}
            <p className="text-lg sm:text-xl text-gray-200 font-light leading-relaxed max-w-2xl">
              {editorial("travel/BungeeExperiencePage.text33")}</p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppEnquiryUrl(editorialFormat("travel/BungeeExperiencePage.copy1"))}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span>{editorial("travel/BungeeExperiencePage.text34")}</span>
              </a>

              <button
                onClick={onOpenPlanHoliday}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>{editorial("travel/BungeeExperiencePage.text35")}</span>
              </button>
            </div>

            {/* Quick Fact Strip */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BungeeExperiencePage.text36")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BungeeExperiencePage.text37")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Zap className="w-4 h-4 text-[#E5C989] shrink-0" />
                <span className="font-medium">{editorial("travel/BungeeExperiencePage.text38")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BungeeExperiencePage.text39")}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Story Column (8 Cols) */}
          <main className="lg:col-span-8 space-y-16">
            
            {/* 3. Why We Recommend This Experience (Editorial Callout) */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BungeeExperiencePage.text40")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text41")}</h2>
              </div>

              {/* Singita Style Editorial Block */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0B5E8E]/10 to-[#0D2833]/5 border-l-4 border-[#C9A66B] space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0B5E8E]">
                  <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                  <span>{editorial("travel/BungeeExperiencePage.text42")}</span>
                </div>
                <p className="text-base sm:text-lg text-[#1A2E35] italic font-serif leading-relaxed">
                  {editorial("travel/BungeeExperiencePage.text43")}</p>
              </div>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {editorial("travel/BungeeExperiencePage.text44")}</p>
            </section>

            {/* 4. Experience Highlights */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BungeeExperiencePage.text45")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text46")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {editorialValue("travel/BungeeExperiencePage.section4", {}).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#0B5E8E]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#0B5E8E]">{item.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. What to Expect / The Experience Journey (Step-by-Step Timeline) */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BungeeExperiencePage.text59")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text60")}</h2>
                <p className="text-sm text-gray-600">
                  {editorial("travel/BungeeExperiencePage.text61")}</p>
              </div>

              {/* Timeline Items */}
              <div className="space-y-8">
                {steps.map((st) => (
                  <div key={st.stepNumber} className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-200/70 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 h-48 rounded-xl overflow-hidden relative">
                      <img 
                        src={st.image} 
                        alt={st.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-[#0D2833]/90 text-[#E5C989] text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        {editorial("travel/BungeeExperiencePage.text62")}{st.stepNumber} • {st.time}
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-2">
                      <h3 className="font-serif text-xl font-bold text-[#0B5E8E]">
                        {st.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                        {st.description}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A66B] pt-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{st.highlight}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Visual Editorial Gallery */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BungeeExperiencePage.text63")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text64")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {editorialValue("travel/BungeeExperiencePage.section5", {}).map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className="h-52 rounded-2xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Victoria Falls bungee gallery ${idx + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
              {lightboxIndex !== null && (
                <GalleryLightbox
                  images={editorialValue("travel/BungeeExperiencePage.section6", {})}
                  initialIndex={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                />
              )}
            </section>

            {/* 7. Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Included */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0B5E8E]" />
                  <span>{editorial("travel/BungeeExperiencePage.text65")}</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text66")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text67")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text68")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text69")}</span>
                  </li>
                </ul>
              </section>

              {/* Excluded */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-gray-400" />
                  <span>{editorial("travel/BungeeExperiencePage.text70")}</span>
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text71")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text72")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                    <span>{editorial("travel/BungeeExperiencePage.text73")}</span>
                  </li>
                </ul>
              </section>

            </div>

            {/* 8. Local Expert Tip Banner */}
            <section className="rounded-3xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#C9A66B]/40">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A66B]/20 border border-[#C9A66B]/50 flex items-center justify-center text-[#E5C989] shrink-0 mt-1">
                  <Star className="w-6 h-6 text-[#E5C989]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                    {editorial("travel/BungeeExperiencePage.text74")}</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {editorial("travel/BungeeExperiencePage.text75")}</h3>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {editorial("travel/BungeeExperiencePage.text76")}</p>
                </div>
              </div>
            </section>

            {/* 9. Requirements & Good To Know */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BungeeExperiencePage.text77")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text78")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BungeeExperiencePage.text79")}</span>
                  </span>
                  <p className="text-gray-600">{editorial("travel/BungeeExperiencePage.text80")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BungeeExperiencePage.text81")}</span>
                  </span>
                  <p className="text-gray-600">{editorial("travel/BungeeExperiencePage.text82")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BungeeExperiencePage.text83")}</span>
                  </span>
                  <p className="text-gray-600">{editorial("travel/BungeeExperiencePage.text84")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BungeeExperiencePage.text85")}</span>
                  </span>
                  <p className="text-gray-600">{editorial("travel/BungeeExperiencePage.text86")}</p>
                </div>
              </div>
            </section>

            {/* 10. Frequently Asked Questions */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BungeeExperiencePage.text87")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text88")}</h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndices.includes(idx);
                  return (
                    <div 
                      key={idx}
                      className="rounded-2xl border border-gray-200 overflow-hidden bg-[#FAF9F6]"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left p-4 font-bold text-sm text-[#0B5E8E] flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-[#C9A66B]" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 11. Recommended Combinations */}
            {relatedList.length > 0 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    {editorial("travel/BungeeExperiencePage.text89")}</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BungeeExperiencePage.text90")}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedList.map((rel) => (
                    <PageLink href={experiencePath(rel)}
                      key={rel.id}
                      onClick={() => onSelectRelatedExperience && onSelectRelatedExperience(rel)}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="h-32 overflow-hidden relative">
                        <img 
                          src={rel.featuredImage} 
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                          {rel.fromPrice}
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors line-clamp-1">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {rel.shortDescription}
                        </p>
                      </div>
                    </PageLink>
                  ))}
                </div>
              </section>
            )}

          </main>

          {/* Sticky Booking Sidebar (4 Cols) */}
          <aside id="bungee-booking-section" className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-lg space-y-6">
              
              <div className="space-y-1 border-b border-gray-200 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{editorial("travel/BungeeExperiencePage.text91")}</span>
                <div className="text-3xl font-bold font-serif text-[#0B5E8E]">
                  {editorial("travel/BungeeExperiencePage.text92")}<span className="text-xs font-normal text-gray-500">{editorial("travel/BungeeExperiencePage.text93")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{editorial("travel/BungeeExperiencePage.text94")}</span>
                </div>
              </div>

              {/* Interactive Booking Calculator Form */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{editorial("travel/BungeeExperiencePage.text95")}</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{editorial("travel/BungeeExperiencePage.text96")}</label>
                  <select
                    value={jumperCount}
                    onChange={(e) => setJumperCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] text-xs bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Jumper' : 'Jumpers'}</option>
                    ))}
                  </select>
                </div>

                {/* Add-on Toggles */}
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200">
                    <span className="font-semibold text-gray-700">{editorial("travel/BungeeExperiencePage.text97")}</span>
                    <input 
                      type="checkbox" 
                      checked={includeTransfers} 
                      onChange={(e) => setIncludeTransfers(e.target.checked)}
                      className="w-4 h-4 accent-[#0B5E8E] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-200">
                    <span className="font-semibold text-gray-700">{editorial("travel/BungeeExperiencePage.text98")}</span>
                    <input 
                      type="checkbox" 
                      checked={includeVideoPackage} 
                      onChange={(e) => setIncludeVideoPackage(e.target.checked)}
                      className="w-4 h-4 accent-[#0B5E8E] cursor-pointer"
                    />
                  </label>
                </div>

                {/* Estimated Total Display */}
                <div className="p-3.5 rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 flex items-center justify-between">
                  <span className="font-bold text-gray-700">{editorial("travel/BungeeExperiencePage.text99")}</span>
                  <span className="font-serif font-bold text-lg text-[#0B5E8E]">{editorial("travel/BungeeExperiencePage.text100")}{totalEstimatedCost}</span>
                </div>

                <WhatsAppEnquiryButton 
                  experienceName={editorialFormat("travel/BungeeExperiencePage.copy2")}
                  date={selectedDate}
                  guests={jumperCount}
                  buttonText="Enquire About Availability"
                  variant="whatsapp-green"
                />

                <WhatsAppSpecialistCTA topic="Victoria Falls Bungee Jump" />
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#0B5E8E]">
                  <ShieldCheck className="w-4 h-4 text-[#C9A66B]" />
                  <span>{editorial("travel/BungeeExperiencePage.text101")}</span>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  {editorial("travel/BungeeExperiencePage.text102")}</p>
              </div>
            </div>
          </aside>

        </div>
      </div>

    </div>
  );
};
