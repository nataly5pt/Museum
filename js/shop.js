/* shop.js — buttons with data-* attrs call addToCart(this) */
"use strict";

const CART_KEY = "museumCartV1";

// read/write cart
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// navbar count
function updateCartCount() {
  const countEl = document.querySelector("#cart-count");
  if (!countEl) return;
  const total = readCart().reduce((n, it) => n + it.qty, 0);
  countEl.textContent = total;
}

// called from the button: onclick="addToCart(this)"
function addToCart(btn) {
  const id = String(btn.dataset.id);
  const name = btn.dataset.name;
  const unitPrice = Number(btn.dataset.price);
  const image = btn.dataset.image;

  let cart = readCart();
  const idx = cart.findIndex(it => String(it.id) === id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, unitPrice, qty: 1, image });
  }
  writeCart(cart);

  // update this card's qty badge
  const card = btn.closest(".souvenir-item, .product, .card");
  if (card) {
    const badge = card.querySelector(".qty-badge");
    if (badge) {
      const item = cart.find(it => String(it.id) === id);
      badge.textContent = item ? `Qty: ${item.qty}` : "";
      badge.setAttribute("aria-live", "polite");
    }
  }

  updateCartCount();
  // optional tiny feedback
  btn.disabled = true;
  const old = btn.textContent;
  btn.textContent = "Added!";
  setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 700);
}

// On load, sync all qty badges (in case user returns from cart)
document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();
  document.querySelectorAll("[data-id]").forEach(btn => {
    const id = String(btn.dataset.id);
    const item = cart.find(it => String(it.id) === id);
    if (!item) return;
    const card = btn.closest(".souvenir-item, .product, .card");
    if (!card) return;
    const badge = card.querySelector(".qty-badge");
    if (badge) badge.textContent = `Qty: ${item.qty}`;
  });
  updateCartCount();
});

// Make addToCart global for inline onclick
window.addToCart = addToCart;







