/* /js/cart.js
   Renders the cart, discounts, tax, remove/clear, and summary.
*/
(function () {
  "use strict";

  // Shared key (same one used by shop.js)
  if (!window.MUSEUM_CART_KEY) window.MUSEUM_CART_KEY = "museumCartV1";
  const KEY = window.MUSEUM_CART_KEY;

  // ---- Constants ----
  const TAX_RATE = 0.102; // 10.20%
  const MEMBER_RATE = 0.15;
  const VOLUME_TIERS = [
    { min: 0,     max: 49.99,  rate: 0.00 },
    { min: 50,    max: 99.99,  rate: 0.05 },
    { min: 100,   max: 199.99, rate: 0.10 },
    { min: 200,   max: Infinity, rate: 0.15 },
  ];
  const SHIPPING_RATE = 25.00;

  // ---- Storage helpers ----
  function readCart() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function writeCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateHeaderCount(cart);
  }

  // ---- Currency formatting (negative -> parentheses) ----
  function money(n) {
    const sign = n < 0 ? -1 : 1;
    const v = Math.round(Math.abs(n) * 100) / 100;
    const s = `$${v.toFixed(2)}`;
    return sign < 0 ? `(${s})` : s;
  }

  // Header "Cart N" count
  function updateHeaderCount(cart = readCart()) {
    const count = cart.reduce((acc, it) => acc + (it.qty || 0), 0);
    const el =
      document.querySelector("#navCartCount") ||
      document.querySelector("#cart-count") ||
      document.querySelector(".cart-count");
    if (el) el.textContent = String(count);
  }

  // Which discount choice the user made if both could apply
  const CHOICE_KEY = "museumCartChoice"; // session only
  function setChoice(v) { sessionStorage.setItem(CHOICE_KEY, v); }
  function getChoice() { return sessionStorage.getItem(CHOICE_KEY) || ""; }
  function clearChoice() { sessionStorage.removeItem(CHOICE_KEY); }

  // ---- Render ----
  function render() {
    const cart = readCart();

    const rowsEl = document.getElementById("cartRows");
    const emptyEl = document.getElementById("emptyState");
    const memberCheck = document.getElementById("memberCheck");

    // images/lines
    rowsEl.innerHTML = "";
    if (!cart.length) {
      emptyEl.style.display = "";
    } else {
      emptyEl.style.display = "none";
    }

    // Build rows
    for (const item of cart) {
      if (!item || !item.qty || item.unitPrice === 0) continue;

      const tr = document.createElement("tr");

      const tdImg = document.createElement("td");
      tdImg.className = "thumb";
      tdImg.innerHTML = item.image
        ? `<img src="${item.image}" alt="" />`
        : "";
      tr.appendChild(tdImg);

      const tdName = document.createElement("td");
      tdName.textContent = item.name || "";
      tr.appendChild(tdName);

      const tdQty = document.createElement("td");
      tdQty.className = "center";
      tdQty.textContent = item.qty;
      tr.appendChild(tdQty);

      const tdUnit = document.createElement("td");
      tdUnit.className = "amount";
      tdUnit.textContent = money(item.unitPrice);
      tr.appendChild(tdUnit);

      const tdLine = document.createElement("td");
      tdLine.className = "amount";
      tdLine.textContent = money(item.qty * item.unitPrice);
      tr.appendChild(tdLine);

      const tdRem = document.createElement("td");
      tdRem.className = "center";
      const btn = document.createElement("button");
      btn.className = "btn danger small";
      btn.textContent = "Remove";
      btn.addEventListener("click", () => {
        const idx = cart.findIndex(x => String(x.id) === String(item.id));
        if (idx >= 0) {
          cart.splice(idx, 1);
          writeCart(cart);
          render();
        }
      });
      tdRem.appendChild(btn);
      tr.appendChild(tdRem);

      rowsEl.appendChild(tr);
    }

    // ---- Math ----
    const itemTotal = cart.reduce((s, it) => s + (it.unitPrice * it.qty), 0);

    // volume tier
    let volRate = 0;
    for (const t of VOLUME_TIERS) {
      if (itemTotal >= t.min && itemTotal <= t.max) { volRate = t.rate; break; }
    }
    const volDisc = itemTotal * volRate; // positive number (we subtract later)

    const memberWants = !!memberCheck.checked;
    let use = ""; // 'member' | 'volume' | ''
    let memberDisc = 0;
    let volumeDiscUsed = 0;

    if (memberWants && volRate > 0) {
      // Prompt once which discount to use
      use = getChoice();
      if (!use) {
        const msg =
          `Both discounts are available.\n\n` +
          `OK = Use Member (15%)\n` +
          `Cancel = Use Volume (${(volRate * 100).toFixed(0)}%)`;
        const ok = window.confirm(msg);
        use = ok ? "member" : "volume";
        setChoice(use);
      }
    } else {
      // Only one applies
      use = memberWants ? "member" : "volume";
      clearChoice();
    }

    if (use === "member") memberDisc = itemTotal * MEMBER_RATE;
    else if (use === "volume") volumeDiscUsed = volDisc;

    const anyDiscount = memberDisc + volumeDiscUsed; // positive sum
    const shipping = itemTotal > 0 ? SHIPPING_RATE : 0;

    const taxable = itemTotal - anyDiscount + shipping;
    const tax = taxable * TAX_RATE;
    const invoice = taxable + tax;

    // ---- Summary outputs ----
    document.getElementById("sumItemTotal").textContent = money(itemTotal);
    document.getElementById("sumVolDisc").textContent = anyDiscount && use === "volume" ? `(${money(volumeDiscUsed)})` : "$0.00";
    document.getElementById("sumMemDisc").textContent = anyDiscount && use === "member" ? `(${money(memberDisc)})` : "$0.00";
    document.getElementById("sumShip").textContent = money(shipping);
    document.getElementById("sumTaxable").textContent = money(taxable);
    document.getElementById("sumTaxRate").textContent = (TAX_RATE * 100).toFixed(2) + "%";
    document.getElementById("sumTax").textContent = money(tax);
    document.getElementById("sumTotal").textContent = money(invoice);

    const noteEl = document.getElementById("whichDiscountNote");
    if (itemTotal === 0) {
      noteEl.textContent = "";
    } else if (use === "member") {
      noteEl.textContent = "Member discount applied. (Volume tiers suppressed.)";
    } else if (use === "volume" && volRate > 0) {
      noteEl.textContent = `Volume discount applied at ${(volRate * 100).toFixed(0)}%.`;
    } else {
      noteEl.textContent = "No discount applied.";
    }
  }

  // ---- events ----
  document.addEventListener("DOMContentLoaded", () => {
    updateHeaderCount();

    document.getElementById("memberCheck").addEventListener("change", () => {
      render();
    });

    document.getElementById("clearBtn").addEventListener("click", () => {
      if (confirm("Clear your cart?")) {
        localStorage.setItem(KEY, JSON.stringify([]));
        clearChoice();
        render();
      }
    });

    render();
  });
})();










