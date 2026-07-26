import React, { useState } from 'react';
import { CartItem, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/travelData';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  currency: Currency;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  currency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const rateObj = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];

  const rawSubtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.product.priceUSD * item.quantity,
    0
  );

  const discountAmountUSD = (rawSubtotalUSD * discountPercent) / 100;
  const finalSubtotalUSD = rawSubtotalUSD - discountAmountUSD;

  const formatPrice = (priceUSD: number) => {
    const converted = Math.round(priceUSD * rateObj.rate);
    return `${rateObj.symbol}${converted.toLocaleString()}`;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'OUTBOUND10' || couponCode.toUpperCase() === 'AFRICA10') {
      setDiscountPercent(10);
    } else {
      alert('Invalid coupon code. Try "OUTBOUND10" for 10% off!');
    }
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      onClearCart();
      setCheckoutSuccess(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0B5E8E]" />
            <h3 className="font-bold text-lg text-[#0B5E8E]">Your Shopping Cart</h3>
            <span className="bg-[#0B5E8E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {checkoutSuccess ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-[#3F6B3C]/10 text-[#3F6B3C] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#0B5E8E]">Order Confirmed!</h3>
              <p className="text-xs text-gray-600">
                Your artwork purchase has been registered. An official Certificate of Authenticity and crate tracking number have been generated.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-medium text-sm">Your shopping cart is currently empty.</p>
              <button
                onClick={onClose}
                className="text-xs font-bold text-[#0B5E8E] underline hover:text-[#E67E22]"
              >
                Browse Featured Artworks
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-xs text-[#0B5E8E] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 truncate">
                      {item.product.artistName} ({item.product.artistCountry})
                    </p>
                    <p className="text-xs font-bold text-[#0B5E8E] mt-1">
                      {formatPrice(item.product.priceUSD)}
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-gray-300 rounded-md bg-white">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-1.5 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. OUTBOUND10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md text-xs uppercase"
                />
                <button
                  type="submit"
                  className="bg-gray-800 text-white font-bold text-xs px-3 py-2 rounded-md hover:bg-black"
                >
                  Apply
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && !checkoutSuccess && (
          <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(rawSubtotalUSD)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-[#3F6B3C] font-semibold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatPrice(discountAmountUSD)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Global Express Shipping</span>
                <span className="text-[#3F6B3C] font-bold">Complimentary</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#0B5E8E] pt-2 border-t border-gray-200">
                <span>Total ({currency})</span>
                <span>{formatPrice(finalSubtotalUSD)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-sm py-3 rounded-md shadow-md flex items-center justify-center gap-2 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
