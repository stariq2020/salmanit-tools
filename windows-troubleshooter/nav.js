/* Mobile menu toggle shared by the troubleshooter pages. */
(function () {
  'use strict';
  var hb = document.getElementById('hamburger'), mm = document.getElementById('mobileMenu');
  if (!hb || !mm) return;
  function set(open) { mm.classList.toggle('open', open); hb.setAttribute('aria-expanded', String(open)); }
  hb.addEventListener('click', function () { set(!mm.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  window.addEventListener('scroll', function () { set(false); }, { passive: true });
})();
