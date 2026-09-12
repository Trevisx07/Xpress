import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const out = process.argv[2];
const server = spawn('npx', ['serve', 'dist', '-l', '4179', '-n', '-L'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const B = 'http://127.0.0.1:4179';
const browser = await chromium.launch({ channel: 'chrome' });
const widths = [320, 390, 768, 1024, 1440, 1920];
const pages = ['/', '/services', '/commercial-towing', '/contact', '/404'];
const offenders = [];
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  for (const p of pages) {
    await page.goto(B + p, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const clipped = (el) => { for (let n = el.parentElement; n; n = n.parentElement) { const o = getComputedStyle(n); if (/hidden|clip/.test(o.overflowX) || o.clipPath !== 'none') return true; } return false; };
      const bad = [...document.body.querySelectorAll('*')].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1) && !clipped(el) && getComputedStyle(el).position !== 'fixed'; }).slice(0, 5).map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].slice(0, 3).join('.') + ' r=' + Math.round(el.getBoundingClientRect().right));
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, bad };
    });
    if (r.sw > r.iw || r.bad.length) offenders.push(`${w}px ${p}: scrollWidth ${r.sw}/${r.iw} ${r.bad.join(' | ')}`);
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.waitForLoadState('networkidle'); await page.waitForTimeout(200);
    await page.screenshot({ path: `${out}/${w}${p === '/' ? '-home' : p.replace('/', '-')}.png`, fullPage: true });
  }
  await page.close();
}
console.log('offenders:', offenders.length ? offenders : 'none');

// detail crops
const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await d.goto(B + '/', { waitUntil: 'networkidle' });
await d.evaluate(() => scrollTo(0, 300)); await d.waitForTimeout(400);
await d.screenshot({ path: `${out}/detail-header-scrolled-1440.png`, clip: { x: 900, y: 0, width: 540, height: 100 } });
await d.evaluate(() => document.querySelector('.divider-slant[data-draw]').scrollIntoView({ block: 'center' })); await d.waitForTimeout(1200);
const div = await d.evaluate(() => { const r = document.querySelector('.divider-slant[data-draw]').getBoundingClientRect(); return { y: r.top, h: r.height }; });
await d.screenshot({ path: `${out}/detail-divider-1440.png`, clip: { x: 0, y: Math.max(0, div.y - 20), width: 1440, height: div.h + 40 } });
await d.evaluate(() => document.querySelector('.card-step').scrollIntoView({ block: 'center' })); await d.waitForTimeout(900);
const st = await d.evaluate(() => { const r = document.querySelector('.card-step').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
await d.screenshot({ path: `${out}/detail-step-card-1440.png`, clip: { x: st.x - 10, y: st.y - 10, width: st.w + 20, height: st.h + 20 } });
await d.close();
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(B + '/', { waitUntil: 'networkidle' });
await m.screenshot({ path: `${out}/detail-hero-390.png`, fullPage: false });
await m.evaluate(() => document.querySelector('.divider-slant[data-draw]').scrollIntoView({ block: 'center' })); await m.waitForTimeout(1200);
const dv = await m.evaluate(() => { const r = document.querySelector('.divider-slant[data-draw]').getBoundingClientRect(); return { y: r.top, h: r.height }; });
await m.screenshot({ path: `${out}/detail-divider-390.png`, clip: { x: 0, y: dv.y - 10, width: 390, height: dv.h + 20 } });
await m.evaluate(() => scrollTo(0, 0)); await m.click('#menu-open'); await m.waitForTimeout(600);
const menu = await m.evaluate(() => { const r = document.getElementById('mobile-menu').getBoundingClientRect(); const cb = document.querySelector('.callbar'); return { top: r.top, h: r.height, vh: innerHeight, callbarHidden: getComputedStyle(cb).visibility === 'hidden', bg: getComputedStyle(document.getElementById('mobile-menu')).backgroundColor, locked: document.documentElement.style.overflow, bodyFlag: document.body.hasAttribute('data-menu-open') }; });
await m.screenshot({ path: `${out}/detail-menu-open-390.png` });
await m.keyboard.press('Escape');
const closed = await m.evaluate(() => ({ callbarVisible: getComputedStyle(document.querySelector('.callbar')).visibility === 'visible', bodyFlag: document.body.hasAttribute('data-menu-open') }));
console.log('menu:', JSON.stringify(menu), 'closed:', JSON.stringify(closed));
const heroClip = await m.evaluate(() => getComputedStyle(document.querySelector('.hero-media')).clipPath);
console.log('hero-media clip-path at 390:', heroClip);
await m.close();
const t = await browser.newPage({ viewport: { width: 768, height: 1024 } });
await t.goto(B + '/', { waitUntil: 'networkidle' });
console.log('hero order 768:', await t.evaluate(() => [...document.querelectorAll ? [] : document.querySelectorAll('section:first-of-type .hero-copy > *, .hero-media, .marquee')].map((e) => e.className.split(' ')[0] || e.tagName).join(' > ')));
await t.screenshot({ path: `${out}/detail-hero-768.png` });
await t.close();

// nav twice, console errors, VT usage
const n = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; n.on('console', (x) => { if (x.type() === 'error') errors.push(x.text()); }); n.on('pageerror', (e) => errors.push(e.message));
await n.goto(B + '/', { waitUntil: 'networkidle' });
await n.evaluate(() => { window.__swaps = 0; document.addEventListener('astro:after-swap', () => window.__swaps++); });
const order = ['/services', '/commercial-towing', '/contact', '/'];
for (let round = 0; round < 2; round++) for (const href of order) { await n.click(`#site-header nav a[href="${href}"]`); await n.waitForURL(B + href); await n.waitForTimeout(500); }
console.log('nav: swaps', await n.evaluate(() => window.__swaps), 'expected 8 | errors:', errors);
await browser.close(); server.kill(); process.exit(0);
