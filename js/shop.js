/* shop.js — renders products and wires Add to Cart */
"use strict";

// Try to load from ../data/products.json, but fall back to this list if not found.
// You can change titles/prices/images freely.
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: "Celestial Inkstone",
    price: 24.00,
    image: "../images/celestial-inkstone.jpg"
  },
  {
    id: 2,
    title: "Marker Arch Fragment",
    price: 18.50,
    image: "../images/marker-arch-fragment.jpg"
  },
  {
    id: 3,
    title: "Spiral Claw Fossil",
    price: 32.00,
    image: "../images/spiral-claw-fossil.jpg"
  }
  // Add more later if you like
];

const $ = (sel, root=document) => root.querySelector(sel);

async function getProducts() {
  // If you create /Museum/data/products.json later, it will auto-load.
  // Example JSON structure:
  // [{ "id": 1, "title": "Name", "price": 19.99, "image": "../images/xxx.jpg" }, ...]
  try {
    const res = await fetch("../data/products.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No products.json");
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error("Empty list");
    return data;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

function renderProducts(products) {
  const grid = $("#product-grid");
  if (!grid) return;

  grid.innerHTML = products.map(p => `
    <article class="card product" data-id="${p.id}">
      <div class="img-wrap">
        <img src="${p.image}" alt="${p.title}">
      </div>
      <div class="body">
        <h3 class="title">${p.title}</h3>
        <p class="price">$${Number(p.price).toFixed(2)}</p>
        <button class="btn-add">Add to Cart</button>
      </div>
    </article>
  `).join("");

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".product");
    if (!card) return;
    if (!e.target.matches(".btn-add")) return;

    const id = Number(card.dataset.id);
    const p = products.find(x => x.id === id);
    if (!p) return;

    window.Cart.add(p, 1);
    // Optional: little confirmation
    e.target.textContent = "Added!";
    setTimeout(() => (e.target.textContent = "Add to Cart"), 800);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const products = await getProducts();
  renderProducts(products);
});






