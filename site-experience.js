/* Optional motion and guide orientation. All content and links work without it. */
(function () {
  'use strict';

  // Four guides take their hero photograph from a third-party host we do not
  // control. If that host blocks, rate-limits or moves the file, the browser
  // renders the alt text in place of the hero and the page looks broken.
  // Fall back to the brand gradient instead: the heading and its veil already
  // sit above the image, so the hero still reads correctly without it.
  function heroFallback(img) {
    if (!img || img.dataset.heroFallbackApplied) return;
    img.dataset.heroFallbackApplied = '1';
    var hero = img.closest ? img.closest('.np-hero') : null;
    // The image stays in the DOM: it occupies a grid cell, and removing it
    // would collapse the hero's second column. CSS hides it and fills the cell.
    if (hero) hero.classList.add('np-hero--no-photo');
  }
  Array.prototype.forEach.call(document.querySelectorAll('.np-hero-img'), function (img) {
    // Already failed before this script ran.
    if (img.complete && img.naturalWidth === 0) heroFallback(img);
    else img.addEventListener('error', function () { heroFallback(img); });
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var animations = new Set();
  var observer;
  if (!reduce.matches && 'IntersectionObserver' in window && Element.prototype.animate) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        // Animate only after the element is on-screen; nothing starts hidden.
        if (reduce.matches) return;
        var animation = entry.target.animate([
          { opacity: .45, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' });
        animations.add(animation);
        animation.finished.then(function () { animations.delete(animation); }, function () { animations.delete(animation); });
      });
    }, { threshold: .04 });
    document.querySelectorAll('main .reveal, main .fade-up, main .hp-reveal, main .ni-reveal, main .np-reveal, main .ss-reveal').forEach(function (el) {
      // Above-the-fold controls and headings are immediately stable.
      if (el.getBoundingClientRect().top >= window.innerHeight) observer.observe(el);
    });
  }
  reduce.addEventListener('change', function () {
    if (!reduce.matches) return;
    if (observer) observer.disconnect();
    animations.forEach(function (animation) { animation.cancel(); });
    animations.clear();
  });

  var guideNav = document.querySelector('.np-section-nav');
  if (!guideNav) return;
  var sections = Array.from(guideNav.querySelectorAll('a[href^="#"]')).map(function (link) {
    return { link: link, section: document.getElementById(link.hash.slice(1)) };
  }).filter(function (item) { return item.section; });
  var scheduled = false;
  function syncSection() {
    scheduled = false;
    var edge = guideNav.getBoundingClientRect().bottom + 32;
    var active = null;
    var closestTop = -Infinity;
    sections.forEach(function (item) {
      // The quick-link order prioritizes parks and schools, while the map appears
      // earlier in the page. Follow actual geometry, never the menu's order.
      var top = item.section.getBoundingClientRect().top;
      if (top <= edge && top > closestTop) { active = item; closestTop = top; }
    });
    sections.forEach(function (item) {
      if (item === active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  }
  function scheduleSync() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(syncSection);
  }
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync);
  window.addEventListener('hashchange', scheduleSync);
  syncSection();
})();
