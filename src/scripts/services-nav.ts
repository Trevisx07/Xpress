let io: IntersectionObserver | null = null;
let onScroll: (() => void) | null = null;

document.addEventListener('astro:page-load', () => {
  io?.disconnect();
  if (onScroll) removeEventListener('scroll', onScroll);
  const rail = document.querySelector<HTMLElement>('[data-rail]');
  const wrap = document.querySelector<HTMLElement>('[data-articles]');
  const links = document.querySelectorAll<HTMLAnchorElement>('#service-nav a[href^="#"]');
  if (!rail || !wrap || !links.length || !('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = new Map([...links].map((a) => [a.getAttribute('href')!.slice(1), a]));
  const snapTo = (a: HTMLAnchorElement) => { rail.style.setProperty('--rail-y', `${a.offsetTop}px`); rail.style.setProperty('--rail-h', `${a.offsetHeight}px`); };
  const activate = (a: HTMLAnchorElement) => {
    links.forEach((l) => l.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'true');
    if (reduced) snapTo(a);
  };
  io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { const a = byId.get(e.target.id); if (a) activate(a); }
  }, { rootMargin: '-40% 0px -50% 0px' });
  byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io!.observe(el); });
  activate(links[0]);
  if (reduced) return;
  // Indicator travels continuously with scroll progress through the articles block; the observer only sets the bold item.
  let queued = false;
  const first = links[0], last = links[links.length - 1];
  const update = () => {
    queued = false;
    const r = wrap.getBoundingClientRect();
    const focus = innerHeight * 0.4;
    const t = Math.min(1, Math.max(0, (focus - r.top) / (r.height - innerHeight * 0.6)));
    const y = first.offsetTop + t * (last.offsetTop - first.offsetTop);
    rail.style.setProperty('--rail-y', `${y}px`);
    rail.style.setProperty('--rail-h', `${first.offsetHeight}px`);
    rail.style.setProperty('--rail-progress', `${(t * 100).toFixed(1)}%`);
  };
  onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });
  update();
});
document.addEventListener('astro:before-swap', () => { io?.disconnect(); if (onScroll) removeEventListener('scroll', onScroll); });
