/* /js/shop.js — Shop-only cart helpers
   - Buttons call: onclick="addToCart(this)"
   - Header count element: #navCartCount (fallbacks supported)
*/
"use strict";

const CART_KEY = "museumCartV1";

/* ---------- storage ---------- */
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateHeaderCount(cart);
}

/* ---------- header count (supports multiple selectors) ---------- */
const COUNT_SELECTORS = ["#navCartCount", "#cart-count", ".cart-count"];
function updateHeaderCount(cart = readCart()) {
  const total = cart.reduce((n, it) => n + (Number(it.qty) || 0), 0);
  document.querySelectorAll(COUNT_SELECTORS.join(",")).forEach(el => {
    el.textContent = String(total);
  });
}

/* ---------- main: Add to Cart ---------- */
function addToCart(btn) {
  const id    = String(btn.dataset.id || "").trim();
  const name  = String(btn.dataset.name || "").trim();
  const price = Number(btn.dataset.price);
  const image = String(btn.dataset.image || "");

  if (!id || !name || !Number.isFinite(price)) {
    alert("Missing or invalid data-id / data-name / data-price on this button.");
    return;
  }

  const cart = readCart();
  const ix = cart.findIndex(it => String(it.id) === id);
  if (ix >= 0) {
    cart[ix].qty += 1;
  } else {
    cart.push({ id, name, unitPrice: price, qty: 1, image });
  }
  writeCart(cart);

  // Update the card’s qty badge (if present)
  const card = btn.closest(".souvenir-item, .shop-card, .card, .product");
  if (card) {
    const badge = card.querySelector(".qty-badge");
    if (badge) {
      const me = cart.find(it => String(it.id) === id);
      badge.textContent = me ? `Qty: ${me.qty}` : "";
      badge.setAttribute("aria-live", "polite");
    }
  }

  // Tiny visual feedback
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Added!";
  setTimeout(() => {
    btn.textContent = old;
    btn.disabled = false;
  }, 600);
}

/* ---------- hydrate on load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();

  // Sync any visible qty badges with existing cart
  document.querySelectorAll("[data-id]").forEach(btn => {
    const card = btn.closest(".souvenir-item, .shop-card, .card, .product");
    const badge = card?.querySelector(".qty-badge");
    if (!badge) return;

    const item = cart.find(it => String(it.id) === String(btn.dataset.id));
    if (item) badge.textContent = `Qty: ${item.qty}`;
  });

  updateHeaderCount(cart);
});

/* expose for inline onclick */
window.addToCart = addToCart;










