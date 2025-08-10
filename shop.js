// Modal + Add-to-Cart (Phase 1)
(function () {
  const modal = document.getElementById('item-modal');
  const imgEl = document.getElementById('modal-img');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const priceEl = document.getElementById('modal-price');
  const addBtn = document.getElementById('modal-add');

  let activeItem = null;
  let lastFocus = null;

  function openModal(article) {
    activeItem = {
      id: article.dataset.id,
      title: article.dataset.title,
      price: Number(article.dataset.price),
      img: article.dataset.img,
      desc: article.dataset.desc
    };
    imgEl.src = activeItem.img;
    imgEl.alt = activeItem.title;
    titleEl.textContent = activeItem.title;
    descEl.textContent = activeItem.desc;
    priceEl.textContent = `$${activeItem.price.toFixed(2)}`;
    addBtn.textContent = `Add ${activeItem.title} to Cart`;

    lastFocus = document.activeElement;
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    addBtn.focus();
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  // Open via image click
  document.querySelectorAll('.souvenir-item .modal-trigger').forEach(img => {
    img.addEventListener('click', e => openModal(e.target.closest('.souvenir-item')));
  });

  // Close (backdrop or X)
  modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', e => { if (!modal.hasAttribute('hidden') && e.key === 'Escape') closeModal(); });

  // Add-to-cart stub
  function addToCart(item) {
    alert(`Added to cart: ${item.title} — $${item.price.toFixed(2)} (ID: ${item.id})`);
  }

  // Card buttons
  document.querySelectorAll('.souvenir-item .add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const a = e.target.closest('.souvenir-item');
      addToCart({ id: a.dataset.id, title: a.dataset.title, price: Number(a.dataset.price) });
    });
  });

  // Modal button
  addBtn.addEventListener('click', () => { if (activeItem) addToCart(activeItem); });
})();

