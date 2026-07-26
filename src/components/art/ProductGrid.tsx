import React, { useState } from 'react';
import { ArtProduct, Currency } from '../../types';
import { ART_PRODUCTS } from '../../data/artData';
import { CURRENCY_RATES } from '../../data/travelData';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Eye, 
  Scale, 
  Check, 
  Sparkles, 
  Filter, 
  ArrowUpDown 
} from 'lucide-react';

interface ProductGridProps {
  currency: Currency;
  selectedCategorySlug: string | null;
  searchQuery: string;
  wishlistIds: string[];
  compareIds: string[];
  onToggleWishlist: (productId: string) => void;
  onToggleCompare: (productId: string) => void;
  onAddToCart: (product: ArtProduct) => void;
  onQuickView: (product: ArtProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  currency,
  selectedCategorySlug,
  searchQuery,
  wishlistIds,
  compareIds,
  onToggleWishlist,
  onToggleCompare,
  onAddToCart,
  onQuickView,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bestsellers' | 'new'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Filter products
  let filtered = ART_PRODUCTS.filter((prod) => {
    // Category filter
    if (selectedCategorySlug && prod.categorySlug !== selectedCategorySlug) {
      return false;
    }
    // Tab filter
    if (activeTab === 'bestsellers' && !prod.isBestSeller) return false;
    if (activeTab === 'new' && !prod.isNewArrival) return false;
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchArtist = prod.artistName.toLowerCase().includes(q);
      const matchCategory = prod.categoryName.toLowerCase().includes(q);
      const matchDesc = prod.description.toLowerCase().includes(q);
      if (!matchName && !matchArtist && !matchCategory && !matchDesc) return false;
    }
    return true;
  });

  // Sort products
  if (sortBy === 'price-low') {
    filtered.sort((a, b) => a.priceUSD - b.priceUSD);
  } else if (sortBy === 'price-high') {
    filtered.sort((a, b) => b.priceUSD - a.priceUSD);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <section id="art-shop" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold text-[#3F6B3C] uppercase tracking-widest block mb-1">
              Curated Gallery & Collection
            </span>
            <h2 className="text-3xl font-bold text-[#0B5E8E] font-serif">
              Authentic African Artworks
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'all' ? 'bg-[#0B5E8E] text-white shadow-xs' : 'text-gray-600 hover:text-[#0B5E8E]'
                }`}
              >
                All Artworks
              </button>
              <button
                onClick={() => setActiveTab('bestsellers')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'bestsellers' ? 'bg-[#0B5E8E] text-white shadow-xs' : 'text-gray-600 hover:text-[#0B5E8E]'
                }`}
              >
                Best Sellers
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'new' ? 'bg-[#0B5E8E] text-white shadow-xs' : 'text-gray-600 hover:text-[#0B5E8E]'
                }`}
              >
                New Arrivals
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-hidden text-gray-700 cursor-pointer"
              >
                <option value="featured">Featured Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 font-medium">No artwork items matched your selected filters or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const isCompared = compareIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.isBestSeller && (
                          <span className="bg-[#C9A66B] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm shadow-xs">
                            Best Seller
                          </span>
                        )}
                        {product.isNewArrival && (
                          <span className="bg-[#3F6B3C] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm shadow-xs">
                            New Arrival
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => onToggleWishlist(product.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
                          isWishlisted
                            ? 'bg-[#E67E22] text-white'
                            : 'bg-white/90 text-gray-600 hover:text-[#E67E22]'
                        }`}
                        title="Wishlist"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {/* Quick View Hover Button */}
                      <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
                        <button
                          onClick={() => onQuickView(product)}
                          className="w-full bg-white/90 backdrop-blur-xs text-[#0B5E8E] hover:bg-[#0B5E8E] hover:text-white font-bold text-xs py-2 rounded-md shadow-md flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="font-semibold text-[#3F6B3C]">
                          {product.categoryName}
                        </span>
                        <div className="flex items-center gap-1 text-[#2F3A44] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#E67E22] text-[#E67E22]" />
                          <span>{product.rating}</span>
                        </div>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#0B5E8E] mb-1 line-clamp-1 group-hover:text-[#E67E22] transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-600 mb-3">
                        By <strong className="text-gray-800">{product.artistName}</strong> ({product.artistCountry})
                      </p>

                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-lg font-extrabold text-[#0B5E8E]">
                          {formatPrice(product.priceUSD)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          In Stock ({product.inStock})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 pt-0 mt-auto border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex-1 bg-[#0B5E8E] hover:bg-[#094b72] text-white font-bold text-xs py-2.5 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add to Cart
                    </button>

                    <button
                      onClick={() => onToggleCompare(product.id)}
                      className={`p-2.5 rounded-md border text-xs font-bold transition-colors ${
                        isCompared
                          ? 'bg-[#3F6B3C] text-white border-[#3F6B3C]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      title={isCompared ? 'In Compare List' : 'Compare Artwork'}
                    >
                      <Scale className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
