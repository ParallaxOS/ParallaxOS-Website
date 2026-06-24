/* ParallaxOS — site behaviour
   Mobile nav, parallax orbs, scroll reveal, hero dashboard tilt,
   FAQ keyboard support, ROI calculator, contact form stub,
   Edge Mode connectivity banner, current year stamp.
*/
(function () {
  'use strict';

  // ---- Skip link + main landmark (a11y) ----
  (function () {
    var main = document.querySelector('main');
    if (main && !document.querySelector('.skip-link')) {
      if (!main.id) main.id = 'main-content';
      var sk = document.createElement('a');
      sk.className = 'skip-link'; sk.href = '#' + main.id; sk.textContent = 'Skip to content';
      document.body.insertBefore(sk, document.body.firstChild);
    }
  })();

  // ---- Year stamp ----
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Mobile menu toggle ----
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    // close on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
    // close on Escape (a11y)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ---- Parallax orbs (cheap mouse parallax on hero) ----
  var hero = document.querySelector('.hero');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var orbs = hero.querySelectorAll('.orb');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      orbs.forEach(function (orb, i) {
        var depth = (i + 1) * 12;
        orb.style.transform = 'translate(' + (x * depth) + 'px, ' + (y * depth) + 'px)';
      });
    });
  }

  // ---- Hero dashboard tilt on scroll ----
  var dash = document.querySelector('.dash-frame');
  if (dash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    function updateDash() {
      var rect = dash.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var ratio = Math.max(0, Math.min(1, 1 - (rect.top / vh)));
      var rotateX = Math.max(0, 6 - ratio * 6);
      dash.style.transform = 'rotateX(' + rotateX + 'deg)';
    }
    document.addEventListener('scroll', updateDash, { passive: true });
    updateDash();
  }

  // ---- Scroll reveal ----
  // Strategy: content is visible by default in CSS. We OPT IN to the animation
  // by adding .js-reveal (which is opacity:0), then add .visible on intersection.
  // A 1500ms safety timeout forces all remaining .reveal to .visible regardless,
  // so a stuck observer can never leave content invisible.
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    // Opt into the animation
    revealEls.forEach(function (el) { el.classList.add('js-reveal'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });

    // Safety net — force everything visible after 1.5s no matter what
    setTimeout(function () {
      document.querySelectorAll('.js-reveal:not(.visible)').forEach(function (el) {
        el.classList.add('visible');
      });
    }, 1500);
  }
  // (Without IO, .reveal stays at its CSS default of opacity:1 — already visible.)

  // ---- Active nav link based on filename ----
  (function () {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop();
      if (href === path) a.classList.add('active');
    });
  })();

  // ---- Edge Mode banner: show when offline ----
  var banner = document.querySelector('.edge-banner');
  if (banner) {
    function setEdge() {
      banner.classList.toggle('active', !navigator.onLine);
    }
    window.addEventListener('online', setEdge);
    window.addEventListener('offline', setEdge);
    setEdge();
  }

  // ---- Contact form → Supabase request-demo edge function ----
  // Anon key is the public, RLS-protected project key (same one shipped in the
  // app bundle); the edge function does its own authorization + rate limiting.
  var SUPABASE_URL = 'https://ehmbjfrndqwaavqljxqa.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobWJqZnJuZHF3YWF2cWxqeHFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDE5ODMsImV4cCI6MjA5NDA3Nzk4M30.TZeV7vwmb6XOkenC3kIq653q47qZikoKwnzMj_Dw5w4';
  var form = document.querySelector('form[data-contact]');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form));
      if (!data.name || !data.email || !data.website) {
        if (status) { status.textContent = 'Please complete your name, email and company website.'; status.style.color = 'var(--status-blocked)'; }
        return;
      }
      // request-demo stores name/email/company/role/why_interested + the
      // adaptive-demo fields (website_url, social_links, industry, logo) that
      // drive the website/social deep-dive and the co-branded demo. Fold the
      // remaining extras (worker count, networks, mobile, org type) into
      // why_interested so nothing is lost.
      var why = (data.message || '').trim();
      var ctx = [];
      if (data.workers)  ctx.push('Workers: ' + data.workers);
      if (data.networks) ctx.push('Networks: ' + data.networks);
      if (data.phone)    ctx.push('Mobile: ' + data.phone);
      if (data.orgtype)  ctx.push('Org type: ' + data.orgtype);
      if (ctx.length) why = (why ? why + '\n\n' : '') + '[' + ctx.join(' · ') + ']';

      // Read the optional logo to a data URL (≤ 4 MB) before sending. The logo
      // is optional — a read failure just sends the request without it.
      var logoInput = form.querySelector('#logo');
      var file = logoInput && logoInput.files && logoInput.files[0];
      if (file && file.size > 4 * 1024 * 1024) {
        if (status) { status.style.color = 'var(--status-blocked)'; status.textContent = 'Logo must be under 4 MB.'; }
        return;
      }

      if (status) { status.style.color = 'var(--text-secondary)'; status.textContent = 'Sending your request…'; }
      if (submitBtn) submitBtn.disabled = true;

      function send(logoData, logoName) {
        fetch(SUPABASE_URL + '/functions/v1/request-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON, 'Authorization': 'Bearer ' + SUPABASE_ANON },
          body: JSON.stringify({
            name: data.name, email: data.email, company: data.company || '', role: '',
            tier: data.tier || 'professional', why_interested: why,
            website_url: data.website, social_links: data.social_links || '', industry: data.industry || '',
            logo_data: logoData || '', logo_name: logoName || ''
          })
        }).then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) { return { ok: res.ok, body: body }; });
        }).then(function (r) {
          if (!r.ok || (r.body && r.body.error)) {
            var msg = (r.body && r.body.error === 'too_many_requests')
              ? (r.body.detail || 'You have already requested a demo recently — we will be in touch shortly.')
              : ((r.body && r.body.detail) || 'Something went wrong sending your request. Please email support@parallaxos.com.au.');
            if (status) { status.style.color = 'var(--status-blocked)'; status.textContent = msg; }
            return;
          }
          if (status) { status.style.color = 'var(--status-cleared)'; status.textContent = 'Thanks ' + data.name + ' — your request is in. We will reply within one business day with your tailored demo login.'; }
          form.reset();
        }).catch(function () {
          if (status) { status.style.color = 'var(--status-blocked)'; status.textContent = 'Network error — please email support@parallaxos.com.au and we will sort it out.'; }
        }).then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
      }

      if (file) {
        var reader = new FileReader();
        reader.onload  = function () { send(String(reader.result || ''), file.name); };
        reader.onerror = function () { send('', ''); };  // logo optional — send without it
        reader.readAsDataURL(file);
      } else {
        send('', '');
      }
    });
  }

  // ---- ROI calculator on pricing page ----
  var roi = document.querySelector('[data-roi]');
  if (roi) {
    var workersIn = roi.querySelector('[data-workers]');
    var rateIn    = roi.querySelector('[data-rate]');
    var hoursIn   = roi.querySelector('[data-hours]');
    var workersOut = roi.querySelector('[data-out-workers]');
    var rateOut    = roi.querySelector('[data-out-rate]');
    var hoursOut   = roi.querySelector('[data-out-hours]');
    var monthlyOut = roi.querySelector('[data-out-monthly]');
    var annualOut  = roi.querySelector('[data-out-annual]');
    var roiOut     = roi.querySelector('[data-out-roi]');
    var planOut    = roi.querySelector('[data-out-plan]');

    function fmt(n) { return '$' + Math.round(n).toLocaleString('en-AU'); }
    function recalc() {
      var w = +workersIn.value;
      var r = +rateIn.value;
      var h = +hoursIn.value;
      workersOut.textContent = w;
      rateOut.textContent = '$' + r + '/hr';
      hoursOut.textContent = h + 'h';
      var monthly = h * r;
      var planCost = w <= 5 ? 599 : w <= 15 ? 999 : 1999; // Enterprise estimate
      var planLabel = w <= 5 ? 'Starter $599/mo' : w <= 15 ? 'Professional $999/mo' : 'Enterprise (est. $1,999/mo)';
      var net = monthly - planCost;
      var ratio = monthly / planCost;
      monthlyOut.textContent = fmt(monthly);
      annualOut.textContent  = fmt(monthly * 12);
      roiOut.textContent = ratio.toFixed(1) + '×';
      planOut.textContent = planLabel + ' · saves ' + fmt(net) + '/mo';
    }
    [workersIn, rateIn, hoursIn].forEach(function (el) { el && el.addEventListener('input', recalc); });
    recalc();
  }
})();
