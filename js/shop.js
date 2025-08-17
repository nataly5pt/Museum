/* ==========================================================================
   Museum of Wonder – Shop bootstrap
   File: /Museum/js/shop.js
   Purpose:
     - Wire “Add to Cart” buttons
     - Persist cart to localStorage using a stable schema
     - Update quantity badges on each product
     - (Optional) Update a live header count if #cartCount exists
   Cart item shape expected by cart.js:
     { id, name, unitPrice, qty, image }
   ========================================================================== */

(() => {
  "use strict";

  /* -------------------- Config / Storage -------------------- */
  const CART_KEY = "museumCartV1"; // must match cart.js
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const readCart = () => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Cart read error:", e);
      return [];
    }
  };

  const writeCart = (cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Cart write error:", e);
    }
  };

  const findIndexById = (cart, id) => cart.findIndex((i) => i.id === id);

  /* -------------------- Cart mutations -------------------- */
  const addOne = ({ id, name, unitPrice, image }) => {
    const cart = readCart();
    const idx = findIndexById(cart, id);
    if (idx >= 0) {
      // increment existing
      cart[idx].qty += 1;
    } else {
      // add new
      cart.push({
        id,
        name,
        unitPrice: Number(unitPrice),
        qty: 1,
        image
      });
    }
    writeCart(cart);
    return cart;
  };

  /* -------------------- UI helpers -------------------- */
  const sumQty = (cart) => cart.reduce((n, it) => n + (Number(it.qty) || 0), 0);

  const updateBadge = (cardEl) => {
    const badge = $(".qty-badge", cardEl);
    const id = cardEl.dataset.id;
    const cart = readCart();
    const found = cart.find((i) => i.id === id);
    const qty = found ? Number(found.qty) : 0;
    badge.textContent = qty > 0 ? `Qty: ${qty}` : "";
    badge.style.visibility = qty > 0 ? "visible" : "hidden";
  };

  // Optional: header mini-count if you add <span id="cartCount"></span>
  const updateHeaderCount = () => {
    const el = $("#cartCount");
    if (!el) return;
    const total = sumQty(readCart());
    el.textContent = total > 0 ? total : "0";
  };

  const attachCard = (cardEl) => {
    const btn = $(".add-btn", cardEl);
    if (!btn) return;

    // Initialize badge from persisted cart
    updateBadge(cardEl);

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const { id, name, price, image } = cardEl.dataset;

      // Defensive: ignore zero/invalid priced products
      const unitPrice = Number(price);
      if (!isFinite(unitPrice) || unitPrice <= 0) {
        console.warn("Skipping add: invalid or zero price for", id);
        return;
      }

      addOne({ id, name, unitPrice, image });
      updateBadge(cardEl);
      updateHeaderCount();

      // Small micro-feedback
      btn.disabled = true;
      btn.classList.add("pressed");
      window.setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove("pressed");
      }, 220);
    });
  };

  /* -------------------- Bootstrap -------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    // Attach to every product card
    $$(".souvenir-card").forEach(attachCard);

    // On load, reflect any persisted quantities
    updateHeaderCount();

    // If you navigate back from the cart, ensure badges reflect reality
    window.addEventListener("focus", () => {
      $$(".souvenir-card").forEach(updateBadge);
      updateHeaderCount();
    });
  });
})();



