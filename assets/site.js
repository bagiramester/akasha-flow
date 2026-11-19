/* Akasha Flow – Lélekívek · közös szkript (mobilmenü, sütisáv, űrlapok, utalvány) */
(function () {
  'use strict';

  // Mobilmenü
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('fomenu');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  }

  // Sütikezelés: hozzájárulás nélkül semmilyen mérőkód nem töltődik be.
  var KEY = 'akasha-cookie-consent-v1';
  var memory = null;
  function readConsent() {
    try { var v = window.localStorage.getItem(KEY); return v ? JSON.parse(v) : memory; } catch (e) { return memory; }
  }
  function saveConsent(c) {
    memory = c;
    try { window.localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* tárolás nem elérhető */ }
    applyConsent(c);
  }
  function applyConsent(c) {
    // Élesítéskor ide kerül: ha c.analytics → Google Analytics 4 betöltése;
    // ha c.marketing → Meta Pixel betöltése; ha c.external → foglalónaptár és térkép beágyazása. A bemutató változat egyiket sem tölti be.
    document.documentElement.setAttribute('data-consent', (c.analytics ? 'a' : '') + (c.marketing ? 'm' : '') + (c.external ? 'e' : '') || 'none');
  }
  var banner = document.getElementById('cookie');
  var opts = document.getElementById('cookie-opts');
  var chkA = document.getElementById('ck-analytics');
  var chkM = document.getElementById('ck-marketing');
  var chkE = document.getElementById('ck-external');
  function showBanner(withOptions) {
    if (!banner) return;
    var c = readConsent() || { analytics: false, marketing: false };
    if (chkA) chkA.checked = !!c.analytics;
    if (chkM) chkM.checked = !!c.marketing;
    if (chkE) chkE.checked = !!c.external;
    if (opts) opts.hidden = !withOptions;
    banner.hidden = false;
  }
  function hideBanner() { if (banner) banner.hidden = true; }
  if (banner) {
    var existing = readConsent();
    if (existing) { applyConsent(existing); } else { showBanner(false); }
    banner.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t) return;
      var act = t.getAttribute('data-ck');
      if (act === 'all') { saveConsent({ analytics: true, marketing: true, external: true }); hideBanner(); }
      else if (act === 'none') { saveConsent({ analytics: false, marketing: false, external: false }); hideBanner(); }
      else if (act === 'settings') { if (opts) { opts.hidden = !opts.hidden; } }
      else if (act === 'save') { saveConsent({ analytics: !!(chkA && chkA.checked), marketing: !!(chkM && chkM.checked), external: !!(chkE && chkE.checked) }); hideBanner(); }
    });
  }
  document.querySelectorAll('[data-open-cookie]').forEach(function (el) {
    el.addEventListener('click', function () { showBanner(true); var f = banner && banner.querySelector('button'); if (f) f.focus(); });
  });

  // Űrlapok (bemutató: nem küld adatot sehova)
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var status = form.querySelector('.form-status');
      if (status) {
        status.textContent = form.getAttribute('data-demo');
        status.hidden = false;
        status.focus();
      }
    });
  });

  // Utalvány összesítő
  var vlist = document.querySelector('[data-voucher]');
  if (vlist) {
    var name = document.getElementById('sum-name');
    var price = document.getElementById('sum-price');
    var update = function () {
      var r = vlist.querySelector('input:checked');
      if (!r) return;
      if (name) name.textContent = r.getAttribute('data-name') + ' utalvány';
      if (price) price.textContent = r.getAttribute('data-price');
    };
    vlist.addEventListener('change', update);
    update();
  }
})();

/* Látvány: fényporszemek, parallaxis, ív-feltárás */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ív alakú képek feltárása görgetéskor (egyszer)
  var risers = document.querySelectorAll('.section .kicker, .section h2, .section-sm h2, .steps li, .tri h3');
  risers.forEach(function (el, i) {
    el.classList.add('rise');
    if (el.matches('.steps li')) el.style.setProperty('--i', [].indexOf.call(el.parentNode.children, el));
  });
  var items = document.querySelectorAll('.reveal, .rise');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  var hero = document.querySelector('.hero');
  // Mobil foglalás gomb: a nyitókép és a sütisáv alatt rejtve
  var cookie = document.getElementById('cookie');
  var syncCookie = function () { document.body.classList.toggle('cookie-open', !!cookie && !cookie.hidden); };
  if (cookie && 'MutationObserver' in window) { new MutationObserver(syncCookie).observe(cookie, { attributes: true, attributeFilter: ['hidden'] }); }
  syncCookie();
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { document.body.classList.toggle('hero-in-view', e[0].isIntersecting); }, { threshold: 0.15 }).observe(hero);
  }
  if (!hero || reduce) return;

  // Lassan felszálló, gyertyafényű porszemek
  var cv = document.getElementById('motes');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0, motes = [];
    var lastW = 0, rt = null;
    var resize = function () {
      if (hero.clientWidth === lastW && motes.length) { H = hero.clientHeight; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); return; }
      lastW = hero.clientWidth;
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, W / 22));
      motes = [];
      for (var i = 0; i < n; i++) motes.push(spawn(true));
    };
    var spawn = function (anyY) {
      return { x: Math.random() * W, y: anyY ? Math.random() * H : H + 10, r: Math.random() * 1.8 + 0.4,
        v: Math.random() * 0.25 + 0.08, a: Math.random() * 0.5 + 0.15, p: Math.random() * Math.PI * 2 };
    };
    var visible = true, running = false;
    var start = function () { if (!running) { running = true; requestAnimationFrame(tick); } };
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(hero);
    var tick = function (t) {
      if (!visible) { running = false; return; }
      {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < motes.length; i++) {
          var m = motes[i];
          m.y -= m.v; m.x += Math.sin(t / 2400 + m.p) * 0.18;
          if (m.y < -10) motes[i] = m = spawn(false);
          var flick = m.a * (0.75 + 0.25 * Math.sin(t / 700 + m.p));
          var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
          g.addColorStop(0, 'rgba(240,203,138,' + flick + ')');
          g.addColorStop(1, 'rgba(240,203,138,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 5, 0, Math.PI * 2); ctx.fill();
        }
      }
      requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    start();
  }

  // Finom parallaxis az íveken az egér mozgására
  var arcs = hero.querySelector('.hero-arcs');
  if (arcs && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      arcs.style.transform = 'translate(' + (dx * -18) + 'px,' + (dy * -12) + 'px)';
    });
  }
})();

/* Húzz egy kérdést + görgetésre rajzolódó ív */
(function () {
  'use strict';
  var Q = ['Mi az, ami idén újra és újra visszatért az életedben?', 'Mire vagy a legbüszkébb az elmúlt hónapokból?',
    'Mit engednél el szívesen, mielőtt új évet kezdesz?', 'Ki volt az, aki idén a legtöbbet adta neked?',
    'Mikor érezted magad igazán nyugodtnak?', 'Milyen döntést halogatsz, és mi segítene meghozni?',
    'Mit tanultál magadról egy nehéz helyzetben?', 'Miből szeretnél többet a következő évben?',
    'Mit mondanál magadnak egy évvel ezelőtt?', 'Honnan veszed észre, hogy túl sok minden jut neked?',
    'Minek örülnél, ha jövő ilyenkor visszanéznél?', 'Mi az a kis dolog, ami minden nap jobbá teszi a napodat?'];
  var btn = document.getElementById('draw-btn'), card = document.getElementById('qcard');
  if (btn && card) {
    var last = -1;
    var drawFn = function () {
      var i; do { i = Math.floor(Math.random() * Q.length); } while (i === last && Q.length > 1); last = i;
      var show = function () {
        document.getElementById('q-no').textContent = (i + 1) + '. kérdés a 12-ből';
        document.getElementById('q-text').textContent = Q[i];
      };
      if (card.classList.contains('flipped')) {
        card.classList.remove('shuffle'); void card.offsetWidth; card.classList.add('shuffle'); setTimeout(show, 220);
      } else { show(); card.classList.add('flipped'); }
      btn.textContent = 'Másik kérdést kérek';
      var nx = document.getElementById('draw-next'); if (nx) nx.hidden = false;
    };
    btn.addEventListener('click', drawFn);
    card.addEventListener('click', drawFn);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drawFn(); } });
  }
  var arc = document.querySelector('.scroll-arc path'), sec = document.querySelector('.steps-sec');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (arc && sec && arc.getTotalLength && !reduce) {
    var L = arc.getTotalLength();
    arc.style.strokeDasharray = L; arc.style.strokeDashoffset = L;
    var on = false;
    var upd = function () {
      var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
      arc.style.strokeDashoffset = L * (1 - p);
      on = false;
    };
    window.addEventListener('scroll', function () { if (!on) { on = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }
})();
