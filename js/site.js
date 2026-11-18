// Acceleron Investments mockup: mobile menu + contact form (validation only, sending not yet connected).
(function () {
  // Scroll reveal: tag blocks, show them as they enter the viewport
  var sel = '.section h2, .section-tight h2, .head .lead, .who, .service, .steps li, .quote, .stat, .logo-cell, .team-teaser a, .person, .entry, .featured, .contact-card, .prose, .list-plain, .places, .cta-side, .case .note, .facts';
  var items = Array.prototype.slice.call(document.querySelectorAll(sel));
  items.forEach(function (el) {
    if (el.closest('.hero')) return;
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.classList.add('reveal');
    el.style.setProperty('--d', Math.min(sib, 6) * 0.08 + 's');
  });
  var watch = Array.prototype.slice.call(document.querySelectorAll('.reveal, .service, .on-dark'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    watch.forEach(function (el) { io.observe(el); });
  } else {
    watch.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Count-up for figures marked with data-count
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var fmt = function (n) { return Math.round(n).toLocaleString('en-GB'); };
    if (reduce || !('IntersectionObserver' in window)) return;
    var done = false;
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting || done) return;
      done = true; o.disconnect();
      var t0 = null;
      function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min((ts - t0) / 1400, 1);
        el.textContent = fmt(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(end);
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        toggle.focus();
      }
    });
  }

  var form = document.getElementById('contact-form');
  if (!form) return;

  // Preselect the topic from ?topic=call (the "Book a call" buttons)
  try {
    var topic = new URLSearchParams(location.search).get('topic');
    var select = form.querySelector('#f-topic');
    if (topic && select && select.querySelector('option[value="' + topic + '"]')) select.value = topic;
  } catch (e) {}

  var messages = {
    name: 'Please enter your name.',
    email: 'Please enter an email address we can reply to, e.g. name@company.co.uk.',
    topic: 'Please choose what you would like to discuss.',
    message: 'Please tell us briefly about your business and what you need.',
    phone: 'Please enter a valid phone number, or leave this field empty.',
    consent: 'Please confirm we may use these details to reply to you.'
  };

  function check(field) {
    var err = document.getElementById(field.id + '-error');
    var ok;
    if (field.type === 'checkbox') ok = field.checked;
    else if (field.required) ok = field.value.trim() !== '' && field.checkValidity();
    else ok = field.checkValidity();
    field.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (err) err.textContent = ok ? '' : (messages[field.name] || 'Please check this field.');
    return ok;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll('[required], input[type="email"], input[type="tel"]'));
  fields.forEach(function (f) {
    f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) check(f); });
    f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) check(f); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = document.getElementById('form-status');
    var firstBad = null;
    fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
    if (firstBad) {
      status.hidden = false;
      status.className = 'form-status bad';
      status.textContent = 'Some details are missing. Please check the highlighted fields.';
      firstBad.focus();
      return;
    }
    // TODO at launch: post to the Odoo website form (/website/form/...) or another mail handler.
    status.hidden = false;
    status.className = 'form-status ok';
    status.textContent = 'Thank you. This is a preview of the new site, so the form is not yet connected and nothing was sent. Please email info@acceleroninvest.com or call +44 203 287 5395.';
    status.focus();
  });
})();
