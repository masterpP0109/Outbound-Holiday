import { editorialFormat } from "../../runtime/catalog";
import { editorial, editorialValue, registerContent } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import React,{ useState,useEffect } from 'react';
import { WhatsAppEnquiryButton,WhatsAppSpecialistCTA,WhatsAppIcon } from '../common/WhatsAppButton';
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';
import {
Clock,Star,
CheckCircle2,
ShieldCheck,
Sparkles,
Utensils,
Music,
Bus,
PhoneCall,
CalendarCheck,
ChevronRight,
ChevronDown,
ChevronUp,ArrowLeft,
Share2,
Users,Check,
Info,
Coffee
} from 'lucide-react';
import { GalleryLightbox } from './GalleryLightbox';
// Public image paths for experiences
let bomaDinnerImg: any;
registerContent(() => { bomaDinnerImg = editorialValue("travel/BomaExperiencePage.bomaDinnerImg", {}); });
let bomaDinnerImg2: any;
registerContent(() => { bomaDinnerImg2 = editorialValue("travel/BomaExperiencePage.bomaDinnerImg2", {}); });
let bomaDinnerImg3: any;
registerContent(() => { bomaDinnerImg3 = editorialValue("travel/BomaExperiencePage.bomaDinnerImg3", {}); });
let bomaDinnerImg5: any;
registerContent(() => { bomaDinnerImg5 = editorialValue("travel/BomaExperiencePage.bomaDinnerImg5", {}); });
let bomaDinnerImg6: any;
registerContent(() => { bomaDinnerImg6 = editorialValue("travel/BomaExperiencePage.bomaDinnerImg6", {}); });







interface BomaExperiencePageProps {
  onOpenPlanHoliday: () => void;
  onNavigateHome: () => void;
  onSelectRelatedExperience?: (expTitle: string) => void;
}

export const BomaExperiencePage: React.FC<BomaExperiencePageProps> = ({
  onOpenPlanHoliday,
  onNavigateHome,
  onSelectRelatedExperience
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [includeTransfers, setIncludeTransfers] = useState(true);
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);
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

  const faqs = editorialValue("travel/BomaExperiencePage.section1", {});

  const relatedExperiences = editorialValue("travel/BomaExperiencePage.section2", {});

  return (
    <div>
      <div className="sticky top-[73px] z-40 bg-[#0D2833] text-white border-b border-[#C9A66B]/30 py-2.5 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          <PageLink href={'/'}
            onClick={onNavigateHome}
            className="hover:text-[#C9A66B] transition-colors flex items-center gap-1.5 font-semibold text-gray-300 cursor-pointer text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{editorial("travel/BomaExperiencePage.text29")}</span>
          </PageLink>

          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span className="hidden sm:inline">{editorial("travel/BomaExperiencePage.text30")}</span>
            <span className="sm:hidden">{editorial("travel/BomaExperiencePage.text31")}</span>
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
        {/* Background Photo */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bomaDinnerImg} 
            alt={editorial("travel/BomaExperiencePage.text32")}
             className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/70 to-[#0D2833]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 backdrop-blur-md border border-[#C9A66B]/50 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{editorial("travel/BomaExperiencePage.text33")}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              {editorial("travel/BomaExperiencePage.text34")}</h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-200 font-light leading-relaxed max-w-2xl">
              {editorial("travel/BomaExperiencePage.text35")}</p>

            {/* Hero Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppEnquiryUrl("The Boma Dinner & Drum Show")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span>{editorial("travel/BomaExperiencePage.text36")}</span>
              </a>

              <button
                onClick={onOpenPlanHoliday}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>{editorial("travel/BomaExperiencePage.text37")}</span>
              </button>
            </div>

            {/* Quick Facts Strip */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Star className="w-4 h-4 text-[#E5C989] shrink-0" />
                <span className="font-medium">{editorial("travel/BomaExperiencePage.text38")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BomaExperiencePage.text39")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Utensils className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BomaExperiencePage.text40")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Music className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BomaExperiencePage.text41")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Bus className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{editorial("travel/BomaExperiencePage.text42")}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Layout Container with Sticky Sidebar on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Story Content Column (8 Cols) */}
          <main className="lg:col-span-8 space-y-16">
            
            {/* 3. Why We Recommend It */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text43")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text44")}</h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-serif italic text-[#1A2E35]">
                {editorial("travel/BomaExperiencePage.text45")}</p>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {editorial("travel/BomaExperiencePage.text46")}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Sparkles className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text47")}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text48")}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Music className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text49")}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text50")}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Utensils className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text51")}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text52")}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Users className="w-4 h-4 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text53")}</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text54")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Photo Story - Narrative Chapters */}
            <section className="space-y-12">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text55")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text56")}</h2>
                <p className="text-sm text-gray-600">
                  {editorial("travel/BomaExperiencePage.text57")}</p>
              </div>

              {/* Story 1: Your Evening Begins */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 h-64 md:h-auto relative">
                  <img 
                    src={bomaDinnerImg}
                    alt={editorial("travel/BomaExperiencePage.text58")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {editorial("travel/BomaExperiencePage.text59")}</div>
                </div>
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text60")}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text61")}</p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{editorial("travel/BomaExperiencePage.text62")}</span>
                  </div>
                </div>
              </div>

              {/* Story 2: Traditional Performances */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text63")}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text64")}</p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Music className="w-3.5 h-3.5" />
                    <span>{editorial("travel/BomaExperiencePage.text65")}</span>
                  </div>
                </div>
                <div className="md:col-span-6 h-64 md:h-auto relative order-1 md:order-2">
                  <img 
                    src={bomaDinnerImg2} 
                    alt={editorial("travel/BomaExperiencePage.text66")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {editorial("travel/BomaExperiencePage.text67")}</div>
                </div>
              </div>

              {/* Story 3: Open Fire Cooking & Spit Roast */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 h-64 md:h-auto relative">
                  <img 
                    src={bomaDinnerImg3} 
                    alt={editorial("travel/BomaExperiencePage.text68")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {editorial("travel/BomaExperiencePage.text69")}</div>
                </div>
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text70")}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text71")}</p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Utensils className="w-3.5 h-3.5" />
                    <span>{editorial("travel/BomaExperiencePage.text72")}</span>
                  </div>
                </div>
              </div>

              {/* Story 4: African Buffet Feast */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text73")}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text74")}</p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{editorial("travel/BomaExperiencePage.text75")}</span>
                  </div>
                </div>
                <div className="md:col-span-6 h-64 md:h-auto relative order-1 md:order-2">
                  <img 
                    src={bomaDinnerImg5}
                    alt={editorial("travel/BomaExperiencePage.text76")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {editorial("travel/BomaExperiencePage.text77")}</div>
                </div>
              </div>

              {/* Story 5: Interactive Drumming Show */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 h-64 md:h-auto relative">
                  <img 
                    src={bomaDinnerImg5}
                    alt={editorial("travel/BomaExperiencePage.text78")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {editorial("travel/BomaExperiencePage.text79")}</div>
                </div>
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text80")}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text81")}</p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Music className="w-3.5 h-3.5" />
                    <span>{editorial("travel/BomaExperiencePage.text82")}</span>
                  </div>
                </div>
              </div>

              {/* Story 6: Desserts & Acapella Epilogue */}
              <div className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-3 order-2 md:order-1">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text83")}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text84")}</p>
                  <div className="text-xs font-semibold text-[#C9A66B] flex items-center gap-1.5 pt-1">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{editorial("travel/BomaExperiencePage.text85")}</span>
                  </div>
                </div>
                <div className="md:col-span-6 h-64 md:h-auto relative order-1 md:order-2">
                  <img 
                    src={bomaDinnerImg6} 
                    alt={editorial("travel/BomaExperiencePage.text86")}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[#0D2833]/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                    {editorial("travel/BomaExperiencePage.text87")}</div>
                </div>
              </div>

            </section>

            {/* Boma Experience Gallery */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text88")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text89")}</h2>
                <p className="text-sm text-gray-600">
                  {editorial("travel/BomaExperiencePage.text90")}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {editorialValue("travel/BomaExperiencePage.section3", {}).map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    className="h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`The Boma gallery photo ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
              {lightboxIndex !== null && (
                <GalleryLightbox
                  images={editorialValue("travel/BomaExperiencePage.section4", {})}
                  initialIndex={lightboxIndex}
                  onClose={() => setLightboxIndex(null)}
                />
              )}
            </section>

            {/* 5. Evening Timeline Section */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text91")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text92")}</h2>
                <p className="text-sm text-gray-600">
                  {editorial("travel/BomaExperiencePage.text93")}</p>
              </div>

              {/* Timeline Flow */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-[#C9A66B]/40 space-y-8 my-6">
                
                {/* 6:45 PM */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#0B5E8E] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      {editorial("travel/BomaExperiencePage.text94")}</span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      {editorial("travel/BomaExperiencePage.text95")}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text96")}</p>
                  </div>
                </div>

                {/* Starters */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#C9A66B] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      {editorial("travel/BomaExperiencePage.text97")}</span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      {editorial("travel/BomaExperiencePage.text98")}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text99")}</p>
                  </div>
                </div>

                {/* 8:00 PM */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#0B5E8E] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      {editorial("travel/BomaExperiencePage.text100")}</span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      {editorial("travel/BomaExperiencePage.text101")}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text102")}</p>
                  </div>
                </div>

                {/* 8:45 PM */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#E67E22] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#E67E22] uppercase tracking-wider block">
                      {editorial("travel/BomaExperiencePage.text103")}</span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      {editorial("travel/BomaExperiencePage.text104")}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text105")}</p>
                  </div>
                </div>

                {/* Epilogue */}
                <div className="relative group">
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-5 h-5 rounded-full bg-[#0B5E8E] border-4 border-white shadow-xs group-hover:scale-110 transition-transform" />
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/60 space-y-1">
                    <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                      {editorial("travel/BomaExperiencePage.text106")}</span>
                    <h4 className="font-serif font-bold text-base text-[#0B5E8E]">
                      {editorial("travel/BomaExperiencePage.text107")}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {editorial("travel/BomaExperiencePage.text108")}</p>
                  </div>
                </div>

              </div>

              {/* Optional Throughout Evening Callout */}
              <div className="p-5 rounded-2xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0B5E8E]">
                  <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                  <span>{editorial("travel/BomaExperiencePage.text109")}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>{editorial("travel/BomaExperiencePage.text110")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>{editorial("travel/BomaExperiencePage.text111")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>{editorial("travel/BomaExperiencePage.text112")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>{editorial("travel/BomaExperiencePage.text113")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>{editorial("travel/BomaExperiencePage.text114")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    <span>{editorial("travel/BomaExperiencePage.text115")}</span>
                  </div>
                </div>
              </div>

            </section>

            {/* 6. What's Included */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text116")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text117")}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {editorialValue("travel/BomaExperiencePage.section5", {}).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 text-center space-y-1 hover:border-[#C9A66B]/50 transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center mx-auto mb-2">
                      <Check className="w-4 h-4 text-[#0B5E8E]" />
                    </div>
                    <span className="font-bold text-xs text-[#0B5E8E] block">{item.title}</span>
                    <span className="text-[10px] text-gray-500 block">{item.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. Local Specialist Tip */}
            <section className="rounded-3xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#C9A66B]/40">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A66B]/20 border border-[#C9A66B]/50 flex items-center justify-center text-[#E5C989] shrink-0 mt-1">
                  <Star className="w-6 h-6 text-[#E5C989]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                    {editorial("travel/BomaExperiencePage.text134")}</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                    {editorial("travel/BomaExperiencePage.text135")}</h3>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text136")}</p>
                </div>
              </div>
            </section>

            {/* 8. Good To Know */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text137")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text138")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BomaExperiencePage.text139")}</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text140")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BomaExperiencePage.text141")}</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text142")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BomaExperiencePage.text143")}</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text144")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BomaExperiencePage.text145")}</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text146")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BomaExperiencePage.text147")}</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text148")}</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 space-y-1">
                  <span className="font-bold text-xs text-[#0B5E8E] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>{editorial("travel/BomaExperiencePage.text149")}</span>
                  </span>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {editorial("travel/BomaExperiencePage.text150")}</p>
                </div>
              </div>
            </section>

            {/* 9. Typical Investment */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text151")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text152")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-200 space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/BomaExperiencePage.text153")}</span>
                  <div className="text-3xl sm:text-4xl font-bold font-serif text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text154")}<span className="text-xs font-normal text-gray-500">{editorial("travel/BomaExperiencePage.text155")}</span>
                  </div>
                  <p className="text-xs text-gray-600">{editorial("travel/BomaExperiencePage.text156")}</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-200 space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">{editorial("travel/BomaExperiencePage.text157")}</span>
                  <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text158")}</div>
                  <p className="text-xs text-gray-600">{editorial("travel/BomaExperiencePage.text159")}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 italic text-center sm:text-left">
                {editorial("travel/BomaExperiencePage.text160")}</p>
            </section>

            {/* 10. Is This Experience Right For You? */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text161")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text162")}</h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#0D2833] text-white font-serif font-bold">
                    <tr>
                      <th className="p-4">{editorial("travel/BomaExperiencePage.text163")}</th>
                      <th className="p-4">{editorial("travel/BomaExperiencePage.text164")}</th>
                      <th className="p-4">{editorial("travel/BomaExperiencePage.text165")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-[#FAF9F6]">
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text166")}</td>
                      <td className="p-4 font-bold text-[#E67E22]">{editorial("travel/BomaExperiencePage.text167")}</td>
                      <td className="p-4 text-gray-600">{editorial("travel/BomaExperiencePage.text168")}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text169")}</td>
                      <td className="p-4 font-bold text-[#E67E22]">{editorial("travel/BomaExperiencePage.text170")}</td>
                      <td className="p-4 text-gray-600">{editorial("travel/BomaExperiencePage.text171")}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text172")}</td>
                      <td className="p-4 font-bold text-[#E67E22]">{editorial("travel/BomaExperiencePage.text173")}</td>
                      <td className="p-4 text-gray-600">{editorial("travel/BomaExperiencePage.text174")}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text175")}</td>
                      <td className="p-4 font-bold text-[#E67E22]">{editorial("travel/BomaExperiencePage.text176")}</td>
                      <td className="p-4 text-gray-600">{editorial("travel/BomaExperiencePage.text177")}</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#0B5E8E]">{editorial("travel/BomaExperiencePage.text178")}</td>
                      <td className="p-4 font-bold text-[#E67E22]">{editorial("travel/BomaExperiencePage.text179")}</td>
                      <td className="p-4 text-gray-600">{editorial("travel/BomaExperiencePage.text180")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 11. Frequently Asked Questions */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text181")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text182")}</h2>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndices.includes(idx);
                  return (
                    <div 
                      key={idx}
                      className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200 bg-[#FAF9F6]"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#0B5E8E] cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#C9A66B] shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 12. Related Experiences */}
            <section className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/BomaExperiencePage.text183")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/BomaExperiencePage.text184")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedExperiences.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:border-[#0B5E8E] transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                          {item.duration}
                        </div>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base text-[#0B5E8E] font-serif">
                            {item.title}
                          </h4>
                          <span className="text-xs font-bold text-[#E67E22] bg-[#E67E22]/10 px-2 py-0.5 rounded-md">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <PageLink href={`/things-to-do/${item.slug}`}
                        onClick={() => {
                          if (onSelectRelatedExperience) {
                            onSelectRelatedExperience(item.slug);
                          } else {
                            onOpenPlanHoliday();
                          }
                        }}
                        className="w-full bg-[#FAF9F6] hover:bg-[#0B5E8E] hover:text-white text-[#0B5E8E] font-bold text-xs py-2.5 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{editorial("travel/BomaExperiencePage.text185")}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </PageLink>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>

          {/* Sticky Desktop Booking & Specialist Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div id="boma-booking-section" className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-lg space-y-5">
              
              <div className="pb-4 border-b border-gray-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block">
                  {editorial("travel/BomaExperiencePage.text186")}</span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-2xl font-bold text-[#0B5E8E]">
                    {editorial("travel/BomaExperiencePage.text187")}</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-[#E67E22]">{editorial("travel/BomaExperiencePage.text188")}</span>
                    <span className="text-[10px] text-gray-400 block">{editorial("travel/BomaExperiencePage.text189")}</span>
                  </div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">{editorial("travel/BomaExperiencePage.text190")}</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">{editorial("travel/BomaExperiencePage.text191")}</label>
                  <select 
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800 block">{editorial("travel/BomaExperiencePage.text192")}</span>
                    <span className="text-[10px] text-gray-500">{editorial("travel/BomaExperiencePage.text193")}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={includeTransfers}
                    onChange={(e) => setIncludeTransfers(e.target.checked)}
                    className="w-4 h-4 text-[#0B5E8E] rounded border-gray-300 focus:ring-[#0B5E8E]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <WhatsAppEnquiryButton 
                experienceName="The Boma Dinner & Drum Show"
                date={selectedDate}
                guests={guestCount}
                additionalNotes={includeTransfers ? editorialFormat("travel/BomaExperiencePage.copy1") : undefined}
                buttonText="Enquire & Reserve Seats"
                variant="whatsapp-green"
              />

              <WhatsAppSpecialistCTA topic={editorialFormat("travel/BomaExperiencePage.copy2")} />

              {/* Trust Badges */}
              <div className="pt-3 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B5E8E] shrink-0" />
                  <span>{editorial("travel/BomaExperiencePage.text194")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0" />
                  <span>{editorial("travel/BomaExperiencePage.text195")}</span>
                </div>
              </div>

            </div>

            {/* Local Concierge Box */}
            <div className="bg-[#0D2833] text-white rounded-3xl p-6 space-y-3 border border-[#C9A66B]/30 shadow-md">
              <span className="text-[10px] font-bold text-[#E5C989] uppercase tracking-wider block">
                {editorial("travel/BomaExperiencePage.text196")}</span>
              <h4 className="font-serif font-bold text-base text-white">
                {editorial("travel/BomaExperiencePage.text197")}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {editorial("travel/BomaExperiencePage.text198")}</p>
              <button
                onClick={onOpenPlanHoliday}
                className="w-full bg-[#C9A66B] hover:bg-[#b8955a] text-[#0D2833] font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{editorial("travel/BomaExperiencePage.text199")}</span>
              </button>
            </div>
          </aside>

        </div>
      </div>

      {/* 13. Final CTA Banner */}
      <section className="bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-widest border border-[#C9A66B]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/BomaExperiencePage.text200")}</span>
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            {editorial("travel/BomaExperiencePage.text201")}</h2>

          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            {editorial("travel/BomaExperiencePage.text202")}</p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenPlanHoliday}
              className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>{editorial("travel/BomaExperiencePage.text203")}</span>
            </button>

            <button
              onClick={onOpenPlanHoliday}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 text-[#C9A66B]" />
              <span>{editorial("travel/BomaExperiencePage.text204")}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
