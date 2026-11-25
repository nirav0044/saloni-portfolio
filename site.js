/* Saloni Chaudhary — portfolio interactions. No dependencies. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- keep oversized headlines inside their column ---- */
  function fit() {
    $$('.hero-title, .cs-t').forEach(function (el) {
      el.style.fontSize = '';
      var room = el.parentElement.clientWidth;
      var widest = Math.max.apply(null, $$('.ln > span', el).map(function (s) {
        var r = document.createRange(); r.selectNodeContents(s); return r.getBoundingClientRect().width;
      }));
      if (widest > room) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * room / widest * 0.99) + 'px';
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
    if (a.hasAttribute('data-zoom') || a.target === '_blank' || /^(#|mailto:|tel:)/.test(href) || a.origin !== location.origin) return;
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

  /* ---- header line + current section ---- */
  var head = $('.head');
  function onScroll() { head.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var links = $$('.nav a');
  var map = { about: 'about', education: 'about', experience: 'experience', tools: 'experience', work: 'work', typography: 'work', contact: 'contact' };
  if ('IntersectionObserver' in window && $('.p-home')) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('on', l.dataset.nav === map[en.target.id]); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
    var hero = $('.hero'); if (hero) so.observe(hero);
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

  /* ---- enlarge a portfolio page ---- */
  var zoom = $('.zoom'), zimg = zoom && $('img', zoom), last = null;
  function closeZoom() {
    if (!zoom || zoom.hidden) return;
    zoom.classList.remove('open'); document.body.style.overflow = '';
    setTimeout(function () { zoom.hidden = true; zimg.removeAttribute('src'); }, 360);
    if (last) last.focus();
  }
  if (zoom) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-zoom]');
      if (!a) return;
      e.preventDefault(); last = a;
      zimg.src = a.getAttribute('href'); zimg.alt = (a.querySelector('img') || {}).alt || '';
      zoom.hidden = false; zoom.offsetHeight; zoom.classList.add('open'); document.body.style.overflow = 'hidden';
      $('button', zoom).focus();
    });
    zoom.addEventListener('click', closeZoom);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeZoom(); closeMenu(); } });

  /* ---- a quiet cursor dot, desktop only ---- */
  if (fine && !reduce) {
    var cur = $('.cursor'), cx = -50, cy = -50, tx = -50, ty = -50;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', function (e) { cur.classList.toggle('big', !!e.target.closest('[data-cursor],[data-zoom]')); });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }
})();
