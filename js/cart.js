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




