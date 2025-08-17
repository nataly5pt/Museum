/* ===== Cart page (single render pass) ================================= */
(function () {
  "use strict";

  // ---- Constants / Globals (declared up top as required) ----
  const CART_KEY = "museumCartV1";
  const MEMBER_FLAG_KEY = "museumMemberFlag";
  const DISCOUNT_CHOICE_KEY = "museumDiscountChoice"; // "member" | "volume" | ""
  const TAX_RATE = 0.102;               // 10.2%
  const MEMBER_DISCOUNT_RATE = 0.15;    // 15%
  const SHIPPING_RATE = 25.0;

  // [threshold, rate]
  const VOLUME_DISCOUNT_TIERS = [
    [0, 0.00],
    [50, 0.05],
    [100, 0.10],
    [200, 0.15]
  ];

  let cart = [];
  let isMember = false;
  let discountChoice = ""; // "", "member", "volume"

  // ---- Storage helpers ----
  function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(next) {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }
  function readMemberFlag() {
    return localStorage.getItem(MEMBER_FLAG_KEY) === "1";
  }
  function saveMemberFlag(flag) {
    localStorage.setItem(MEMBER_FLAG_KEY, flag ? "1" : "0");
  }
  function readChoice() {
    return localStorage.getItem(DISCOUNT_CHOICE_KEY) || "";
  }
  function saveChoice(v) {
    localStorage.setItem(DISCOUNT_CHOICE_KEY, v || "");
  }

  // ---- Utility ----
  function fmt(n) {
    // currency with parentheses for negatives
    const s = Math.abs(n).toFixed(2);
    return (n < 0 ? `($${s})` : `$${s}`);
  }
  function volumeRate(total) {
    let rate = 0;
    for (const [th, r] of VOLUME_DISCOUNT_TIERS) {
      if (total >= th) rate = r;
    }
    return rate;
  }

  // ---- Single render function ----
  function render() {
    const root = document.getElementById("cartRoot");
    if (!root) return;

    // 1) Load state
    cart = readCart();
    isMember = readMemberFlag();
    discountChoice = readChoice();

    // 2) Math
    const itemTotal = cart.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);

    const volRate = volumeRate(itemTotal);
    let useMember = false;
    let useVolume = false;

    if (itemTotal > 0) {
      if (isMember && volRate > 0) {
        // both possible: honor previous choice or ask once
        if (!discountChoice) {
          const ok = window.confirm(
            "Both discounts are available.\n\nClick OK to use MEMBER 15%.\nClick Cancel to use VOLUME tier."
          );
          discountChoice = ok ? "member" : "volume";
          saveChoice(discountChoice);
        }
        useMember = discountChoice === "member";
        useVolume = discountChoice === "volume";
      } else if (isMember) {
        useMember = true;
        saveChoice("member");
      } else {
        useVolume = true;
        saveChoice("volume");
      }
    } else {
      saveChoice("");
    }

    const memberDiscount = useMember ? itemTotal * MEMBER_DISCOUNT_RATE : 0;
    const volumeDiscount = useVolume ? itemTotal * volRate : 0;
    const discounts = memberDiscount + volumeDiscount;

    const shipping = itemTotal > 0 ? SHIPPING_RATE : 0;
    const taxable = itemTotal - discounts + shipping;
    const taxAmount = taxable * TAX_RATE;
    const invoiceTotal = taxable + taxAmount;

    // 3) View
    const emptyMsg = cart.length === 0
      ? `<p>Your cart is empty.</p>`
      : "";

    const lines = cart.map((it, idx) => {
      const line = it.unitPrice * it.qty;
      return `
        <div class="cart-row">
          <div class="cart-left">
            <img class="thumb" src="${it.image}" alt="${it.name}">
            <div>
              <div class="strong">${it.name}</div>
              <div class="muted">$${it.unitPrice.toFixed(2)} × ${it.qty}</div>
            </div>
          </div>
          <div class="cart-right">
            <div class="amount">${fmt(line)}</div>
            <button class="btn btn-outline danger remove-btn" data-index="${idx}">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join("");

    root.innerHTML = `
      ${emptyMsg}
      ${lines ? `<div class="cart-list">${lines}</div>` : ""}

      <dl class="summary">
        <div><dt>Subtotal of ItemTotals</dt><dd class="amount">${fmt(itemTotal)}</dd></div>
        <div><dt>Volume Discount</dt><dd class="amount">${fmt(-volumeDiscount)}</dd></div>
        <div><dt>Member Discount</dt><dd class="amount">${fmt(-memberDiscount)}</dd></div>
        <div><dt>Shipping</dt><dd class="amount">${fmt(shipping)}</dd></div>
        <div><dt>Subtotal (Taxable amount)</dt><dd class="amount">${fmt(taxable)}</dd></div>
        <div><dt>Tax Rate %</dt><dd class="amount">${(TAX_RATE*100).toFixed(1)}%</dd></div>
        <div><dt>Tax Amount $</dt><dd class="amount">${fmt(taxAmount)}</dd></div>
        <div class="total"><dt>Invoice Total</dt><dd class="amount">${fmt(invoiceTotal)}</dd></div>
      </dl>

      <div class="cart-controls">
        <label class="switch">
          <input id="memberChk" type="checkbox" ${isMember ? "checked" : ""} />
          <span>Member (15% off)</span>
        </label>
        <div class="spacer"></div>
        <button id="keepBtn" class="btn">Keep Shopping</button>
        <button id="clearBtn" class="btn btn-outline">Clear Cart</button>
      </div>
    `;

    // 4) Wire-up controls AFTER render
    root.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = +btn.getAttribute("data-index");
        cart.splice(i, 1);
        saveCart(cart);
        render();
      });
    });

    const clearBtn = document.getElementById("clearBtn");
    if (clearBtn) clearBtn.addEventListener("click", () => {
      saveCart([]);
      render();
    });

    const keepBtn = document.getElementById("keepBtn");
    if (keepBtn) keepBtn.addEventListener("click", () => {
      location.href = "/Museum/html/shop.html";
    });

    const memberChk = document.getElementById("memberChk");
    if (memberChk) memberChk.addEventListener("change", (e) => {
      saveMemberFlag(e.target.checked);
      // reset choice when toggling membership to allow a new decision
      saveChoice("");
      render();
    });
  }

  // ---- Init ----
  document.addEventListener("DOMContentLoaded", render);
})();





