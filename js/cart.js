/* cart.js — shared cart logic for ALL pages */
"use strict";

// ===== Settings you can tweak =====
const CART_KEY = "museum_cart";
const TAX_RATE = 0.102;                 // 10.2% tax
const SHIPPING_FLAT = 7.5;              // flat shipping if under threshold
const FREE_SHIP_THRESHOLD = 50;         // free shipping if subtotal >= this

// ===== Helpers =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

function toCents(n) { return Math.round(Number(n) * 100); }
function fromCents(c) { return (c / 100).toFixed(2); }

// ===== Storage =====
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ===== Public cart API =====
function addToCart(product, qty = 1) {
  const cart = getCart();
  const found = cart.find(i => i.id === product.id);
  if (found) {
    found.qty += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,             // number (e.g., 19.99)
      image: product.image || "",
      qty: qty
    });
  }
  saveCart(cart);
  updateCartCount();
}

function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartCount();
}

function setQty(id, qty) {
  qty = Math.max(1, Number(qty) || 1);
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty = qty;
  saveCart(cart);
  updateCartCount();
}

function updateCartCount() {
  const badge = $("#cart-count");
  if (!badge) return;
  const count = getCart().reduce((n, i) => n + i.qty, 0);
  badge.textContent = count;
}

// ===== Totals (simple rules from class) =====
// Order: Subtotal -> (optional) Discount -> Shipping -> Tax(on subtotal after discount)
function computeSummary(cart) {
  const subtotalCents = cart.reduce((sum, i) => sum + toCents(i.price) * i.qty, 0);

  // If you add a discount code later, set discountCents accordingly.
  const discountCents = 0;

  const subAfterDiscount = Math.max(0, subtotalCents - discountCents);
  const shippingCents = subAfterDiscount >= toCents(FREE_SHIP_THRESHOLD) || subAfterDiscount === 0
    ? 0
    : toCents(SHIPPING_FLAT);

  // Tax on subtotal (after discount). If your class taxes shipping too, change base to (subAfterDiscount + shippingCents)
  const taxCents = Math.round(subAfterDiscount * TAX_RATE);

  const totalCents = subAfterDiscount + shippingCents + taxCents;

  return { subtotalCents, discountCents, shippingCents, taxCents, totalCents };
}

// ===== Cart page rendering (only runs on cart.html) =====
function renderCartPageIfPresent() {
  const list = $("#cart-items");
  if (!list) return; // Not on the cart page

  const empty = $("#cart-empty");
  const summaryEls = {
    subtotal: $("#sum-subtotal"),
    discount: $("#sum-discount"),
    shipping: $("#sum-shipping"),
    tax: $("#sum-tax"),
    total: $("#sum-total"),
  };

  const cart = getCart();

  if (!cart.length) {
    if (empty) empty.hidden = false;
    list.innerHTML = "";
    Object.values(summaryEls).forEach(el => { if (el) el.textContent = "$0.00"; });
    updateCartCount();
    return;
  }

  if (empty) empty.hidden = true;

  list.innerHTML = cart.map(i => `
    <div class="cart-row" data-id="${i.id}">
      <img src="${i.image || ""}" alt="" class="thumb" />
      <div class="info">
        <strong class="title">${i.title}</strong>
        <div class="price">$${Number(i.price).toFixed(2)}</div>
      </div>
      <div class="qty">
        <button class="btn-qty minus" aria-label="Decrease">−</button>
        <input class="qty-input" type="number" min="1" value="${i.qty}">
        <button class="btn-qty plus" aria-label="Increase">+</button>
      </div>
      <div class="line-total">
        $${fromCents(toCents(i.price) * i.qty)}
      </div>
      <button class="remove" aria-label="Remove">✕</button>
    </div>
  `).join("");

  // totals
  const sums = computeSummary(cart);
  if (summaryEls.subtotal) summaryEls.subtotal.textContent = `$${fromCents(sums.subtotalCents)}`;
  if (summaryEls.discount) summaryEls.discount.textContent = `−$${fromCents(sums.discountCents)}`;
  if (summaryEls.shipping) summaryEls.shipping.textContent = `$${fromCents(sums.shippingCents)}`;
  if (summaryEls.tax) summaryEls.tax.textContent = `$${fromCents(sums.taxCents)}`;
  if (summaryEls.total) summaryEls.total.textContent = `$${fromCents(sums.totalCents)}`;

  updateCartCount();
}

// ===== Events (cart page) =====
function attachCartHandlers() {
  const list = $("#cart-items");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const row = e.target.closest(".cart-row");
    if (!row) return;
    const id = Number(row.dataset.id);
    const input = row.querySelector(".qty-input");

    if (e.target.matches(".remove")) {
      removeFromCart(id);
      renderCartPageIfPresent();
      return;
    }
    if (e.target.matches(".btn-qty.minus")) {
      setQty(id, Math.max(1, Number(input.value) - 1));
      renderCartPageIfPresent();
      return;
    }
    if (e.target.matches(".btn-qty.plus")) {
      setQty(id, Number(input.value) + 1);
      renderCartPageIfPresent();
      return;
    }
  });

  list.addEventListener("change", (e) => {
    if (!e.target.matches(".qty-input")) return;
    const row = e.target.closest(".cart-row");
    const id = Number(row.dataset.id);
    setQty(id, Number(e.target.value));
    renderCartPageIfPresent();
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCartPageIfPresent();
  attachCartHandlers();
});

// Expose small API for shop.js
window.Cart = { add: addToCart, count: updateCartCount };






