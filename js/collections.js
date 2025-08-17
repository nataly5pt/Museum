// Tabs: show one section at a time
(function () {
  const sections = {
    arch: document.getElementById('arch'),
    anth: document.getElementById('anth'),
    hist: document.getElementById('hist')
  };
  const buttons = document.querySelectorAll('.tab-btn');

  function show(tab) {
    Object.entries(sections).forEach(([key, el]) => {
      const on = key === tab;
      el.hidden = !on;
    });
    buttons.forEach(b => {
      b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false');
    });
    // return focus to first card when switching
    const firstCardImg = sections[tab].querySelector('.card img, .history a');
    if (firstCardImg) firstCardImg.focus?.();
  }

  buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.tab)));
  // default
  show('arch');

  // Modal logic from assignment (text only)
  const modal     = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn  = modal.querySelector('.close-modal');
  let lastTrigger = null;

  function openFrom(selector, trigger){
    const src = document.querySelector(selector);
    if (!src) { console.warn('Missing modal content:', selector); return; }
    modalBody.innerHTML = src.innerHTML;
    modal.style.display = 'block';
    lastTrigger = trigger || null;
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.style.display = 'none';
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('[data-modal-target]');
    if (trigger){
      e.preventDefault();
      openFrom(trigger.getAttribute('data-modal-target'), trigger);
      return;
    }
    if (e.target === modal || e.target.closest('.close-modal')) closeModal();
  });

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && modal.style.display === 'block') closeModal();
  });

  // “Back to Collections” link inside histories
  document.querySelectorAll('[data-tab-return]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      show(a.getAttribute('data-tab-return'));
    });
  });
})();
