/**
 * Historical rate statistics module covering ~30 daily calendar observations.
 * Calculates 30d average, 30d high, and 30d low safely.
 */

import { fetchHistoricalRate } from './api.js';
import { fmt, formatDateString } from './utils.js';

/**
 * Fetch ~30 daily historical rates and return mathematical stats.
 */
export async function calculate30DayStats(fromCode, toCode) {
  const from = fromCode.toLowerCase();
  const to = toCode.toLowerCase();

  // Generate date array for past 30 days (excluding today to prevent double counting if today is partial)
  const dates = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDateString(d));
  }

  // Sample or fetch daily requests in parallel with concurrency throttling if needed
  // Since 30 requests via CDN are fast and cached locally after first fetch:
  const fetchPromises = dates.map(dateStr => fetchHistoricalRate(dateStr, from, to));

  try {
    const results = await Promise.all(fetchPromises);
    const validObservations = results.filter(r => typeof r === 'number' && !isNaN(r) && isFinite(r) && r > 0);

    if (validObservations.length === 0) {
      return {
        avg: null,
        high: null,
        low: null,
        count: 0,
        isSparse: true,
        label: "30d stats"
      };
    }

    const sum = validObservations.reduce((acc, val) => acc + val, 0);
    const avg = sum / validObservations.length;
    const high = Math.max(...validObservations);
    const low = Math.min(...validObservations);

    const isSparse = validObservations.length < 15;
    const label = isSparse ? `${validObservations.length}d avg` : "30d avg";

    return {
      avg: avg,
      high: high,
      low: low,
      count: validObservations.length,
      isSparse: isSparse,
      label: label
    };
  } catch (err) {
    console.warn("Failed to load historical statistics:", err);
    return {
      avg: null,
      high: null,
      low: null,
      count: 0,
      isSparse: true,
      label: "30d stats"
    };
  }
}

/**
 * Helper to safely format stat values for DOM rendering.
 */
export function formatStatValues(stats) {
  if (!stats || stats.avg === null || isNaN(stats.avg) || !isFinite(stats.avg)) {
    return {
      avg: '—',
      high: '—',
      low: '—',
      label: '30d avg'
    };
  }

  return {
    avg: fmt(stats.avg),
    high: fmt(stats.high),
    low: fmt(stats.low),
    label: stats.label || '30d avg'
  };
}
