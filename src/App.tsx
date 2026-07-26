import React, { useState } from 'react';
import { ActivePortal, Currency, CartItem, ArtProduct, TravelPackage } from './types';
import { Header } from './components/common/Header';
import { TravelHero } from './components/travel/TravelHero';
import { TrustBuilders } from './components/travel/TrustBuilders';
import { IntentCards } from './components/travel/IntentCards';
import { HowItWorks } from './components/travel/HowItWorks';
import { FeaturedPackages } from './components/travel/FeaturedPackages';
import { VicFallsGuide } from './components/travel/VicFallsGuide';
import { FaqSection } from './components/travel/FaqSection';
import { AboutUsView } from './components/travel/AboutUsView';
import { ContactUsView } from './components/travel/ContactUsView';
import { PlanHolidayModal } from './components/travel/PlanHolidayModal';

import { ArtHero } from './components/art/ArtHero';
import { CategoryGrid } from './components/art/CategoryGrid';
import { ProductGrid } from './components/art/ProductGrid';
import { ProductDetailModal } from './components/art/ProductDetailModal';
import { FeaturedArtists } from './components/art/FeaturedArtists';
import { WhyShopWithUs } from './components/art/WhyShopWithUs';
import { CompareModal } from './components/art/CompareModal';

import { CartDrawer } from './components/common/CartDrawer';
import { WishlistDrawer } from './components/common/WishlistDrawer';
import { Newsletter } from './components/common/Newsletter';
import { Footer } from './components/common/Footer';
import { ART_PRODUCTS } from './data/artData';
import { Scale, Heart, Sparkles, Check } from 'lucide-react';

export default function App() {
  // Application State
  const [activePortal, setActivePortal] = useState<ActivePortal>('travel');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['prod-shona-embrace']);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [planHolidayOpen, setPlanHolidayOpen] = useState(false);
  const [preselectedPackage, setPreselectedPackage] = useState<TravelPackage | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ArtProduct | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Operations
  const handleAddToCart = (product: ArtProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedCurrency: currency }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist Operations
  const handleToggleWishlist = (productId: string) => {
    if (wishlistIds.includes(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      showToast('Removed item from Wishlist');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      showToast('Added item to Wishlist');
    }
  };

  // Compare Operations
  const handleToggleCompare = (productId: string) => {
    if (compareIds.includes(productId)) {
      setCompareIds((prev) => prev.filter((id) => id !== productId));
    } else {
      if (compareIds.length >= 3) {
        showToast('You can compare a maximum of 3 items at a time');
        return;
      }
      setCompareIds((prev) => [...prev, productId]);
      showToast('Added item to Comparison list');
    }
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
    <div className="min-h-screen bg-white text-[#2F3A44] flex flex-col font-sans">
      {/* Top Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B5E8E] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-white/20">
          <Check className="w-4 h-4 text-[#C9A66B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        currency={currency}
        setCurrency={setCurrency}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenWishlist={() => setWishlistDrawerOpen(true)}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null);
          setPlanHolidayOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Content Areas based on Active Portal */}
      <main className="flex-1">
        {/* TRAVEL PORTAL OR COMBINED VIEW */}
        {(activePortal === 'travel' || activePortal === 'combined') && (
          <div className="space-y-0">
            <TravelHero
              onOpenPlanHoliday={() => {
                setPreselectedPackage(null);
                setPlanHolidayOpen(true);
              }}
              onBrowsePackages={() => handleNavigateSection('travel-packages')}
            />

            <TrustBuilders />

            <IntentCards
              onSelectIntent={(intentKey) => {
                setPlanHolidayOpen(true);
              }}
            />

            <HowItWorks
              onStartPlanning={() => setPlanHolidayOpen(true)}
            />

            <FeaturedPackages
              currency={currency}
              onSelectPackage={handleSelectPackageDetail}
              onPlanHolidayWithPackage={handlePlanHolidayWithPackage}
            />

            <VicFallsGuide />

            <FaqSection />

            <AboutUsView
              onOpenPlanHoliday={() => setPlanHolidayOpen(true)}
            />

            <ContactUsView />
          </div>
        )}

        {/* ART MARKETPLACE PORTAL OR COMBINED VIEW */}
        {(activePortal === 'art' || activePortal === 'combined') && (
          <div className="space-y-0">
            {activePortal === 'combined' && (
              <div className="bg-[#2F3A44] text-center py-6 px-4 border-t border-b border-gray-700">
                <span className="text-xs font-bold text-[#C9A66B] uppercase tracking-widest block mb-1">
                  Sister Portal Showcase
                </span>
                <h2 className="text-2xl font-serif font-bold text-white">
                  African Art & Craft Gallery Marketplace
                </h2>
              </div>
            )}

            <ArtHero
              onExploreCollections={() => handleNavigateSection('art-shop')}
              onMeetArtists={() => handleNavigateSection('art-artists')}
            />

            <CategoryGrid
              selectedCategorySlug={selectedCategorySlug}
              onSelectCategory={(slug) => {
                setSelectedCategorySlug(slug);
                handleNavigateSection('art-shop');
              }}
            />

            <ProductGrid
              currency={currency}
              selectedCategorySlug={selectedCategorySlug}
              searchQuery={searchQuery}
              wishlistIds={wishlistIds}
              compareIds={compareIds}
              onToggleWishlist={handleToggleWishlist}
              onToggleCompare={handleToggleCompare}
              onAddToCart={handleAddToCart}
              onQuickView={(p) => setQuickViewProduct(p)}
            />

            <FeaturedArtists
              onSelectArtistFilter={(artistName) => {
                setSearchQuery(artistName);
                handleNavigateSection('art-shop');
              }}
            />

            <WhyShopWithUs />
          </div>
        )}

        {/* Global Newsletter Section */}
        <Newsletter />
      </main>

      {/* Floating Compare Drawer Trigger if items selected */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40 bg-[#0B5E8E] text-white p-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/20">
          <Scale className="w-5 h-5 text-[#C9A66B]" />
          <span className="text-xs font-bold">{compareIds.length} Artworks Selected</span>
          <button
            onClick={() => setCompareModalOpen(true)}
            className="bg-[#E67E22] hover:bg-[#d67118] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-xs"
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Footer */}
      <Footer
        activePortal={activePortal}
        onNavigateSection={handleNavigateSection}
        onOpenPlanHoliday={() => {
          setPreselectedPackage(null);
          setPlanHolidayOpen(true);
        }}
      />

      {/* Modals & Drawers */}
      <PlanHolidayModal
        isOpen={planHolidayOpen}
        onClose={() => setPlanHolidayOpen(false)}
        preselectedPackage={preselectedPackage}
      />

      <ProductDetailModal
        product={quickViewProduct}
        currency={currency}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
      />

      <CompareModal
        compareIds={compareIds}
        currency={currency}
        onClose={() => setCompareModalOpen(false)}
        onRemoveFromCompare={handleToggleCompare}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        cartItems={cartItems}
        currency={currency}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        wishlistIds={wishlistIds}
        currency={currency}
        onClose={() => setWishlistDrawerOpen(false)}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
