const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader() {
  const header = document.getElementById('site-header');
  if (!header || header.dataset.ready) return;
  header.dataset.ready = '1';

  const menu = document.getElementById('mobile-menu')!;
  const openBtn = document.getElementById('menu-open') as HTMLButtonElement;
  const fallback = document.getElementById('menu-open-fallback');
  const closeBtn = document.getElementById('menu-close') as HTMLElement;
  fallback?.remove();
  openBtn.hidden = false;
  closeBtn.setAttribute('role', 'button');
  closeBtn.removeAttribute('href');
  closeBtn.tabIndex = 0;

  let lastFocus: HTMLElement | null = null;
  let isOpen = false;
  const focusables = () => [closeBtn, ...menu.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]')].filter((el) => !el.hidden);
  // Escape closes; Tab wraps within the panel so focus never escapes behind the overlay.
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const els = focusables();
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const open = () => {
    isOpen = true;
    lastFocus = document.activeElement as HTMLElement;
    menu.setAttribute('data-open', '');
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    document.body.setAttribute('data-menu-open', '');
    header.removeAttribute('data-hidden');
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  };
  const close = (restoreFocus = true) => {
    if (!isOpen) return;
    isOpen = false;
    menu.removeAttribute('data-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    document.body.removeAttribute('data-menu-open');
    document.removeEventListener('keydown', onKey);
    if (restoreFocus) lastFocus?.focus();
  };
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  closeBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); close(); } });
  menu.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => close(false)));
  menu.addEventListener('click', (e) => { if (e.target === menu) close(); });
  document.addEventListener('astro:before-preparation', () => close(false));

  let lastY = window.scrollY;
  let queued = false;
  const update = () => {
    queued = false;
    const y = window.scrollY;
    header.toggleAttribute('data-scrolled', y > 8);
    if (reduced() || isOpen || y < 120) header.removeAttribute('data-hidden');
    else if (y > lastY + 4) header.setAttribute('data-hidden', '');
    else if (y < lastY - 4) header.removeAttribute('data-hidden');
    lastY = y;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  document.addEventListener('astro:after-swap', () => { lastY = window.scrollY; update(); });
  update();
}

function syncCurrentNav() {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('#site-header nav a[href]').forEach((a) => {
    const href = a.getAttribute('href')!;
    const current = href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
    current ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}

let revealIO: IntersectionObserver | null = null;
function initReveal() {
  revealIO?.disconnect();
  if (reduced() || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-reveal');
  revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); revealIO!.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '-40px 0px' });
  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((p) => {
    [...p.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i)));
  });
  document.querySelectorAll('[data-reveal], [data-reveal-stagger], [data-draw]').forEach((el) => revealIO!.observe(el));
}

let countIO: IntersectionObserver | null = null;
function initCountUp() {
  countIO?.disconnect();
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!els.length || reduced() || !('IntersectionObserver' in window)) return;
  countIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      countIO!.unobserve(e.target);
      const el = e.target as HTMLElement;
      const target = Number(el.dataset.count), decimals = Number(el.dataset.decimals ?? 0), suffix = el.dataset.suffix ?? '';
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 900);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.5 });
  els.forEach((el) => countIO!.observe(el));
}

let parallaxEl: HTMLElement | null = null;
function initParallax() {
  parallaxEl = document.querySelector<HTMLElement>('[data-parallax]');
  if (!parallaxEl) return;
  let queued = false;
  const update = () => {
    queued = false;
    if (!parallaxEl) return;
    if (reduced() || innerWidth < 1024) { parallaxEl.style.transform = ''; return; }
    parallaxEl.style.transform = `translateY(${(-window.scrollY * 0.15).toFixed(1)}px)`;
  };
  addEventListener('scroll', () => { if (!queued && parallaxEl) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

document.addEventListener('astro:before-swap', () => {
  revealIO?.disconnect();
  countIO?.disconnect();
  parallaxEl = null;
});
// The swap replaces <html> attributes, so the navigated flag is set after it.
document.addEventListener('astro:after-swap', () => document.documentElement.classList.add('vt-nav'));
document.addEventListener('astro:page-load', () => {
  initHeader();
  syncCurrentNav();
  initReveal();
  initCountUp();
  initParallax();
});
