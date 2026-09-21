const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const { calculate, schedule } = require('../mortgage.js');
const { JSDOM } = createRequire(path.join(process.env.NEISTAT_TEST_DEPS || '/tmp/neistat-checks', 'package.json'))('jsdom');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
const scenario = { price: 500000, down: 20, rate: 6.5, term: 30, tax: 6000, insurance: 1800, hoa: 100 };
function page(file, query = '') {
  return new JSDOM(read(file), { url: 'https://www.theneistatgroup.com/' + file + query, runScripts: 'outside-only', pretendToBeVisual: true });
}

test('fixed-rate estimate has known payment and explicit non-loan costs', () => {
  const result = calculate(scenario);
  assert.ok(Math.abs(result.pi - 2528.2721) < 0.001);
  assert.ok(Math.abs(result.monthly - result.pi - 750) < 0.000001);
});
test('zero interest and cash purchases remain finite', () => {
  assert.equal(calculate({ ...scenario, rate: 0 }).pi, 400000 / 360);
  const cash = calculate({ ...scenario, down: 100 });
  assert.equal(cash.pi, 0); assert.equal(cash.totalInterest, 0); assert.equal(cash.monthly, 750);
  assert.ok(schedule(cash).every(row => row.balance === 0 && row.payment === 0));
});
test('invalid financial values cannot lower a displayed estimate', () => {
  for (const key of ['price', 'down', 'rate', 'tax', 'insurance', 'hoa']) {
    for (const value of [-1, NaN, Infinity, '', null]) assert.throws(() => calculate({ ...scenario, [key]: value }), RangeError);
  }
  assert.throws(() => calculate({ ...scenario, down: 101 }), RangeError);
  assert.throws(() => calculate({ ...scenario, term: 0 }), RangeError);
});
test('amortization reconciles principal, interest and final balance', () => {
  for (const term of [10, 15, 20, 30]) for (const rate of [0, 0.000001, 3, 6.5, 15]) {
    const result = calculate({ ...scenario, term, rate });
    const rows = schedule(result);
    assert.equal(rows.length, term * 12);
    assert.ok(rows.every(row => row.payment >= 0 && row.principal >= 0 && row.interest >= 0 && row.balance >= 0));
    assert.ok(Math.abs(rows.reduce((sum, row) => sum + row.principal, 0) - result.loan) < 0.00001);
    assert.ok(Math.abs(rows.reduce((sum, row) => sum + row.interest, 0) - result.totalInterest) < 0.00001);
    assert.ok(rows.at(-1).balance < 0.00001);
  }
});

for (const [file, id] of [['index.html', 'ctaForm'], ['contact.html', 'contactForm'], ['calculator.html', 'buyerForm'], ['calculator.html', 'sellerForm']]) {
  test(file + ' / ' + id + ': invalid, duplicate, failure, retry and success flows', async () => {
    const dom = page(file), w = dom.window, d = w.document;
    const form = d.getElementById(id); assert.ok(form);
    assert.notEqual(form.getAttribute('role'), 'status', 'The whole form must not be a live region');
    let calls = 0, resolveRequest, events = 0;
    w.fetch = () => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); };
    w.gtag = () => { events++; };
    w.eval(read('forms.js'));
    const submit = () => form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
    submit(); assert.equal(calls, 0);
    for (const input of form.querySelectorAll('input[required]')) {
      input.value = input.type === 'email' ? 'test@example.com' : input.type === 'number' ? '750000' : 'Test request';
    }
    const email = form.querySelector('input[type="email"]');
    email.value = 'invalid'; submit(); assert.equal(calls, 0); email.value = 'test@example.com';
    const name = form.querySelector('input[type="text"][required]');
    name.value = '   '; submit(); assert.equal(calls, 0); name.value = 'Test request';
    submit(); submit(); assert.equal(calls, 1); assert.equal(form.querySelector('[type="submit"]').disabled, true);
    resolveRequest({ ok: false, json: async () => ({ errors: [{ message: 'Please retry.' }] }) }); await tick();
    assert.equal(events, 0); assert.equal(email.value, 'test@example.com'); assert.equal(form.hidden, false);
    assert.ok(d.getElementById(form.dataset.errorId).textContent.includes('retry'));
    submit(); assert.equal(calls, 2);
    resolveRequest({ ok: true }); await tick();
    assert.equal(events, 1); assert.equal(form.hidden, true);
    assert.equal(d.activeElement.id, form.dataset.successId);
    dom.window.close();
  });
}
test('guide inquiry context and recognized intent reach the contact form', () => {
  const dom = page('contact.html', '?neighborhood=lakeview&intent=buying-home');
  dom.window.eval(read('forms.js'));
  const d = dom.window.document;
  assert.equal(d.querySelector('[name="neighborhood"]').value, 'Lakeview');
  assert.equal(d.querySelector('[data-neighborhood-context]').hidden, false);
  assert.equal(d.querySelector('[name="visitor_intent"]').value, 'buying-home');
  dom.window.close();
});
test('invalid inquiry focuses the first field and centers its label without sending', () => {
  const dom = page('index.html'), w = dom.window, d = w.document;
  const name = d.getElementById('homeName');
  let scrolled = false;
  name.closest('.cta-form-group').scrollIntoView = options => { scrolled = options.block === 'center'; };
  w.fetch = () => { throw new Error('Invalid forms must not submit'); };
  w.eval(read('forms.js'));
  d.getElementById('ctaForm').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(d.activeElement, name);
  assert.equal(scrolled, true);
  dom.window.close();
});
test('optional intent can be cleared after a contextual link preselects it', () => {
  const dom = page('contact.html', '?intent=investment-review'), w = dom.window, d = w.document;
  w.eval(read('forms.js'));
  const choice = d.getElementById('interest');
  assert.equal(choice.querySelector('option[value=""]').disabled, false);
  choice.value = '';
  choice.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(d.querySelector('[name="visitor_intent"]').value, '');
  dom.window.close();
});
test('calculator preserves the last valid result, supports exact input and keyboard disclosures', () => {
  const dom = page('calculator.html'), w = dom.window, d = w.document;
  w.eval(read('mortgage.js')); w.eval(read('affordability.js'));
  const input = (id, value) => { const field = d.getElementById(id); field.value = value; field.dispatchEvent(new w.Event('input', { bubbles: true })); };
  const before = d.getElementById('monthlyPayment').textContent;
  assert.equal(d.getElementById('compactPayment').textContent, before);
  input('taxInput', '-1000');
  assert.equal(d.getElementById('taxInput').getAttribute('aria-invalid'), 'true');
  assert.equal(d.getElementById('monthlyPayment').textContent, before);
  assert.match(d.getElementById('calcError').textContent, /last valid/);
  assert.match(d.getElementById('compactEstimateLabel').textContent, /Last valid/);
  assert.equal(d.getElementById('compactPayment').textContent, before);
  input('taxInput', '6000'); input('priceInput', '812345');
  assert.equal(d.getElementById('buyerPrice').value, '812345');
  input('buyerPrice', '900000'); input('priceInput', '820000');
  assert.equal(d.getElementById('buyerPrice').value, '900000');
  input('downInput', '100'); input('rateInput', '0');
  assert.equal(d.getElementById('loanDisplay').textContent, '$0');
  assert.equal(d.getElementById('compactPayment').textContent, d.getElementById('monthlyPayment').textContent);
  d.getElementById('amortToggle').click();
  assert.equal(d.getElementById('amortToggle').getAttribute('aria-expanded'), 'true');
  const year = d.querySelector('.amort-year-button'); year.click();
  assert.equal(year.getAttribute('aria-expanded'), 'true');
  assert.equal(d.getElementById('amort-month-1').hidden, false);
  const faq = d.querySelector('.faq-q'); faq.click();
  assert.equal(faq.getAttribute('aria-expanded'), 'true');
  assert.equal(d.getElementById(faq.getAttribute('aria-controls')).hidden, false);
  dom.window.close();
});
test('neighborhood guides identify their parent in desktop and mobile navigation', () => {
  const dom = page('neighborhoods/lakeview.html'), w = dom.window, d = w.document;
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.eval(read('nav.js'));
  const current = [...d.querySelectorAll('.nav-links [aria-current], .mobile-menu-link[aria-current]')];
  assert.equal(current.length, 2);
  for (const link of current) {
    assert.equal(link.textContent, 'Neighborhoods');
    assert.equal(link.getAttribute('aria-current'), 'location');
  }
  dom.window.close();
});
test('mobile menu isolates the page, contains focus and restores focus on Escape', () => {
  const dom = page('contact.html'), w = dom.window, d = w.document;
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.eval(read('nav.js'));
  const toggle = d.getElementById('navToggle'), menu = d.getElementById('mobileMenu');
  assert.equal(menu.hidden, true); toggle.click();
  assert.equal(menu.hidden, false); assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(d.querySelector('main').inert, true); assert.equal(d.activeElement, menu.querySelector('a'));
  menu.querySelectorAll('a')[7].focus();
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  assert.equal(d.activeElement, toggle);
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(menu.hidden, true); assert.equal(d.querySelector('main').inert, false); assert.equal(d.activeElement, toggle);
  dom.window.close();
});

test('publication gates and static portfolio stay aligned', () => {
  execFileSync(process.execPath, ['scripts/build-selected-work.mjs', '--check'], { cwd: root });
  const context = { window: {} }; vm.runInNewContext(read('selected-work-data.js'), context);
  const dom = page('selected-work.html');
  for (const record of context.window.SELECTED_WORK) {
    const expected = record.publishStatus === 'public' && record.needsVerification === false;
    assert.equal(!!dom.window.document.getElementById(record.id), expected);
  }
  assert.equal(dom.window.document.getElementById('elm'), null);
  dom.window.close();
});

test('all pages have valid scripts, main landmarks, local links and unique IDs', () => {
  const files = fs.readdirSync(root).filter(f => f.endsWith('.html')).concat(['neighborhoods/lincoln-park.html', 'neighborhoods/lakeview.html']);
  const documents = new Map(files.map(file => [file, page(file)]));
  for (const [file, dom] of documents) {
    const d = dom.window.document;
    assert.equal(d.querySelectorAll('main').length, 1, file);
    const ids = [...d.querySelectorAll('[id]')].map(el => el.id);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs in ' + file);
    for (const script of d.querySelectorAll('script:not([src])')) {
      if (script.type === 'application/ld+json') JSON.parse(script.textContent);
      else new vm.Script(script.textContent, { filename: file });
    }
    for (const el of d.querySelectorAll('a[href], img[src], script[src], link[rel="stylesheet"]')) {
      const raw = el.getAttribute('href') || el.getAttribute('src');
      const url = new URL(raw, dom.window.location.href);
      if (url.origin !== 'https://www.theneistatgroup.com') continue;
      let target = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
      if (!path.extname(target)) target += '.html';
      assert.ok(fs.existsSync(path.join(root, target)), file + ' → ' + raw);
      if (url.hash && documents.has(target)) assert.ok(documents.get(target).window.document.getElementById(decodeURIComponent(url.hash.slice(1))), file + ' → ' + raw);
    }
    assert.doesNotMatch(d.body.textContent.replace(/\s+/g, ' '), /Coming soon|Figures to be confirmed|130M\+|1183 Elm|1185 Elm/);
  }
  documents.forEach(dom => dom.window.close());
});
