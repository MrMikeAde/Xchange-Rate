/**
 * Client-side localStorage caching utility with TTL and version management.
 */

const CACHE_PREFIX = 'xr_v1_';

export const DEFAULT_TTLS = {
  METADATA: 24 * 60 * 60 * 1000, // 24 hours
  RATES: 60 * 60 * 1000,          // 1 hour
  HISTORY: 12 * 60 * 60 * 1000     // 12 hours
};

export function setCache(key, data, ttlMs = DEFAULT_TTLS.RATES) {
  if (typeof localStorage === 'undefined') return;
  try {
    const payload = {
      timestamp: Date.now(),
      ttl: ttlMs,
      data: data
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
  } catch (e) {
    console.warn('localStorage setCache failed:', e);
  }
}

export function getCache(key) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('timestamp' in parsed) || !('data' in parsed)) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    const age = Date.now() - parsed.timestamp;
    const isStale = age > (parsed.ttl || DEFAULT_TTLS.RATES);

    return {
      data: parsed.data,
      timestamp: parsed.timestamp,
      isStale: isStale,
      age: age
    };
  } catch (e) {
    console.warn('localStorage getCache error:', e);
    return null;
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    // Ignore clear errors
  }
}
