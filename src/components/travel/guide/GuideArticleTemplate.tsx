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
  Users
} from 'lucide-react';

interface GuideArticleTemplateProps {
  article: GuideArticle;
  onOpenPlanHoliday: () => void;
  onSelectRelatedArticle?: (slug: string) => void;
  onNavigateHome?: () => void;
}

export const GuideArticleTemplate: React.FC<GuideArticleTemplateProps> = ({
  article,
  onOpenPlanHoliday,
  onSelectRelatedArticle,
  onNavigateHome,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    article.sections[0]?.id || ''
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('All');
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // References for scroll tracking
  const articleRef = useRef<HTMLDivElement>(null);

  // Track initial page view & inject dynamic SEO & JSON-LD schema
  useEffect(() => {
    trackGuideEvent('guide_viewed', {
      articleSlug: article.slug,
      articleTitle: article.title,
    });

    // Update document title & meta description
    document.title = article.seo.metaTitle;

    // Scroll to top on article change
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
      'mainEntity': article.faqs.map((faq) => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer,
        },
      })),
    };

    // Inject JSON-LD into DOM
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
      // Clean up script if unmounted
      const elem = document.getElementById(scriptId);
      if (elem) elem.remove();
    };
  }, [article]);

  // Scroll position listener for reading progress bar & section active states
  useEffect(() => {
    const handleScroll = () => {
      // Calculate overall reading scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Intersection / position check for active section
      const sectionElements = article.sections.map((sec) =>
        document.getElementById(sec.id)
      );

      const headerOffset = 140; // Account for fixed header
      const scrollPos = window.scrollY + headerOffset;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const elem = sectionElements[i];
        if (elem && elem.offsetTop <= scrollPos) {
          if (activeSectionId !== article.sections[i].id) {
            setActiveSectionId(article.sections[i].id);
            trackGuideEvent('section_scrolled', {
              articleSlug: article.slug,
              sectionId: article.sections[i].id,
            });
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.sections, activeSectionId, article.slug]);

  // Smooth scroll handler with header offset
  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setMobileTocOpen(false);

    trackGuideEvent('toc_clicked', {
      articleSlug: article.slug,
      sectionId,
    });

    const elem = document.getElementById(sectionId);
    if (elem) {
      const headerOffset = 110;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
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

  const filteredFaqs = faqCategoryFilter === 'All' 
    ? article.faqs 
    : article.faqs.filter(f => f.category === faqCategoryFilter);

  const faqCategories = ['All', ...Array.from(new Set(article.faqs.map(f => f.category).filter(Boolean)))];

  return (
    <div ref={articleRef} className="bg-[#FAF9F6] text-[#1A2E35] min-h-screen selection:bg-[#C9A66B]/30 selection:text-[#0B5E8E]">
      {/* Reading Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-[#0B5E8E] via-[#C9A66B] to-[#D97706] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Breadcrumbs Navigation */}
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

      {/* 3. Editorial Article Hero */}
      <section className="relative bg-[#0D2833] text-white overflow-hidden py-12 lg:py-20">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={article.heroImageUrl} 
            alt={article.heroImageAlt}
            className="w-full h-full object-cover object-center opacity-30 transform scale-105 filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2833] via-[#0D2833]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/30 mb-6 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-[#C9A66B]" />
            <span>{article.category}</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6">
            {article.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-200 font-normal leading-relaxed max-w-3xl mb-8">
            {article.subtitle}
          </p>

          {/* 5. Primary and Secondary Hero CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <button
              onClick={() => {
                trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'hero_plan_trip' });
                onOpenPlanHoliday();
              }}
              className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Plan My Victoria Falls Trip</span>
            </button>

            <button
              onClick={() => {
                const elem = document.getElementById('understanding-the-falls');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-5 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>Read Local Guide</span>
              <ArrowRight className="w-4 h-4 text-[#C9A66B]" />
            </button>
          </div>

          {/* 4. Article Metadata Bar */}
          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-6 text-xs text-gray-300">
            {/* Author Badge */}
            <div className="flex items-center gap-3">
              <img 
                src={article.author.avatarUrl} 
                alt={article.author.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#C9A66B]"
              />
              <div>
                <span className="font-bold text-white block text-sm">{article.author.name}</span>
                <span className="text-gray-300 text-[11px] block">{article.author.role}</span>
              </div>
            </div>

            {/* Reading Details */}
            <div className="flex items-center gap-4 sm:gap-6 text-gray-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#C9A66B]" />
                <span>Updated: {article.lastUpdatedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C9A66B]" />
                <span>{article.readingTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C9A66B]" />
                <span>{article.location}</span>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShareClick}
                className="ml-auto sm:ml-0 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                title="Share or copy article link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#C9A66B]" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Four Quick-Planning Facts Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 mb-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {article.quickFacts.map((fact, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3.5 p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-[#C9A66B]/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                {renderIconByName(fact.iconName, 'w-5 h-5 text-[#0B5E8E]')}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  {fact.label}
                </span>
                <span className="font-bold text-sm text-[#0B5E8E] block mt-0.5">
                  {fact.value}
                </span>
                {fact.subtext && (
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    {fact.subtext}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Two-Column Desktop Article Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* 21. Mobile Collapsible Section Navigation */}
        <div className="lg:hidden mb-8 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-sm text-[#0B5E8E] bg-[#0B5E8E]/5 border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-[#C9A66B]" />
              <span>Jump to a Section ({article.sections.length} Chapters)</span>
            </div>
            {mobileTocOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {mobileTocOpen && (
            <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
              {article.sections.map((sec, i) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    activeSectionId === sec.id 
                      ? 'bg-[#0B5E8E] text-white font-bold shadow-xs' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    activeSectionId === sec.id ? 'bg-[#C9A66B] text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="truncate">{sec.tocTitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 8. Sticky Guide Contents Navigation (Desktop Left Sidebar) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-2xl border border-gray-200/90 shadow-md p-6 space-y-6">
              <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block">
                    Guide Index
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#0B5E8E]">
                    Article Contents
                  </h3>
                </div>
                <div className="text-xs font-bold text-gray-400">
                  {article.sections.length} Sections
                </div>
              </div>

              {/* Table of Contents Item List */}
              <nav aria-label="Article Table of Contents" className="space-y-1.5">
                {article.sections.map((sec, idx) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-[#0B5E8E] text-white font-bold shadow-sm translate-x-1'
                          : 'text-gray-600 hover:text-[#0B5E8E] hover:bg-gray-50'
                      }`}
                      aria-current={isActive ? 'location' : undefined}
                    >
                      <span className={`w-6 h-6 rounded-lg text-[10px] font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-[#C9A66B] text-white' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-[#0B5E8E]/10 group-hover:text-[#0B5E8E]'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2 leading-snug">{sec.tocTitle}</span>
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#C9A66B] ml-auto shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Specialist Callout Box */}
              <div className="p-4 rounded-xl bg-[#0B5E8E]/5 border border-[#0B5E8E]/15 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B5E8E]">
                  <PhoneCall className="w-4 h-4 text-[#C9A66B]" />
                  <span>Have questions about Victoria Falls?</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Speak directly with a local Zimbabwe specialist for personal itinerary advice.
                </p>
                <button
                  onClick={() => {
                    trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'sidebar_speak_specialist' });
                    onOpenPlanHoliday();
                  }}
                  className="w-full bg-[#0B5E8E] hover:bg-[#08486e] text-white font-bold text-xs py-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                  <span>Talk to a Specialist</span>
                </button>
              </div>
            </div>
          </aside>

          {/* 9. Main Editorial Article Body Column */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* Render Each Article Section */}
            {article.sections.map((section, sIdx) => (
              <section 
                key={section.id} 
                id={section.id} 
                className="scroll-mt-32 bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6"
              >
                {/* Section Header */}
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                    Chapter {sIdx + 1}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B5E8E] leading-tight">
                    {section.heading}
                  </h2>
                </div>

                {/* Render Section Blocks */}
                <div className="space-y-6">
                  {section.blocks.map((block, bIdx) => (
                    <React.Fragment key={bIdx}>
                      {/* Standard Paragraph */}
                      {block.type === 'text' && block.content && (
                        <p className="text-base text-gray-700 leading-relaxed font-normal">
                          {block.content}
                        </p>
                      )}

                      {/* Heading H3 */}
                      {block.type === 'heading' && block.subheading && (
                        <h3 className="font-serif text-xl font-bold text-[#0B5E8E] pt-4 leading-snug">
                          {block.subheading}
                        </h3>
                      )}

                      {/* Bullet List */}
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

                      {/* Responsive Image */}
                      {block.type === 'image' && block.imageUrl && (
                        <figure className="my-6 rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs bg-gray-50">
                          <img 
                            src={block.imageUrl} 
                            alt={block.imageAlt || 'Victoria Falls travel photo'}
                            loading="lazy"
                            className="w-full h-auto max-h-[480px] object-cover"
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

                      {/* 13. Callout Box (Outbound Advice, Local Insight, Our Recommendation) */}
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

                      {/* 12. Pull Quote */}
                      {block.type === 'pullquote' && block.pullQuote && (
                        <blockquote className="my-8 p-6 rounded-2xl bg-gradient-to-r from-[#0D2833] to-[#0B5E8E] text-white shadow-lg relative overflow-hidden">
                          <Quote className="w-16 h-16 text-[#C9A66B]/20 absolute -right-2 -bottom-2 pointer-events-none" />
                          <p className="font-serif italic text-lg sm:text-xl text-white/95 leading-relaxed mb-4 relative z-10">
                            "{block.pullQuote.quote}"
                          </p>
                          <footer className="text-xs font-semibold text-[#C9A66B]">
                            — {block.pullQuote.author} {block.pullQuote.title && `(${block.pullQuote.title})`}
                          </footer>
                        </blockquote>
                      )}

                      {/* 14. Configurable Practical Info Panel */}
                      {block.type === 'practical_info' && block.practicalPanel && (
                        <div className="my-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm p-6 space-y-4">
                          <div className="pb-3 border-b border-gray-100">
                            <h4 className="font-serif font-bold text-lg text-[#0B5E8E]">
                              {block.practicalPanel.title}
                            </h4>
                            {block.practicalPanel.subtitle && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {block.practicalPanel.subtitle}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {block.practicalPanel.items.map((item, idx) => (
                              <div key={idx} className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0 mt-0.5">
                                  {renderIconByName(item.iconName, 'w-4 h-4 text-[#0B5E8E]')}
                                </div>
                                <div>
                                  <h5 className="font-bold text-sm text-[#0B5E8E] mb-1">
                                    {item.heading}
                                  </h5>
                                  <p className="text-xs text-gray-600 leading-relaxed">
                                    {item.detail}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </section>
            ))}

            {/* 15. Traveller-Type Cards Component */}
            <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                  Tailored Advice
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                  Victoria Falls for Every Traveller Type
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {article.travellerTypes.map((card) => (
                  <div key={card.id} className="rounded-xl border border-gray-200 overflow-hidden bg-[#FAF9F6] flex flex-col hover:border-[#C9A66B] transition-all group">
                    <div className="h-44 overflow-hidden relative">
                      <img 
                        src={card.imageUrl} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        {card.recommendedDuration}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-base text-[#0B5E8E] font-serif">
                          {card.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {card.tagline}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-gray-200/80 text-[11px] text-gray-700 space-y-1 bg-white p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-[#0B5E8E] block">Specialist Tip:</span>
                        <p className="italic">{card.topTip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 16. Mid-Article Assistance CTA */}
            <section className="rounded-2xl bg-gradient-to-br from-[#0B5E8E] to-[#0D2833] text-white p-8 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Free Local Concierge Service</span>
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Need Help Customising Your Victoria Falls Itinerary?
                </h3>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Our Victoria Falls specialists offer complimentary custom trip planning, lodge reservations, and on-ground assistance.
                </p>
              </div>

              <button
                onClick={() => {
                  trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'mid_article_holiday_builder' });
                  onOpenPlanHoliday();
                }}
                className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Build My Custom Trip</span>
              </button>
            </section>

            {/* 18. "Why plan with Outbound Holidays?" Trust Section */}
            <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-gray-100 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                  Local Advantage
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                  Why Plan Your Victoria Falls Journey with Outbound Holidays?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <MapPin className="w-5 h-5 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Based in Victoria Falls</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Our main office and concierge team live in Victoria Falls, providing 24/7 on-ground emergency support.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Handpicked Lodges & Tours</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      We only recommend lodges, riverboats, and guides we personally inspect and audit regularly.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <DollarSign className="w-5 h-5 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Transparent Local Rates</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Direct contract rates with zero hidden markups or surprise fees.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0B5E8E]/10 flex items-center justify-center text-[#0B5E8E] shrink-0">
                    <Users className="w-5 h-5 text-[#0B5E8E]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0B5E8E]">Seamless Multi-Country Safaris</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Expertly combined Victoria Falls, Chobe (Botswana), and Hwange National Park logistics.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 19. Accessible FAQ Accordion Section */}
            <section id="faqs" className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-32">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                    First-Time Answers
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                    Frequently Asked Questions
                  </h3>
                </div>

                {/* FAQ Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {faqCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFaqCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        faqCategoryFilter === cat
                          ? 'bg-[#0B5E8E] text-white font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accordion Item List */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-gray-200 rounded-xl overflow-hidden bg-[#FAF9F6] transition-all"
                    >
                      <button
                        onClick={() => {
                          const nextState = isOpen ? null : idx;
                          setOpenFaqIndex(nextState);
                          trackGuideEvent('faq_toggled', {
                            articleSlug: article.slug,
                            faqQuestion: faq.question,
                          });
                        }}
                        aria-expanded={isOpen}
                        className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-sm text-[#0B5E8E] hover:text-[#08486e] focus:outline-none focus:ring-2 focus:ring-[#0B5E8E] cursor-pointer"
                      >
                        <span className="pr-4">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#C9A66B] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 bg-white">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 17. Related-Guide Cards Component */}
            {article.relatedGuides && article.relatedGuides.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-gray-100">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A66B] block mb-1">
                    Continue Planning
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#0B5E8E]">
                    More Victoria Falls Travel Guides
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {article.relatedGuides.map((rel) => (
                    <div 
                      key={rel.slug}
                      onClick={() => {
                        trackGuideEvent('related_guide_clicked', {
                          articleSlug: article.slug,
                          relatedSlug: rel.slug,
                        });
                        if (onSelectRelatedArticle) {
                          onSelectRelatedArticle(rel.slug);
                        }
                      }}
                      className="rounded-xl border border-gray-200 overflow-hidden bg-[#FAF9F6] hover:border-[#0B5E8E] transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="h-40 overflow-hidden relative">
                        <img 
                          src={rel.imageUrl} 
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {rel.badge && (
                          <span className="absolute top-2 left-2 bg-[#E67E22] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                            {rel.badge}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 bg-[#0D2833]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-md">
                          {rel.readTime}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A66B] block">
                            {rel.category}
                          </span>
                          <h4 className="font-bold text-base text-[#0B5E8E] font-serif group-hover:text-[#08486e] transition-colors mt-1">
                            {rel.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                            {rel.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-200 text-xs font-bold text-[#0B5E8E] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Read Full Guide</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#C9A66B]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 20. Final Planning CTA Section */}
            <section className="rounded-3xl bg-gradient-to-r from-[#0D2833] via-[#0B5E8E] to-[#0D2833] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center space-y-6">
              <div className="max-w-2xl mx-auto space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C9A66B]/20 text-[#E5C989] text-xs font-bold uppercase tracking-wider border border-[#C9A66B]/30">
                  <Compass className="w-4 h-4 text-[#C9A66B]" />
                  <span>Start Your Victoria Falls Experience</span>
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Ready to Experience Mosi-oa-Tunya?
                </h2>
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                  Let our local Victoria Falls specialists craft your bespoke itinerary — complete with handpicked river lodges, guided rainforest walks, and seamless transfers.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-10">
                <button
                  onClick={() => {
                    trackGuideEvent('cta_clicked', { articleSlug: article.slug, ctaName: 'final_plan_holiday' });
                    onOpenPlanHoliday();
                  }}
                  className="bg-[#E67E22] hover:bg-[#d36e17] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <CalendarCheck className="w-5 h-5" />
                  <span>Plan My Holiday Now</span>
                </button>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};
