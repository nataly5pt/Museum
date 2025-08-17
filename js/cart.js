/* cart.js — cart page render with discounts, shipping, tax */
"use strict";

const CART_KEY = "museumCartV1";
const TAX_RATE = 0.102; // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;
const VOLUME_DISCOUNT_TIERS = [
  { min: 0,    max: 49.99, rate: 0.00 },
  { min: 50.0, max: 99.99, rate: 0.05 },
  { min: 100.0,max: 199.99,rate: 0.10 },
  { min: 200.0,max: Infinity, rate: 0.15 }
];
const SHIPPING_RATE = 25.00;

function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateCartCount() {
  const el = document.querySelector("#cart-count, .cart-count");
  if (!el) return;
  const total = readCart().reduce((n, it) => n + it.qty, 0);
  el.textContent = total;
}

function render() {
  const fmt = n => `$${Number(n).toFixed(2)}`;
  const cart = readCart();

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
            <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th>Remove</th></tr>
          </thead>
          <tbody>
            ${cart.map((it,i)=>`
              <tr data-id="${it.id}">
                <td class="item">
                  ${it.image?`<img class="thumb" src="${it.image}" alt="">`:``}
                  <span>${it.name}</span>
                </td>
                <td>${it.qty}</td>
                <td>${fmt(it.unitPrice)}</td>
                <td>${fmt(it.unitPrice * it.qty)}</td>
                <td><button class="remove-btn" data-index="${i}">Remove</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
    }
  }

  // Math (ItemTotal -> discount (one type) -> shipping -> SubTotal -> Tax -> Invoice)
  const itemTotal = cart.reduce((s,it)=>s+it.unitPrice*it.qty,0);
  let volumeRate = 0;
  for (const t of VOLUME_DISCOUNT_TIERS) {
    if (itemTotal >= t.min && itemTotal <= t.max) { volumeRate = t.rate; break; }
  }
  const volumeDiscount = itemTotal * volumeRate;
  const memberChecked = !!document.querySelector("#member-discount")?.checked;
  const memberDiscount = memberChecked ? itemTotal * MEMBER_DISCOUNT_RATE : 0;
  const appliedVolume = memberChecked ? 0 : volumeDiscount;
  const appliedMember = memberChecked ? memberDiscount : 0;
  const shipping = cart.length ? SHIPPING_RATE : 0;
  const subTotal = Math.max(0, itemTotal - appliedVolume - appliedMember) + shipping;
  const taxAmount = subTotal * TAX_RATE;
  const invoiceTotal = subTotal + taxAmount;

  const id = s => document.querySelector(s);
  (id("#sum-itemtotal")  || {}).textContent = fmt(itemTotal);
  (id("#sum-volume")     || {}).textContent = `−${fmt(appliedVolume)}`;
  (id("#sum-member")     || {}).textContent = `−${fmt(appliedMember)}`;
  (id("#sum-shipping")   || {}).textContent = fmt(shipping);
  (id("#sum-subtotal")   || {}).textContent = fmt(subTotal);
  (id("#sum-taxrate")    || {}).textContent = `${(TAX_RATE*100).toFixed(1)}%`;
  (id("#sum-taxamount")  || {}).textContent = fmt(taxAmount);
  (id("#sum-invoice")    || {}).textContent = fmt(invoiceTotal);

  updateCartCount();

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
    }, { once: true });
  }

  const clearBtn = document.querySelector("#clear-cart");
  if (clearBtn) clearBtn.addEventListener("click", () => { writeCart([]); render(); }, { once: true });

  const keepBtn = document.querySelector("#keep-shopping");
  if (keepBtn) keepBtn.addEventListener("click", () => { location.href = "shop.html"; }, { once: true });

  const memberChk = document.querySelector("#member-discount");
  if (memberChk) memberChk.addEventListener("change", () => render(), { once: true });
}

document.addEventListener("DOMContentLoaded", () => { updateCartCount(); render(); });









