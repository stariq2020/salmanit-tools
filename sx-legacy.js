/* Behaviour for retained sections: accordions, screenshot/how-it-works tabs, lightbox, FAQ, contact modal. */
// Auto-open contact modal if arriving via #contact link from another page
  try {
    if (window.location.hash === '#contact') {
      document.addEventListener('DOMContentLoaded', function() {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) {
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        history.replaceState(null, '', window.location.pathname + window.location.search);
      });
    }
  } catch(e) { console.warn('Contact modal auto-open failed:', e); }

  
// ── Accordion
  function toggleAccordion(btn) {
    const body = btn.nextElementSibling;
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open');
    btn.classList.toggle('open');
  }

  
// ── Lightbox
  function openLightbox(src, caption) {
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxCaption').textContent = caption;
    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLightbox(); closeModal(); }
  });

  // ── Screenshots tabs
  function switchSsTab(btn, tabId) {
    document.querySelectorAll('.ss-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.ss-content').forEach(t => t.style.display = 'none');
    btn.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
  }

  // ── How It Works tabs
  function switchTab(btn, tabId) {
    document.querySelectorAll('.how-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.how-tab-content').forEach(t => t.style.display = 'none');
    btn.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
  }

  // ── FAQ
  function toggleFaq(el) {
    const item = el.closest('.faq-item');
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  }

  // ── Modal
  function openModal(e) {
    if (e) e.preventDefault();
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
  }
  function closeModalOutside(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // ── Contact form via Formspree
  document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    try {
      const res = await fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        this.style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
      } else {
        btn.textContent = 'Send Message →';
        btn.disabled = false;
        alert('Something went wrong. Please try again.');
      }
    } catch {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      alert('Network error. Please try again.');
    }
  });

