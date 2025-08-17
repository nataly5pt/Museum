/* ==========================================================================
   Museum of Wonder – Shared Cart Engine (card.js)
   One lightweight, vanilla JS module for Shop + Cart pages.
   Exposes API on window.MuseumCart (no bundlers needed).
   ========================================================================== */

(() => {
  'use strict';

  /* --------------------------- Constants -------------------------------- */
  const CART_KEY = 'museumCartV1';

  // Business rules
  const TAX_RATE = 0.102;                  // 10.2%
  const MEMBER_DISCOUNT_RATE = 0.15;       // 15%
  const SHIPPING_RATE = 25.00;             // Flat fee

  // Volume tiers (min/max inclusive of min, exclusive of max)
  const VOLUME_DISCOUNT_TIERS = [
    { min: 0,     max: 49.99,  rate: 0.00 },
    { min: 50,    max: 99.99,  rate: 0.05 },
    { min: 100,   max: 199.99, rate: 0.10 },
    { min: 200,   max: Infinity, rate: 0.15 }
  ];

  // Number formatter (money)
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  /* ------------------------ Utility helpers ----------------------------- */

  function clampToMoney(n) {
    // avoid -0.00, NaN etc.
    const x = Number.isFinite(n) ? n : 0;
    const r = Math.round(x * 100) / 100;
    return r === 0 ? 0 : r;
  }

  function formatMoney(n) {
    return fmt.format(clampToMoney(n));
  }

  function formatPct(n) {
    return `${(n * 100).toFixed(1)}%`;
  }

  function read() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function write(cart) {
    // drop invalid or free items
    const clean = (cart || []).filter(it =>
      it && it.id && Number(it.unitPrice) > 0 && Number(it.qty) > 0
    );
    localStorage.setItem(CART_KEY, JSON.stringify(clean));
    return clean;
  }

  function clear() {
    localStorage.removeItem(CART_KEY);
    // fire storage manually for same-tab listeners
    try {
      window.dispatchEvent(new StorageEvent('storage', { key: CART_KEY }));
    } catch {}
  }

  function find(cart, id) {
    return (cart || []).find(it => it.id === id);
  }

  function setQty(id, qty) {
    const cart = read();
    const it = find(cart, id);
    if (!it) return write(cart);
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) {
      const next = cart.filter(x => x.id !== id);
      return write(next);
    }
    it.qty = q;
    return write(cart);
  }

  function remove(id) {
    const cart = read().filter(it => it.id !== id);
    return write(cart);
  }

  function add(item) {
    // item: {id, name, unitPrice, image?, qty?}
    if (!item || !item.id) return read();

    const price = Number(item.unitPrice);
    if (!Number.isFinite(price) || price <= 0) return read();

    const cart = read();
    const existing = find(cart, item.id);
    if (existing) {
      existing.qty = Number(existing.qty || 0) + Number(item.qty || 1);
    } else {
      cart.push({
        id: String(item.id),
        name: String(item.name || 'Item'),
        unitPrice: price,
        qty: Number(item.qty || 1),
        image: item.image || ''
      });
    }
    return write(cart);
  }

  function count(cart = read()) {
    return cart.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  }

  function itemTotal(cart = read()) {
    return cart.reduce((sum, it) => {
      const p = Number(it.unitPrice || 0);
      const q = Number(it.qty || 0);
      return sum + (p * q);
    }, 0);
  }

  function volumeRateFor(total) {
    for (const tier of VOLUME_DISCOUNT_TIERS) {
      if (total >= tier.min && total < tier.max) return tier.rate;
    }
    return 0;
  }

  function calcVolumeDiscount(total) {
    return total * volumeRateFor(total);
  }

  /**
   * Compute summary numbers with discount choice.
   * @param {Object} options
   * @param {Array}  options.cart
   * @param {boolean} options.isMember - true if member checkbox checked
   * @param {'auto'|'member'|'volume'|'none'} options.discountMode
   * @returns {Object} summary
   */
  function summarize({ cart = read(), isMember = false, discountMode = 'auto' } = {}) {
    // 1) ItemTotal
    const itemsTotal = itemTotal(cart);

    // 2) Decide discounts
    const volRate = volumeRateFor(itemsTotal);
    const volDisc = itemsTotal * volRate;
    const memDisc = isMember ? itemsTotal * MEMBER_DISCOUNT_RATE : 0;

    let applyMember = false;
    let applyVolume = false;
    let needChoice = false;
    let suggested = ''; // which gives bigger discount

    if (discountMode === 'member') {
      applyMember = !!isMember;
    } else if (discountMode === 'volume') {
      applyVolume = volRate > 0;
    } else if (discountMode === 'none') {
      // nothing
    } else {
      // auto
      if (isMember && volRate > 0) {
        needChoice = true;
        suggested = (memDisc > volDisc) ? 'member' : 'volume';
        // For auto mode we do NOT apply either so UI can prompt.
      } else if (isMember) {
        applyMember = true;
      } else if (volRate > 0) {
        applyVolume = true;
      }
    }

    const memberDiscount  = applyMember ? memDisc : 0;
    const volumeDiscount  = applyVolume ? volDisc : 0;
    const discounts       = memberDiscount + volumeDiscount;

    // 4) Shipping after discounts (flat if cart non-empty)
    const shipping = cart.length > 0 ? SHIPPING_RATE : 0;

    // 5) Subtotal (taxable)
    const taxable = clampToMoney(itemsTotal - discounts + shipping);

    // 6–8) Tax and total
    const taxAmount = clampToMoney(taxable * TAX_RATE);
    const invoiceTotal = clampToMoney(taxable + taxAmount);

    return {
      // inputs
      cart,
      isMember,
      discountMode,
      // key rows
      itemsTotal: clampToMoney(itemsTotal),
      volumeRate: volRate,
      volumeDiscount: clampToMoney(volumeDiscount),
      memberDiscount: clampToMoney(memberDiscount),
      shipping: clampToMoney(shipping),
      taxable,                          // subtotal (taxable amount)
      taxRate: TAX_RATE,
      taxAmount,
      invoiceTotal,
      // UX hints
      needChoice,                       // true if both discounts possible
      suggested                        // 'member' | 'volume' when needChoice
    };
  }

  /* ------------------------ Header Count Helper -------------------------- */

  function updateHeaderCount(selector = '#cartCount') {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    el.textContent = String(count());
  }

  // Keep header count in sync across tabs
  window.addEventListener('storage', (evt) => {
    if (evt.key === CART_KEY) updateHeaderCount();
  });

  /* --------------------------- Public API -------------------------------- */

  const API = {
    // constants
    CART_KEY,
    TAX_RATE,
    MEMBER_DISCOUNT_RATE,
    SHIPPING_RATE,
    VOLUME_DISCOUNT_TIERS,

    // storage
    read,
    write,
    clear,

    // items
    add,
    remove,
    setQty,
    find: (id) => find(read(), id),
    count,
    itemTotal,

    // discounts & summary
    volumeRateFor,
    calcVolumeDiscount,
    summarize,

    // formatting
    formatMoney,
    formatPct,

    // small UI helper
    updateHeaderCount
  };

  // Expose for global usage (no modules)
  window.MuseumCart = API;

  /* ---- Compatibility aliases (keeps earlier snippets working) ----------- */
  window.CartAPI = API;                               // alias
  window.addItemToCart = (item) => API.add(item);     // alias if someone calls addItemToCart()
})();



