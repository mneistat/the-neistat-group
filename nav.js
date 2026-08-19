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

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav-group]'), setup);

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
