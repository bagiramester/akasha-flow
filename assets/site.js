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
