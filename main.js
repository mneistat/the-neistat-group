/* THE NEISTAT GROUP — Final JS */

document.addEventListener('DOMContentLoaded', () => {

  // Preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const hide = () => preloader.classList.add('loaded');
    window.addEventListener('load', () => setTimeout(hide, 900));
    setTimeout(hide, 2800);
  }

  // Nav scroll
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile menu
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('active');
      toggle.classList.toggle('active');
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.querySelectorAll('span').forEach(s => s.style.background = open ? '#fff' : '');
    });
  }

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      const siblings = Array.from(e.target.parentElement.querySelectorAll(':scope > .reveal'));
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = `${Math.max(0, idx) * 0.08}s`;
      e.target.classList.add('visible');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Stat counters
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => {
        const target = +e.target.dataset.target;
        const dur = 2000;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          e.target.textContent = Math.round((1 - Math.pow(1 - t, 4)) * target);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 300);
      cio.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.stat-number[data-target]').forEach(el => cio.observe(el));

  // Hero parallax
  const vid = document.querySelector('.hero-video');
  if (vid) {
    let t = false;
    window.addEventListener('scroll', () => {
      if (!t) { requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) vid.style.transform = `translateY(${y * 0.18}px)`;
        t = false;
      }); t = true; }
    }, { passive: true });
  }

  // Contact form
  const form = document.getElementById('contactForm');
  const ok = document.getElementById('formSuccess');
  if (form && ok) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;
      setTimeout(() => {
        form.style.cssText = 'opacity:0;transform:translateY(-16px);transition:all 0.5s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(() => { form.style.display = 'none'; ok.classList.add('show'); }, 500);
      }, 1200);
    });
  }

  // Image fade
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete) {
      img.style.cssText = 'opacity:0;transition:opacity 0.6s ease';
      img.onload = () => img.style.opacity = '1';
    }
  });
});
