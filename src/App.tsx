import { ContactUsView } from './components/travel/ContactUsView';
import { useEffect,useState } from 'react';
import { resolveRoute,sectionPath,experiencePath,packagePath,accommodationPath,categoryPath } from './routes';
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
import { HowWeHelp } from './components/travel/HowWeHelp';
import { FinalCtaBanner } from './components/travel/FinalCtaBanner';
import { VicFallsGuide } from './components/travel/VicFallsGuide';
import { VicFallsGuidePage } from './components/travel/VicFallsGuidePage';
import { ExperienceCategoryPage } from './components/travel/ExperienceCategoryPage';
import { BomaExperiencePage } from './components/travel/BomaExperiencePage';
import { BungeeExperiencePage } from './components/travel/BungeeExperiencePage';
import { PlanHolidayModal } from './components/travel/PlanHolidayModal';
import { MobileStickyCta } from './components/common/MobileStickyCta';
import { Newsletter } from './components/common/Newsletter';
import { Footer } from './components/common/Footer';

export default function App({ initialPath,contentVersion }: { initialPath?: string;contentVersion?:string } = {}) {
  // Application View & Navigation State
  const [route, setRoute] = useState(() => resolveRoute(initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname)));
  useEffect(() => { setRoute(resolveRoute(window.location.pathname)); },[contentVersion]);
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
    if (window.location.pathname + window.location.hash !== path) window.history.pushState({}, '', path);
    setRoute(resolveRoute(window.location.pathname));
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modals & Drawers
  const [preselectedActivity,setPreselectedActivity]=useState<string|null>(null);
  const [planHolidayOpen, setPlanHolidayOpen] = useState(false);
  const [preselectedPackage, setPreselectedPackage] = useState<TravelPackage | null>(null);
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

  return (
    <div className="min-h-screen bg-white text-[#1A2E35] flex flex-col font-sans pb-16 md:pb-0">
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
        isGuideActive={activeView === 'guide'}
        isExperiencesActive={activeView === 'experiences' || activeView === 'experience-category' || activeView === 'experience-detail' || activeView === 'boma' || activeView === 'bungee'}
        isAccommodationActive={activeView === 'accommodation' || activeView === 'accommodation-detail'}
        isPackagesActive={activeView === 'packages' || activeView === 'package-detail'}
        isGalleryActive={activeView === 'client-gallery'}
        isAboutActive={activeView === 'about'}
      />

      {/* Main Content Area - Render Dedicated Page or Home Layout */}
      <main className="flex-1">
        {activeView === 'not-found' ? (
          <section className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
            <h1 className="font-serif text-4xl font-bold text-[#0B5E8E]">Page not found</h1>
            <p>The page you’re looking for is unavailable. Explore our Victoria Falls holidays and experiences.</p>
            <PageLink href="/" onClick={() => navigate('/')} className="inline-block rounded-xl bg-[#0B5E8E] px-6 py-3 text-white">Back to home</PageLink>
          </section>
        ) : activeView === 'newsletter-confirmed' ? (
          <section className="max-w-3xl mx-auto p-12 text-center space-y-5"><h1 className="text-3xl font-serif text-[#0B5E8E]">Travel updates confirmation</h1><p>Use the confirmation link sent to your email to confirm your request. Visiting this page alone does not confirm a subscription.</p><PageLink href="/" onClick={()=>navigate('/')}>Explore Outbound Holidays</PageLink></section>
        ) : activeView === 'contact' ? (
          <ContactUsView />
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
        ) : activeView === 'experience-category' ? (
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

            {/* 2. Quick Planning Bar */}
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

            {/* 3. Why Plan With Outbound Holidays */}
            <WhyChooseOutbound
              onOpenPlanHoliday={() => {
                setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
                setPlanHolidayOpen(true);
              }}
            />

            {/* 4. Featured Experiences */}
            <FeaturedExperiences
              onSelectExperience={handleSelectExperience}
              onExploreAll={() => {
                navigate(sectionPath('experiences'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 5. Where to Stay in Victoria Falls */}
            <WhereToStaySection
              currency={currency}
              onSelectProperty={handleSelectAccommodationDetail}
              onExploreAllProperties={handleExploreAllAccommodations}
            />

            {/* 6. Victoria Falls Guide Preview */}
            <VicFallsGuide
              onOpenFullGuide={() => {
                navigate(sectionPath('guide'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 7. Recommended Victoria Falls Holidays */}
            <FeaturedPackages
              currency={currency}
              onSelectPackage={handleSelectPackageDetail}
              onExploreAllPackages={handleExploreAllPackages}
            />

            {/* 8. Genuine Testimonials */}
            <TravellerStories />

            <ClientGallery preview onSeeGallery={() => handleNavigateSection('client-gallery')} />

            {/* 9. How We Help */}
            <HowWeHelp />

            {/* 10. Final Call To Action */}
            <FinalCtaBanner
              onOpenPlanHoliday={() => {
                setPreselectedPackage(null); setPreselectedAccommodation(null); setPreselectedActivity(null);
                setPlanHolidayOpen(true);
              }}
            />
          </div>
        )}

        {/* Global Travel Newsletter Section */}
        <Newsletter />
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
    </div>
  );
}
