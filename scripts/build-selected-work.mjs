import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'selected-work-data.js'), 'utf8'), context);
const records = context.window.SELECTED_WORK.filter(t => t.publishStatus === 'public' && t.needsVerification === false);
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const join = values => values.filter(Boolean).map(escape).join(' · ');
const paragraph = (className, value) => value ? `<p class="${className}">${escape(value)}</p>` : '';
const sourceNotes = items => items.filter(t => t.pressMention && t.pressUrl)
  .map(t => `      <p>${escape(t.address)} · <a href="${escape(t.pressUrl)}">${escape(t.pressMention)}</a>.</p>`).join('\n');
const story = t => {
  const beats = [['challenge', 'The challenge'], ['strategy', 'The strategy'], ['outcome', 'The outcome']]
    .filter(([field]) => t.story?.[field]?.trim())
    .map(([field, label]) => `<div><dt>${label}</dt><dd>${escape(t.story[field])}</dd></div>`);
  return beats.length ? `\n      <dl class="sw-story sw-story--portfolio" aria-label="${escape('The story behind ' + t.address)}">${beats.join('')}</dl>` : '';
};
const ids = new Set();
for (const t of records) {
  if (!t.id || ids.has(t.id) || !t.address || !t.image || !t.imageAlt || !t.priceOrResult) throw new Error('Incomplete or duplicate public record: ' + t.id);
  if (!fs.existsSync(path.join(root, t.image))) throw new Error('Missing image: ' + t.image);
  ids.add(t.id);
}
function replace(file, marker, body) {
  const filename = path.join(root, file);
  const before = fs.readFileSync(filename, 'utf8');
  const start = `<!-- GENERATED: ${marker} START -->`;
  const end = `<!-- GENERATED: ${marker} END -->`;
  const a = before.indexOf(start), b = before.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error('Missing generation markers: ' + file);
  const after = before.slice(0, a + start.length) + '\n' + body.replace(/^[ \t]+$/gm, '') + '\n  ' + before.slice(b);
  if (process.argv.includes('--check')) {
    if (before !== after) throw new Error('Generated content is stale: ' + file);
  } else fs.writeFileSync(filename, after);
}
const portfolio = records.map((t, i) => `<section class="swp-assignment ${i === 0 ? 'swp-assignment--lead' : i % 2 ? 'swp-assignment--reverse' : ''}" id="${escape(t.id)}" aria-labelledby="heading-${escape(t.id)}">
    <div class="swp-assignment-inner">
      <figure class="swp-assignment-media${t.imageFit === 'contain' ? ' swp-assignment-media--contain' : ''}">
        <img src="${escape(t.image)}" alt="${escape(t.imageAlt)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
        ${t.imageCaption ? `<figcaption>${escape(t.imageCaption)}</figcaption>` : ''}
      </figure>
      <div class="swp-assignment-body">
        <p class="swp-feature-meta">${join([t.neighborhood, t.assetType])}</p>
        <h2 class="swp-feature-address" id="heading-${escape(t.id)}">${escape(t.address)}</h2>
        ${paragraph('swp-assignment-rep', t.representation)}
        <p class="swp-feature-price">${escape(t.priceOrResult)}</p>
        ${paragraph('swp-feature-note', t.resultHighlight || t.outcomeLine)}
        ${paragraph('swp-feature-tenants', t.tenants)}
      </div>${story(t)}
    </div>
  </section>`).join('\n\n');
replace('selected-work.html', 'portfolio', portfolio);
replace('selected-work.html', 'portfolio-sources', sourceNotes(records));
replace('selected-work.html', 'portfolio-index', records.map(t =>
  `      <a href="#${escape(t.id)}">${escape(t.address)}<span>${join([t.neighborhood, t.assetType])}</span></a>`
).join('\n'));

const proof = ['lake', 'wellington'].map(id => records.find(t => t.id === id)).filter(Boolean).map(t => `<article class="ss-deal">
            <p class="ss-deal-type">${join([t.assetType, t.neighborhood])}</p>
            <h3><a href="selected-work.html#${escape(t.id)}">${escape(t.address)}</a></h3>
            <p class="ss-deal-fig">${escape(t.priceOrResult)}</p>
            ${paragraph('ss-deal-out', t.outcomeLine)}
            ${paragraph('ss-deal-src', t.representation)}
          </article>`).join('\n          ');
replace('seller-strategy.html', 'seller-proof', proof);
replace('seller-strategy.html', 'seller-sources', sourceNotes(['lake', 'wellington'].map(id => records.find(t => t.id === id)).filter(Boolean)));

for (const [slug, name] of [['lincoln-park', 'Lincoln Park'], ['lakeview', 'Lakeview']]) {
  const nearby = records.filter(t => t.neighborhood === name);
  const body = `<section id="nearby-work" class="np-band np-band--cream">
      <div class="np-wrap">
        <h2 class="np-sect-label np-reveal">Selected Work Nearby</h2>
        <div class="np-work${nearby.length === 1 ? ' np-work--single' : ''} np-reveal">
          ${nearby.map(t => `<figure>
            <div class="np-work-fig"><img src="/${escape(t.image)}" alt="${escape(t.imageAlt)}" loading="lazy" width="840" height="560"></div>
            <figcaption>
              <h3><a href="/selected-work.html#${escape(t.id)}">${escape(t.address)} ↗</a></h3>
              <p class="np-work-meta">${join([t.assetType, t.representation])}</p>
              <p class="np-work-price">${escape(t.priceOrResult)}</p>
              ${paragraph('np-work-outcome', t.outcomeLine)}
            </figcaption>
          </figure>`).join('\n          ')}
        </div>
      </div>
    </section>`;
  replace(`neighborhoods/${slug}.html`, 'nearby-work', body);
}
console.log(`${records.length} public records; static proof ${process.argv.includes('--check') ? 'verified' : 'generated'}.`);
