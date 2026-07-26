import React from 'react';
import { ArtProduct, Currency } from '../../types';
import { ART_PRODUCTS } from '../../data/artData';
import { CURRENCY_RATES } from '../../data/travelData';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistIds: string[];
  currency: Currency;
  onClose: () => void;
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: ArtProduct) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistIds,
  currency,
  onClose,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = ART_PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#E67E22] fill-current" />
            <h3 className="font-bold text-lg text-[#0B5E8E]">Your Wishlist</h3>
            <span className="bg-[#E67E22] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {wishlistedProducts.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-3">
              <Heart className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-medium text-sm">Your wishlist is empty.</p>
              <p className="text-xs text-gray-400">Save artworks you love while browsing!</p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-xs text-[#0B5E8E] truncate">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">
                    {product.artistName} ({product.artistCountry})
                  </p>
                  <p className="text-xs font-bold text-[#0B5E8E] mt-1">
                    {formatPrice(product.priceUSD)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => onRemoveFromWishlist(product.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onRemoveFromWishlist(product.id);
                    }}
                    className="bg-[#0B5E8E] hover:bg-[#094b72] text-white p-1.5 rounded-md text-xs font-bold flex items-center gap-1"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
