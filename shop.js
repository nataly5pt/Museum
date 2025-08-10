// Modal + Add-to-Cart (Phase 1 stub)
(function () {
  const modal = document.getElementById('item-modal');
  const imgEl = document.getElementById('modal-img');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const priceEl = document.getElementById('modal-price');
  const addBtn = document.getElementById('modal-add');

  let activeItem = null;
  let lastFocus = null;

  // Open modal with data from clicked item
  function openModal(fromArticle) {
    activeItem = {
      id: fromArticle.dataset.id,
      title: fromArticle.dataset.title,
      price: Number(fromArticle.dataset.price),
      img: fromArticle.dataset.img,
      desc: fromArticle.dataset.desc
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
    addBtn.focus();
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  // Wire image clicks to modal
  document.querySelectorAll('.souvenir-item .modal-trigger').forEach(img => {
    img.addEventListener('click', (e) => {
      const article = e.target.closest('.souvenir-item');
      openModal(article);
    });
  });

  // Close actions
  modal.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (!modal.hasAttribute('hidden') && e.key === 'Escape') closeModal();
  });

  // Add to Cart (Phase 1 stub)
  function addToCart(item) {
    // Phase 1 requirement: prompt only (no storage yet)
    alert(`Added to cart: ${item.title} — $${item.price.toFixed(2)} (ID: ${item.id})`);
  }

  // Buttons in cards
  document.querySelectorAll('.souvenir-item .add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const article = e.target.closest('.souvenir-item');
      const item = {
        id: article.dataset.id,
        title: article.dataset.title,
        price: Number(article.dataset.price)
      };
      addToCart(item);
    });
  });

  // Button inside modal
  addBtn.addEventListener('click', () => {
    if (activeItem) addToCart(activeItem);
  });
})();
