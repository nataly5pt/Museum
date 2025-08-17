/* ================== Shop Add-to-Cart ================== */
const CART_KEY = 'museumCartV1';

/* storage helpers */
function readCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function cartCount() {
  return readCart().reduce((n, it) => n + (it.qty || 0), 0);
}
function updateHeaderCount() {
  const el = document.getElementById('cart-count');
  if (el) el.textContent = cartCount();
}

/* main: called by buttons on shop.html */
function addToCart(btn) {
  const id        = btn.dataset.id;
  const name      = btn.dataset.name;
  const unitPrice = Number(btn.dataset.price);
  const image     = btn.dataset.image;

  let cart = readCart();
  const idx = cart.findIndex(it => it.id === id);

  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ id, name, unitPrice, qty: 1, image });
  }
  writeCart(cart);
  updateHeaderCount();

  // Update qty badge on this card
  const card  = btn.closest('.souvenir-item');
  const badge = card?.querySelector('.qty-badge');
  if (badge) {
    const it = cart.find(x => x.id === id);
    badge.textContent = it ? `Qty: ${it.qty}` : '';
  }
}

/* initialize existing badges + header count on load */
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderCount();
  const cart = readCart();
  document.querySelectorAll('.souvenir-item').forEach(card => {
    const btn   = card.querySelector('button[onclick]');
    const id    = btn?.dataset.id;
    const badge = card.querySelector('.qty-badge');
    if (!id || !badge) return;
    const it = cart.find(x => x.id === id);
    if (it) badge.textContent = `Qty: ${it.qty}`;
  });
});








