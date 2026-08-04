import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GuideArticle, 
  GuideSection, 
  ArticleBlock, 
  FaqItem,
  QuickFact 
} from '../../../types/guide';
import { trackGuideEvent } from '../../../utils/analytics';
import { 
  Compass, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Share2, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  ChevronUp,
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  Sun, 
  Bed, 
  CheckCircle2, 
  Quote, 
  Lightbulb, 
  HelpCircle, 
  PhoneCall, 
  CalendarCheck, 
  ArrowRight,
  Menu,
  Heart,
  Plane,
  Luggage,
  Users,
  Grid,
  Layers,
  BookOpen,
  Search,
  X,
  MessageCircle
} from 'lucide-react';

interface GuideArticleTemplateProps {
  article: GuideArticle;
  onOpenPlanHoliday: () => void;
  onSelectRelatedArticle?: (slug: string) => void;
  onNavigateHome?: () => void;
}

const FAQ_FILTER_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Planning', label: 'Planning', category: 'Planning Your Trip' },
  { id: 'Money', label: 'Money', category: 'Money & Payments' },
  { id: 'Activities', label: 'Activities', category: 'Activities' },
  { id: 'Safety', label: 'Safety', category: 'Health & Safety' },
  { id: 'Weather', label: 'Weather', category: 'Weather' },
  { id: 'Wildlife', label: 'Wildlife', category: 'Wildlife' },
  { id: 'Accommodation', label: 'Accommodation', category: 'Accommodation' },
  { id: 'Booking', label: 'Booking', category: 'Booking with Outbound Holidays' },
];

export const GuideArticleTemplate: React.FC<GuideArticleTemplateProps> = ({
  article,
  onOpenPlanHoliday,
  onNavigateHome,
}) => {
  // Chapter / Section State
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [activeMainTab, setActiveMainTab] = useState<'chapters' | 'travellers' | 'faqs'>('chapters');

  // FAQ State
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0, 1]);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [activeFaqFilter, setActiveFaqFilter] = useState('All');
  const [copiedLink, setCopiedLink] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Track initial page view & inject dynamic SEO & JSON-LD schema
  useEffect(() => {
    trackGuideEvent('guide_viewed', {
      articleSlug: article.slug,
      articleTitle: article.title,
    });

    document.title = article.seo.metaTitle;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    // Build JSON-LD Structured Data
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': article.seo.canonicalUrl,
      },
      'headline': article.title,
      'description': article.seo.metaDescription,
      'image': [article.heroImageUrl],
      'datePublished': article.publishedDate,
      'dateModified': article.lastUpdatedDate,
      'author': {
        '@type': 'Person',
        'name': article.author.name,
        'jobTitle': article.author.role,
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Outbound Holidays Victoria Falls',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://outboundholidays.co.zw/logo.png',
        },
      },
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': 'https://outboundholidays.co.zw/',
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Victoria Falls Guide',
          'item': 'https://outboundholidays.co.zw/victoria-falls-guide',
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': article.title,
          'item': article.seo.canonicalUrl,
        },
      ],
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': (article.faqs || []).map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        },
      })),
    };

    const scriptId = 'json-ld-article';
    let scriptElem = document.getElementById(scriptId);
    if (!scriptElem) {
      scriptElem = document.createElement('script');
      scriptElem.id = scriptId;
      scriptElem.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElem);
    }
    scriptElem.textContent = JSON.stringify([articleSchema, breadcrumbSchema, faqSchema]);

    return () => {
      const elem = document.getElementById(scriptId);
      if (elem) elem.remove();
    };
  }, [article]);

  const handleSelectSection = (index: number) => {
    setActiveSectionIndex(index);
    setActiveMainTab('chapters');
    setViewMode('single');

    trackGuideEvent('toc_clicked', {
      articleSlug: article.slug,
      sectionId: article.sections[index]?.id,
    });

    if (mainContainerRef.current) {
      const headerOffset = 100;
      const elementPosition = mainContainerRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      trackGuideEvent('share_clicked', {
        articleSlug: article.slug,
        sharePlatform: 'clipboard_copy',
      });
    }
  };

  const toggleFaqIndex = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Icon Resolver Helper
  const renderIconByName = (name?: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Sun': return <Sun className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'DollarSign': return <DollarSign className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Bed': return <Bed className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'CheckCircle2': return <CheckCircle2 className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Plane': return <Plane className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Heart': return <Heart className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const activeSection = article.sections[activeSectionIndex] || article.sections[0];
  const articleFaqs = article.faqs || [];

  const filteredFaqs = articleFaqs.filter((faq) => {
    let categoryMatch = true;
    if (activeFaqFilter !== 'All') {
      const tabObj = FAQ_FILTER_TABS.find((t) => t.id === activeFaqFilter);
      if (tabObj && tabObj.category) {
        categoryMatch = faq.category === tabObj.category || faq.category === tabObj.id;
      } else {
        categoryMatch = faq.category === activeFaqFilter;
      }
    }

    let searchMatch = true;
    if (faqSearchQuery.trim()) {
      const q = faqSearchQuery.toLowerCase();
      searchMatch =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
    }

    return categoryMatch && searchMatch;
  });

  return (
    <div className="bg-[#FAF9F6] text-[#1A2E35] min-h-screen selection:bg-[#C9A66B]/30 selection:text-[#0B5E8E]">
      
      {/* 1. Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center text-xs font-medium text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button 
            onClick={onNavigateHome}
            className="hover:text-[#0B5E8E] transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 shrink-0" />
          <span className="text-gray-700 font-semibold">Victoria Falls Guide</span>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 shrink-0" />
          <span className="text-[#0B5E8E] font-bold truncate max-w-xs sm:max-w-md">{article.title}</span>
        </div>
      </nav>

      {/* 2. Editorial Article Hero */}
      <section className="relative bg-[#0D2833] text-white overflow-hidden py-10 lg:py-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={article.heroImageUrl} 
            alt={article.heroImageAlt}
            className="w-full h-full object-cover object-center opacity-30 transform scale-105 filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/40">
                {article.category}
              </span>
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#C9A66B]" />
                {article.readingTime}
              </span>
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C9A66B]" />
                {article.location}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-200 max-w-3xl leading-relaxed font-light">
              {article.subtitle}
            </p>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={article.author.avatarUrl} 
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#C9A66B]"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{article.author.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                  </div>
                  <div className="text-[11px] text-gray-300">
                    {article.author.role} • Updated {article.lastUpdatedDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareClick}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share Guide'}</span>
                </button>

                <button
                  onClick={() => {
                    trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'hero_plan_trip' });
                    onOpenPlanHoliday();
                  }}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Plan My Holiday</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Four Quick-Planning Facts Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20 mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(article.quickFacts || []).map((fact, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-[#C9A66B]/40 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                {renderIconByName(fact.iconName, 'w-4 h-4 text-[#0B5E8E]')}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  {fact.label}
                </span>
                <span className="font-bold text-xs sm:text-sm text-[#0B5E8E] block mt-0.5">
                  {fact.value}
                </span>
                {fact.subtext && (
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    {fact.subtext}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Interactive Page Layout */}
      <div ref={mainContainerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Main Section Navigation Bar */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-3 mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* View Mode Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => { setActiveMainTab('chapters'); setViewMode('single'); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'chapters' && viewMode === 'single'
                    ? 'bg-[#0B5E8E] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Guide Chapters ({article.sections.length})</span>
              </button>

              <button
                onClick={() => setActiveMainTab('travellers')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'travellers'
                    ? 'bg-[#0B5E8E] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Traveller Types</span>
              </button>

              <button
                onClick={() => {
                  setActiveMainTab('faqs');
                  const elem = document.getElementById('faq-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'faqs'
                    ? 'bg-[#0B5E8E] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Practical FAQs</span>
              </button>
            </div>

            {/* Toggle Full Scroll Mode option */}
            {activeMainTab === 'chapters' && (
              <button
                onClick={() => setViewMode(viewMode === 'single' ? 'all' : 'single')}
                className="text-xs font-semibold text-[#0B5E8E] hover:text-[#08486e] px-3 py-1.5 rounded-lg bg-[#0B5E8E]/5 border border-[#0B5E8E]/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Layers className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>{viewMode === 'single' ? 'View All Chapters at Once' : 'Switch to Tabbed Chapters View'}</span>
              </button>
            )}
          </div>

          {/* Chapter Quick Selector Row */}
          {activeMainTab === 'chapters' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-[11px] font-bold text-gray-400 shrink-0 uppercase tracking-wider">Chapters:</span>
              {article.sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => handleSelectSection(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeSectionIndex === idx && viewMode === 'single'
                      ? 'bg-[#C9A66B] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-200/80 border border-gray-200/60'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-extrabold">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[140px] sm:max-w-none">{sec.tocTitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. Content Layout Container */}
        {activeMainTab === 'chapters' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Chapter List Index (4 Cols) */}
            <aside className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4">
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                    Guide Index ({article.sections.length} Chapters)
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A66B] bg-[#C9A66B]/10 px-2 py-0.5 rounded-full">
                    Chapter {activeSectionIndex + 1} of {article.sections.length}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                  {article.sections.map((sec, idx) => {
                    const isSelected = activeSectionIndex === idx && viewMode === 'single';
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleSelectSection(idx)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                          isSelected
                            ? 'bg-[#0B5E8E] text-white font-bold shadow-xs translate-x-1'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#C9A66B] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="line-clamp-2 leading-snug flex-1">{sec.tocTitle}</span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                          isSelected ? 'text-[#C9A66B] translate-x-0.5' : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                      </button>
                    );
                  })}
                </div>

                {/* Specialist Callout */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="p-3.5 rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/15 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B5E8E]">
                      <PhoneCall className="w-3.5 h-3.5 text-[#C9A66B]" />
                      <span>Have Victoria Falls Questions?</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Connect with our local Zimbabwe team for custom advice and lodge bookings.
                    </p>
                    <button
                      onClick={() => {
                        trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'sidebar_speak_specialist' });
                        onOpenPlanHoliday();
                      }}
                      className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                      <span>Talk to a Specialist</span>
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Active Chapter Content Panel (8 Cols) */}
            <main className="lg:col-span-8 space-y-8">
              
              {/* Single Active Chapter View Mode */}
              {viewMode === 'single' ? (
                <div className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                  
                  {/* Chapter Header */}
                  <div className="pb-4 border-b border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                        Chapter {activeSectionIndex + 1} of {article.sections.length}
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] leading-tight">
                        {activeSection.heading}
                      </h2>
                    </div>
                  </div>

                  {/* Render Active Chapter Blocks */}
                  <div className="space-y-6">
                    {activeSection.blocks.map((block, bIdx) => (
                      <React.Fragment key={bIdx}>
                        {block.type === 'text' && block.content && (
                          <p className="text-base text-gray-700 leading-relaxed font-normal">
                            {block.content}
                          </p>
                        )}

                        {block.type === 'heading' && block.subheading && (
                          <h3 className="font-serif text-xl font-bold text-[#0B5E8E] pt-3 leading-snug">
                            {block.subheading}
                          </h3>
                        )}

                        {block.type === 'bullet_list' && block.items && (
                          <ul className="space-y-3 bg-[#FAF9F6] p-5 rounded-xl border border-gray-200/70">
                            {block.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {block.type === 'image' && block.imageUrl && (
                          <figure className="my-6 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs bg-gray-50">
                            <img 
                              src={block.imageUrl} 
                              alt={block.imageAlt || 'Victoria Falls travel photo'}
                              loading="lazy"
                              className="w-full h-auto max-h-[460px] object-cover"
                            />
                            {(block.imageCaption || block.imageCredit) && (
                              <figcaption className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap justify-between gap-2">
                                <span>{block.imageCaption}</span>
                                {block.imageCredit && (
                                  <span className="font-semibold text-gray-400">Photo: {block.imageCredit}</span>
                                )}
                              </figcaption>
                            )}
                          </figure>
                        )}

                        {block.type === 'callout' && block.callout && (
                          <div className={`p-5 sm:p-6 rounded-2xl border ${
                            block.callout.type === 'advice'
                              ? 'bg-[#0B5E8E]/5 border-[#0B5E8E]/30 text-[#0B5E8E]'
                              : block.callout.type === 'recommendation'
                              ? 'bg-[#E67E22]/5 border-[#E67E22]/30 text-[#8E4B10]'
                              : 'bg-[#C9A66B]/10 border-[#C9A66B]/40 text-[#5E4A28]'
                          }`}>
                            <div className="flex items-center gap-2 font-bold text-sm mb-2">
                              {block.callout.type === 'advice' ? (
                                <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />
                              ) : block.callout.type === 'recommendation' ? (
                                <Sparkles className="w-5 h-5 text-[#E67E22]" />
                              ) : (
                                <Lightbulb className="w-5 h-5 text-[#C9A66B]" />
                              )}
                              <span className="font-serif text-base">{block.callout.title}</span>
                            </div>
                            <p className="text-sm leading-relaxed text-gray-700">
                              {block.callout.content}
                            </p>
                          </div>
                        )}

                        {block.type === 'table' && block.table && (
                          <div className="overflow-x-auto my-6 rounded-2xl border border-gray-200 bg-white shadow-xs">
                            {block.table.title && (
                              <div className="p-4 bg-[#0D2833] text-white font-bold text-sm font-serif">
                                {block.table.title}
                              </div>
                            )}
                            <table className="w-full text-left text-xs sm:text-sm">
                              <thead className="bg-[#FAF9F6] text-[#0B5E8E] font-bold border-b border-gray-200">
                                <tr>
                                  {block.table.headers.map((h, hI) => (
                                    <th key={hI} className="p-3.5">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {block.table.rows.map((row, rI) => (
                                  <tr key={rI} className="hover:bg-gray-50/80 transition-colors">
                                    {row.map((cell, cI) => (
                                      <td key={cI} className="p-3.5 text-gray-700">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Chapter Pagination Next/Previous Buttons */}
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleSelectSection(Math.max(0, activeSectionIndex - 1))}
                      disabled={activeSectionIndex === 0}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        activeSectionIndex === 0
                          ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Chapter</span>
                    </button>

                    <button
                      onClick={() => handleSelectSection(Math.min(article.sections.length - 1, activeSectionIndex + 1))}
                      disabled={activeSectionIndex === article.sections.length - 1}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        activeSectionIndex === article.sections.length - 1
                          ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
                          : 'bg-[#0B5E8E] hover:bg-[#08486e] text-white shadow-xs'
                      }`}
                    >
                      <span>Next Chapter</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ) : (
                /* All Chapters Continuous Document View */
                <div className="space-y-12">
                  {article.sections.map((section, sIdx) => (
                    <section key={section.id} id={section.id} className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="pb-4 border-b border-gray-100 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                            Chapter {sIdx + 1} of {article.sections.length}
                          </span>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] leading-tight">
                            {section.heading}
                          </h2>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {section.blocks.map((block, bIdx) => (
                          <React.Fragment key={bIdx}>
                            {block.type === 'text' && block.content && (
                              <p className="text-base text-gray-700 leading-relaxed font-normal">
                                {block.content}
                              </p>
                            )}

                            {block.type === 'heading' && block.subheading && (
                              <h3 className="font-serif text-xl font-bold text-[#0B5E8E] pt-3 leading-snug">
                                {block.subheading}
                              </h3>
                            )}

                            {block.type === 'bullet_list' && block.items && (
                              <ul className="space-y-3 bg-[#FAF9F6] p-5 rounded-xl border border-gray-200/70">
                                {block.items.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-[#0B5E8E] shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {block.type === 'image' && block.imageUrl && (
                              <figure className="my-6 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs bg-gray-50">
                                <img 
                                  src={block.imageUrl} 
                                  alt={block.imageAlt || 'Victoria Falls travel photo'}
                                  loading="lazy"
                                  className="w-full h-auto max-h-[460px] object-cover"
                                />
                                {(block.imageCaption || block.imageCredit) && (
                                  <figcaption className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap justify-between gap-2">
                                    <span>{block.imageCaption}</span>
                                    {block.imageCredit && (
                                      <span className="font-semibold text-gray-400">Photo: {block.imageCredit}</span>
                                    )}
                                  </figcaption>
                                )}
                              </figure>
                            )}

                            {block.type === 'callout' && block.callout && (
                              <div className={`p-5 sm:p-6 rounded-2xl border ${
                                block.callout.type === 'advice'
                                  ? 'bg-[#0B5E8E]/5 border-[#0B5E8E]/30 text-[#0B5E8E]'
                                  : block.callout.type === 'recommendation'
                                  ? 'bg-[#E67E22]/5 border-[#E67E22]/30 text-[#8E4B10]'
                                  : 'bg-[#C9A66B]/10 border-[#C9A66B]/40 text-[#5E4A28]'
                              }`}>
                                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                                  {block.callout.type === 'advice' ? (
                                    <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />
                                  ) : block.callout.type === 'recommendation' ? (
                                    <Sparkles className="w-5 h-5 text-[#E67E22]" />
                                  ) : (
                                    <Lightbulb className="w-5 h-5 text-[#C9A66B]" />
                                  )}
                                  <span className="font-serif text-base">{block.callout.title}</span>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-700">
                                  {block.callout.content}
                                </p>
                              </div>
                            )}

                            {block.type === 'table' && block.table && (
                              <div className="overflow-x-auto my-6 rounded-2xl border border-gray-200 bg-white shadow-xs">
                                {block.table.title && (
                                  <div className="p-4 bg-[#0D2833] text-white font-bold text-sm font-serif">
                                    {block.table.title}
                                  </div>
                                )}
                                <table className="w-full text-left text-xs sm:text-sm">
                                  <thead className="bg-[#FAF9F6] text-[#0B5E8E] font-bold border-b border-gray-200">
                                    <tr>
                                      {block.table.headers.map((h, hI) => (
                                        <th key={hI} className="p-3.5">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {block.table.rows.map((row, rI) => (
                                      <tr key={rI} className="hover:bg-gray-50/80 transition-colors">
                                        {row.map((cell, cI) => (
                                          <td key={cI} className="p-3.5 text-gray-700">{cell}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {/* Mid-Article Assistance Banner */}
              <section className="rounded-2xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Free Local Concierge Service</span>
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Need Help Customising Your Victoria Falls Itinerary?
                  </h3>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Our Victoria Falls specialists offer complimentary custom trip planning and lodge bookings.
                  </p>
                </div>

                <button
                  onClick={() => {
                    trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'mid_article_holiday_builder' });
                    onOpenPlanHoliday();
                  }}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Build My Custom Trip</span>
                </button>
              </section>

              {/* Trust Section */}
              <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                    Local Advantage
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                    Why Plan Your Victoria Falls Journey with Outbound Holidays?
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                      <MapPin className="w-4 h-4 text-[#0B5E8E]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B5E8E]">Based in Victoria Falls</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        Our main office and concierge team live in Victoria Falls with 24/7 on-ground support.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#0B5E8E]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B5E8E]">Handpicked Lodges & Tours</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        We only recommend lodges and riverboats we personally inspect and audit.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </main>
          </div>
        )}

        {/* Traveller Types Tab Section */}
        {activeMainTab === 'travellers' && (
          <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6 mb-12">
            <div className="pb-4 border-b border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                Tailored Advice
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                Victoria Falls for Every Traveller Type
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(article.travellerTypes || []).map((card) => (
                <div key={card.id} className="rounded-xl border border-gray-200 overflow-hidden bg-[#FAF9F6] flex flex-col justify-between hover:border-[#C9A66B] transition-all group">
                  <div>
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        {card.recommendedDuration}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-base text-[#0B5E8E] font-serif">
                        {card.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {card.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-gray-200/80 text-[11px] text-gray-700 space-y-1 bg-white p-3 rounded-lg border border-gray-100">
                      <span className="font-bold text-[#0B5E8E] block">Specialist Tip:</span>
                      <p className="italic">{card.topTip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Restored FAQ Section with Search, Filter Tabs, and Accordions */}
        <section id="faq-section" className="mt-12 bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xs space-y-8">
          
          {/* FAQ Header */}
          <div className="space-y-3 border-b border-gray-100 pb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A66B]/15 text-[#8E713E] text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Victoria Falls Knowledge Base</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B5E8E] leading-tight">
              Your Victoria Falls Questions, Answered
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-3xl">
              Clear answers to the questions travellers ask us most often before visiting Victoria Falls.
            </p>
          </div>

          {/* Search Bar & Category Filter Tabs */}
          <div className="space-y-4">
            
            {/* Search Input Field */}
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search your Victoria Falls question…"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-[#FAF9F6] text-sm text-[#1A2E35] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]/30 focus:border-[#0B5E8E] transition-all"
              />
              {faqSearchQuery && (
                <button
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {FAQ_FILTER_TABS.map((tab) => {
                const isActive = activeFaqFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFaqFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0B5E8E] text-white shadow-xs'
                        : 'bg-[#FAF9F6] text-gray-600 hover:bg-gray-200/80 border border-gray-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Accordions List */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isOpen
                        ? 'border-[#0B5E8E]/40 bg-white shadow-xs'
                        : 'border-gray-200/80 bg-[#FAF9F6] hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaqIndex(idx)}
                      aria-expanded={isOpen}
                      className="w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C9A66B] bg-[#C9A66B]/10 px-2 py-0.5 rounded-md shrink-0">
                          {faq.category || 'FAQ'}
                        </span>
                        <span className="font-serif font-bold text-sm sm:text-base text-[#0B5E8E] leading-snug">
                          {faq.question}
                        </span>
                      </div>
                      <div className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                        isOpen ? 'bg-[#0B5E8E] text-white rotate-180' : 'bg-gray-200/60 text-gray-500'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 pt-2 text-xs sm:text-sm text-gray-700 leading-relaxed border-t border-gray-100 bg-white">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4 bg-[#FAF9F6] rounded-2xl border border-gray-200/80 space-y-2">
                <HelpCircle className="w-8 h-8 text-[#C9A66B] mx-auto opacity-60" />
                <h4 className="font-serif font-bold text-base text-[#0B5E8E]">No questions found</h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  We couldn’t find any questions matching "{faqSearchQuery}". Try another keyword or ask our local specialists directly below.
                </p>
                <button
                  onClick={() => { setFaqSearchQuery(''); setActiveFaqFilter('All'); }}
                  className="text-xs font-bold text-[#0B5E8E] underline hover:text-[#E67E22] pt-2 inline-block cursor-pointer"
                >
                  Reset FAQ Search Filters
                </button>
              </div>
            )}
          </div>

          {/* 7. Still Have a Question? CTA */}
          <div className="mt-8 rounded-2xl bg-[#0D2833] text-white p-6 sm:p-8 border border-[#C9A66B]/30 shadow-md space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider">
                <MessageCircle className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Direct Local Concierge</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Still Have a Question?
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Planning a holiday is personal, and every traveller is different. If you have not found the answer you are looking for, our local Victoria Falls specialists are ready to help.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="tel:+263771234567"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 px-5 rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Ask a Local Specialist</span>
              </a>
              <button
                onClick={() => {
                  trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'faq_still_have_question_build' });
                  onOpenPlanHoliday();
                }}
                className="w-full sm:w-auto bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Build My Holiday</span>
              </button>
            </div>
          </div>
        </section>

        {/* 8. Final Planning Call To Action */}
        <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] text-white p-8 sm:p-10 shadow-xl relative overflow-hidden text-center space-y-5">
          <div className="max-w-2xl mx-auto space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/30">
              <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
              <span>Start Your Victoria Falls Experience</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to Experience Mosi-oa-Tunya?
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Let our local Victoria Falls specialists craft your bespoke itinerary — complete with handpicked river lodges, guided rainforest walks, and seamless transfers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <button
              onClick={() => {
                trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'final_plan_holiday' });
                onOpenPlanHoliday();
              }}
              className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Plan My Holiday Now</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
