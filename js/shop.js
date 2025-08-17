// /Museum/js/shop.js
import { renderProductCard, formatMoney } from "./card.js";

/* ---------- Constants ---------- */
const STORAGE_KEY = "museumCartV1";

/* ---------- Data: products for the shop ---------- */
const PRODUCTS = [
  {
    id: "postcard-pack",
    name: "Curios Postcard Pack",
    short: "Postcard Pack",
    desc: "Set of 10 matte postcards featuring highlights from the Museum of Wonder.",
    price: 9.95,
    image: "/Museum/images/shop/souvenir-shop.jpg",
    alt: "Souvenir shop full of curios"
  }
];

/* ---------- Storage helpers ---------- */
function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function writeCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function cartCount(cart) {
  return cart.reduce((sum, it) => sum + (it.qty || 0), 0);
}
function findIndex(cart, id) {
  return cart.findIndex((x) => x.id === id);
}

/* ---------- UI: header count ---------- */
function updateHeaderCount(count) {
  const el = document.getElementById("cartCount");
  if (el) el.textContent = String(count);
}

/* ---------- Add-to-cart ---------- */
function addToCart(productId) {
  const cart = readCart();
  const i = findIndex(cart, productId);
  if (i >= 0) cart[i].qty += 1;
  else cart.push({ id: productId, qty: 1 });
  writeCart(cart);

  // Update header count
  updateHeaderCount(cartCount(cart));

  // Update this card’s badge
  const badge = document.getElementById(`badge-${productId}`);
  if (badge) {
    const item = cart.find((x) => x.id === productId);
    badge.hidden = false;
    badge.textContent = `Qty: ${item.qty}`;
  }
}

/* ---------- Render ---------- */
function render() {
  const grid = document.getElementById("shop-list");
  if (!grid) return;

  grid.textContent = ""; // clear

  const cart = readCart();
  const qtyById = Object.fromEntries(cart.map((c) => [c.id, c.qty]));

  PRODUCTS.forEach((p) => {
    const card = renderProductCard(p, {
      onAdd: addToCart,
      qty: qtyById[p.id] || 0
    });
    grid.append(card);
  });

  updateHeaderCount(cartCount(cart));

  const vc = document.getElementById("viewCartBtn");
  if (vc) vc.addEventListener("click", () => {
    location.href = "/Museum/html/cart.html";
  });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", render);





