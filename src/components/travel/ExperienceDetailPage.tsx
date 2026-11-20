import { editorialFormat } from "../../runtime/catalog";
import { editorial } from "../../runtime/catalog";
import { PageLink } from '../common/PageLink';
import { sectionPath, experiencePath } from '../../routes';
import React,{ useState,useEffect } from 'react';
import { Experience,getExperienceById } from '../../data/experiencesData';
import { BungeeExperiencePage } from './BungeeExperiencePage';
import { GalleryLightbox } from './GalleryLightbox';
import { WhatsAppIcon } from '../common/WhatsAppButton';
import { getWhatsAppEnquiryUrl } from '../../utils/whatsapp';
import { ShareButton } from '../common/ShareButton';
import { UnifiedEnquiryPanel } from './UnifiedEnquiryPanel';
import type { Currency } from '../../types';
import { formatCurrencyAmount } from '../../utils/currency';
import type { DirectEnquiryContext } from '../../utils/enquiry';
import {
Clock,
Star,
CheckCircle2,
ShieldCheck,
Sparkles,ChevronDown,
ChevronUp,
ArrowLeft,
Check,
Info,
MapPin,
XCircle
} from 'lucide-react';

interface ExperienceDetailPageProps {
  experience: Experience;
  currency?: Currency;
  onOpenPlanHoliday: () => void;
  onDirectEnquiry?: (context: DirectEnquiryContext) => void;
  onNavigateHome: () => void;
  onSelectRelatedExperience: (exp: Experience) => void;
  onBackToDirectory?: () => void;
}

export const ExperienceDetailPage: React.FC<ExperienceDetailPageProps> = ({
  experience,
  currency = 'USD',
  onOpenPlanHoliday,
  onDirectEnquiry: _onDirectEnquiry,
  onNavigateHome,
  onSelectRelatedExperience,
  onBackToDirectory
}) => {
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [experience.id]);

  // Keep hooks unconditional when switching between generic and flagship experiences.
  if (experience.id === 'bungee-jump' || experience.slug === 'bungee-jump') {
    return (
      <BungeeExperiencePage
        currency={currency}
        onOpenPlanHoliday={onOpenPlanHoliday}
        onNavigateHome={onNavigateHome}
        onSelectRelatedExperience={onSelectRelatedExperience}
        onBackToDirectory={onBackToDirectory}
      />
    );
  }

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const relatedList = experience.relatedIds
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
              <span>{editorial("travel/ExperienceDetailPage.text1")}</span>
            </PageLink>
            {onBackToDirectory && (
              <>
                <span className="text-gray-500">/</span>
                <PageLink href={sectionPath('experiences')}
                  onClick={onBackToDirectory}
                  className="hover:text-[#C9A66B] transition-colors font-semibold text-gray-300 cursor-pointer text-[11px]"
                >
                  {editorial("travel/ExperienceDetailPage.text2")}</PageLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-[#C9A66B] font-bold text-[11px] uppercase tracking-wider hidden sm:flex">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{editorial("travel/ExperienceDetailPage.text3")}</span>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton
              title={experience.title}
              canonicalPath={experiencePath(experience)}
            />
          </div>
        </div>
      </div>

      {/* 2. Editorial Hero Section */}
      <section className="relative bg-[#0D2833] text-white overflow-hidden py-16 sm:py-24 lg:py-28">
        <div className="absolute inset-0 z-0">
          <img 
            src={experience.featuredImage} 
            alt={experience.title}
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/70 to-[#0D2833]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 backdrop-blur-md border border-[#C9A66B]/50 text-[#E5C989] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>{experience.badge || editorialFormat("travel/ExperienceDetailPage.copy1")}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              {experience.title}
            </h1>

            {/* Subtitle / Short Description */}
            <p className="text-lg sm:text-xl text-gray-200 font-light leading-relaxed max-w-2xl">
              {experience.subtitle || experience.shortDescription}
            </p>

            {/* Hero Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={getWhatsAppEnquiryUrl(experience.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span>{editorial("travel/ExperienceDetailPage.text4")}</span>
              </a>

              <button
                onClick={onOpenPlanHoliday}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>{editorial("travel/ExperienceDetailPage.text5")}</span>
              </button>
            </div>

            {/* Quick Fact Strip */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-gray-200">
                <Clock className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{experience.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <ShieldCheck className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{typeof experience.priceAmount === 'number' && experience.priceAmount > 0 ? `From ${formatCurrencyAmount(experience.priceAmount, currency)}` : experience.fromPrice}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <Star className="w-4 h-4 text-[#E5C989] shrink-0" />
                <span className="font-medium">{editorial("travel/ExperienceDetailPage.text6")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-200">
                <MapPin className="w-4 h-4 text-[#C9A66B] shrink-0" />
                <span className="font-medium">{experience.location || "Victoria Falls Region"}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Story Content (8 Cols) */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* Overview & Why We Recommend It */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/ExperienceDetailPage.text7")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/ExperienceDetailPage.text8")}{experience.title}
                </h2>
              </div>

              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                {experience.fullOverview}
              </p>

              {/* Specialist Quote Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#0B5E8E]">
                  <Star className="w-4 h-4 text-[#C9A66B] fill-[#C9A66B]" />
                  <span>{editorial("travel/ExperienceDetailPage.text9")}</span>
                </div>
                <p className="text-sm sm:text-base text-gray-700 italic font-serif leading-relaxed">
                  "{experience.whyWeRecommend}"
                </p>
              </div>
            </section>

            {/* Highlights */}
            <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                  {editorial("travel/ExperienceDetailPage.text10")}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                  {editorial("travel/ExperienceDetailPage.text11")}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {experience.highlights.map((h, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/60 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#0B5E8E]" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Step-by-Step Experience Journey (If steps provided) */}
            {experience.steps && experience.steps.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-8">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    {editorial("travel/ExperienceDetailPage.text12")}</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    {editorial("travel/ExperienceDetailPage.text13")}</h2>
                </div>

                <div className="space-y-6">
                  {experience.steps.map((st) => (
                    <div key={st.stepNumber} className="bg-[#FAF9F6] rounded-2xl p-5 border border-gray-200/70 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {st.image && (
                        <div className="md:col-span-4 h-40 rounded-xl overflow-hidden relative">
                          <img src={st.image} alt={st.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className={st.image ? "md:col-span-8 space-y-1.5" : "md:col-span-12 space-y-1.5"}>
                        <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-wider block">
                          {editorial("travel/ExperienceDetailPage.text14")}{st.stepNumber} {st.time ? `• ${st.time}` : ''}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#0B5E8E]">{st.title}</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">{st.description}</p>
                        {st.highlight && (
                          <span className="inline-block text-[11px] font-semibold text-[#0B5E8E] bg-[#0B5E8E]/10 px-2.5 py-0.5 rounded-full mt-1">
                            {st.highlight}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {experience.galleryImages.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    {editorial("travel/ExperienceDetailPage.text15")}</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    {editorial("travel/ExperienceDetailPage.text16")}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {experience.galleryImages.map((imgUrl, idx) => (
                    <div 
                      key={idx} 
                      className="h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer"
                      onClick={() => setLightboxIndex(idx)}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${experience.title} gallery photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
                {lightboxIndex !== null && (
                  <GalleryLightbox
                    images={experience.galleryImages}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                  />
                )}
              </section>
            )}

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Whats Included */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0B5E8E]" />
                  <span>{editorial("travel/ExperienceDetailPage.text17")}</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  {experience.whatsIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A66B] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Whats Excluded / Good to Know */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0B5E8E] flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#C9A66B]" />
                  <span>{editorial("travel/ExperienceDetailPage.text18")}</span>
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-700">
                  {experience.whatsExcluded && experience.whatsExcluded.map((item, idx) => (
                    <li key={`ex-${idx}`} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                      <span className="text-gray-500">{item}</span>
                    </li>
                  ))}
                  {experience.goodToKnow.map((item, idx) => (
                    <li key={`gk-${idx}`} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0B5E8E] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

            </div>

            {/* Local Expert Tip Callout */}
            {experience.localExpertTip && (
              <section className="rounded-3xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-8 shadow-xl border border-[#C9A66B]/40">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#C9A66B]/20 border border-[#C9A66B]/50 flex items-center justify-center text-[#E5C989] shrink-0 mt-1">
                    <Star className="w-5 h-5 text-[#E5C989]" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#E5C989]">
                      {editorial("travel/ExperienceDetailPage.text19")}</span>
                    <p className="text-sm text-gray-200 leading-relaxed font-serif italic">
                      "{experience.localExpertTip}"
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* FAQs */}
            {experience.faqs.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    {editorial("travel/ExperienceDetailPage.text20")}</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    {editorial("travel/ExperienceDetailPage.text21")}</h2>
                </div>

                <div className="space-y-3">
                  {experience.faqs.map((faq, idx) => {
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
            )}

            {/* Related Experiences */}
            {relatedList.length > 0 && (
              <section className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C9A66B]">
                    {editorial("travel/ExperienceDetailPage.text22")}</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E]">
                    {editorial("travel/ExperienceDetailPage.text23")}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedList.map((rel) => (
                    <div 
                      key={rel.id}
                      onClick={() => onSelectRelatedExperience(rel)}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img 
                          src={rel.featuredImage} 
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute top-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                          {typeof rel.priceAmount === 'number' && rel.priceAmount > 0 ? `From ${formatCurrencyAmount(rel.priceAmount, currency)}` : rel.fromPrice}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="font-serif font-bold text-sm text-[#0B5E8E] group-hover:text-[#C9A66B] transition-colors leading-snug">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {rel.shortDescription}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </main>

          {/* Sticky Enquiry Sidebar (4 Cols) */}
          <aside id="experience-booking-sidebar" className="lg:col-span-4 sticky top-28 space-y-6">
            <UnifiedEnquiryPanel
              mode="activity"
              currency={currency}
              itemTitle={experience.title}
              itemSlug={experience.slug || experience.id}
              basePriceUSD={experience.priceAmount || null}
              priceLabelPrefix={editorial("travel/ExperienceDetailPage.text24")}
              priceSuffix={editorial("travel/ExperienceDetailPage.text25")}
              ageNotice="Child pricing rule: Under 11 selects child rates (confirmed with operator on enquiry). Ages 11+ (11 years or older) are priced at the standard adult/11+ activity rate."
              durationLabel={`${editorial("travel/ExperienceDetailPage.text26")}${experience.duration}`}
              extras={[
                {
                  id: 'transfers',
                  label: 'Request return hotel transfer quote (if not already included)',
                },
              ]}
              trustTitle={editorial("travel/ExperienceDetailPage.text32")}
              trustBody={editorial("travel/ExperienceDetailPage.text33")}
              whatsappButtonLabel="Enquire on WhatsApp"
              buildHolidayLabel="Add to My Holiday Plan"
              onBuildHoliday={onOpenPlanHoliday}
            />
          </aside>

        </div>
      </div>

    </div>
  );
};

