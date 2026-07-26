import React from 'react';
import { ArtProduct, Currency } from '../../types';
import { ART_PRODUCTS } from '../../data/artData';
import { CURRENCY_RATES } from '../../data/travelData';
import { X, Scale, ShoppingBag, Trash2 } from 'lucide-react';

interface CompareModalProps {
  compareIds: string[];
  currency: Currency;
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
  onAddToCart: (product: ArtProduct) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  compareIds,
  currency,
  onClose,
  onRemoveFromCompare,
  onAddToCart,
}) => {
  const products = ART_PRODUCTS.filter((p) => compareIds.includes(p.id));

  const formatPrice = (priceUSD: number) => {
    const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0B5E8E] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C9A66B]" />
            <h3 className="font-bold text-lg">Compare Artworks ({products.length}/3)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 min-w-[600px]">
            {products.map((p) => (
              <div key={p.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => onRemoveFromCompare(p.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#0B5E8E] mb-1 line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">By {p.artistName} ({p.artistCountry})</p>
                  <p className="text-lg font-extrabold text-[#0B5E8E] mb-3">{formatPrice(p.priceUSD)}</p>

                  <div className="space-y-1.5 text-xs text-gray-700 border-t border-gray-200 pt-3">
                    <p><strong>Category:</strong> {p.categoryName}</p>
                    <p><strong>Medium:</strong> {p.medium}</p>
                    <p><strong>Dimensions:</strong> {p.dimensions}</p>
                    <p><strong>Rating:</strong> {p.rating} ★</p>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(p)}
                  className="w-full bg-[#0B5E8E] hover:bg-[#094b72] text-white font-bold text-xs py-2.5 rounded-md flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
