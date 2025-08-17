/* ================== Cart math + render ================== */
const CART_KEY = 'museumCartV1';

/* constants */
const TAX_RATE = 0.102;               // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;    // 15%
const SHIPPING_RATE = 25.00;          // flat
const VOLUME_DISCOUNT_TIERS = [
  { min:   0, max:  49.99, rate: 0.00 },
  { min:  50, max:  99.99, rate: 0.05 },
  { min: 100, max: 199.99, rate: 0.10 },
  { min: 200, max:   Infinity, rate: 0.15 },
];

/* storage helpers */
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function updateHeaderCount() {
  const n = readCart().reduce((sum, it) => sum + (it.qty || 0), 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = n;
}

/* formatting */
function fmt(n) {
  const val = Number(n || 0);
  const s = `$${Math.abs(val).toFixed(2)}`;
  return val < 0 ? `(${s})` : s;
}

/* helper to compute volume rate */
function volumeRate(itemTotal) {
  for (const t of VOLUME_DISCOUNT_TIERS) {
    if (itemTotal >= t.min && itemTotal <= t.max) return t.rate;
  }
  return 0;
}

/* =============== STUDENT WORK STARTS (render) =============== */
function render() {
  const host = document.getElementById('cart-view');
  if (!host) return;

  let cart = readCart().filter(it => (it.qty || 0) > 0 && (it.unitPrice || 0) > 0);
  writeCart(cart); // cleanup any zero/invalid items

  // 1) Item total = sum(unitPrice * qty)
  const itemTotal = cart.reduce((s, it) => s + it.unitPrice * it.qty, 0);

  // Header UI bits (member checkbox value saved in dataset for re-renders)
  const memberChecked = host.dataset.member === '1';

  // 2) Choose exactly ONE discount
  const volRate = volumeRate(itemTotal);
  const volumeDiscount = itemTotal * volRate;
  const memberDiscount = memberChecked ? itemTotal * MEMBER_DISCOUNT_RATE : 0;

  // Mutually exclusive: if memberChecked then apply member and ignore volume
  const discountUsed = memberChecked ? memberDiscount : volumeDiscount;

  // 4) Shipping flat fee AFTER discounts (only when cart not empty)
  const shipping = cart.length ? SHIPPING_RATE : 0;

  // 5) SubTotal / taxable amount
  const subTotal = itemTotal - discountUsed + shipping;

  // 7) Tax Amount
  const tax = subTotal * TAX_RATE;

  // 8) Invoice Total
  const invoice = subTotal + tax;

  // Build line items (table-like list)
  const lines = cart.map((it, i) => {
    const line = it.unitPrice * it.qty;
    return `
      <div class="row cart-line">
        <div class="cell item">
          <img class="thumb" src="${it.image}" alt="" />
          <div class="meta">
            <strong>${it.name}</strong>
            <div class="muted">Qty: ${it.qty}</div>
          </div>
        </div>
        <div class="cell unit money">${fmt(it.unitPrice)}</div>
        <div class="cell qty">${it.qty}</div>
        <div class="cell money">${fmt(line)}</div>
        <div class="cell action">
          <button class="btn -ghost" data-remove="${i}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  // Empty message
  const emptyMsg = cart.length ? '' : `<p>Your cart is empty.</p>`;

  host.innerHTML = `
    ${emptyMsg}
    ${cart.length ? `
    <div class="cart-table">
      <div class="row head">
        <div class="cell">Item</div>
        <div class="cell">Unit Price</div>
        <div class="cell">Qty</div>
        <div class="cell">Line Total</div>
        <div class="cell">Remove</div>
      </div>
      ${lines}
    </div>
    ` : ''}

    <div class="summary">
      <div class="row"><div>Subtotal of ItemTotals</div><div class="money">${fmt(itemTotal)}</div></div>
      <div class="row"><div>Volume Discount</div><div class="money">${fmt(-volumeDiscount)}</div></div>
      <div class="row"><div>Member Discount</div><div class="money">${fmt(-memberDiscount)}</div></div>
      <div class="row"><div>Shipping</div><div class="money">${fmt(shipping)}</div></div>
      <div class="row"><div>Subtotal (Taxable amount)</div><div class="money">${fmt(subTotal)}</div></div>
      <div class="row"><div>Tax Rate %</div><div class="money">${(TAX_RATE*100).toFixed(1)}%</div></div>
      <div class="row"><div>Tax Amount $</div><div class="money">${fmt(tax)}</div></div>
      <div class="row total"><div>Invoice Total</div><div class="money">${fmt(invoice)}</div></div>

      <label class="member-toggle">
        <input id="memberCheck" type="checkbox" ${memberChecked ? 'checked' : ''} />
        Member (15% off)
      </label>

      <div class="actions">
        <a class="btn" href="/Museum/html/shop.html">Keep Shopping</a>
        <button id="clearCartBtn" class="btn -ghost">Clear Cart</button>
      </div>
    </div>
  `;

  // wire up events
  host.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.remove);
      let c = readCart();
      c.splice(idx, 1);
      writeCart(c);
      updateHeaderCount();
      render();
    });
  });

  const clearBtn = host.querySelector('#clearCartBtn');
  clearBtn?.addEventListener('click', () => {
    writeCart([]);
    updateHeaderCount();
    render();
  });

  const m = host.querySelector('#memberCheck');
  m?.addEventListener('change', () => {
    host.dataset.member = m.checked ? '1' : '0';
    render(); // recompute with chosen discount
  });

  updateHeaderCount();
}
/* =============== STUDENT WORK ENDS =============== */

document.addEventListener('DOMContentLoaded', render);








