// /Museum/js/card.js

export const formatMoney = (n) =>
  `$${Number(n).toFixed(2)}`;

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.substring(2).toLowerCase(), v);
    } else if (k === "dataset") {
      Object.assign(node.dataset, v);
    } else {
      node.setAttribute(k, v);
    }
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) node.append(c);
  return node;
}

/**
 * Build a single product card. Returns an <article>.
 * @param {Object} p - {id,name,price,desc,image,alt}
 * @param {Object} opts
 * @param {Function} opts.onAdd - click handler
 * @param {number} opts.qty - current qty for this id
 */
export function renderProductCard(p, { onAdd, qty = 0 } = {}) {
  const img = el("img", {
    src: p.image,
    alt: p.alt || p.name,
    loading: "lazy"
  });

  const figure = el("figure", { class: "media-frame" }, img);

  const title = el("h3", {}, p.name);
  const desc = el("p", { class: "desc" }, p.desc || "");
  const price = el("div", { class: "price" }, formatMoney(p.price));

  const addBtn = el(
    "button",
    { class: "btn add", type: "button" },
    `Add ${p.short || "to Cart"}`
  );

  // badge shows Qty in cart for this item
  const badge = el(
    "span",
    {
      class: "qty-badge",
      "aria-live": "polite",
      id: `badge-${p.id}`,
    },
    qty > 0 ? `Qty: ${qty}` : ""
  );
  if (qty <= 0) badge.hidden = true;

  if (typeof onAdd === "function") {
    addBtn.addEventListener("click", () => onAdd(p.id));
  }

  const meta = el("div", { class: "meta" }, [price, addBtn, badge]);
  const content = el("div", { class: "content" }, [title, desc, meta]);

  const card = el("article", {
    class: "souvenir-item card",
    dataset: { id: p.id }
  }, [figure, content]);

  return card;
}
<script>
/* ======================= Cart Core (card.js) ======================= */
/* Paths assume your site root is /Museum/ on GitHub Pages */

(function () {
  "use strict";

  // ---- Constants (UPPER_SNAKE_CASE) ----
  const CART_KEY = "museumCartV1";
  const TAX_RATE = 0.102;                 // 10.2%
  const MEMBER_DISCOUNT_RATE = 0.15;      // 15%
  const VOLUME_DISCOUNT_TIERS = [
    { min: 200, rate: 0.15 },
    { min: 100, rate: 0.10 },
    { min: 50,  rate: 0.05 },
    { min: 0,   rate: 0.00 }
  ];
  const SHIPPING_RATE = 25.00;

  // ---- Utils ----
  const toMoney = (n) =>
    (n < 0 ? "(" : "") +
    "$" + Math.abs(n).toFixed(2) +
    (n < 0 ? ")" : "");

  function readCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(x => x && typeof x.id === "string");
    } catch (e) {
      return [];
    }
  }
  function writeCart(arr) {
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
  }
  function clearCart() { writeCart([]); }

  function addToCart(item) {
    // item: {id, name, unitPrice, image}
    const cart = readCart();
    const idx = cart.findIndex(x => x.id === item.id);
    if (idx >= 0) {
      cart[idx].qty += 1;
    } else {
      cart.push({ id: item.id, name: item.name, unitPrice: +item.unitPrice, qty: 1, image: item.image });
    }
    writeCart(cart);
    return cart;
  }
  function removeItem(id) {
    const cart = readCart().filter(x => x.id !== id);
    writeCart(cart);
    return cart;
  }
  function qtyFor(id) {
    const found = readCart().find(x => x.id === id);
    return found ? found.qty : 0;
  }
  function cartCount() {
    return readCart().reduce((s, x) => s + x.qty, 0);
  }

  function computeTotals({ member = false } = {}) {
    const cart = readCart();
    // ItemTotal (unrounded)
    const itemTotal = cart.reduce((s, x) => s + x.unitPrice * x.qty, 0);

    // Volume discount rate by tier
    let volumeRate = 0;
    for (const t of VOLUME_DISCOUNT_TIERS) {
      if (itemTotal >= t.min) { volumeRate = t.rate; break; }
    }

    // Mutually exclusive discounts
    let volumeDiscount = 0, memberDiscount = 0, chosen = "none";
    if (member && volumeRate > 0) {
      // pick the larger (requirement “only one is allowed”)
      const vAmt = itemTotal * volumeRate;
      const mAmt = itemTotal * MEMBER_DISCOUNT_RATE;
      if (vAmt >= mAmt) {
        volumeDiscount = vAmt; chosen = "volume";
      } else {
        memberDiscount = mAmt; chosen = "member";
      }
    } else if (member) {
      memberDiscount = itemTotal * MEMBER_DISCOUNT_RATE; chosen = "member";
    } else {
      volumeDiscount = itemTotal * volumeRate; chosen = "volume";
    }

    const discounts = volumeDiscount + memberDiscount;
    const subTotal = itemTotal - discounts + (itemTotal > 0 ? SHIPPING_RATE : 0);
    const taxAmount = subTotal * TAX_RATE;
    const invoiceTotal = subTotal + taxAmount;

    return {
      cart, itemTotal, volumeRate, volumeDiscount, memberDiscount,
      subTotal, taxAmount, invoiceTotal,
      shipping: (itemTotal > 0 ? SHIPPING_RATE : 0),
      chosenDiscount: chosen,
      fmt: toMoney,
      TAX_RATE, MEMBER_DISCOUNT_RATE
    };
  }

  // Expose to window
  window.MuseumCart = {
    // constants
    TAX_RATE, MEMBER_DISCOUNT_RATE, VOLUME_DISCOUNT_TIERS, SHIPPING_RATE,
    // primitives
    readCart, writeCart, clearCart, addToCart, removeItem, qtyFor, cartCount,
    // totals
    computeTotals,
    // util
    toMoney
  };
})();
</script>




