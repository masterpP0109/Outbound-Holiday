import React from 'react';
import { ArtProduct, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { X, ShoppingBag, Heart, ShieldCheck, Award, Star, Truck, MapPin } from 'lucide-react';

interface ProductDetailModalProps {
  product: ArtProduct | null;
  currency: Currency;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (product: ArtProduct) => void;
  onToggleWishlist: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
}) => {
  if (!product) return null;

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3F6B3C] uppercase tracking-wider">
              {product.categoryName}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 font-semibold">
              ID: {product.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column Image Showcase */}
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 h-80 relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md transition-colors ${
                  isWishlisted ? 'bg-[#E67E22] text-white' : 'bg-white/90 text-gray-600 hover:text-[#E67E22]'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>
            <div className="mt-4 bg-[#3F6B3C]/10 border border-[#3F6B3C]/20 p-3 rounded-lg flex items-center gap-2.5 text-xs text-[#3F6B3C] font-semibold">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>Includes Official Signed Certificate of Authenticity</span>
            </div>
          </div>

          {/* Right Column Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0B5E8E] leading-tight mb-1">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[#C9A66B]" />
                <span>
                  By <strong>{product.artistName}</strong> ({product.artistCountry})
                </span>
              </div>
            </div>

            {/* Price & Rating */}
            <div className="flex items-baseline justify-between py-2 border-y border-gray-100">
              <span className="text-3xl font-extrabold text-[#0B5E8E]">
                {formatPrice(product.priceUSD)}
              </span>
              <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                <Star className="w-4 h-4 fill-[#E67E22] text-[#E67E22]" />
                <span>{product.rating}</span>
                <span className="text-gray-400 font-normal">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#2F3A44] leading-relaxed">
              {product.description}
            </p>

            {/* Artwork Specifications Table */}
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <p><strong>Medium:</strong> {product.medium}</p>
              <p><strong>Dimensions:</strong> {product.dimensions}</p>
              <p><strong>Year Created:</strong> {product.yearCreated}</p>
              <p><strong>Provenance:</strong> {product.provenance}</p>
            </div>

            {/* Shipping Guarantee */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Truck className="w-4 h-4 text-[#0B5E8E]" />
              <span>Ships in wooden safety crate (3-5 days delivery)</span>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full bg-[#0B5E8E] hover:bg-[#094b72] text-white font-bold text-sm py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart ({formatPrice(product.priceUSD)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
