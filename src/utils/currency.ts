import { CURRENCY_META, CURRENCY_RATES } from '../runtime/catalog';
import type { Currency } from '../types';

export const CURRENCY_DISCLAIMER =
  'Converted prices are indicative. Final quotations and payments are confirmed in USD.';

export const CURRENCY_RATE_NOTE =
  'Reference exchange rates only; actual bank or card payment rates may differ.';

const CURRENCY_LOCALES: Partial<Record<Currency, string>> = {
  USD: 'en-US',
  ZAR: 'en-ZA',
  GBP: 'en-GB',
  EUR: 'en-IE',
  AUD: 'en-AU',
  ZWG: 'en-ZW',
};

/**
 * Check whether a non-USD currency currently has a valid server-supplied rate.
 */
export function hasValidCurrencyRate(currency: Currency): boolean {
  if (currency === 'USD') return true;
  const entry = CURRENCY_RATES[currency];
  return Boolean(entry && typeof entry.rate === 'number' && Number.isFinite(entry.rate) && entry.rate > 0);
}

/**
 * Format a USD amount in the selected display currency using `Intl.NumberFormat`.
 * Never invents a rate: if the target currency has no valid rate, formats the original USD amount.
 */
export function formatCurrencyAmount(
  amountUSD: number,
  currency: Currency = 'USD'
): string {
  const safeUSD = Number.isFinite(amountUSD) ? amountUSD : 0;
  const canConvert = hasValidCurrencyRate(currency);
  const targetCurrency: Currency = canConvert ? currency : 'USD';
  const rate = canConvert ? (CURRENCY_RATES[targetCurrency]?.rate ?? 1) : 1;
  const converted = Math.round(safeUSD * rate);
  const locale = CURRENCY_LOCALES[targetCurrency] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    const symbol = CURRENCY_RATES[targetCurrency]?.symbol || '$';
    return `${symbol}${converted.toLocaleString('en-US')}`;
  }
}

/**
 * Return a short human-readable status summary for the active exchange rates.
 */
export function getCurrencyStatusSummary(): string {
  const statusLabels: Record<string, string> = {
    live: 'Live reference rates',
    cached: 'Cached reference rates',
    manual: 'Manual override rates',
    unavailable: 'USD only (live rates unavailable)',
  };
  const label = statusLabels[CURRENCY_META.status] || 'Reference rates';
  if (CURRENCY_META.effectiveDate) {
    return `${label} (${CURRENCY_META.effectiveDate})`;
  }
  return label;
}
