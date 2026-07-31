import React, { useState } from 'react';
import { Currency, TravelPackage } from './types';
import { Header } from './components/common/Header';
import { TravelHero } from './components/travel/TravelHero';
import { IntentCards } from './components/travel/IntentCards';
import { MeetYourGuide } from './components/travel/MeetYourGuide';
import { ExperienceExplorer } from './components/travel/ExperienceExplorer';
import { BudgetSelector } from './components/travel/BudgetSelector';
import { FeaturedPackages } from './components/travel/FeaturedPackages';
import { TravellerStories } from './components/travel/TravellerStories';
import { HowItWorks } from './components/travel/HowItWorks';
import { FaqSection } from './components/travel/FaqSection';
import { FinalCtaBanner } from './components/travel/FinalCtaBanner';
import { VicFallsGuide } from './components/travel/VicFallsGuide';
import { AboutUsView } from './components/travel/AboutUsView';
import { ContactUsView } from './components/travel/ContactUsView';
import { PlanHolidayModal } from './components/travel/PlanHolidayModal';
import { MobileStickyCta } from './components/common/MobileStickyCta';
import { Newsletter } from './components/common/Newsletter';
import { Footer } from './components/common/Footer';
import { Check } from 'lucide-react';

export default function App() {
  // Application State
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

  // Smooth Section Navigation
  const handleNavigateSection = (sectionId: string) => {
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
      />

      {/* Main Content Area - Guided Journey Layout */}
      <main className="flex-1">
        <div className="space-y-0">
          {/* 1. Emotional Hero */}
          <TravelHero
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
            onBrowsePackages={() => handleNavigateSection('travel-packages')}
          />

          {/* 2. Choose Your Travel Intention */}
          <IntentCards
            onSelectIntent={() => {
              setPlanHolidayOpen(true);
            }}
          />

          {/* 3. Meet Your Local Guide */}
          <MeetYourGuide
            onOpenConsultation={() => {
              setPlanHolidayOpen(true);
            }}
          />

          {/* 4. Explore Experiences */}
          <div id="travel-experiences">
            <ExperienceExplorer
              onExploreExperiences={() => {
                setPlanHolidayOpen(true);
              }}
            />
          </div>

          {/* 5. Choose a Budget Style */}
          <BudgetSelector
            currency={currency}
            onSelectBudgetStyle={() => {
              setPlanHolidayOpen(true);
            }}
          />

          {/* 6. Recommended Packages */}
          <FeaturedPackages
            currency={currency}
            onSelectPackage={handleSelectPackageDetail}
            onPlanHolidayWithPackage={handlePlanHolidayWithPackage}
          />

          {/* 7. Traveller Stories */}
          <TravellerStories />

          {/* 8. Simple 3-Step Planning Process */}
          <HowItWorks
            onStartPlanning={() => setPlanHolidayOpen(true)}
          />

          {/* 9. Questions & Answers (FAQ) */}
          <div id="faqs">
            <FaqSection
              onOpenGuide={() => handleNavigateSection('travel-guide')}
            />
          </div>

          {/* 10. Warm Final Conversion Banner */}
          <FinalCtaBanner
            onOpenPlanHoliday={() => {
              setPreselectedPackage(null);
              setPlanHolidayOpen(true);
            }}
          />

          {/* Victoria Falls Comprehensive Insider Guide & Accommodations */}
          <VicFallsGuide />

          {/* About Us & Promises (Linked from Footer) */}
          <AboutUsView
            onOpenPlanHoliday={() => setPlanHolidayOpen(true)}
          />

          {/* Contact Section */}
          <ContactUsView />
        </div>

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
