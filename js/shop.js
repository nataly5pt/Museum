/* /js/shop.js
   Shop page cart hooks: buttons call onclick="addToCart(this)"
*/
(function () {
  "use strict";

  // ---- Shared key for both Shop and Cart (safe if declared twice) ----
  if (!window.MUSEUM_CART_KEY) window.MUSEUM_CART_KEY = "museumCartV1";
  const KEY = window.MUSEUM_CART_KEY;

  // ---- Storage helpers ----
  function readCart() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Cart read error:", e);
      return [];
    }
  }
  function writeCart(cart) {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Cart write error:", e);
    }
    updateHeaderCount(cart);
  }

  // ---- Header "Cart N" count ----
  function updateHeaderCount(cart = readCart()) {
    const count = cart.reduce((n, it) => n + (it.qty || 0), 0);
    const el =
      document.querySelector("#navCartCount") ||
      document.querySelector("#cart-count") ||
      document.querySelector(".cart-count");
    if (el) el.textContent = String(count);
  }

  // ---- Add-to-cart (called from HTML onclick) ----
  function addToCart(btn) {
    // Defensive: make sure we can read the data attributes
    const id = (btn && btn.dataset && btn.dataset.id) ? String(btn.dataset.id) : "";
    const name = (btn && btn.dataset) ? btn.dataset.name : "";
    const unitPrice = (btn && btn.dataset) ? Number(btn.dataset.price) : NaN;
    const image = (btn && btn.dataset) ? (btn.dataset.image || "") : "";

    if (!id || !name || !Number.isFinite(unitPrice)) {
      alert("This item is missing data-id / data-name / data-price.");
      return;
    }

    const cart = readCart();
    const i = cart.findIndex(it => String(it.id) === id);
    if (i >= 0) {
      cart[i].qty += 1;
    } else {
      cart.push({ id, name, unitPrice, qty: 1, image });
    }
    writeCart(cart);

    // Update the small qty badge on the card
    const card =
      (btn && btn.closest && btn.closest(".souvenir-item, .shop-card, .card")) || null;
    if (card) {
      const badge = card.querySelector(".qty-badge");
      if (badge) {
        const me = cart.find(it => String(it.id) === id);
        badge.textContent = me ? `Qty: ${me.qty}` : "";
        badge.setAttribute("aria-live", "polite");
      }
    }

    // Tiny visual feedback on the button
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Added!";
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = label;
    }, 600);
  }

  // ---- On page load: sync badges + header count ----
  document.addEventListener("DOMContentLoaded", () => {
    const cart = readCart();

    document.querySelectorAll("button[data-id]").forEach(btn => {
      const id = String(btn.dataset.id || "");
      const item = cart.find(it => String(it.id) === id);
      if (!item) return;
      const card = btn.closest(".souvenir-item, .shop-card, .card");
      if (!card) return;
      const badge = card.querySelector(".qty-badge");
      if (badge) badge.textContent = `Qty: ${item.qty}`;
    });

    updateHeaderCount(cart);
  });

  // Expose the one function the HTML calls
  window.addToCart = addToCart;
  // (optionally expose helpers for cart.js or debugging)
  window._shopCart = { readCart, writeCart, updateHeaderCount };
})();













