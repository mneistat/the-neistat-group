/* THE NEISTAT GROUP — navigation.
 *
 * Two-level nav only: no nesting, no mega-menu. Shared by every page so the
 * behaviour cannot drift between them.
 *
 * Desktop: a group opens on pointer hover and on keyboard focus. aria-expanded
 * is kept truthful in both cases rather than letting CSS open a panel the
 * accessibility tree still reports as closed.
 *
 * Mobile: the same groups are click-only disclosures — no hover dependency.
 */
(function () {
  'use strict';

  // The exact complement of the "max-width: 1250px" rule that hides .nav-links in
  // styles.css. Using "min-width: 1251px" would leave fractional widths such as
  // 1250.5px matching neither, where the desktop nav shows but hover never arms.
  var DESKTOP = 'not all and (max-width: 1250px)';

  function isDesktop() {
    return window.matchMedia && window.matchMedia(DESKTOP).matches;
  }

  function setup(group) {
    var trigger = group.querySelector('[aria-controls]');
    if (!trigger) return;
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    function open(state) {
      trigger.setAttribute('aria-expanded', state ? 'true' : 'false');
      group.setAttribute('data-open', state ? 'true' : 'false');
      // On mobile the panel is removed from the tab order when closed. On
      // desktop it stays in the DOM so the CSS transition can run.
      if (!isDesktop()) panel.hidden = !state;
    }

    function closeSiblings() {
      var all = group.parentElement ? group.parentElement.querySelectorAll('[data-nav-group]') : [];
      Array.prototype.forEach.call(all, function (other) {
        if (other !== group) {
          var t = other.querySelector('[aria-controls]');
          if (t) t.setAttribute('aria-expanded', 'false');
          other.setAttribute('data-open', 'false');
          var p = document.getElementById(t && t.getAttribute('aria-controls'));
          if (p && !isDesktop()) p.hidden = true;
        }
      });
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      closeSiblings();
      open(willOpen);
    });

    // Hover, desktop only.
    group.addEventListener('mouseenter', function () {
      if (!isDesktop()) return;
      closeSiblings();
      open(true);
    });
    group.addEventListener('mouseleave', function () {
      if (!isDesktop()) return;
      // Don't yank the panel away from a keyboard user who has tabbed into it
      // and happens to move the mouse off the group.
      if (group.contains(document.activeElement)) return;
      open(false);
    });

    // Keyboard: opening on focus means tabbing to the trigger reveals the group.
    // Escape returns focus to the trigger, which would otherwise re-fire this
    // handler and immediately reopen what Escape just closed.
    var suppressFocusOpen = false;
    trigger.addEventListener('focus', function () {
      if (!isDesktop()) return;
      if (suppressFocusOpen) { suppressFocusOpen = false; return; }
      closeSiblings();
      open(true);
    });

    // Close once focus leaves the group entirely.
    group.addEventListener('focusout', function (e) {
      if (!isDesktop()) return;
      if (!group.contains(e.relatedTarget)) open(false);
    });

    group.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        suppressFocusOpen = true;
        open(false);
        trigger.focus();
        // Clear the guard once the focus event has had its chance to fire.
        setTimeout(function () { suppressFocusOpen = false; }, 0);
      }
    });

    open(false);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // The hamburger is the sole entry point to the mobile IA — six top-level items
  // plus three groups — but carried no state. The open/close click handler stays
  // in each page's inline script; this only keeps ARIA in step with it.

  /* Cursor safety net, sitewide.
     styles.css hides the native pointer only while body.cursor-live is set. Rather
     than polling, wait for the first real mouse movement and check on the next
     frame whether the page's own cursor script actually moved the dot. If it did,
     hand over. If it never does, the visitor simply keeps their normal pointer. */
  function watchCursor() {
    var dot = document.getElementById('cursorDot');
    if (!dot || window.innerWidth < 769) return;
    function check() {
      document.removeEventListener('mousemove', check);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var moved = dot.style.left && dot.style.left !== '0px';
          document.body.classList.toggle('cursor-live', !!moved);
        });
      });
    }
    document.addEventListener('mousemove', check, { once: true });
  }

  function wireToggle() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    if (!menu.id) return;
    toggle.setAttribute('aria-controls', menu.id);
    toggle.setAttribute('aria-expanded', menu.classList.contains('active') ? 'true' : 'false');
    if (!window.MutationObserver) return;
    new MutationObserver(function () {
      toggle.setAttribute('aria-expanded', menu.classList.contains('active') ? 'true' : 'false');
    }).observe(menu, { attributes: true, attributeFilter: ['class'] });
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav-group]'), setup);
    wireToggle();
    watchCursor();

    // Reset group state when crossing the breakpoint, so a panel left open on
    // one layout cannot appear stuck in the other.
    if (window.matchMedia) {
      var mq = window.matchMedia(DESKTOP);
      var onChange = function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-nav-group]'), function (g) {
          var t = g.querySelector('[aria-controls]');
          var p = t && document.getElementById(t.getAttribute('aria-controls'));
          if (t) t.setAttribute('aria-expanded', 'false');
          g.setAttribute('data-open', 'false');
          if (p) p.hidden = !isDesktop() ? true : false;
        });
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
      onChange();
    }
  });
})();
