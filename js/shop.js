<script>
/* ======================= Shop (shop.js) ======================= */
(function () {
  "use strict";

  // Use absolute paths for GitHub Pages
  const IMG = "/Museum/images";

  // Your shop items (match real image files)
  const SHOP_ITEMS = [
    {
      id: "postcard-pack",
      name: "Curios Postcard Pack",
      unitPrice: 9.95,
      image: `${IMG}/souvenir-shop.jpg`,
      blurb: "Set of 10 matte postcards featuring highlights from the Museum of Wonder."
    },
    {
      id: "celestial-inkstone",
      name: "Celestial Inkstone",
      unitPrice: 14.95,
      image: `${IMG}/celestial-inkstone.jpg`,
      blurb: "Pigment mixing platform—possibly astronomical in function."
    },
    {
      id: "basaltic-glyphstone",
      name: "Basaltic Glyphstone",
      unitPrice: 31.55,
      image: `${IMG}/marker-arch-fragment.jpg`,
      blurb: "Boundary marker incised with shallow crossing lines."
    },
    {
      id: "spiral-claw-fossil",
      name: "Spiral Claw Fossil",
      unitPrice: 24.25,
      image: `${IMG}/spiral-claw-fossil.jpg`,
      blurb: "Coiled mineralized talon; specimen box included."
    }
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function cardHTML(item) {
    const qty = MuseumCart.qtyFor(item.id);
    return `
      <article class="shop-card card">
        <figure class="media-frame">
          <img src="${item.image}" alt="${item.name}">
        </figure>
        <div class="content">
          <h3>${item.name}</h3>
          <p class="muted">${item.blurb}</p>
          <div class="price-row">
            <strong>${MuseumCart.toMoney(item.unitPrice)}</strong>
            <button class="btn add-btn" data-id="${item.id}">Add to Cart</button>
          </div>
          <span class="qty-badge" aria-live="polite" id="q-${item.id}">${qty ? "Qty: " + qty : ""}</span>
        </div>
      </article>
    `;
  }

  function renderShop() {
    const host = document.getElementById("shop-list");
    if (!host) return;
    host.innerHTML = SHOP_ITEMS.map(cardHTML).join("");
    wireButtons();
    updateCartCount();
  }

  function wireButtons() {
    $$(".add-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const item = SHOP_ITEMS.find(x => x.id === id);
        MuseumCart.addToCart(item);
        // update qty badge and header count
        const badge = document.getElementById("q-" + id);
        if (badge) badge.textContent = "Qty: " + MuseumCart.qtyFor(id);
        updateCartCount();
      });
    });
  }

  function updateCartCount() {
    const n = MuseumCart.cartCount();
    const link = document.getElementById("cartLink");
    if (link) link.textContent = "Cart " + n;
  }

  document.addEventListener("DOMContentLoaded", renderShop);
})();
</script>




