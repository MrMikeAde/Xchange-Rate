/**
 * Application Bootstrap & Main Controller.
 */

import { CurrencyConverter } from './converter.js';
import { UIController } from './ui.js';
import { loadCurrenciesRegistry } from './currencies.js';
import { calculate30DayStats, formatStatValues } from './history.js';

class Application {
  constructor() {
    this.converter = new CurrencyConverter();
    this.ui = new UIController(this.converter, () => this.handlePairChange());
  }

  async init() {
    // 1. Render initial trigger flags & codes
    this.ui.renderTriggers();

    // 2. Load currencies registry (with 24h cache)
    await loadCurrenciesRegistry();

    // 3. Render popular African currency pairs
    this.ui.renderPopularPairs();

    // 4. Perform initial conversion & stats fetch
    await this.handlePairChange();

    // 5. Setup copy clipboard listeners for support section
    this.initCopyListeners();
  }

  async handlePairChange() {
    this.ui.showStatus('Fetching latest exchange rates…');

    // 1. Fetch current pair rate
    const { rate, rateDate, isStale, error } = await this.converter.updateRate();

    if (error) {
      this.ui.updateRateDisplay(null, null, false);
      this.ui.updateStatsDisplay({ avg: '—', high: '—', low: '—', label: '30d avg' });
      return;
    }

    this.ui.updateRateDisplay(rate, rateDate, isStale);

    // 2. Fetch ~30 day stats
    const rawStats = await calculate30DayStats(this.converter.from, this.converter.to);
    const formattedStats = formatStatValues(rawStats);
    this.ui.updateStatsDisplay(formattedStats);
  }

  initCopyListeners() {
    window.copyCryptoAddress = (address, currencyName) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(() => {
          this.ui.showToast(`${currencyName} address copied to clipboard!`);
        }).catch(() => {
          this.fallbackCopy(address, currencyName);
        });
      } else {
        this.fallbackCopy(address, currencyName);
      }
    };
  }

  fallbackCopy(address, currencyName) {
    const ta = document.createElement('textarea');
    ta.value = address;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      this.ui.showToast(`${currencyName} address copied to clipboard!`);
    } catch (e) {
      this.ui.showToast(`Failed to copy address.`);
    } finally {
      document.body.removeChild(ta);
    }
  }
}

// Auto-boot on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init().catch(err => console.error('App initialization failed:', err));
});
