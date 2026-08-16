/**
 * API client with primary (jsDelivr CDN) + fallback (Cloudflare Pages),
 * request deduplication for in-flight requests, and cached responses.
 */

import { getCache, setCache, DEFAULT_TTLS } from './cache.js';

export const PRIMARY_API = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1";
export const FALLBACK_API = "https://latest.currency-api.pages.dev/v1";

export const HISTORICAL_PRIMARY_BASE = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@";

// Map to track in-flight fetch promises for deduplication
const inFlightRequests = new Map();

/**
 * Low-level fetch wrapper with primary + fallback endpoint retry
 */
async function fetchEndpoint(path) {
  if (inFlightRequests.has(path)) {
    return inFlightRequests.get(path);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${PRIMARY_API}/${path}`);
      if (!res.ok) throw new Error(`Primary API error: status ${res.status}`);
      return await res.json();
    } catch (primaryErr) {
      try {
        const res = await fetch(`${FALLBACK_API}/${path}`);
        if (!res.ok) throw new Error(`Fallback API error: status ${res.status}`);
        return await res.json();
      } catch (fallbackErr) {
        throw new Error(`API fetch failed for ${path}: ${fallbackErr.message}`);
      }
    }
  })();

  inFlightRequests.set(path, fetchPromise);

  try {
    const result = await fetchPromise;
    return result;
  } finally {
    inFlightRequests.delete(path);
  }
}

/**
 * Fetch currencies list with caching (24h TTL)
 */
export async function fetchCurrenciesList() {
  const cacheKey = 'currencies_list';
  const cached = getCache(cacheKey);

  if (cached && !cached.isStale) {
    return { data: cached.data, isCached: true, isStale: false };
  }

  try {
    const raw = await fetchEndpoint('currencies.json');
    if (raw && typeof raw === 'object') {
      setCache(cacheKey, raw, DEFAULT_TTLS.METADATA);
      return { data: raw, isCached: false, isStale: false };
    }
    throw new Error('Malformed currencies list response');
  } catch (err) {
    if (cached && cached.data) {
      return { data: cached.data, isCached: true, isStale: true };
    }
    throw err;
  }
}

/**
 * Fetch current rates for base currency (1h TTL cache, in-flight deduping)
 */
export async function fetchBaseCurrencyRates(baseCurrency) {
  const code = baseCurrency.toLowerCase();
  const path = `currencies/${code}.json`;
  const cacheKey = `rate_${code}`;

  const cached = getCache(cacheKey);
  if (cached && !cached.isStale) {
    return { data: cached.data, isCached: true, isStale: false, timestamp: cached.timestamp };
  }

  try {
    const json = await fetchEndpoint(path);
    if (json && json[code]) {
      setCache(cacheKey, json, DEFAULT_TTLS.RATES);
      return { data: json, isCached: false, isStale: false, timestamp: Date.now() };
    }
    throw new Error(`Invalid rate structure for base ${baseCurrency}`);
  } catch (err) {
    if (cached && cached.data) {
      return { data: cached.data, isCached: true, isStale: true, timestamp: cached.timestamp };
    }
    throw err;
  }
}

/**
 * Fetch historical currency rate for a specific date (YYYY-MM-DD)
 */
export async function fetchHistoricalRate(dateStr, baseCode, targetCode) {
  const base = baseCode.toLowerCase();
  const target = targetCode.toLowerCase();
  const cacheKey = `hist_${dateStr}_${base}`;

  const cached = getCache(cacheKey);
  if (cached && cached.data && cached.data[base] && typeof cached.data[base][target] === 'number') {
    return cached.data[base][target];
  }

  const primaryUrl = `${HISTORICAL_PRIMARY_BASE}${dateStr}/v1/currencies/${base}.json`;
  const fallbackUrl = `https://${dateStr}.currency-api.pages.dev/v1/currencies/${base}.json`;

  try {
    let res = await fetch(primaryUrl);
    if (!res.ok) {
      res = await fetch(fallbackUrl);
    }
    if (!res.ok) return null;
    const json = await res.json();

    if (json && json[base]) {
      setCache(cacheKey, json, DEFAULT_TTLS.HISTORY);
      if (typeof json[base][target] === 'number') {
        return json[base][target];
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}
