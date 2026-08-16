/**
 * Core currency conversion engine using cached rates and local calculations.
 */

import { fetchBaseCurrencyRates } from './api.js';
import { fmt } from './utils.js';

export class CurrencyConverter {
  constructor() {
    this.from = 'USD';
    this.to = 'NGN';
    this.currentRate = null;
    this.rateDate = null;
    this.isStaleRate = false;
  }

  setPair(from, to) {
    if (this.from !== from || this.to !== to) {
      this.from = from.toUpperCase();
      this.to = to.toUpperCase();
      this.currentRate = null; // Reset cached pair rate when currencies change
    }
  }

  swap() {
    const temp = this.from;
    this.from = this.to;
    this.to = temp;
    this.currentRate = null;
  }

  /**
   * Fetch exchange rate for current pair and calculate target amount.
   */
  async updateRate() {
    if (this.from === this.to) {
      this.currentRate = 1.0;
      this.rateDate = 'Same currency';
      this.isStaleRate = false;
      return {
        rate: 1.0,
        rateDate: 'Same currency',
        isStale: false,
        error: null
      };
    }

    try {
      const { data, isStale } = await fetchBaseCurrencyRates(this.from);
      const baseCode = this.from.toLowerCase();
      const targetCode = this.to.toLowerCase();

      if (!data || !data[baseCode] || typeof data[baseCode][targetCode] !== 'number') {
        throw new Error(`Exchange rate unavailable for ${this.from} → ${this.to}`);
      }

      this.currentRate = data[baseCode][targetCode];
      this.rateDate = data.date || 'Live';
      this.isStaleRate = isStale;

      return {
        rate: this.currentRate,
        rateDate: this.rateDate,
        isStale: isStale,
        error: null
      };
    } catch (err) {
      this.currentRate = null;
      return {
        rate: null,
        rateDate: null,
        isStale: false,
        error: err.message || 'Rate temporarily unavailable'
      };
    }
  }

  /**
   * Convert amount locally using stored rate without triggering any network call.
   */
  convertAmount(amount) {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
      return {
        convertedAmount: 0,
        formattedAmount: '0',
        formattedRate: this.currentRate ? fmt(this.currentRate) : '—'
      };
    }

    if (this.from === this.to) {
      return {
        convertedAmount: parsed,
        formattedAmount: fmt(parsed),
        formattedRate: '1.0000'
      };
    }

    if (this.currentRate === null || isNaN(this.currentRate)) {
      return {
        convertedAmount: null,
        formattedAmount: '—',
        formattedRate: '—'
      };
    }

    const converted = parsed * this.currentRate;
    return {
      convertedAmount: converted,
      formattedAmount: fmt(converted),
      formattedRate: fmt(this.currentRate)
    };
  }
}
