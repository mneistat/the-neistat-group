/* Shared inquiry handling. Personal values are sent only to the form endpoint. */
(function () {
  'use strict';
  var contexts = { 'lincoln-park': 'Lincoln Park', lakeview: 'Lakeview' };
  var query = new URLSearchParams(window.location.search);
  document.querySelectorAll('form[data-success-id]').forEach(function (form) {
    var success = document.getElementById(form.dataset.successId);
    var error = document.getElementById(form.dataset.errorId);
    var button = form.querySelector('[type="submit"]');
    var label = button.querySelector('span') || button;
    var originalLabel = label.textContent;
    var intent = form.querySelector('[name="visitor_intent"]');
    var choice = form.querySelector('[name="interest"], [name="intent"]');
    var pageUrl = form.querySelector('[name="page_url"]');
    var sending = false;
    // Center the first invalid field so its label clears the fixed navigation.
    // Native validation remains available when JavaScript is disabled.
    form.noValidate = true;
    if (pageUrl) pageUrl.value = window.location.href;
    if (choice && Array.from(choice.options).some(function (opt) { return opt.value && opt.value === query.get('intent'); })) choice.value = query.get('intent');
    function syncIntent() { if (choice && intent) intent.value = choice.value; }
    syncIntent();
    if (choice) choice.addEventListener('change', syncIntent);
    var context = form.querySelector('[name="neighborhood"]');
    if (context && contexts[query.get('neighborhood')]) {
      context.value = contexts[query.get('neighborhood')];
      context.closest('[data-neighborhood-context]').hidden = false;
    }
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (sending) return;
      form.querySelectorAll('input[type="text"][required], input[type="email"][required]').forEach(function (field) { field.value = field.value.trim(); });
      if (!form.checkValidity()) {
        var invalid = form.querySelector(':invalid');
        if (invalid) {
          invalid.focus({ preventScroll: true });
          var group = invalid.closest('.form-group, .cta-form-group, .lead-form-group') || invalid;
          if (group.scrollIntoView) group.scrollIntoView({ block: 'center', behavior: 'instant' });
          invalid.reportValidity();
        }
        return;
      }
      error.textContent = '';
      error.classList.remove('show');
      if (pageUrl) pageUrl.value = window.location.href;
      syncIntent();
      sending = true;
      button.disabled = true;
      label.textContent = 'Sending…';
      form.setAttribute('aria-busy', 'true');
      try {
        var response = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!response.ok) {
          var data = await response.json().catch(function () { return null; });
          throw new Error(data && Array.isArray(data.errors)
            ? data.errors.map(function (item) { return item.message; }).join(' ')
            : 'Your request could not be sent. Please try again or email matt@theneistatgroup.com.');
        }
        form.hidden = true;
        success.classList.add('show');
        success.focus();
        try {
          if (typeof window.gtag === 'function') window.gtag('event', 'lead_form_submit', {
            form_type: form.dataset.formType,
            visitor_intent: intent && intent.value || '(none)',
            source_page: (form.querySelector('[name="source_page"]') || {}).value || 'other'
          });
        } catch (_) { /* Analytics cannot change a successful delivery outcome. */ }
      } catch (failure) {
        error.textContent = failure instanceof TypeError
          ? 'Network error — your request was not sent. Your entries are still here. Try again or email matt@theneistatgroup.com.'
          : failure.message;
        error.classList.add('show');
      } finally {
        sending = false;
        button.disabled = false;
        label.textContent = originalLabel;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();
