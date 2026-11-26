/* Saloni Chaudhary — portfolio interactions. No dependencies. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- oversized headlines: the name fills its column, project titles never overflow ---- */
  function fit() {
    $$('.hero-title, .cs-t').forEach(function (el) {
      el.style.fontSize = '';
      var room = el.parentElement.clientWidth;
      var widest = Math.max.apply(null, $$('.ln > span', el).map(function (s) {
        var r = document.createRange(); r.selectNodeContents(s); return r.getBoundingClientRect().width;
      }));
      if (widest > 0 && (widest > room || el.hasAttribute('data-fill')))
        el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * room / widest * 0.992) + 'px';
    });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', fit);

  /* ---- page fade in and out ---- */
  function arrive() { doc.classList.remove('leaving'); setTimeout(function () { doc.classList.add('ready'); }, 30); }
  arrive();
  window.addEventListener('pageshow', function (e) { if (e.persisted) arrive(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var href = a.getAttribute('href');
    if (a.target === '_blank' || /^(#|mailto:|tel:)/.test(href) || a.origin !== location.origin) return;
    if (a.pathname === location.pathname) { closeMenu(); return; }
    e.preventDefault();
    doc.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 300);
  });

  /* ---- reveal on scroll ---- */
  var revs = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });
    revs.forEach(function (el) { io.observe(el); });
  } else { revs.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- header line, current section, gentle parallax ---- */
  var head = $('.head'), pars = reduce ? [] : $$('[data-par]'), ticking = false;
  function onScroll() {
    ticking = false;
    head.classList.toggle('scrolled', window.scrollY > 8);
    var vh = window.innerHeight;
    pars.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.par)).toFixed(1) + 'px';
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  var links = $$('.nav a');
  var map = { top: '', work: 'work', about: 'about', experience: 'experience', education: 'experience', tools: 'experience', contact: 'contact' };
  if ('IntersectionObserver' in window && $('.p-home')) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('on', l.dataset.nav === map[en.target.id]); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  } else if ($('.p-case')) { links.forEach(function (l) { l.classList.toggle('on', l.dataset.nav === 'work'); }); }

  /* ---- mobile menu ---- */
  var btn = $('.menu-btn'), menu = $('#menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open);
    if (open) { menu.hidden = false; menu.offsetHeight; menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
    else { menu.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, 420); }
  }
  function closeMenu() { if (btn && btn.getAttribute('aria-expanded') === 'true') setMenu(false); }
  if (btn && menu) btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- pointer: hero shapes drift, and a small cursor follows ---- */
  if (fine && !reduce) {
    var cur = $('.cursor'), cx = -50, cy = -50, tx = -50, ty = -50, qx = 0, qy = 0;
    var drift = $$('.hero [data-depth]');
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var l = e.target.closest('[data-cursor]'), a = e.target.closest('a,button');
      cur.classList.toggle('label', !!l); cur.classList.toggle('link', !l && !!a);
      cur.textContent = l ? l.dataset.cursor : '';
    });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      if (drift.length && window.scrollY < window.innerHeight) {
        var px = tx / window.innerWidth - 0.5, py = ty / window.innerHeight - 0.5;
        qx += (px - qx) * 0.05; qy += (py - qy) * 0.05;
        drift.forEach(function (el) {
          var d = parseFloat(el.dataset.depth);
          el.style.translate = (qx * d * 2).toFixed(1) + 'px ' + (qy * d * 2).toFixed(1) + 'px';
        });
      }
      requestAnimationFrame(loop);
    })();
  }
})();
