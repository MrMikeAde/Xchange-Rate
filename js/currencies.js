/**
 * Currency classification, registry management, search filtering,
 * and filtering of unsupported symbols.
 */

import { fetchCurrenciesList } from './api.js';
import { getIsoCode, isCryptoCode, SUPPORTED_CRYPTO_SET } from './utils.js';

export const POPULAR_AFRICAN_PAIRS = [
  { from: 'USD', to: 'NGN', label: 'USD / NGN' },
  { from: 'GBP', to: 'NGN', label: 'GBP / NGN' },
  { from: 'EUR', to: 'NGN', label: 'EUR / NGN' },
  { from: 'CAD', to: 'NGN', label: 'CAD / NGN' },
  { from: 'GHS', to: 'NGN', label: 'GHS / NGN' },
  { from: 'KES', to: 'NGN', label: 'KES / NGN' },
  { from: 'ZAR', to: 'NGN', label: 'ZAR / NGN' },
  { from: 'NGN', to: 'USD', label: 'NGN / USD' }
];

export let CURRENCY_REGISTRY = {
  NGN: { name: "Nigerian Naira", iso: "ng", type: "fiat" },
  USD: { name: "US Dollar", iso: "us", type: "fiat" },
  GBP: { name: "British Pound Sterling", iso: "gb", type: "fiat" },
  EUR: { name: "Euro", iso: "eu", type: "fiat" },
  BTC: { name: "Bitcoin", iso: null, type: "crypto" },
  ETH: { name: "Ethereum", iso: null, type: "crypto" },
  USDT: { name: "Tether", iso: null, type: "crypto" },
  USDC: { name: "USD Coin", iso: null, type: "crypto" }
};

export async function loadCurrenciesRegistry() {
  try {
    const { data } = await fetchCurrenciesList();
    if (!data || typeof data !== 'object') return CURRENCY_REGISTRY;

    const newDict = {};
    for (const [code, name] of Object.entries(data)) {
      if (!code) continue;
      const upper = code.toUpperCase();

      // Check if crypto
      const isCrypto = isCryptoCode(upper);

      // Filter out unsupported obscure tokens/cryptos that aren't fiat or supported crypto
      if (!isCrypto) {
        // Assume Fiat if 3 letters or known fiat code
        const iso = getIsoCode(upper);
        newDict[upper] = {
          name: name || upper,
          iso: iso,
          type: 'fiat'
        };
      } else if (SUPPORTED_CRYPTO_SET.has(upper)) {
        newDict[upper] = {
          name: name || upper,
          iso: null,
          type: 'crypto'
        };
      }
    }

    if (Object.keys(newDict).length > 0) {
      CURRENCY_REGISTRY = newDict;
    }
    return CURRENCY_REGISTRY;
  } catch (err) {
    console.warn('Using default currency registry due to fetch error:', err);
    return CURRENCY_REGISTRY;
  }
}

export function filterCurrencies(query = '', category = 'all') {
  const q = query.trim().toUpperCase();
  const codes = Object.keys(CURRENCY_REGISTRY).sort();

  return codes.filter(code => {
    const info = CURRENCY_REGISTRY[code];
    if (!info) return false;

    // Filter by Category
    if (category === 'fiat' && info.type !== 'fiat') return false;
    if (category === 'crypto' && info.type !== 'crypto') return false;

    // Filter by Query
    if (!q) return true;
    const nameMatch = info.name && info.name.toUpperCase().includes(q);
    const codeMatch = code.includes(q);
    return nameMatch || codeMatch;
  });
}
