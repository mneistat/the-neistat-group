/* Shared flat navigation, keyboard handling and background-video controls. */
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  // Keep secondary sticky navigation below the header at every viewport/text size.
  if (nav && 'ResizeObserver' in window) {
    var headerObserver = new ResizeObserver(function () {
      document.documentElement.style.setProperty('--site-header-height', nav.getBoundingClientRect().height + 'px');
    });
    headerObserver.observe(nav);
  }
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  var desktop = window.matchMedia('not all and (max-width: 1250px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var inertNodes = [];
  var previousOverflow = '';
  var page = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/index';
  document.querySelectorAll('.nav-links a, .mobile-menu-link').forEach(function (link) {
    var target = new URL(link.href).pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/index';
    var active = page === target || (target === '/neighborhoods' && page.indexOf('/neighborhoods/') === 0);
    if (active) link.setAttribute('aria-current', page === target ? 'page' : 'location');
    else link.removeAttribute('aria-current');
  });
  if (nav && toggle && menu) {
    menu.hidden = true;
    menu.setAttribute('aria-label', 'Mobile navigation');
    menu.setAttribute('role', 'navigation');
    toggle.setAttribute('aria-controls', menu.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    function openMenu(open, restoreFocus) {
      if (open === menu.classList.contains('active')) return;
      menu.hidden = !open;
      menu.classList.toggle('active', open);
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        inertNodes = Array.from(document.body.children).filter(function (el) {
          return el !== nav && el !== menu && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) && !el.inert;
        }).concat(Array.from(nav.children).filter(function (el) { return el !== toggle && !el.inert; }));
        inertNodes.forEach(function (el) { el.inert = true; });
        menu.querySelector('a').focus();
      } else {
        inertNodes.forEach(function (el) { el.inert = false; });
        inertNodes = [];
        document.body.style.overflow = previousOverflow;
        if (restoreFocus) (desktop.matches ? nav.querySelector('a') : toggle).focus();
      }
    }
    toggle.addEventListener('click', function () { openMenu(menu.hidden, true); });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) openMenu(false, false);
    });
    document.addEventListener('keydown', function (event) {
      if (menu.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); openMenu(false, true); }
      if (event.key !== 'Tab') return;
      var items = [toggle].concat(Array.from(menu.querySelectorAll('a, button')));
      var index = items.indexOf(document.activeElement);
      var next = (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
      event.preventDefault();
      items[next].focus();
    });
    desktop.addEventListener('change', function () { if (desktop.matches) openMenu(false, true); });
  }
  var video = document.getElementById('heroVideo');
  var videoButton = document.getElementById('heroVideoControl');
  if (video && videoButton) {
    var mobileVideo = window.matchMedia('(max-width: 768px)');
    function labelVideo() { videoButton.textContent = video.paused ? 'Play background video' : 'Pause background video'; }
    video.addEventListener('play', labelVideo);
    video.addEventListener('pause', labelVideo);
    videoButton.addEventListener('click', function () {
      if (video.paused) video.play().catch(labelVideo); else video.pause();
    });
    reduce.addEventListener('change', function () { if (reduce.matches) video.pause(); });
    mobileVideo.addEventListener('change', function () { if (mobileVideo.matches) video.pause(); });
    if (!reduce.matches && !mobileVideo.matches) video.play().catch(labelVideo);
    labelVideo();
  }
})();
