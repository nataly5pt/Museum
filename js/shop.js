/* /Museum/js/shop.js */
(function () {
  'use strict';

  // ---------- Shared storage key (must match cart.js) ----------
  const CART_KEY = 'museumCartV1';

  // ---------- Small DOM helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- Cart I/O ----------
  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('Invalid cart JSON, resetting.', err);
      localStorage.removeItem(CART_KEY);
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateHeaderCount(cart);
    updateBadges(cart);
    // Let anything else (e.g., card.js, a header widget) react to changes
    window.dispatchEvent(
      new CustomEvent('cart:updated', {
        detail: { cart, count: cartCount(cart) }
      })
    );
  }

  // ---------- Helpers ----------
  function cartCount(cart = readCart()) {
    return cart.reduce((n, it) => n + (Number(it.qty) || 0), 0);
  }

  function updateHeaderCount(cart = readCart()) {
    const badge = $('#cartCount');
    if (!badge) return;
    const n = cartCount(cart);
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  function updateBadges(cart = readCart()) {
    $$('.souvenir-card').forEach(card => {
      const id = card?.dataset?.id;
      const badge = $('.qty-badge', card);
      if (!badge || !id) return;

      const found = cart.find(it => it.id === id);
      const qty = found ? Number(found.qty) : 0;

      badge.textContent = qty > 0 ? `Qty: ${qty}` : '';
      badge.style.display = qty > 0 ? 'inline-block' : 'none';
    });
  }

  function addToCartFromCard(card) {
    if (!card) return console.error('addToCartFromCard: missing card element');

    const { id, name, price, image } = card.dataset || {};
    if (!id || !name || price == null) {
      console.error(
        'Card is missing required data attributes on <article.souvenir-card>',
        card
      );
      return;
    }

    const unitPrice = Number(price);
    if (Number.isNaN(unitPrice)) {
      console.error('Invalid data-price on card:', price);
      return;
    }

    const cart = readCart();
    const row = cart.find(it => it.id === id);

    if (row) {
      row.qty += 1;
    } else {
      cart.push({
        id,
        name,
        unitPrice,
        qty: 1,
        image: image || ''
      });
    }

    writeCart(cart);
  }

  function bindAddButtons() {
    $$('.souvenir-card .add-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const card = e.currentTarget.closest('.souvenir-card');
        addToCartFromCard(card);
      });
    });
  }

  // Sync badges/count if another tab changes the cart
  window.addEventListener('storage', evt => {
    if (evt.key === CART_KEY) {
      const cart = readCart();
      updateHeaderCount(cart);
      updateBadges(cart);
    }
  });

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    // If card.js exposes a hydrate hook, run it first so cards are ready
    if (window.MuseumCard && typeof window.MuseumCard.hydrate === 'function') {
      try {
        window.MuseumCard.hydrate();
      } catch (e) {
        console.warn('MuseumCard.hydrate() failed:', e);
      }
    }

    bindAddButtons();
    updateHeaderCount();
    updateBadges();
  });

  // ---------- Small public API (optional; useful for card.js/tests) ----------
  window.ShopCart = {
    read: readCart,
    count: cartCount,
    add(id, name, unitPrice, qty = 1, image = '') {
      if (!id) return;
      const cart = readCart();
      let row = cart.find(it => it.id === id);
      if (!row) {
        row = { id, name, unitPrice: Number(unitPrice) || 0, qty: 0, image };
        cart.push(row);
      }
      row.qty += Math.max(1, Number(qty) || 1);
      writeCart(cart);
    },
    clear() {
      localStorage.removeItem(CART_KEY);
      updateHeaderCount([]);
      updateBadges([]);
      window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: [], count: 0 } }));
    }
  };
})();




