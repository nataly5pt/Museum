/* ==========================================================================
   Cart logic – one named function: render()
   - Meets requirements for math, order of ops, formatting, UX.
   - Persists to localStorage across pages.
   ========================================================================== */

/*** Constants (UPPER_SNAKE_CASE) ***/
const CART_KEY = "museumCartV1";
const MEMBER_KEY = "museumMember";
const MODE_KEY = "museumDiscountMode"; // 'member' | 'volume' | ''

const TAX_RATE = 0.102;                // 10.2%
const MEMBER_DISCOUNT_RATE = 0.15;     // 15%
const SHIPPING_RATE = 25.00;

const VOLUME_DISCOUNT_TIERS = [
  { max: 49.99, rate: 0.00 },
  { max: 99.99, rate: 0.05 },
  { max: 199.99, rate: 0.10 },
  { max: Infinity, rate: 0.15 }
];

/*** State ***/
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { cart = []; }
let isMember = localStorage.getItem(MEMBER_KEY) === "true";
let DISCOUNT_MODE = localStorage.getItem(MODE_KEY) || ""; // '', 'member', 'volume'

/*** DOM refs ***/
const mount = document.getElementById("cartMount");
const memberCheck = document.getElementById("memberCheck");
const live = document.getElementById("cartLive");
if (memberCheck) memberCheck.checked = isMember;

/*** Formatter (use formatter object, not a helper function) ***/
const moneyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

/*** Main render box (single named function per the assignment) ***/
function render() {
  // 1) Normalize cart (drop zero price or zero qty items)
  cart = Array.isArray(cart) ? cart.filter(it => it && it.unitPrice > 0 && it.qty > 0) : [];

  // 2) Compute ItemTotal across cart (unrounded)
  let itemTotal = 0;
  for (let i = 0; i < cart.length; i++) {
    const it = cart[i];
    itemTotal += (it.unitPrice * it.qty);
  }

  // 3) Volume rate from tiers
  let volumeRate = 0;
  for (let i = 0; i < VOLUME_DISCOUNT_TIERS.length; i++) {
    if (itemTotal <= VOLUME_DISCOUNT_TIERS[i].max) {
      volumeRate = VOLUME_DISCOUNT_TIERS[i].rate;
      break;
    }
  }

  // 4) Member desired?
  const memberRateWanted = isMember ? MEMBER_DISCOUNT_RATE : 0;

  // 5) Mutually exclusive discounts (prompt user only when both are available)
  let appliedMemberRate = 0;
  let appliedVolumeRate = 0;

  if (memberRateWanted > 0 && volumeRate > 0) {
    if (!DISCOUNT_MODE) {
      const useMember = window.confirm(
        `Both discounts are available.\n\nOK = Apply Member (15%)\nCancel = Apply Volume (${(volumeRate*100).toFixed(0)}%)`
      );
      DISCOUNT_MODE = useMember ? "member" : "volume";
      localStorage.setItem(MODE_KEY, DISCOUNT_MODE);
    }
    if (DISCOUNT_MODE === "member") {
      appliedMemberRate = MEMBER_DISCOUNT_RATE;
      appliedVolumeRate = 0;
    } else {
      appliedMemberRate = 0;
      appliedVolumeRate = volumeRate;
    }
  } else {
    // Only one possible
    appliedMemberRate = memberRateWanted;
    appliedVolumeRate = memberRateWanted > 0 ? 0 : volumeRate;
    // if none available, DISCOUNT_MODE is irrelevant
  }

  // 6) Discounts (unrounded)
  const volumeDiscount = itemTotal * appliedVolumeRate;
  const memberDiscount = itemTotal * appliedMemberRate;
  const totalDiscounts = volumeDiscount + memberDiscount;

  // 7) Shipping (flat) added after discounts (0 if empty)
  const shipping = cart.length ? SHIPPING_RATE : 0;

  // 8) SubTotal (taxable) and tax & total (unrounded)
  const taxableSubTotal = itemTotal - totalDiscounts + shipping;
  const taxAmount = taxableSubTotal * TAX_RATE;
  const invoiceTotal = taxableSubTotal + taxAmount;

  // 9) Build table rows
  let rows = "";
  for (let i = 0; i < cart.length; i++) {
    const it = cart[i];
    const lineTotal = it.unitPrice * it.qty;
    const unitFormatted = moneyFmt.format(it.unitPrice);
    const lineFormatted = moneyFmt.format(lineTotal);

    rows += `
      <tr data-id="${it.id}">
        <td class="thumb"><img src="${it.image || ""}" alt=""></td>
        <td class="name"><div class="item-name">${it.name}</div></td>
        <td class="amount">${unitFormatted}</td>
        <td class="qty">x ${it.qty}</td>
        <td class="amount">${lineFormatted}</td>
        <td class="controls">
          <button class="cart-remove" type="button" data-remove="${it.id}">Remove</button>
        </td>
      </tr>
    `;
  }

  // 10) Empty cart UX
  const emptyHtml = `
    <div class="cart-empty">Your cart is empty. Add souvenirs in the Shop and they’ll appear here.</div>
  `;

  // 11) Summary block (display with parentheses for negatives)
  const fmt = (v) => (v < 0 ? "(" + moneyFmt.format(Math.abs(v)) + ")" : moneyFmt.format(v));
  const itemTotalDisplay = moneyFmt.format(itemTotal);
  const volDisplay = fmt(-volumeDiscount);
  const memDisplay = fmt(-memberDiscount);
  const shipDisplay = moneyFmt.format(shipping);
  const taxableDisplay = moneyFmt.format(taxableSubTotal);
  const taxRateDisplay = (TAX_RATE * 100).toFixed(1) + "%";
  const taxDisplay = moneyFmt.format(taxAmount);
  const totalDisplay = moneyFmt.format(invoiceTotal);

  // Optional note about which discount applied when both could apply
  let discountNote = "";
  if (memberRateWanted > 0 && volumeRate > 0) {
    discountNote = `
      <div class="note" style="margin:.35rem 0;color:var(--text-300,#E9D8A6);opacity:.9">
        Discount mode: <strong>${DISCOUNT_MODE === "member" ? "Member (15%)" : "Volume (" + (volumeRate*100).toFixed(0) + "%)"}</strong>.
        <a href="#" id="changeDiscount">Change</a>
      </div>
    `;
  }

  // 12) Single render injection
  mount.innerHTML = `
    ${cart.length ? `
      <table class="cart-table" role="table" aria-label="Cart items">
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Name</th>
            <th scope="col">Unit</th>
            <th scope="col">Qty</th>
            <th scope="col">Line Total</th>
            <th scope="col" class="controls">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    ` : emptyHtml}

    ${discountNote}

    <div class="summary" aria-label="Order summary">
      <div class="row"><div class="label">Subtotal of ItemTotals</div><div class="value">${itemTotalDisplay}</div></div>
      <div class="row"><div class="label">Volume Discount</div><div class="value">${volDisplay}</div></div>
      <div class="row"><div class="label">Member Discount</div><div class="value">${memDisplay}</div></div>
      <div class="row"><div class="label">Shipping</div><div class="value">${shipDisplay}</div></div>
      <div class="row"><div class="label">Subtotal (Taxable amount)</div><div class="value">${taxableDisplay}</div></div>
      <div class="row"><div class="label">Tax Rate</div><div class="value">${taxRateDisplay}</div></div>
      <div class="row"><div class="label">Tax Amount</div><div class="value">${taxDisplay}</div></div>
      <div class="row total"><div class="label">Invoice Total</div><div class="value">${totalDisplay}</div></div>
    </div>
  `;

  // 13) Announce updates for a11y
  if (live) {
    live.textContent = `Cart has ${cart.length} item${cart.length===1?"":"s"}. Total ${totalDisplay}.`;
  }

  // 14) Persist
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  localStorage.setItem(MEMBER_KEY, isMember ? "true" : "false");
}

/*** Interactions (anonymous handlers so we don’t add named helpers) ***/

// Remove item
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.matches("[data-remove]")) {
    const id = t.getAttribute("data-remove");
    cart = cart.filter(it => String(it.id) !== String(id));
    render();
  }
  if (t.matches("#clearCart")) {
    cart = [];
    DISCOUNT_MODE = "";
    localStorage.removeItem(MODE_KEY);
    render();
  }
  if (t.matches("#changeDiscount")) {
    e.preventDefault();
    DISCOUNT_MODE = "";
    localStorage.removeItem(MODE_KEY);
    render();
  }
});

// Member toggle
if (memberCheck) {
  memberCheck.addEventListener("change", () => {
    isMember = memberCheck.checked;
    // Force new choice when both apply
    DISCOUNT_MODE = "";
    localStorage.removeItem(MODE_KEY);
    render();
  });
}

/*** First paint ***/
render();

