/* THE NEISTAT GROUP — GA4 conversion tracking.
 *
 * Reports which pathways produce leads. Only non-identifying values are ever
 * sent: page slugs, section slugs, intent slugs, and static UI labels that are
 * hard-coded in the markup. Names, email addresses, phone numbers, messages,
 * and property addresses are never read or transmitted.
 *
 * Every call is wrapped so that a blocked or failed GA load cannot break the
 * page. lead_form_submit is NOT fired here — each form's own handler fires it
 * after Formspree confirms success, so it is never counted twice.
 */
(function () {
  'use strict';

  function track(eventName, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    } catch (err) {
      /* analytics must never break the site */
    }
  }

  var PAGE_SLUGS = {
    '': 'homepage',
    'index.html': 'homepage',
    'contact.html': 'contact-page',
    'calculator.html': 'calculator-page',
    'about.html': 'about-page',
    'marketing.html': 'marketing-page',
    'selling-process.html': 'selling-process-page',
    'neighborhoods.html': 'neighborhoods-page',
    'vendors.html': 'vendors-page'
  };

  // Reuses the form's hidden source_page when the page has one, so the value
  // matches exactly what Formspree receives.
  function sourcePage() {
    var hidden = document.querySelector('input[name="source_page"]');
    if (hidden && hidden.value) return hidden.value;
    var file = window.location.pathname.split('/').pop();
    return PAGE_SLUGS[file] || 'other';
  }

  // Reuses the hidden visitor_intent (already seeded from ?intent= by the
  // contact form), falling back to the query parameter on pages without a form.
  function visitorIntent() {
    var hidden = document.querySelector('input[name="visitor_intent"]');
    if (hidden && hidden.value) return hidden.value;
    try {
      return new URLSearchParams(window.location.search).get('intent') || '(none)';
    } catch (err) {
      return '(none)';
    }
  }

  function intentFromHref(href) {
    var match = /[?&]intent=([^&#]*)/.exec(href || '');
    if (!match) return '(none)';
    try { return decodeURIComponent(match[1]) || '(none)'; } catch (err) { return match[1]; }
  }

  var SECTIONS = [
    ['.vendor-card', 'vendor-directory'],
    ['.mobile-menu', 'mobile-menu'],
    ['.nav', 'nav'],
    ['.footer', 'footer'],
    ['.decision-studio', 'decision-studio'],
    ['.start-here', 'start-here'],
    ['.contact-details', 'contact-details'],
    ['.cta-form-details', 'cta-form'],
    ['.contact-form', 'contact-form'],
    ['.cta-form', 'cta-form']
  ];

  function sourceSection(el) {
    if (!el || !el.closest) return 'page-body';
    for (var i = 0; i < SECTIONS.length; i++) {
      if (el.closest(SECTIONS[i][0])) return SECTIONS[i][1];
    }
    return 'page-body';
  }

  // Static pathway labels only. Never called for tel:/mailto: links, whose
  // text is a phone number or email address.
  function pathwayLabel(anchor) {
    var node = anchor.querySelector('.start-here-path-text, .decision-studio-q');
    var text = (node ? node.textContent : anchor.textContent) || '';
    return text.replace(/→/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function firedOnce(el, key) {
    var flag = '__ng_' + key;
    if (el[flag]) return true;
    el[flag] = true;
    return false;
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var page = sourcePage();

    // 1 & 4 & 5 — pathway, phone, and email clicks, via one delegated listener
    // so it also covers anything rendered after load.
    document.addEventListener('click', function (e) {
      var anchor = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!anchor) return;

      var pathway = anchor.closest('.start-here-path, .decision-studio-row');
      if (pathway) {
        if (firedOnce(pathway, 'path')) return;
        track('lead_path_click', {
          visitor_intent: intentFromHref(pathway.getAttribute('href')),
          source_section: sourceSection(pathway),
          link_text: pathwayLabel(pathway),
          source_page: page
        });
        return;
      }

      var href = anchor.getAttribute('href') || '';
      // No link_text here — it would be the phone number or email address.
      if (href.indexOf('tel:') === 0) {
        if (firedOnce(anchor, 'tel')) return;
        track('phone_click', { source_page: page, source_section: sourceSection(anchor) });
      } else if (href.indexOf('mailto:') === 0) {
        if (firedOnce(anchor, 'mail')) return;
        track('email_click', { source_page: page, source_section: sourceSection(anchor) });
      }
    }, true);

    // 2 — first interaction with the homepage or contact-page form, once each.
    [['ctaForm', 'homepage'], ['contactForm', 'contact-page']].forEach(function (pair) {
      var form = document.getElementById(pair[0]);
      if (!form) return;
      var started = false;
      function onFirstInteraction() {
        if (started) return;
        started = true;
        form.removeEventListener('focusin', onFirstInteraction);
        form.removeEventListener('change', onFirstInteraction);
        track('lead_form_start', {
          form_type: pair[1],
          visitor_intent: visitorIntent(),
          source_page: page
        });
      }
      form.addEventListener('focusin', onFirstInteraction);
      form.addEventListener('change', onFirstInteraction);
    });
  });
})();
