/* Saloni Chaudhary — portfolio interactions. No dependencies. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- headline fitting: the widest line fills the column, capped at a share of the viewport ---- */
  function fit() {
    $$('[data-fit]').forEach(function (el) {
      var cap = parseFloat(el.dataset.fit) * window.innerWidth;
      var cs = getComputedStyle(el.parentElement);
      var room = el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = '100px';
      var widest = Math.max.apply(null, $$('.ln > span', el).map(function (s) {
        var r = document.createRange(); r.selectNodeContents(s); return r.getBoundingClientRect().width;
      }));
      if (widest > 0) el.style.fontSize = Math.min(100 * room / widest * 0.995, cap) + 'px';
    });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', fit);

  /* ---- page transition ---- */
  function arrive() { doc.classList.remove('leaving'); setTimeout(function () { doc.classList.add('ready'); }, 40); }
  arrive();
  window.addEventListener('pageshow', function (e) { if (e.persisted) arrive(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    var href = a.getAttribute('href');
    if (a.target === '_blank' || /^(#|mailto:|tel:)/.test(href) || a.origin !== location.origin) return;
    if (a.pathname === location.pathname && a.hash) return;
    e.preventDefault();
    var pt = $('.pt');
    pt.style.transition = 'none'; pt.style.transform = 'translateY(101%)'; pt.offsetHeight;
    pt.style.transition = ''; pt.style.transform = '';
    doc.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 620);
  });

  /* ---- reveal on scroll ---- */
  var revs = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revs.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  } else { revs.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- parallax, scroll progress, back to top ---- */
  var px = reduce ? [] : $$('[data-speed]');
  var totop = $('.totop'), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    px.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var mid = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (mid * parseFloat(el.dataset.speed) * -1).toFixed(1) + 'px,0)';
    });
    var max = doc.scrollHeight - vh;
    if (totop) {
      totop.classList.toggle('show', y > vh * 0.7);
      totop.style.setProperty('--p', max > 0 ? Math.min(100, y / max * 100).toFixed(1) : 0);
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---- menu ---- */
  var btn = $('.menu-btn'), menu = $('#menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', open);
    if (open) { menu.hidden = false; menu.offsetHeight; menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
    else { menu.classList.remove('open'); document.body.style.overflow = ''; setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, 600); }
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); } });
  }

  /* ---- cursor + hover preview ---- */
  if (fine && !reduce) {
    var cur = $('.cursor'), dot = $('.cursor span'), cx = -100, cy = -100, tx = -100, ty = -100;
    var prev = document.createElement('div'); prev.className = 'preview'; prev.innerHTML = '<img alt="">'; document.body.appendChild(prev);
    var pimg = prev.firstChild, pvx = 0, pvy = 0;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var l = e.target.closest('[data-cursor]'), a = e.target.closest('a,button,.chip,input,textarea');
      cur.classList.toggle('label', !!l); cur.classList.toggle('link', !l && !!a);
      dot.textContent = l ? l.dataset.cursor : '';
      var p = e.target.closest('[data-preview]');
      if (p) { if (pimg.getAttribute('src') !== p.dataset.preview) pimg.src = p.dataset.preview; prev.classList.add('on'); }
      else prev.classList.remove('on');
    });
    (function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; pvx += (tx - pvx) * 0.1; pvy += (ty - pvy) * 0.1;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      prev.style.transform = 'translate3d(' + (pvx + 28).toFixed(1) + 'px,' + (pvy - prev.offsetHeight / 2).toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---- work filter ---- */
  var chips = $$('button.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (o) { o.classList.toggle('on', o === c); o.setAttribute('aria-pressed', o === c); });
      var f = c.dataset.f, shown = 0;
      $$('#pj-list .pj').forEach(function (p) {
        var ok = f === 'all' || p.dataset.cats.split(' ').indexOf(f) > -1;
        p.classList.toggle('is-hidden', !ok);
        if (ok) { shown++; p.classList.remove('in'); requestAnimationFrame(function () { requestAnimationFrame(function () { p.classList.add('in'); }); }); }
      });
      var none = $('.none'); if (none) none.hidden = shown > 0;
    });
  });

  /* ---- contact form: posts to an endpoint if one is configured, otherwise opens the visitor's mail app ---- */
  var form = $('#contact-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = $('.form-note', form), d = new FormData(form), ep = form.dataset.endpoint;
    if (ep) {
      note.textContent = 'Sending…';
      fetch(ep, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw 0; form.reset(); note.textContent = 'Thank you. Your message is on its way.'; })
        .catch(function () { note.textContent = 'That did not send. Please email me directly instead.'; });
      return;
    }
    var to = form.getAttribute('action').replace('mailto:', '');
    var body = d.get('message') + '\n\n' + d.get('name') + '\n' + d.get('email');
    location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Project idea from ' + d.get('name')) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Your mail app should open with the message ready to send.';
  });
})();
