/* shop.js — inline buttons call addToCart(this) */
"use strict";

const CART_KEY = "museumCartV1";

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  // support either #cart-count or .cart-count
  const el = document.querySelector("#cart-count, .cart-count");
  if (!el) return;
  const total = readCart().reduce((n, it) => n + it.qty, 0);
  el.textContent = total;
}

// Called from HTML: onclick="addToCart(this)"
function addToCart(btn) {
  const id = String(btn.dataset.id);
  const name = btn.dataset.name;
  const unitPrice = Number(btn.dataset.price);
  // Prefer relative paths so GitHub Pages doesn’t break
  const image = btn.dataset.image?.replace(/^\/Museum\//, "../") || "";

  let cart = readCart();
  const idx = cart.findIndex(it => String(it.id) === id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, unitPrice, qty: 1, image });
  }
  writeCart(cart);

  // Update qty badge on this card
  const card = btn.closest(".souvenir-item, .shop-card, .card");
  if (card) {
    const badge = card.querySelector(".qty-badge");
    if (badge) {
      const item = cart.find(it => String(it.id) === id);
      badge.textContent = item ? `Qty: ${item.qty}` : "";
      badge.setAttribute("aria-live", "polite");
    }
  }

  updateCartCount();

  // Small feedback
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = "Added!";
  setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 600);
}

// Sync badges when page opens (in case user came back from Cart)
document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();
  document.querySelectorAll("[data-id]").forEach(btn => {
    const id = String(btn.dataset.id);
    const item = cart.find(it => String(it.id) === id);
    if (!item) return;
    const card = btn.closest(".souvenir-item, .shop-card, .card");
    const badge = card?.querySelector(".qty-badge");
    if (badge) badge.textContent = `Qty: ${item.qty}`;
  });
  updateCartCount();
});

// Expose globally for inline onclick
window.addToCart = addToCart;









