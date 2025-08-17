/* ===== Shop page (non-module) ========================================= */
(function () {
  "use strict";

  // ---- Constants / keys ----
  const CART_KEY = "museumCartV1";

  // ---- Products (you can add more later) ----
  const PRODUCTS = [
    {
      id: "postcard-pack",
      name: "Curios Postcard Pack",
      unitPrice: 9.95,
      image: "/Museum/images/shop/souvenir-shop.jpg",
      blurb:
        "Set of 10 matte postcards featuring highlights from the Museum of Wonder."
    },
    {
      id: "celestial-inkstone",
      name: "Celestial Inkstone",
      unitPrice: 14.95,
      image: "/Museum/images/celestial-inkstone.jpg",
      blurb: "Pigment-making platform, possibly ceremonial or archway-related."
    },
    {
      id: "marker-arch-fragment",
      name: "Marker Arch Fragment",
      unitPrice: 13.55,
      image: "/Museum/images/marker-arch-fragment.jpg",
      blurb: "A shard with incised motifs; travel token or invocation tablet."
    },
    {
      id: "spiral-claw-fossil",
      name: "Spiral Claw Fossil",
      unitPrice: 12.8,
      image: "/Museum/images/spiral-claw-fossil.jpg",
      blurb: "Curio fossil with helical ridges—beloved in our field kits."
    }
  ];

  // ---- Storage helpers ----
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  function cartCount() {
    return readCart().reduce((n, it) => n + (it.qty || 0), 0);
  }
  function updateNavCount() {
    const el = document.getElementById("navCartCount");
    if (el) el.textContent = cartCount();
  }

  // ---- Shop rendering ----
  function renderShop() {
    const grid = document.getElementById("shopGrid");
    if (!grid) return;

    const cart = readCart();

    grid.innerHTML = PRODUCTS.map(p => {
      const inCart = cart.find(it => it.id === p.id);
      const qty = inCart ? inCart.qty : 0;

      return `
        <article class="card shop-card" data-id="${p.id}">
          <figure class="media-frame">
            <img src="${p.image}" alt="${p.name}">
          </figure>
          <div class="content">
            <h3>${p.name}</h3>
            <p class="muted">${p.blurb}</p>
            <div class="price-row">
              <div class="price">$${p.unitPrice.toFixed(2)}</div>
              <button class="btn btn-amber add-btn" data-id="${p.id}">
                Add to Cart
              </button>
            </div>
            <span class="qty-badge" aria-live="polite">
              ${qty ? `Qty in cart: ${qty}` : ``}
            </span>
          </div>
        </article>
      `;
    }).join("");

    // Wire buttons
    grid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        addToCart(btn.getAttribute("data-id"));
      });
    });
  }

  // ---- Add to cart ----
  function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const cart = readCart();
    const found = cart.find(it => it.id === id);
    if (found) {
      found.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        unitPrice: product.unitPrice,
        qty: 1,
        image: product.image
      });
    }
    saveCart(cart);
    updateNavCount();
    renderShop(); // refresh qty badges
  }

  // ---- Nav “View Cart” ----
  document.addEventListener("DOMContentLoaded", () => {
    const goCart = () => (location.href = "/Museum/html/cart.html");
    const vbtn = document.getElementById("viewCartBtn");
    if (vbtn) vbtn.addEventListener("click", goCart);

    const ncl = document.getElementById("navCartLink");
    if (ncl) ncl.addEventListener("click", goCart);

    renderShop();
    updateNavCount();
  });
})();





