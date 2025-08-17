/* cart.js — cart page logic with one render() flow */
"use strict";

const CART_KEY = "museumCartV1";

// ==== CONSTANTS (UPPER_SNAKE_CASE) ====
const TAX_RATE = 0.102; // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;
const VOLUME_DISCOUNT_TIERS = [
  { min: 0,    max: 49.99, rate: 0.00 },
  { min: 50.0, max: 99.99, rate: 0.05 },
  { min: 100.0,max: 199.99,rate: 0.10 },
  { min: 200.0,max: Infinity, rate: 0.15 }
];
const SHIPPING_RATE = 25.00;

// ==== Basic storage helpers ====
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateCartCount() {
  const el = document.querySelector("#cart-count");
  if (!el) return;
  const total = readCart().reduce((n, it) => n + it.qty, 0);
  el.textContent = total;
}

// ==== The one main flow ====
function render() {
  const fmt = n => `$${Number(n).toFixed(2)}`;
  const cart = readCart();

  // 1) Build the line items table
  const list = document.querySelector("#cart-items");
  const empty = document.querySelector("#cart-empty");

  if (!cart.length) {
    if (list) list.innerHTML = "";
    if (empty) empty.hidden = false;
  } else {
    if (empty) empty.hidden = true;

    if (list) {
      list.innerHTML = `
        <table class="cart-table">
          <thead>
            <tr>
              <th>Item</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th>Remove</th>
            </tr>
          </thead>
          <tbody>
          ${cart.map((it, i) => `
            <tr data-id="${it.id}">
              <td class="item">
                ${it.image ? `<img class="thumb" src="${it.image}" alt="">` : ""}
                <span>${it.name}</span>
              </td>
              <td>${it.qty}</td>
              <td>${fmt(it.unitPrice)}</td>
              <td>${fmt(it.unitPrice * it.qty)}</td>
              <td><button class="remove-btn" data-index="${i}">Remove</button></td>
            </tr>
          `).join("")}
          </tbody>
        </table>
      `;
    }
  }

  // 2) Math — REQUIRED ORDER
  // ItemTotal
  const itemTotal = cart.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);

  // Volume discount (based on ItemTotal)
  let volumeRate = 0;
  for (const t of VOLUME_DISCOUNT_TIERS) {
    if (itemTotal >= t.min && itemTotal <= t.max) { volumeRate = t.rate; break; }
  }
  const volumeDiscount = itemTotal * volumeRate;

  // Member discount checkbox; mutually exclusive with volume discount
  const memberChecked = !!document.querySelector("#member-discount")?.checked;
  const memberDiscount = memberChecked ? itemTotal * MEMBER_DISCOUNT_RATE : 0;

  // Only one type may apply:
  const appliedVolume = memberChecked ? 0 : volumeDiscount;
  const appliedMember = memberChecked ? memberDiscount : 0;

  // Shipping added AFTER discounts (flat rate if there are items)
  const shipping = cart.length ? SHIPPING_RATE : 0;

  // SubTotal (Taxable amount)
  const subTotal = Math.max(0, itemTotal - appliedVolume - appliedMember) + shipping;

  // Tax
  const taxAmount = subTotal * TAX_RATE;

  // Invoice Total
  const invoiceTotal = subTotal + taxAmount;

  // 3) Summary block (IDs from assignment)
  const byId = id => document.querySelector(id);
  (byId("#sum-itemtotal")  || {}).textContent  = fmt(itemTotal);
  (byId("#sum-volume")     || {}).textContent  = `−${fmt(appliedVolume)}`;
  (byId("#sum-member")     || {}).textContent  = `−${fmt(appliedMember)}`;
  (byId("#sum-shipping")   || {}).textContent  = fmt(shipping);
  (byId("#sum-subtotal")   || {}).textContent  = fmt(subTotal); // taxable amount
  (byId("#sum-taxrate")    || {}).textContent  = `${(TAX_RATE*100).toFixed(1)}%`;
  (byId("#sum-taxamount")  || {}).textContent  = fmt(taxAmount);
  (byId("#sum-invoice")    || {}).textContent  = fmt(invoiceTotal);

  updateCartCount();

  // 4) Wire actions without extra global functions
  // Remove buttons
  const table = document.querySelector(".cart-table");
  if (table) {
    table.addEventListener("click", (e) => {
      const btn = e.target.closest(".remove-btn");
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      const now = readCart();
      now.splice(idx, 1);
      writeCart(now);
      render();
    }, { once: true }); // re-attach next render
  }

  // Clear Cart
  const clearBtn = document.querySelector("#clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      writeCart([]);
      render();
    }, { once: true });
  }

  // Keep Shopping
  const keepBtn = document.querySelector("#keep-shopping");
  if (keepBtn) {
    keepBtn.addEventListener("click", () => {
      // retain items (do nothing to storage)
      location.href = "shop.html";
    }, { once: true });
  }

  // Member Discount toggle
  const memberChk = document.querySelector("#member-discount");
  if (memberChk) {
    memberChk.addEventListener("change", () => render(), { once: true });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  render();
});







