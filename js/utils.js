/**
 * Utility functions for formatting, flag rendering, and currency categorization.
 */

export const FLAG_OVERRIDES = {
  EUR: 'eu', USD: 'us', GBP: 'gb', JPY: 'jp', AUD: 'au', CAD: 'ca', CHF: 'ch',
  CNY: 'cn', NZD: 'nz', SEK: 'se', NOK: 'no', DKK: 'dk', INR: 'in', SGD: 'sg',
  HKD: 'hk', MXN: 'mx', ZAR: 'za', BRL: 'br', TRY: 'tr', PLN: 'pl', CZK: 'cz',
  HUF: 'hu', ILS: 'il', KRW: 'kr', MYR: 'my', IDR: 'id', PHP: 'ph', RON: 'ro',
  BGN: 'bg', ISK: 'is', THB: 'th', NGN: 'ng', EGP: 'eg', KES: 'ke', GHS: 'gh',
  ANG: 'cw', XAF: 'cm', XOF: 'sn', XCD: 'ag', XPF: 'pf', AED: 'ae', SAR: 'sa',
  QAR: 'qa', KWD: 'kw', BHD: 'bh', OMR: 'om', JOD: 'jo', LBP: 'lb', MAD: 'ma',
  DZD: 'dz', TND: 'tn', LRD: 'lr', SLL: 'sl', GMD: 'gm', CVE: 'cv', MZN: 'mz',
  ZMW: 'zm', BWP: 'bw', NAD: 'na', MUR: 'mu', SCR: 'sc', ETB: 'et', TZS: 'tz',
  UGX: 'ug', RWF: 'rw', BIF: 'bi', SOS: 'so', DJF: 'dj', KMF: 'km', MWK: 'mw'
};

export const SUPPORTED_CRYPTO_SET = new Set([
  'BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'XRP', 'DOGE',
  'ADA', 'AVAX', 'DOT', 'LINK', 'LTC', '1INCH', 'AAVE'
]);

export function fmt(n) {
  if (n === null || n === undefined || typeof n !== 'number' || !isFinite(n) || isNaN(n)) {
    return '—';
  }
  try {
    const dec = n < 0.0001 ? 8 : (n < 1 ? 6 : (n >= 100000 ? 2 : 4));
    return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: dec }).format(n);
  } catch (e) {
    return n.toFixed(4);
  }
}

export function isCryptoCode(code) {
  if (!code) return false;
  const upper = code.toUpperCase();
  return SUPPORTED_CRYPTO_SET.has(upper);
}

export function getIsoCode(code) {
  if (!code) return null;
  const upper = code.toUpperCase();
  if (FLAG_OVERRIDES[upper]) return FLAG_OVERRIDES[upper];
  if (isCryptoCode(upper)) return null;
  if (upper.length >= 2) return upper.slice(0, 2).toLowerCase();
  return null;
}

export function setFlag(circleEl, flagEl, code) {
  if (!circleEl || !flagEl) return;
  const iso = getIsoCode(code);
  if (iso) {
    flagEl.style.display = 'inline-block';
    flagEl.className = 'fi fi-' + iso;
    // Remove text nodes in circleEl
    Array.from(circleEl.childNodes).forEach(child => {
      if (child !== flagEl) child.remove();
    });
  } else {
    flagEl.style.display = 'none';
    // Display short code (e.g. BTC)
    Array.from(circleEl.childNodes).forEach(child => {
      if (child !== flagEl) child.remove();
    });
    const textSpan = document.createElement('span');
    textSpan.className = 'crypto-badge-text';
    textSpan.style.fontSize = '9px';
    textSpan.style.fontWeight = '700';
    textSpan.style.color = 'var(--forest)';
    textSpan.textContent = code.slice(0, 3).toUpperCase();
    circleEl.appendChild(textSpan);
  }
}

export function formatDateString(date) {
  return date.toISOString().slice(0, 10);
}
