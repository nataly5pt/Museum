/* shop.js — Shop page logic */
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
}

/* ---------- header count ---------- */
function getItemCount(cart) {
  return cart.reduce((n, it) => n + (it.qty || 0), 0);
}
function updateHeaderCount(cart = readCart()) {
  // Prefer #navCartCount, fallback to #cart-count or .cart-count
  const el =
    document.getElementById("navCartCount") ||
    document.getElementById("cart-count") ||
    document.querySelector(".cart-count");
  if (el) el.textContent = String(getItemCount(cart));
}

/* ---------- addToCart (called by buttons) ---------- */
// Called from HTML: onclick="addToCart(this)"
function addToCart(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const unitPrice = Number(btn.dataset.price);
  const image = btn.dataset.image || "";

  if (!id || !name || !Number.isFinite(unitPrice)) {
    alert("This item is missing data-id / data-name / data-price.");
    return;
  }

  const cart = readCart();
  const idx = cart.findIndex((it) => String(it.id) === String(id));
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, unitPrice, qty: 1, image });
  }
  writeCart(cart);
  updateHeaderCount(cart);

  // Update qty badge on this card
  const card = btn.closest(".souvenir-item, .shop-card, .card, article");
  if (card) {
    const badge = card.querySelector(".qty-badge");
    if (badge) {
      const me = cart.find((it) => String(it.id) === String(id));
      badge.textContent = me ? `Qty: ${me.qty}` : "";
      badge.setAttribute("aria-live", "polite");
    }
  }

  // Small visual feedback
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Added!";
  setTimeout(() => {
    btn.textContent = old;
    btn.disabled = false;
  }, 700);
}

/* ---------- init badges on load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();
  document.querySelectorAll("button[data-id][data-price]").forEach((btn) => {
    const id = String(btn.dataset.id);
    const item = cart.find((it) => String(it.id) === id);
    if (!item) return;
    const card = btn.closest(".souvenir-item, .shop-card, .card, article");
    const badge = card && card.querySelector(".qty-badge");
    if (badge) badge.textContent = `Qty: ${item.qty}`;
  });
  updateHeaderCount(cart);
});

/* expose for inline onclick */
window.addToCart = addToCart;












