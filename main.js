/* ============================================
   THE NEISTAT GROUP — World Class Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Preloader ---
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hide = () => preloader.classList.add('loaded');
    window.addEventListener('load', () => setTimeout(hide, 1000));
    setTimeout(hide, 3000); // fallback
  }

  // --- Navigation ---
  const nav = document.getElementById('nav');

  function handleNav() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNav, { passive: true });
  handleNav();

  // --- Mobile Menu ---
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isActive = mobileMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.background = isActive ? '#FFFFFF' : '';
      });
    });
  }

  // --- Scroll Reveal with stagger ---
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Find sibling reveals for stagger
      const parent = entry.target.parentElement;
      const siblings = Array.from(parent.querySelectorAll(':scope > .reveal, :scope > * > .reveal'));
      const idx = siblings.indexOf(entry.target);
      const delay = Math.max(0, idx) * 0.08;

      entry.target.style.transitionDelay = `${delay}s`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // --- Stat Counter ---
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => animateCounter(entry.target), 300);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2200;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // quartic ease out
      el.textContent = Math.round(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // --- Hero Parallax ---
  const heroMedia = document.querySelector('.hero-bg-video') || document.querySelector('.hero-bg-img');
  if (heroMedia) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            heroMedia.style.transform = `scale(1.05) translateY(${y * 0.2}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --- Contact Form ---
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(() => {
        form.style.opacity = '0';
        form.style.transform = 'translateY(-20px)';
        form.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

        setTimeout(() => {
          form.style.display = 'none';
          success.classList.add('show');
          success.style.animation = 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }, 500);
      }, 1200);
    });
  }

  // --- Image fade on load ---
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.8s ease';
      img.addEventListener('load', () => { img.style.opacity = '1'; });
    }
  });

  // --- Smooth anchor scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

});
