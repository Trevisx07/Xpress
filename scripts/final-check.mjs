import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const out = process.argv[2];
const server = spawn('npx', ['serve', 'dist', '-l', '4187', '-n', '-L'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const B = 'http://127.0.0.1:4187';
const pages = ['/', '/services', '/commercial-towing', '/contact', '/404'];
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [];
const fontRows = [];
for (const p of pages) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(p + ': ' + m.text()); }); page.on('pageerror', (e) => errors.push(p + ': ' + e.message));
  await page.goto(B + p, { waitUntil: 'networkidle' });
  const r = await page.evaluate(async () => { await document.fonts.ready; const h1 = getComputedStyle(document.querySelector('h1')); const body = getComputedStyle(document.body); return { condensed700: document.fonts.check('700 1em "Barlow Condensed"'), barlow400: document.fonts.check('400 1em Barlow'), loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight), h1Weight: h1.fontWeight, h1Tracking: h1.letterSpacing, h1Family: h1.fontFamily.split(',')[0], bodySize: body.fontSize, eyebrowWeight: getComputedStyle(document.querySelector('.eyebrow')).fontWeight }; });
  fontRows.push({ page: p, ...r, loaded: r.loaded.join(', ') });
  if (p === '/') await page.screenshot({ path: `${out}/hero-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.close();
}
console.table(fontRows.map(({ loaded, ...r }) => r)); console.log('loaded faces on /:', fontRows[0].loaded);
// mobile menu on every page + after a view transition
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
m.on('console', (x) => { if (x.type() === 'error') errors.push('menu: ' + x.text()); }); m.on('pageerror', (e) => errors.push('menu: ' + e.message));
const menuRows = [];
const check = async (label) => {
  await m.click('#menu-open'); await m.waitForTimeout(350);
  const open = await m.evaluate(() => ({ panel: document.getElementById('mobile-menu').hasAttribute('data-open'), closeVisible: getComputedStyle(document.getElementById('menu-close')).display !== 'none', hitTarget: document.elementFromPoint(...(() => { const r = document.getElementById('menu-close').getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })())?.closest('#menu-close') !== null }));
  await m.click('#menu-close'); await m.waitForTimeout(350);
  const closed = await m.evaluate(() => ({ hidden: !document.getElementById('mobile-menu').hasAttribute('data-open') && getComputedStyle(document.getElementById('mobile-menu')).display === 'none', expanded: document.getElementById('menu-open').getAttribute('aria-expanded'), unlocked: document.documentElement.style.overflow === '', callbar: getComputedStyle(document.querySelector('.callbar')).visibility === 'visible', focus: document.activeElement.id }));
  menuRows.push({ page: label, ...open, ...closed });
};
for (const p of pages) { await m.goto(B + p, { waitUntil: 'networkidle' }); await check(p); }
await m.goto(B + '/', { waitUntil: 'networkidle' });
await m.click('#menu-open'); await m.click('#mobile-menu nav a[href="/services"]'); await m.waitForURL('**/services'); await m.waitForTimeout(500);
await check('/services after VT');
console.table(menuRows);
console.log('console errors:', errors.length ? errors : 'none');
await browser.close(); server.kill(); process.exit(0);
