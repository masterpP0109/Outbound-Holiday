import { ContactUsView } from './components/travel/ContactUsView';
import { useEffect,useState } from 'react';
import { resolveRoute,sectionPath,experiencePath,packagePath,accommodationPath,categoryPath,blogPath,offerPath } from './routes';
import { getWpConfig } from './runtime/api';
import { editorialValueOptional } from './runtime/catalog';
import { PageMetadata } from './components/common/PageMetadata';
import { PageLink } from './components/common/PageLink';
import { Currency,TravelPackage } from './types';
import { Header } from './components/common/Header';
import { TravelHero } from './components/travel/TravelHero';
import { QuickPlanningBar } from './components/travel/QuickPlanningBar';
import { WhyChooseOutbound } from './components/travel/WhyChooseOutbound';
import { FeaturedExperiences } from './components/travel/FeaturedExperiences';
import { ExperiencesDirectoryPage } from './components/travel/ExperiencesDirectoryPage';
import { ExperienceDetailPage } from './components/travel/ExperienceDetailPage';
import { Experience,ALL_EXPERIENCES } from './data/experiencesData';
import { WhereToStaySection } from './components/travel/WhereToStaySection';
import { AccommodationDirectoryPage } from './components/travel/AccommodationDirectoryPage';
import { AccommodationDetailPage } from './components/travel/AccommodationDetailPage';
import { DetailedAccommodation } from './data/accommodationsData';
import { FeaturedPackages } from './components/travel/FeaturedPackages';
import { PackagesDirectoryPage } from './components/travel/PackagesDirectoryPage';
import { PackageDetailPage } from './components/travel/PackageDetailPage';
import { DetailedPackage } from './data/packagesData';
import { TravellerStories } from './components/travel/TravellerStories';
import { AboutPage } from './components/travel/AboutPage';
import { ClientGallery } from './components/travel/ClientGallery';
import { FinalCtaBanner } from './components/travel/FinalCtaBanner';
import { VicFallsGuide } from './components/travel/VicFallsGuide';
import { VicFallsGuidePage } from './components/travel/VicFallsGuidePage';
import { BlogListingPage } from './components/blog/BlogListingPage';
import { BlogArticlePage } from './components/blog/BlogArticlePage';
import { ExperienceCategoryPage } from './components/travel/ExperienceCategoryPage';
import { BomaExperiencePage } from './components/travel/BomaExperiencePage';
import { BungeeExperiencePage } from './components/travel/BungeeExperiencePage';
import { PlanHolidayModal } from './components/travel/PlanHolidayModal';
import { PromotionalModal } from './components/promotions/PromotionalModal';
import { PromotionEnquiryModal } from './components/promotions/PromotionEnquiryModal';
import { PromotionsSection } from './components/promotions/PromotionsSection';
import { OfferDetailPage } from './components/promotions/OfferDetailPage';
import type { PromotionOffer } from './types/promotion';
import { fetchActivePromotions, canShowPromotionPopup } from './data/promotionsData';
import { MobileStickyCta } from './components/common/MobileStickyCta';
import { Newsletter } from './components/common/Newsletter';
import { NewsletterAdmin } from './components/admin/NewsletterAdmin';
import { Footer } from './components/common/Footer';

export default function App({ initialPath,contentVersion }: { initialPath?: string;contentVersion?:string } = {}) {
  // Application View & Navigation State
  const [hasClientNavigated, setHasClientNavigated] = useState(false);
  const [route, setRoute] = useState(() => resolveRoute(initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname)));
  useEffect(() => {
    setRoute(resolveRoute(hasClientNavigated ? window.location.pathname : (initialPath ?? window.location.pathname)));
  }, [contentVersion]);
  const activeView = route.view;
  const selectedExperience = route.experience;
  const selectedCategory = route.category;
  const selectedPackage = route.package;
  const selectedAccommodation = route.accommodation;
  const [currency, setCurrency] = useState<Currency>('USD');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRoute(window.location.pathname));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const frame = requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
      return () => cancelAnimationFrame(frame);
    }
  }, [route]);

  const navigate = (path: string) => {
    setHasClientNavigated(true);
    if (window.location.pathname + window.location.hash !== path) window.history.pushState({}, '', path);
    setRoute(resolveRoute(window.location.pathname));
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modals & Drawers
  const [preselectedActivity,setPreselectedActivity]=useState<string|null>(null);
  const [planHolidayOpen, setPlanHolidayOpen] = useState(false);
  const [preselectedPackage, setPreselectedPackage] = useState<TravelPackage | DetailedPackage | null>(null);
  const [preselectedAccommodation, setPreselectedAccommodation] = useState<DetailedAccommodation | null>(null);

  const handleSelectAccommodationDetail = (property: DetailedAccommodation) => navigate(accommodationPath(property));
  const handleExploreAllAccommodations = () => navigate(sectionPath('accommodation'));
  const handleSelectPackageDetail = (pkg: DetailedPackage) => navigate(packagePath(pkg));
  const handleExploreAllPackages = () => navigate(sectionPath('packages'));
  const handleSelectExperience = (experience: Experience) => navigate(experiencePath(experience));
  const handleSelectCategory = (category: string) => navigate(categoryPath(category));
  const handleNavigateSection = (section: string) => navigate(sectionPath(section));
  const handleSearchQuery = (query: string) => {
    setSearchQuery(query);
    if (activeView !== 'packages') navigate(sectionPath('packages'));
  };

  // Promotions & Campaigns State
  const [promotions, setPromotions] = useState<PromotionOffer[]>([]);
  const [activePopupPromo, setActivePopupPromo] = useState<PromotionOffer | null>(null);
  const [promoEnquiryTarget, setPromoEnquiryTarget] = useState<PromotionOffer | null>(null);
  const [hasPopupTriggered, setHasPopupTriggered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchActivePromotions().then((list) => {
      if (isMounted && Array.isArray(list)) {
        setPromotions(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Pop-up Trigger Engine (Delay, Scroll, Exit Intent)
  const eligiblePopupPromo = promotions.find(
    (p) => p.display.showAsPopup && canShowPromotionPopup(p, route.path)
  );

  useEffect(() => {
    if (!eligiblePopupPromo || hasPopupTriggered || planHolidayOpen || promoEnquiryTarget) {
      return;
    }

    const mode = eligiblePopupPromo.trigger.mode || 'delay';
    const delaySec = typeof eligiblePopupPromo.trigger.delaySeconds === 'number' ? eligiblePopupPromo.trigger.delaySeconds : 3;
    const delayMs = Math.max(500, delaySec * 1000);
    const scrollTarget = eligiblePopupPromo.trigger.scrollPercentage || 40;

    let timer: NodeJS.Timeout | null = null;

    if (mode === 'delay') {
      timer = setTimeout(() => {
        if (!planHolidayOpen && canShowPromotionPopup(eligiblePopupPromo, route.path)) {
          setActivePopupPromo(eligiblePopupPromo);
          setHasPopupTriggered(true);
        }
      }, delayMs);
    }

    const handleScroll = () => {
      if (hasPopupTriggered) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      if (scrolled >= scrollTarget) {
        if (!planHolidayOpen && canShowPromotionPopup(eligiblePopupPromo, route.path)) {
          setActivePopupPromo(eligiblePopupPromo);
          setHasPopupTriggered(true);
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasPopupTriggered) return;
      if (e.clientY <= 20) {
        if (!planHolidayOpen && canShowPromotionPopup(eligiblePopupPromo, route.path)) {
          setActivePopupPromo(eligiblePopupPromo);
          setHasPopupTriggered(true);
        }
      }
    };

    if (mode === 'scroll') {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else if (mode === 'exit_intent') {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [eligiblePopupPromo, hasPopupTriggered, planHolidayOpen, promoEnquiryTarget, route.path]);

  const wpConfig = getWpConfig();
  const homepageSections = editorialValueOptional<Record<string, boolean>>('cms/homepage.sections', {});
  const showHomepageSection = (key: string): boolean => homepageSections[key] !== false;
  const designTokens = editorialValueOptional<Record<string, string>>('cms/design.tokens', {});

  useEffect(() => {
    const sanitizeHex = (val?: string) => (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val.trim()) ? val.trim() : '');
    const primary = sanitizeHex(designTokens.primaryColor);
    const secondary = sanitizeHex(designTokens.secondaryColor);
    const accent = sanitizeHex(designTokens.accentColor);
    const green = sanitizeHex(designTokens.greenColor);
    const dark = sanitizeHex(designTokens.darkColor);
    const styleId = 'outbound-cms-design-tokens';
    const existing = document.getElementById(styleId);

    const rules: string[] = [];
    if (primary && primary.toUpperCase() !== '#0B5E8E') {
      document.documentElement.style.setProperty('--vf-blue', primary);
      rules.push(`.bg-vf-blue,.bg-\\[\\#0B5E8E\\]{background-color:${primary}!important;}.text-vf-blue,.text-\\[\\#0B5E8E\\]{color:${primary}!important;}.border-vf-blue,.border-\\[\\#0B5E8E\\]{border-color:${primary}!important;}`);
    }
    if (secondary && secondary.toUpperCase() !== '#C9A66B') {
      document.documentElement.style.setProperty('--golden-savannah', secondary);
      rules.push(`.bg-golden-savannah,.bg-\\[\\#C9A66B\\]{background-color:${secondary}!important;}.text-golden-savannah,.text-\\[\\#C9A66B\\]{color:${secondary}!important;}.border-golden-savannah,.border-\\[\\#C9A66B\\]{border-color:${secondary}!important;}`);
    }
    if (accent && accent.toUpperCase() !== '#E67E22') {
      document.documentElement.style.setProperty('--sunset-orange', accent);
      rules.push(`.bg-sunset-orange,.bg-\\[\\#E67E22\\]{background-color:${accent}!important;}.text-sunset-orange,.text-\\[\\#E67E22\\]{color:${accent}!important;}`);
    }
    if (green && green.toUpperCase() !== '#3F6B3C') {
      document.documentElement.style.setProperty('--zambezi-green', green);
      rules.push(`.bg-zambezi-green,.bg-\\[\\#3F6B3C\\]{background-color:${green}!important;}.text-zambezi-green,.text-\\[\\#3F6B3C\\]{color:${green}!important;}`);
    }
    if (dark && dark.toUpperCase() !== '#2F3A44') {
      document.documentElement.style.setProperty('--charcoal-grey', dark);
    }

    if (rules.length > 0) {
      const styleEl = existing || document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = rules.join('\n');
      if (!existing) document.head.appendChild(styleEl);
    } else if (existing) {
      existing.remove();
    }
  }, [designTokens]);

  return (
    <div className="min-h-screen bg-white text-[#1A2E35] flex flex-col font-sans pb-20 md:pb-0">
      {wpConfig?.isPreview && (
        <div
          id="outbound-draft-preview-banner"
          className="bg-[#2F3A44] text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#C9A66B]"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E67E22]" />
            <strong>CMS Draft Preview Mode</strong>
            <span className="text-white/80">You are viewing unpublished draft changes. Visitors still see the published site.</span>
          </div>
          <div className="flex items-center gap-3">
            {wpConfig.cmsAdminUrl && (
              <a
                href={wpConfig.cmsAdminUrl}
                className="underline text-[#C9A66B] hover:text-white font-semibold"
              >
                Return to Outbound CMS
              </a>
            )}
            <a
              href={typeof window !== 'undefined' ? window.location.pathname : '/'}
              className="px-2.5 py-1 rounded bg-white/15 hover:bg-white/25 text-white font-semibold"
            >
              Exit Preview
            </a>
          </div>
        </div>
      )}
      {/* Navigation Header */}
      <Header
        currency={currency}
        setCurrency={setCurrency}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
          setPlanHolidayOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchQuery}

        onNavigateSection={handleNavigateSection}
        isHomepage={activeView === 'home'}
        isGuideActive={activeView === 'guide'}
        isExperiencesActive={activeView === 'experiences' || activeView === 'experience-category' || activeView === 'experience-detail' || activeView === 'boma' || activeView === 'bungee'}
        isAccommodationActive={activeView === 'accommodation' || activeView === 'accommodation-detail'}
        isPackagesActive={activeView === 'packages' || activeView === 'package-detail'}
        isGalleryActive={activeView === 'client-gallery'}
        isAboutActive={activeView === 'about'}
        isBlogActive={activeView === 'blog' || activeView === 'blog-post'}
        isContactActive={activeView === 'contact'}
      />

      {/* Main Content Area - Render Dedicated Page or Home Layout */}
      <main className="flex-1">
        {activeView === 'not-found' ? (
          <section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
            <h1 className="font-serif text-4xl font-bold text-[#0B5E8E]">Page not found</h1>
            <p>The page you’re looking for is unavailable. Explore our Victoria Falls holidays and experiences.</p>
            <PageLink href="/" onClick={() => navigate('/')} className="inline-block rounded-xl bg-[#0B5E8E] px-6 py-3 text-white">Back to home</PageLink>
          </section>
        ) : activeView === 'admin-newsletter' ? (
          <NewsletterAdmin onNavigateHome={() => navigate('/')} />
        ) : activeView === 'newsletter-confirmed' ? (
          <section className="max-w-3xl mx-auto p-12 text-center space-y-5">
            <h1 className="text-3xl font-serif text-[#0B5E8E]">
              {getWpConfig()?.newsletterResult?.status === 'confirmed'
                ? 'Subscription Confirmed!'
                : getWpConfig()?.newsletterResult?.status === 'unsubscribed'
                  ? 'You Have Been Unsubscribed'
                  : 'Travel updates confirmation'}
            </h1>
            <p>
              {getWpConfig()?.newsletterResult?.message ||
                'Use the confirmation link sent to your email to confirm your request. Visiting this page alone does not confirm a subscription.'}
            </p>
            <PageLink href="/" onClick={() => navigate('/')} className="inline-block rounded-xl bg-[#0B5E8E] px-6 py-3 text-white font-semibold">
              Explore Outbound Holidays
            </PageLink>
          </section>
        ) : activeView === 'contact' ? (
          <ContactUsView headingLevel="h1" />
        ) : activeView === 'about' ? (
          <AboutPage onNavigateSection={handleNavigateSection} onOpenPlanHoliday={() => { setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null); setPreselectedAccommodation(null); setPlanHolidayOpen(true); }} />
        ) : activeView === 'client-gallery' ? (
          <ClientGallery key="gallery-page" onNavigateHome={() => handleNavigateSection('hero')} />
        ) : activeView === 'accommodation' ? (
          <AccommodationDirectoryPage
            currency={currency}
            onSelectProperty={handleSelectAccommodationDetail}
            onIncludeInHoliday={(prop) => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPreselectedAccommodation(prop);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'accommodation-detail' && selectedAccommodation ? (
          <AccommodationDetailPage
            property={selectedAccommodation}
            currency={currency}
            onOpenPlanHolidayWithProperty={(prop) => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPreselectedAccommodation(prop);
              setPlanHolidayOpen(true);
            }}
            onSelectExperience={handleSelectExperience}
            onSelectRelatedProperty={handleSelectAccommodationDetail}
            onNavigateBackToDirectory={() => {
              navigate(sectionPath('accommodation'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'packages' ? (
          <PackagesDirectoryPage
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currency={currency}
            onSelectPackage={handleSelectPackageDetail}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'package-detail' && selectedPackage ? (
          <PackageDetailPage
            packageData={selectedPackage}
            currency={currency}
            onPlanHoliday={(pkg) => {
              setPreselectedPackage(pkg); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPlanHolidayOpen(true);
            }}
            onSelectExperience={handleSelectExperience}
            onSelectRelatedPackage={(pkg) => {
              handleSelectPackageDetail(pkg);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateBackToPackages={() => {
              navigate(sectionPath('packages'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'experiences' ? (
          <ExperiencesDirectoryPage
            onSelectExperience={handleSelectExperience}
            onSelectCategory={handleSelectCategory}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPlanHolidayOpen(true);
            }}
          />
        ) : activeView === 'experience-category' && selectedCategory ? (
          <ExperienceCategoryPage
            categoryId={selectedCategory}
            onSelectExperience={handleSelectExperience}
            onSelectCategory={handleSelectCategory}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToLanding={() => {
              navigate(sectionPath('experiences'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'experience-detail' && selectedExperience ? (
          <ExperienceDetailPage
            experience={selectedExperience}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(selectedExperience?.id??null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToDirectory={() => {
              if (selectedCategory) {
                navigate(categoryPath(selectedCategory));
              } else {
                navigate(sectionPath('experiences'));
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedExperience={(rel) => handleSelectExperience(rel)}
          />
        ) : activeView === 'boma' ? (
          <BomaExperiencePage
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(selectedExperience?.id??null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedExperience={(expTitle) => {
              const matched = ALL_EXPERIENCES.find((e) =>
                e.slug === expTitle || e.title.toLowerCase().includes(expTitle.toLowerCase())
              );
              if (matched) {
                handleSelectExperience(matched);
              } else {
                setPlanHolidayOpen(true);
              }
            }}
          />
        ) : activeView === 'bungee' ? (
          <BungeeExperiencePage
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(selectedExperience?.id??null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToDirectory={() => {
              navigate(sectionPath('experiences'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedExperience={(exp) => handleSelectExperience(exp)}
          />
        ) : activeView === 'guide' ? (
          <VicFallsGuidePage
            article={route.article}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeView === 'blog' ? (
          <BlogListingPage
            onSelectPost={(post) => navigate(blogPath(post))}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPlanHolidayOpen(true);
            }}
          />
        ) : activeView === 'blog-post' && route.blogPost ? (
          <BlogArticlePage
            post={route.blogPost}
            onSelectPost={(post) => navigate(blogPath(post))}
            onBackToBlog={() => {
              navigate(sectionPath('blog'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
              setPlanHolidayOpen(true);
            }}
          />
        ) : activeView === 'offer-detail' ? (
          <OfferDetailPage
            offer={
              promotions.find((p) => p.slug === route.offerSlug) ||
              promotions[0] || {
                id: 1,
                name: 'Victoria Falls Exclusive Offer',
                slug: route.offerSlug || 'victoria-falls-exclusive',
                campaignCode: 'VF-EXCLUSIVE',
                headline: 'Victoria Falls Exclusive Special Offer',
                subtitle: 'Personalised holiday planning with verified seasonal savings',
                shortDescription: 'Discover Victoria Falls with Outbound Holidays. Plan your accommodation, activities, and private transfers with local specialists based in Victoria Falls.',
                destinationOrActivity: 'Victoria Falls',
                category: 'packages',
                imageUrl: '/logo/outbound-holidays-logo-dark.webp',
                currency: 'USD',
                priceBasis: 'per_person',
                primaryCta: { label: 'Enquire About This Offer', destination: 'enquiry_form' },
                secondaryCta: { label: 'Explore Holiday Packages', destination: 'custom_url', target: '/victoria-falls-packages' },
                display: { showOnHomepage: true, showAsCard: true, showAsPopup: false },
                trigger: { mode: 'delay', delaySeconds: 8, scrollPercentage: 40, maxImpressions: 1, frequencyHours: 24 },
                whatsappUrl: 'https://wa.me/263714701721?text=Hello%20Outbound%20Holidays%2C%20I%20am%20interested%20in%20your%20Victoria%20Falls%20offer.',
                offerPageUrl: `/offers/${route.offerSlug || 'offer'}`,
              }
            }
            onNavigateHome={() => {
              navigate(sectionPath('home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigatePackages={() => {
              navigate(sectionPath('packages'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div className="space-y-0">
            {/* 1. Hero */}
            <TravelHero
              onOpenPlanHoliday={() => {
                setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
                setPlanHolidayOpen(true);
              }}
              onBrowsePackages={() => handleNavigateSection('travel-packages')}
            />

            {/* 2. Simple Holiday Discovery / Quick Planning Bar */}
            {showHomepageSection('showQuickPlanning') && (
              <QuickPlanningBar
                onOpenGuide={() => {
                  navigate(sectionPath('guide'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenExperiences={() => {
                  navigate(sectionPath('experiences'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 3. Featured Victoria Falls Experiences */}
            {showHomepageSection('showExperiences') && (
              <FeaturedExperiences
                onSelectExperience={handleSelectExperience}
                onExploreAll={() => {
                  navigate(sectionPath('experiences'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 4. Recommended Victoria Falls Holidays */}
            {showHomepageSection('showPackages') && (
              <FeaturedPackages
                currency={currency}
                onSelectPackage={handleSelectPackageDetail}
                onExploreAllPackages={handleExploreAllPackages}
              />
            )}

            {/* Optional CMS-Enabled Promotional Cards */}
            {showHomepageSection('showPromotionCards') && (
              <PromotionsSection
                promotions={promotions}
                onSelectOffer={(promo) => setPromoEnquiryTarget(promo)}
                onOpenOfferDetails={(promo) => navigate(offerPath(promo.slug))}
              />
            )}

            {/* 5. Where to Stay in Victoria Falls */}
            {showHomepageSection('showWhereToStay') && (
              <WhereToStaySection
                currency={currency}
                onSelectProperty={handleSelectAccommodationDetail}
                onExploreAllProperties={handleExploreAllAccommodations}
              />
            )}

            {/* 6. Victoria Falls Travel Guide / Local Insight */}
            {showHomepageSection('showGuides') && (
              <VicFallsGuide
                onOpenFullGuide={() => {
                  navigate(sectionPath('guide'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* 7. Why Choose Outbound Holidays */}
            {showHomepageSection('showWhyOutbound') && (
              <WhyChooseOutbound
                onOpenPlanHoliday={() => {
                  setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
                  setPlanHolidayOpen(true);
                }}
              />
            )}

            {/* 8. Traveller Stories / Testimonials */}
            {showHomepageSection('showStories') && <TravellerStories />}

            {/* Client Gallery Preview */}
            {showHomepageSection('showClientGallery') && (
              <ClientGallery preview onSeeGallery={() => handleNavigateSection('client-gallery')} />
            )}

            {/* 9. Final Call To Action */}
            {showHomepageSection('showFinalCta') && (
              <FinalCtaBanner
                onOpenPlanHoliday={() => {
                  setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
                  setPlanHolidayOpen(true);
                }}
              />
            )}
          </div>
        )}

        {/* Global Travel Newsletter Section (omitted on blog views where compact Victoria Falls Travel Club sits in-page) */}
        {activeView !== 'admin-newsletter' && activeView !== 'blog' && activeView !== 'blog-post' && showHomepageSection('showNewsletter') && <Newsletter />}
      </main>

      <PageMetadata route={route} />

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
          setPlanHolidayOpen(true);
        }}
      />

      {/* Mobile Sticky CTA Bar */}
      <MobileStickyCta
        isModalOpen={planHolidayOpen}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
          setPlanHolidayOpen(true);
        }}
      />

      {/* Holiday Builder Modal */}
      <PlanHolidayModal
        isOpen={planHolidayOpen}
        onClose={() => setPlanHolidayOpen(false)}
        preselectedActivity={preselectedActivity}
        preselectedPackage={preselectedPackage}
        preselectedAccommodation={preselectedAccommodation}
      />

      {/* Promotional Pop-up Modal */}
      {activePopupPromo && (
        <PromotionalModal
          promotion={activePopupPromo}
          isOpen={Boolean(activePopupPromo)}
          onClose={() => setActivePopupPromo(null)}
          onSelectOffer={(promo) => {
            setActivePopupPromo(null);
            setPromoEnquiryTarget(promo);
          }}
          onOpenOfferDetails={(promo) => {
            setActivePopupPromo(null);
            navigate(offerPath(promo.slug));
          }}
        />
      )}

      {/* Promotion-Linked Dedicated Enquiry Modal */}
      {promoEnquiryTarget && (
        <PromotionEnquiryModal
          promotion={promoEnquiryTarget}
          isOpen={Boolean(promoEnquiryTarget)}
          onClose={() => setPromoEnquiryTarget(null)}
        />
      )}
    </div>
  );
}
