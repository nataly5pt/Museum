/* Cart math + view
   Requirement: expose ONE function `render()` that outputs the entire cart.
*/
const CART_KEY = 'museumCartV1';
const MEMBER_KEY = 'museumCartMember';

/* ===== Constants (UPPER_SNAKE_CASE) ===== */
const TAX_RATE = 0.102;          // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;
const VOLUME_DISCOUNT_TIERS = [
  { min: 200,   rate: 0.15 },
  { min: 100,   rate: 0.10 },
  { min: 50,    rate: 0.05 },
  { min: 0,     rate: 0.00 }
];
const SHIPPING_RATE = 25.00;

function render(){
  /* helpers (inline, not exported) */
  const moneyFmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2 });
  const fmt = n => moneyFmt.format(Math.round((n + Number.EPSILON) * 100)/100);

  /* read state */
  let items;
  try { items = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { items = []; }
  const isMember = !!localStorage.getItem(MEMBER_KEY);

  /* compute item totals first (unrounded math) */
  let itemTotal = 0;
  items.forEach(it => { itemTotal += (it.unitPrice * it.qty); });

  /* discounts (mutually exclusive) */
  let memberDiscount = 0, volumeDiscount = 0, discountLabel = '';
  if(isMember){
    memberDiscount = itemTotal * MEMBER_DISCOUNT_RATE;
    discountLabel = `Member Discount (${(MEMBER_DISCOUNT_RATE*100).toFixed(0)}%)`;
  }else{
    const tier = VOLUME_DISCOUNT_TIERS.find(t => itemTotal >= t.min);
    const rate = tier ? tier.rate : 0;
    volumeDiscount = itemTotal * rate;
    discountLabel = `Volume Discount (${(rate*100).toFixed(0)}%)`;
  }
  const discounts = isMember ? memberDiscount : volumeDiscount;

  /* shipping flat after discounts; zero if cart empty */
  const shipping = items.length ? SHIPPING_RATE : 0;

  /* derived */
  const subTotal = itemTotal - discounts + shipping;         // taxable amount
  const taxAmount = subTotal * TAX_RATE;
  const invoiceTotal = subTotal + taxAmount;

  /* view fragments */
  const lineRows = items.map((it, idx) => {
    const line = it.unitPrice * it.qty;
    return `
      <tr class="line">
        <td class="thumb"><img src="${it.img}" alt=""></td>
        <td class="name">
          <div class="title">${it.name}</div>
          <button class="link danger" onclick="
            (function(){
              const k='${CART_KEY}';
              const a=JSON.parse(localStorage.getItem(k)||'[]');
              a.splice(${idx},1);
              localStorage.setItem(k, JSON.stringify(a));
              render();
            })(); return false;">Remove from Cart</button>
        </td>
        <td class="unit price">${fmt(it.unitPrice)}</td>
        <td class="qty">x ${it.qty}</td>
        <td class="amount">${fmt(line)}</td>
      </tr>`;
  }).join('');

  const summary = `
    <div class="summary">
      <table class="summary-table" aria-label="Cart summary">
        <tbody>
          <tr><th>Subtotal of ItemTotals</th><td class="num">${fmt(itemTotal)}</td></tr>
          <tr><th>Volume Discount</th><td class="num">${fmt(volumeDiscount)}</td></tr>
          <tr><th>Member Discount</th><td class="num">${fmt(memberDiscount)}</td></tr>
          <tr><th>Shipping</th><td class="num">${fmt(shipping)}</td></tr>
          <tr class="sep"><th>Subtotal (Taxable amount)</th><td class="num">${fmt(subTotal)}</td></tr>
          <tr><th>Tax Rate %</th><td class="num">${(TAX_RATE*100).toFixed(1)}%</td></tr>
          <tr><th>Tax Amount $</th><td class="num">${fmt(taxAmount)}</td></tr>
          <tr class="total"><th>Invoice Total</th><td class="num">${fmt(invoiceTotal)}</td></tr>
        </tbody>
      </table>
    </div>`;

  /* empty view */
  if(items.length === 0){
    document.getElementById('cartApp').innerHTML = `
      <div class="cart-empty card">
        <p>Your cart is empty.</p>
        <div class="cart-actions">
          <button class="btn" onclick="location.href='/Museum/html/shop.html'">Keep Shopping</button>
        </div>
        ${summary}
      </div>`;
    return;
  }

  /* full view */
  document.getElementById('cartApp').innerHTML = `
    <div class="card cart-card">
      <div class="controls">
        <label class="check">
          <input type="checkbox" ${isMember ? 'checked':''}
                 onchange="localStorage.setItem('${MEMBER_KEY}', this.checked ? '1' : ''); render();">
          Apply Member Discount (${(MEMBER_DISCOUNT_RATE*100).toFixed(0)}%) — volume discount will be disabled.
        </label>
        <div class="spacer"></div>
        <button class="btn danger ghost" onclick="localStorage.setItem('${CART_KEY}','[]'); render();">Clear Cart</button>
        <button class="btn" onclick="location.href='/Museum/html/shop.html'">Keep Shopping</button>
      </div>

      <div class="note">${discountLabel} applies. Shipping is a flat fee added after discounts.</div>

      <div class="table-wrap">
        <table class="cart-table">
          <thead>
            <tr><th>Item</th><th class="sr-only">Name</th><th class="right">Unit</th><th>Qty</th><th class="right">Amount</th></tr>
          </thead>
          <tbody>
            ${lineRows}
          </tbody>
        </table>
      </div>

      ${summary}
    </div>`;
}
