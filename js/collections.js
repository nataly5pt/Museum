<script>
/* ============================================================================
   Collections page: Tabs (show one section at a time) + Text-only Modal
   - Works with IDs: #arch | #anth | #hist  OR  #archaeology | #anthropology | #histories
   - Triggers:
       • Tab buttons:  .tab-btn[data-tab="arch|anth|hist"]
       • Subnav chips: <a class="chip" href="#archaeology|#anthropology|#histories">
       • Modal open:   [data-modal="obsidian|..."]  or  [data-modal-target="#modal-text-..."]
   - Hidden modal content blocks:  <div class="modal-item" id="modal-text-obsidian" hidden>…</div>
   - Modal shell on page: #modal with .close-modal and #modal-body
   ============================================================================ */
(function(){
  // ---- Section lookup (supports both naming schemes) -----------------------
  const sectionEls = {
    arch: document.getElementById('arch')        || document.getElementById('archaeology'),
    anth: document.getElementById('anth')        || document.getElementById('anthropology'),
    hist: document.getElementById('hist')        || document.getElementById('histories')
  };

  // Some CSS shows #histories only when it has .active; mirror that here.
  function setHistoriesActive(on){
    const h = sectionEls.hist;
    if (!h) return;
    if (on) h.classList.add('active'); else h.classList.remove('active');
  }

  // ---- Tabs: show one section, hide the others --------------------------------
  const buttons = document.querySelectorAll('.tab-btn');

  function show(tabKey){
    // normalize allowed keys
    if (!['arch','anth','hist'].includes(tabKey)) tabKey = 'arch';

    Object.entries(sectionEls).forEach(([key, el])=>{
      if (!el) return;
      const on = key === tabKey;
      // Some layouts use CSS display, some use [hidden]; support both.
      el.hidden = !on;
      if (key === 'hist') setHistoriesActive(on);
    });

    // aria-current on buttons (if present)
    buttons.forEach(b => {
      b.setAttribute('aria-current', b.dataset.tab === tabKey ? 'page' : 'false');
    });

    // Focus a sensible target inside the newly shown section
    const host = sectionEls[tabKey];
    if (host){
      const focusTarget = host.querySelector('.card a, .card img, .history a, .history-item a');
      focusTarget?.focus?.();
    }
  }

  // Wire the .tab-btn buttons
  buttons.forEach(b => b.addEventListener('click', (e)=>{
    e.preventDefault();
    show(b.dataset.tab);
  }));

  // Intercept subnav chips like #archaeology / #anthropology / #histories
  document.addEventListener('click', (e)=>{
    const chip = e.target.closest('.subnav .chip[href^="#"]');
    if (!chip) return;

    const hash = (chip.getAttribute('href') || '').toLowerCase();
    if (!hash) return;

    // Map hashes to our normalized tab keys
    const map = {
      '#arch': 'arch', '#archaeology': 'arch',
      '#anth': 'anth', '#anthropology': 'anth',
      '#hist': 'hist', '#histories': 'hist'
    };
    const key = map[hash];
    if (key){
      e.preventDefault();
      show(key);
      sectionEls[key]?.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  // Default view on load: show Archaeology if present, else first existing section
  show(sectionEls.arch ? 'arch' : (sectionEls.anth ? 'anth' : 'hist'));

  // ---- Modal logic (text only; clones hidden HTML into the modal) -------------
  const modal     = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn  = modal?.querySelector?.('.close-modal');
  let lastTrigger = null;

  function openFrom(selector, trigger){
    const src = document.querySelector(selector);
    if (!src){ console.warn('Missing modal content:', selector); return; }
    modalBody.innerHTML = src.innerHTML;

    // Ensure the dialog has a unique labelledby target for a11y
    const heading = modalBody.querySelector('h1,h2,h3,h4');
    if (heading) heading.id = 'modal-title';

    modal.setAttribute('aria-hidden','false');
    modal.style.display = 'block';
    lastTrigger = trigger || null;
    closeBtn?.focus?.();
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeModal(){
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
    lastTrigger?.focus?.();
  }

  // Open modal via [data-modal] or [data-modal-target]
  document.addEventListener('click', (e)=>{
    const t1 = e.target.closest('[data-modal]');
    const t2 = e.target.closest('[data-modal-target]');
    const trigger = t1 || t2;

    if (trigger){
      e.preventDefault();
      const sel = t1 ? `#modal-text-${t1.getAttribute('data-modal')}`
                     : trigger.getAttribute('data-modal-target');
      openFrom(sel, trigger);
      return;
    }

    // Close on overlay or close button
    if (modal && (e.target === modal || e.target.closest('.close-modal'))) closeModal();
  });

  // Esc key closes modal
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && modal?.style.display === 'block') closeModal();
  });

  // Optional: “Back to …” links inside histories that restore a tab
  document.querySelectorAll('[data-tab-return]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      show(a.getAttribute('data-tab-return') || 'arch');
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });
})();
</script>

