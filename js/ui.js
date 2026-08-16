/**
 * UI controller managing DOM bindings, accessibility, modal focus, and Toast notifications.
 */

import { CURRENCY_REGISTRY, filterCurrencies, POPULAR_AFRICAN_PAIRS } from './currencies.js';
import { setFlag, fmt, isCryptoCode } from './utils.js';

export class UIController {
  constructor(converter, onPairChange) {
    this.converter = converter;
    this.onPairChange = onPairChange;
    this.pickerTarget = null; // 'from' or 'to'
    this.pickerCategory = 'all'; // 'all', 'fiat', 'crypto'
    this.previousFocusedElement = null;

    this.bindDOM();
    this.initEvents();
  }

  bindDOM() {
    this.amountEl = document.getElementById('amount');
    this.resultAmount = document.getElementById('resultAmount');
    this.rateValue = document.getElementById('rateValue');
    this.statusEl = document.getElementById('status');

    // Stats
    this.statAvg = document.getElementById('statAvg');
    this.statHigh = document.getElementById('statHigh');
    this.statLow = document.getElementById('statLow');
    this.statAvgLabel = document.getElementById('statAvgLabel');

    // Triggers
    this.fromTrigger = document.getElementById('fromTrigger');
    this.toTrigger = document.getElementById('toTrigger');
    this.fromCode = document.getElementById('fromCode');
    this.toCode = document.getElementById('toCode');
    this.fromFlag = document.getElementById('fromFlag');
    this.toFlag = document.getElementById('toFlag');
    this.fromFlagCircle = document.getElementById('fromFlagCircle');
    this.toFlagCircle = document.getElementById('toFlagCircle');
    this.swapBtn = document.getElementById('swap');

    // Picker Modal
    this.pickerBackdrop = document.getElementById('pickerBackdrop');
    this.pickerModal = document.getElementById('pickerModal');
    this.pickerSearch = document.getElementById('pickerSearch');
    this.pickerList = document.getElementById('pickerList');
    this.pickerCloseBtn = document.getElementById('pickerCloseBtn');
    this.tabAll = document.getElementById('tabAll');
    this.tabFiat = document.getElementById('tabFiat');
    this.tabCrypto = document.getElementById('tabCrypto');

    // Toast
    this.toastEl = document.getElementById('toast');

    // Popular Pairs Container
    this.popularPairsContainer = document.getElementById('popularPairsContainer');
  }

  initEvents() {
    // Amount input handler - local conversion only (NO network calls)
    if (this.amountEl) {
      this.amountEl.addEventListener('input', () => this.handleAmountInput());
    }

    // Currency Picker triggers
    if (this.fromTrigger) {
      this.fromTrigger.addEventListener('click', () => this.openPicker('from'));
      this.fromTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openPicker('from');
        }
      });
    }

    if (this.toTrigger) {
      this.toTrigger.addEventListener('click', () => this.openPicker('to'));
      this.toTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openPicker('to');
        }
      });
    }

    // Swap button
    if (this.swapBtn) {
      this.swapBtn.addEventListener('click', () => this.handleSwap());
    }

    // Modal Close
    if (this.pickerCloseBtn) {
      this.pickerCloseBtn.addEventListener('click', () => this.closePicker());
    }

    if (this.pickerBackdrop) {
      this.pickerBackdrop.addEventListener('click', (e) => {
        if (e.target === this.pickerBackdrop) this.closePicker();
      });
    }

    // Keyboard navigation in modal (Escape & Focus Trap)
    document.addEventListener('keydown', (e) => {
      if (this.isPickerOpen()) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closePicker();
        }
      }
    });

    // Search input in modal
    if (this.pickerSearch) {
      this.pickerSearch.addEventListener('input', () => this.renderPickerList());
    }

    // Filter Tabs
    const setTab = (category, activeTabEl) => {
      this.pickerCategory = category;
      [this.tabAll, this.tabFiat, this.tabCrypto].forEach(tab => {
        if (tab) {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        }
      });
      if (activeTabEl) {
        activeTabEl.classList.add('active');
        activeTabEl.setAttribute('aria-selected', 'true');
      }
      this.renderPickerList();
    };

    if (this.tabAll) this.tabAll.addEventListener('click', () => setTab('all', this.tabAll));
    if (this.tabFiat) this.tabFiat.addEventListener('click', () => setTab('fiat', this.tabFiat));
    if (this.tabCrypto) this.tabCrypto.addEventListener('click', () => setTab('crypto', this.tabCrypto));
  }

  renderTriggers() {
    if (this.fromCode) this.fromCode.textContent = this.converter.from;
    if (this.toCode) this.toCode.textContent = this.converter.to;
    setFlag(this.fromFlagCircle, this.fromFlag, this.converter.from);
    setFlag(this.toFlagCircle, this.toFlag, this.converter.to);
  }

  handleAmountInput() {
    const amount = this.amountEl ? this.amountEl.value : 1;
    const res = this.converter.convertAmount(amount);
    if (this.resultAmount) {
      this.resultAmount.textContent = res.formattedAmount;
    }
  }

  handleSwap() {
    this.converter.swap();
    this.renderTriggers();
    if (typeof this.onPairChange === 'function') {
      this.onPairChange();
    }
  }

  isPickerOpen() {
    return this.pickerBackdrop && this.pickerBackdrop.classList.contains('open');
  }

  openPicker(target) {
    this.previousFocusedElement = document.activeElement;
    this.pickerTarget = target;
    if (this.pickerSearch) this.pickerSearch.value = '';

    // Reset category tab to All
    this.pickerCategory = 'all';
    if (this.tabAll) {
      [this.tabAll, this.tabFiat, this.tabCrypto].forEach(t => {
        if (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      });
      this.tabAll.classList.add('active');
      this.tabAll.setAttribute('aria-selected', 'true');
    }

    this.renderPickerList();
    if (this.pickerBackdrop) this.pickerBackdrop.classList.add('open');

    setTimeout(() => {
      if (this.pickerSearch) this.pickerSearch.focus();
    }, 50);
  }

  closePicker() {
    if (this.pickerBackdrop) this.pickerBackdrop.classList.remove('open');
    this.pickerTarget = null;
    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
      this.previousFocusedElement.focus();
    }
  }

  selectCurrency(code) {
    if (this.pickerTarget === 'from') {
      this.converter.from = code;
    } else if (this.pickerTarget === 'to') {
      this.converter.to = code;
    }
    this.closePicker();
    this.renderTriggers();
    if (typeof this.onPairChange === 'function') {
      this.onPairChange();
    }
  }

  renderPickerList() {
    if (!this.pickerList) return;
    const query = this.pickerSearch ? this.pickerSearch.value : '';
    const filteredCodes = filterCurrencies(query, this.pickerCategory);
    const currentCode = this.pickerTarget === 'from' ? this.converter.from : this.converter.to;

    this.pickerList.innerHTML = '';

    if (filteredCodes.length === 0) {
      this.pickerList.innerHTML = '<div class="picker-empty">No matching currencies found.</div>';
      return;
    }

    filteredCodes.forEach((code, index) => {
      const info = CURRENCY_REGISTRY[code] || { name: code, type: 'fiat' };
      const isSelected = code === currentCode;

      const item = document.createElement('button');
      item.type = 'button';
      item.className = `picker-item${isSelected ? ' selected' : ''}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      item.tabIndex = 0;

      const flagCircle = document.createElement('div');
      flagCircle.className = 'flag-circle';
      const flagEl = document.createElement('span');
      flagEl.className = 'fi';
      flagCircle.appendChild(flagEl);
      setFlag(flagCircle, flagEl, code);

      const codeSpan = document.createElement('span');
      codeSpan.className = 'code';
      codeSpan.textContent = code;

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = info.name;

      const typeBadge = document.createElement('span');
      typeBadge.className = `type-badge ${info.type}`;
      typeBadge.textContent = info.type.toUpperCase();

      const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      checkSvg.setAttribute('class', 'check');
      checkSvg.setAttribute('width', '18');
      checkSvg.setAttribute('height', '18');
      checkSvg.setAttribute('viewBox', '0 0 24 24');
      checkSvg.setAttribute('fill', 'none');
      checkSvg.setAttribute('stroke', 'currentColor');
      checkSvg.setAttribute('stroke-width', '2.5');
      checkSvg.innerHTML = '<path d="M20 6 9 17l-5-5"/>';

      item.appendChild(flagCircle);
      item.appendChild(codeSpan);
      item.appendChild(nameSpan);
      item.appendChild(typeBadge);
      item.appendChild(checkSvg);

      item.addEventListener('click', () => this.selectCurrency(code));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectCurrency(code);
        }
      });

      this.pickerList.appendChild(item);
    });
  }

  renderPopularPairs() {
    if (!this.popularPairsContainer) return;
    this.popularPairsContainer.innerHTML = '';

    POPULAR_AFRICAN_PAIRS.forEach(pair => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'popular-pair-chip';
      btn.textContent = pair.label;
      btn.setAttribute('aria-label', `Convert ${pair.from} to ${pair.to}`);

      btn.addEventListener('click', () => {
        this.converter.setPair(pair.from, pair.to);
        this.renderTriggers();
        if (typeof this.onPairChange === 'function') {
          this.onPairChange();
        }
      });

      this.popularPairsContainer.appendChild(btn);
    });
  }

  showStatus(msg, isError = false) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    if (isError) {
      this.statusEl.classList.add('err');
    } else {
      this.statusEl.classList.remove('err');
    }
  }

  updateRateDisplay(rate, rateDate, isStale) {
    if (rate === null || isNaN(rate)) {
      if (this.rateValue) this.rateValue.textContent = '—';
      this.showStatus('Exchange rate temporarily unavailable', true);
      return;
    }

    const formattedRate = fmt(rate);
    if (this.rateValue) {
      this.rateValue.textContent = `1 ${this.converter.from} = ${formattedRate} ${this.converter.to}`;
    }

    if (isStale) {
      this.showStatus(`Using recently cached rate (${rateDate})`);
    } else {
      this.showStatus(`Rate updated: ${rateDate}`);
    }

    // Trigger amount recalculation
    this.handleAmountInput();
  }

  updateStatsDisplay(formattedStats) {
    if (this.statAvg) this.statAvg.textContent = formattedStats.avg;
    if (this.statHigh) this.statHigh.textContent = formattedStats.high;
    if (this.statLow) this.statLow.textContent = formattedStats.low;
    if (this.statAvgLabel) this.statAvgLabel.textContent = formattedStats.label;
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    setTimeout(() => {
      if (this.toastEl) this.toastEl.classList.remove('show');
    }, 3000);
  }
}
