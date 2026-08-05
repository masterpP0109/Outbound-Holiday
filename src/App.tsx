import React, { useState } from 'react';
import { Currency, TravelPackage } from './types';
import { Header } from './components/common/Header';
import { TravelHero } from './components/travel/TravelHero';
import { QuickPlanningBar } from './components/travel/QuickPlanningBar';
import { WhyChooseOutbound } from './components/travel/WhyChooseOutbound';
import { FeaturedExperiences } from './components/travel/FeaturedExperiences';
import { ExperiencesDirectoryPage } from './components/travel/ExperiencesDirectoryPage';
import { ExperienceDetailPage } from './components/travel/ExperienceDetailPage';
import { Experience, getExperienceById, ALL_EXPERIENCES } from './data/experiencesData';
import { FeaturedPackages } from './components/travel/FeaturedPackages';
import { TravellerStories } from './components/travel/TravellerStories';
import { HowWeHelp } from './components/travel/HowWeHelp';
import { FaqSection } from './components/travel/FaqSection';
import { FinalCtaBanner } from './components/travel/FinalCtaBanner';
import { VicFallsGuide } from './components/travel/VicFallsGuide';
import { VicFallsGuidePage } from './components/travel/VicFallsGuidePage';
import { BomaExperiencePage } from './components/travel/BomaExperiencePage';
import { BungeeExperiencePage } from './components/travel/BungeeExperiencePage';
import { PlanHolidayModal } from './components/travel/PlanHolidayModal';
import { MobileStickyCta } from './components/common/MobileStickyCta';
import { Newsletter } from './components/common/Newsletter';
import { Footer } from './components/common/Footer';
import { Check } from 'lucide-react';

export default function App() {
  // Application View & Navigation State
  const [activeView, setActiveView] = useState<'home' | 'experiences' | 'experience-detail' | 'guide' | 'boma' | 'bungee'>('home');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [planHolidayOpen, setPlanHolidayOpen] = useState(false);
  const [preselectedPackage, setPreselectedPackage] = useState<TravelPackage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Travel Package Handlers
  const handleSelectPackageDetail = (pkg: TravelPackage) => {
    setPreselectedPackage(pkg);
    setPlanHolidayOpen(true);
  };

  const handlePlanHolidayWithPackage = (pkg: TravelPackage) => {
    setPreselectedPackage(pkg);
    setPlanHolidayOpen(true);
  };

  const handleSelectExperience = (exp: Experience) => {
    if (exp.id === 'boma-dinner-show') {
      setActiveView('boma');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (exp.id === 'bungee-jump' || exp.slug === 'bungee-jump') {
      setActiveView('bungee');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedExperience(exp);
      setActiveView('experience-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Smooth Section & Page Navigation
  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'travel-experiences' || sectionId === 'experiences') {
      setActiveView('experiences');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'boma' || sectionId === 'boma-dinner') {
      setActiveView('boma');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'travel-guide' || sectionId === 'guide') {
      setActiveView('guide');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (activeView !== 'home') {
      setActiveView('home');
      setTimeout(() => {
        if (sectionId === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A2E35] flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#0D5C75] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/20">
          <Check className="w-4 h-4 text-[#D97706]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        currency={currency}
        setCurrency={setCurrency}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null);
          setPlanHolidayOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigateSection={handleNavigateSection}
        isGuideActive={activeView === 'guide'}
        isExperiencesActive={activeView === 'experiences'}
      />

      {/* Main Content Area - Render Dedicated Page or Home Layout */}
      <main className="flex-1">
        {activeView === 'experiences' ? (
          <ExperiencesDirectoryPage
            onSelectExperience={handleSelectExperience}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
          />
        ) : activeView === 'experience-detail' && selectedExperience ? (
          <ExperienceDetailPage
            experience={selectedExperience}
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToDirectory={() => {
              setActiveView('experiences');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedExperience={(rel) => handleSelectExperience(rel)}
          />
        ) : activeView === 'boma' ? (
          <BomaExperiencePage
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedExperience={(expTitle) => {
              const matched = ALL_EXPERIENCES.find(e => e.title.toLowerCase().includes(expTitle.toLowerCase()));
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
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToDirectory={() => {
              setActiveView('experiences');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelatedExperience={(exp) => handleSelectExperience(exp)}
          />
        ) : activeView === 'guide' ? (
          <VicFallsGuidePage
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
            onNavigateHome={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div className="space-y-0">
            {/* 1. Hero */}
            <TravelHero
              onOpenPlanHoliday={() => {
                setPreselectedPackage(null);
                setPlanHolidayOpen(true);
              }}
              onBrowsePackages={() => handleNavigateSection('travel-packages')}
            />

            {/* 2. Quick Planning Bar */}
            <QuickPlanningBar
              onOpenGuide={() => {
                setActiveView('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenExperiences={() => {
                setActiveView('experiences');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 3. Why Choose Outbound Holidays */}
            <WhyChooseOutbound />

            {/* 4. Featured Experiences */}
            <FeaturedExperiences
              onSelectExperience={handleSelectExperience}
              onExploreAll={() => {
                setActiveView('experiences');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 5. Victoria Falls Travel Guide */}
            <VicFallsGuide
              onOpenFullGuide={() => {
                setActiveView('guide');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 6. Featured Holiday Packages */}
            <FeaturedPackages
              currency={currency}
              onSelectPackage={handleSelectPackageDetail}
              onPlanHolidayWithPackage={handlePlanHolidayWithPackage}
            />

            {/* 7. Traveller Reviews */}
            <TravellerStories />

            {/* 8. How We Help */}
            <HowWeHelp />

            {/* 9. Final Call To Action */}
            <FinalCtaBanner
              onOpenPlanHoliday={() => {
                setPreselectedPackage(null);
                setPlanHolidayOpen(true);
              }}
            />
          </div>
        )}

        {/* Global Travel Newsletter Section */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null);
          setPlanHolidayOpen(true);
        }}
      />

      {/* Mobile Sticky CTA Bar */}
      <MobileStickyCta
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null);
          setPlanHolidayOpen(true);
        }}
      />

      {/* Holiday Builder Modal */}
      <PlanHolidayModal
        isOpen={planHolidayOpen}
        onClose={() => setPlanHolidayOpen(false)}
        preselectedPackage={preselectedPackage}
      />
    </div>
  );
}
