/* shop.js — buttons call addToCart(this) */
"use strict";

const CART_KEY = "museumCartV1";

/* storage */
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* header count (supports #navCartCount, #cart-count or .cart-count) */
function updateHeaderCount() {
  const cart = readCart();
  const total = cart.reduce((n, it) => n + (it.qty || 0), 0);
  const el =
    document.getElementById("navCartCount") ||
    document.getElementById("cart-count") ||
    document.querySelector(".cart-count");
  if (el) el.textContent = String(total);
}

/* add to cart (called inline) */
function addToCart(btn) {
  const id = String(btn.dataset.id || "");
  const name = btn.dataset.name || "";
  const unitPrice = Number(btn.dataset.price);
  const image = btn.dataset.image || "";

  if (!id || !name || !Number.isFinite(unitPrice)) {
    alert("This item is missing data-id, data-name, or data-price.");
    return;
  }

  const cart = readCart();
  const idx = cart.findIndex(it => String(it.id) === id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, unitPrice, qty: 1, image });
  }
  writeCart(cart);

  /* update qty badge on this card */
  const card = btn.closest(".souvenir-item, .shop-card, .card");
  const badge = card ? card.querySelector(".qty-badge") : null;
  if (badge) {
    const item = cart.find(it => String(it.id) === id);
    badge.textContent = item ? `Qty: ${item.qty}` : "";
  }

  updateHeaderCount();

  /* quick feedback */
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Added!";
  setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 600);
}

/* hydrate badges + header count on load */
document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();
  document.querySelectorAll("[data-id]").forEach(btn => {
    const id = String(btn.dataset.id || "");
    const item = cart.find(it => String(it.id) === id);
    if (!item) return;
    const card = btn.closest(".souvenir-item, .shop-card, .card");
    const badge = card ? card.querySelector(".qty-badge") : null;
    if (badge) badge.textContent = `Qty: ${item.qty}`;
  });
  updateHeaderCount();
});

/* expose globally for inline onclick */
window.addToCart = addToCart;











