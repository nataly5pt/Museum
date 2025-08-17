/* =========================
   Cart – single render() pass
   ========================= */
const CART_KEY = 'museumCartV1';

let cart = [];                  // [{id,name,unitPrice,qty,image}]
let member = false;             // member checkbox state
let discountPref = null;        // 'member' or 'volume' if both could apply

// ---------- Constants (UPPER_SNAKE_CASE)
const TAX_RATE = 0.102;               // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;
const SHIPPING_RATE = 25.00;
// Volume tiers: upper bound (inclusive), rate
const VOLUME_DISCOUNT_TIERS = [
  { max: 49.99, rate: 0.00 },
  { max: 99.99, rate: 0.05 },
  { max: 199.99, rate: 0.10 },
  { max: Infinity, rate: 0.15 }
];

// Load persisted state
try {
  const raw = localStorage.getItem(CART_KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    cart = saved.cart || [];
    member = !!saved.member;
    discountPref = saved.discountPref ?? null;
  }
} catch(e){ /* ignore parse issues */ }

// Money format (parentheses for negatives)
function fmt(x){
  const sign = x < 0 ? -1 : 1;
  const v = Math.abs(x);
  const s = `$${v.toFixed(2)}`;
  return sign < 0 ? `(${s})` : s;
}

// Save
function persist(){
  localStorage.setItem(CART_KEY, JSON.stringify({ cart, member, discountPref }));
}

// Single box: compute & paint UI
function render(){
  const root = document.getElementById('cart-root');
  if(!root) return;

  // 1) Items subtotal (unrounded sum, round for display only)
  let itemTotal = 0;
  cart.forEach(it => { itemTotal += (it.unitPrice * it.qty); });

  // 2) Determine volume discount rate by tiers
  let volumeRate = 0;
  for (const t of VOLUME_DISCOUNT_TIERS){
    if (itemTotal <= t.max){ volumeRate = t.rate; break; }
  }

  // 3) Member vs Volume (mutually exclusive)
  let volumeDiscount = 0;
  let memberDiscount = 0;

  const volumeAvail = volumeRate > 0;
  const memberAvail = member;

  if (memberAvail && volumeAvail){
    // Require an explicit choice (remember preference)
    if (!discountPref){
      const ok = window.confirm(
        `Both discounts could apply.\n\nOK = Use MEMBER 15%\nCancel = Use VOLUME ${(volumeRate*100).toFixed(0)}%`
      );
      discountPref = ok ? 'member' : 'volume';
      persist();
    }
  }

  if (memberAvail && (!volumeAvail || discountPref === 'member')){
    memberDiscount = itemTotal * MEMBER_DISCOUNT_RATE;
  } else if (volumeAvail){
    memberDiscount = 0;
    volumeDiscount = itemTotal * volumeRate;
  }

  // 4) Shipping (flat after discounts)
  const discountTotal = volumeDiscount + memberDiscount;
  const taxableBase = Math.max(0, itemTotal - discountTotal) + (cart.length ? SHIPPING_RATE : 0);

  // 5) Tax + Invoice
  const taxAmount = taxableBase * TAX_RATE;
  const invoiceTotal = taxableBase + taxAmount;

  // ---- Build HTML
  const empty = cart.length === 0;
  let itemsHtml = '';

  if (empty){
    itemsHtml = `
      <p class="meta">Your cart is empty.</p>
    `;
  } else {
    itemsHtml = `
      <div class="cart-items">
        ${cart.map((it, idx) => `
          <div class="cart-item" data-index="${idx}">
            <img src="${it.image}" alt="">
            <div>
              <div class="name">${it.name}</div>
              <div class="meta">Qty ${it.qty} × ${fmt(it.unitPrice)}</div>
            </div>
            <button class="remove-btn" data-remove="${idx}">Remove</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  const summaryHtml = `
    <div class="cart-summary">
      <div class="summary-row"><div class="label">Subtotal of ItemTotals</div><div class="amt">${fmt(itemTotal)}</div></div>
      <div class="summary-row"><div class="label">Volume Discount</div><div class="amt">${fmt(-volumeDiscount)}</div></div>
      <div class="summary-row"><div class="label">Member Discount</div><div class="amt">${fmt(-memberDiscount)}</div></div>
      <div class="summary-row"><div class="label">Shipping</div><div class="amt">${cart.length ? fmt(SHIPPING_RATE) : fmt(0)}</div></div>
      <div class="summary-row"><div class="label">Subtotal (Taxable amount)</div><div class="amt">${fmt(taxableBase)}</div></div>
      <div class="summary-row"><div class="label">Tax Rate %</div><div class="amt">${(TAX_RATE*100).toFixed(1)}%</div></div>
      <div class="summary-row"><div class="label">Tax Amount $</div><div class="amt">${fmt(taxAmount)}</div></div>
      <div class="summary-row"><div class="label"><strong>Invoice Total</strong></div><div class="amt"><strong>${fmt(invoiceTotal)}</strong></div></div>
    </div>
  `;

  const controlsHtml = `
    <div class="member-toggle">
      <label><input id="memberBox" type="checkbox" ${member ? 'checked':''}> Member (15% off)</label>
    </div>
    <div class="cart-controls">
      <button class="cart-btn" id="keepShoppingBtn">Keep Shopping</button>
      <button class="cart-btn" id="clearBtn">Clear Cart</button>
    </div>
  `;

  root.innerHTML = itemsHtml + summaryHtml + controlsHtml;

  // --- Events (re-render after each)
  const keep = document.getElementById('keepShoppingBtn');
  if (keep) keep.onclick = () => { location.href = '/Museum/html/shop.html'; };

  const clear = document.getElementById('clearBtn');
  if (clear) clear.onclick = () => { cart = []; persist(); render(); };

  const mb = document.getElementById('memberBox');
  if (mb) mb.onchange = () => { member = mb.checked; discountPref = null; persist(); render(); };

  root.querySelectorAll('[data-remove]').forEach(btn => {
    btn.onclick = (e) => {
      const idx = +e.currentTarget.getAttribute('data-remove');
      cart.splice(idx,1);
      persist(); render();
    };
  });
}

// kick off
document.addEventListener('DOMContentLoaded', render);


