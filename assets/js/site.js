/* HESPOR Funding — site behaviour */
(function () {
  'use strict';
  /* Lead delivery: FormSubmit (formsubmit.co) emails every request to this inbox. */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@hespor.com';

  var D = document, H = D.documentElement;
  var L = (H.lang || 'en').indexOf('fa') === 0 ? 'fa' : 'en';
  function $(s, c) { return (c || D).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); }
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  function latin(s) { return String(s || '').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }); }
  function num(s) { return parseFloat(latin(s).replace(/[^0-9.]/g, '')); }
  function money(n) { n = Math.round(n); return L === 'fa' ? n.toLocaleString('fa-IR') + ' دلار' : '$' + n.toLocaleString('en-CA'); }
  function dec(n) { return Number(n).toLocaleString(L === 'fa' ? 'fa-IR' : 'en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  var T = {
    en: {
      note: 'The total stays the same whether you repay over 6, 12, 18 or 24 months. A longer term only lowers each payment.',
      okT: 'You likely meet the minimums', okP: 'Your business fits the lending partner’s main criteria. Request your options and we will introduce you the same business day.', okB: 'Request my options',
      noT: 'You may not meet the minimums yet', noP: 'Our lending partner funds Canadian businesses with at least 6 months in operation and $10,000+ in monthly revenue. You can still send your details and we will tell you honestly if there is a fit.', noB: 'Send my details anyway',
      req: 'Please complete this field.', choose: 'Please choose an option.', email: 'Enter a valid email, e.g. name@business.ca', phone: 'Enter a 10-digit phone number, e.g. 604-555-0123', consent: 'Please confirm we may contact you about this request.',
      sending: 'Sending…', fail: 'We could not send your request. Please try again or email info@hespor.com.', subj: 'New funding request'
    },
    fa: {
      note: 'جمع بازپرداخت چه در ۶، ۱۲، ۱۸ یا ۲۴ ماه، ثابت می‌ماند. مدت طولانی‌تر فقط هر قسط را کوچک‌تر می‌کند.',
      okT: 'به احتمال زیاد حداقل شرایط را دارید', okP: 'کسب‌وکار شما با معیارهای اصلی شریک تأمین مالی ما جور است. درخواست‌تان را بفرستید تا همان روز کاری معرفی‌تان کنیم.', okB: 'درخواست گزینه‌ها',
      noT: 'شاید هنوز به حداقل شرایط نرسیده باشید', noP: 'شریک تأمین مالی ما به کسب‌وکارهای کانادایی با دست‌کم ۶ ماه سابقه و بیش از ۱۰٬۰۰۰ دلار درآمد ماهانه سرمایه می‌دهد. باز هم می‌توانید اطلاعات‌تان را بفرستید؛ صادقانه می‌گوییم راهی هست یا نه.', noB: 'اطلاعاتم را می‌فرستم',
      req: 'لطفاً این بخش را کامل کنید.', choose: 'لطفاً یک گزینه انتخاب کنید.', email: 'یک ایمیل معتبر وارد کنید، مثلاً name@business.ca', phone: 'شمارهٔ ۱۰ رقمی وارد کنید، مثلاً 604-555-0123', consent: 'لطفاً تأیید کنید که می‌توانیم دربارهٔ این درخواست با شما تماس بگیریم.',
      sending: 'در حال ارسال…', fail: 'درخواست ارسال نشد. لطفاً دوباره امتحان کنید یا به info@hespor.com ایمیل بزنید.', subj: 'New funding request (Persian)'
    }
  }[L];

  /* Mobile nav */
  var burger = $('.burger'), mnav = $('#mnav');
  if (burger && mnav) burger.addEventListener('click', function () {
    var open = mnav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    D.body.classList.toggle('nav-open', open);
  });

  /* Range fill */
  function fill(r) { var p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); }
  $$('input[type=range]').forEach(function (r) { fill(r); r.addEventListener('input', function () { fill(r); }); });

  /* UTM capture */
  (function () {
    var p = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (p.get(k)) store.set('hf_' + k, p.get(k)); });
    if (!store.get('hf_ref') && D.referrer && D.referrer.indexOf(location.host) === -1) store.set('hf_ref', D.referrer);
    if (!store.get('hf_landing')) store.set('hf_landing', location.pathname);
  })();

  /* Calculator */
  var calc = $('#calc');
  if (calc) {
    var a = $('#c-amt'), f = $('#c-fac');
    var out = function (id) { return $('#' + id, calc); };
    function term() { var r = $('input[name=c-term]:checked', calc); return r ? +r.value : 12; }
    function up() {
      var A = +a.value, F = +f.value, M = term(), tot = A * F;
      out('o-amt').textContent = money(A); out('o-fac').textContent = dec(F);
      out('r-tot').textContent = money(tot); out('r-get').textContent = money(A); out('r-cost').textContent = money(tot - A);
      out('r-wk').textContent = money(tot / (M * 52 / 12)); out('r-day').textContent = money(tot / (M * 21));
      out('r-note').textContent = T.note; store.set('hf_calc', String(A));
      var q = out('c-go'); if (q) q.href = q.getAttribute('data-base') + '?amount=' + A;
    }
    [a, f].forEach(function (x) { x.addEventListener('input', up); });
    $$('input[name=c-term]', calc).forEach(function (r) { r.addEventListener('change', up); });
    up();
  }

  /* Eligibility */
  var el = $('#elig');
  if (el) {
    var res = $('#elig-res');
    function chk() {
      var t = $('input[name=e-t]:checked', el), r = $('input[name=e-r]:checked', el), c = $('input[name=e-c]:checked', el);
      if (!t || !r || !c) return;
      var ok = t.value !== 'lt6' && r.value !== 'lt10' && c.value === 'yes';
      res.className = 'res ' + (ok ? 'ok' : 'no'); res.hidden = false;
      $('h3', res).textContent = ok ? T.okT : T.noT; $('p', res).textContent = ok ? T.okP : T.noP;
      var b = $('a', res); b.textContent = ok ? T.okB : T.noB;
      b.href = b.getAttribute('data-base') + '?rev=' + r.value + '&time=' + t.value;
      store.set('hf_elig', ok ? 'Likely eligible' : 'Below minimums');
    }
    $$('input', el).forEach(function (i) { i.addEventListener('change', chk); });
  }

  /* Application form */
  var form = $('#apply-form');
  if (form) {
    var steps = $$('.step', form), prog = $$('.prog li'), cur = 0, status = $('#fstatus');
    function show(i) {
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      prog.forEach(function (p, k) { p.className = k < i ? 'done' : (k === i ? 'cur' : ''); });
      cur = i;
    }
    function setErr(elm, msg) {
      var box = D.getElementById((elm.id || elm.name) + '-err');
      if (elm.setAttribute) elm.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (box) { box.textContent = msg || ''; box.classList.toggle('show', !!msg); }
      return !msg;
    }
    function v(elm) {
      var val = (elm.value || '').trim();
      if (elm.type === 'checkbox') return setErr(elm, elm.checked ? '' : T.consent);
      if (elm.required && !val) return setErr(elm, elm.tagName === 'SELECT' ? T.choose : T.req);
      if (elm.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return setErr(elm, T.email);
      if (elm.type === 'tel' && val) { var d = latin(val).replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); if (d.length !== 10) return setErr(elm, T.phone); }
      return setErr(elm, '');
    }
    function vStep(i) {
      var s = steps[i], first = null;
      var groups = {};
      $$('input[type=radio][required]', s).forEach(function (r) { groups[r.name] = true; });
      Object.keys(groups).forEach(function (g) {
        var ok = !!$('input[name="' + g + '"]:checked', s), box = D.getElementById(g + '-err');
        if (box) { box.textContent = ok ? '' : T.choose; box.classList.toggle('show', !ok); }
        if (!ok && !first) first = $('input[name="' + g + '"]', s);
      });
      $$('input:not([type=radio]):not([type=hidden]),select,textarea', s).forEach(function (e) {
        if (e.closest('.hp')) return;
        if (!v(e) && !first) first = e;
      });
      if (first) first.focus();
      return !first;
    }
    $$('input,select,textarea', form).forEach(function (e) {
      e.addEventListener('input', function () { if (e.getAttribute('aria-invalid') === 'true') v(e); });
      e.addEventListener('change', function () {
        if (e.getAttribute('aria-invalid') === 'true') v(e);
        if (e.type === 'radio') { var b = D.getElementById(e.name + '-err'); if (b) b.classList.remove('show'); }
      });
      e.addEventListener('blur', function () { if (e.value && /email|tel/.test(e.type)) v(e); });
    });
    $$('[data-next]', form).forEach(function (b) { b.addEventListener('click', function () { if (vStep(cur)) { show(cur + 1); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }); });
    $$('[data-prev]', form).forEach(function (b) { b.addEventListener('click', function () { show(cur - 1); }); });

    /* Prefill from links (hero quick form, calculator, eligibility) */
    var qp = new URLSearchParams(location.search), amt = num(qp.get('amount') || store.get('hf_calc') || '');
    if (!isNaN(amt)) {
      var tiles = $$('input[name=amount]', form), pick = null;
      tiles.forEach(function (t) { var lo = +t.getAttribute('data-lo'), hi = +t.getAttribute('data-hi'); if (amt >= lo && amt <= hi) pick = t; });
      if (pick) pick.checked = true;
    }
    var revMap = { lt10: 'Under $10,000', '10-25': '$10,000 – $25,000', '25-50': '$25,000 – $50,000', '50-100': '$50,000 – $100,000', '100+': 'Over $100,000' };
    if (qp.get('rev') && revMap[qp.get('rev')]) $('#f-rev').value = revMap[qp.get('rev')];
    var timeMap = { lt6: 'Less than 6 months', '6-12': '6 to 12 months', '1-3': '1 to 3 years', '3+': 'More than 3 years' };
    if (qp.get('time') && timeMap[qp.get('time')]) $('#f-time').value = timeMap[qp.get('time')];
    if (qp.get('industry')) { var fi = $('#f-type'); $$('option', fi).forEach(function (o) { if (o.value === qp.get('industry')) fi.value = o.value; }); }
    show(0);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      for (var i = 0; i < steps.length; i++) { if (!vStep(i)) { show(i); return; } }
      if ($('input[name=_honey]', form).value) return;
      var now = new Date(), g = function (id) { var x = D.getElementById(id); return x ? x.value.trim() : ''; };
      var amtR = $('input[name=amount]:checked', form), lang = $('input[name=f-lang]:checked', form);
      var data = {
        'Full name': g('f-name'), 'Business name': g('f-biz'), 'City': g('f-city'), 'Province': g('f-prov'),
        'Phone': latin(g('f-phone')), 'Email': g('f-email'),
        'Type of business': g('f-type'), 'Time in business': g('f-time'), 'Average monthly revenue': g('f-rev'),
        'Amount needed': amtR ? amtR.value : '', 'Use of funds': g('f-use'), 'Details': g('f-detail') || '-',
        'Preferred language': lang ? lang.value : '', 'Consent to be contacted': 'Yes',
        'Submitted (Vancouver time)': now.toLocaleString('en-CA', { timeZone: 'America/Vancouver', dateStyle: 'full', timeStyle: 'long' }),
        'Submitted (UTC)': now.toISOString(),
        'Site language': L === 'fa' ? 'Persian' : 'English',
        'Landing page': store.get('hf_landing') || location.pathname,
        'Eligibility check': store.get('hf_elig') || 'Not used',
        'Traffic source': [store.get('hf_utm_source'), store.get('hf_utm_medium'), store.get('hf_utm_campaign')].filter(Boolean).join(' / ') || store.get('hf_ref') || 'Direct',
        _subject: T.subj + ': ' + (g('f-biz') || g('f-name')) + ' (' + (amtR ? amtR.value : '') + ')',
        _replyto: g('f-email'), _template: 'table', _captcha: 'false'
      };
      ['utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (store.get('hf_' + k)) data[k] = store.get('hf_' + k); });
      var btn = $('#f-submit'), lbl = btn.innerHTML; btn.disabled = true; btn.textContent = T.sending; status.hidden = true;
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (r) {
          if (!r.ok || String(r.j.success) === 'false') throw new Error('fail');
          form.hidden = true; $('.prog') && ($('.prog').hidden = true);
          var s = $('#f-success'); s.hidden = false; s.focus(); s.scrollIntoView({ block: 'center' });
          window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'generate_lead', form: 'funding_application', language: L, amount_range: amtR ? amtR.value : '' });
          if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { currency: 'CAD' });
          if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
        })
        .catch(function () { status.textContent = T.fail; status.hidden = false; btn.disabled = false; btn.innerHTML = lbl; });
    });
  }

  /* Mobile sticky CTA hides near forms and the footer */
  var m = $('.mcta');
  if (m && 'IntersectionObserver' in window) {
    var targets = $$('#apply-form, .cta, .ftr, #f-success');
    var vis = new Set();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) vis.add(x.target); else vis.delete(x.target); });
      m.classList.toggle('hide', vis.size > 0);
    }, { threshold: 0.01 });
    targets.forEach(function (t) { io.observe(t); });
  }
  var y = $('#yr'); if (y) y.textContent = L === 'fa' ? new Date().getFullYear().toLocaleString('fa-IR', { useGrouping: false }) : new Date().getFullYear();
})();
