import { spawn } from 'node:child_process';
import { chromium, firefox } from 'playwright-core';
const server = spawn('npx', ['serve', 'dist', '-l', '4175', '-n', '-L'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const B = 'http://127.0.0.1:4175';

async function run(browser, label, noVT = false) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  if (noVT) await page.addInitScript(() => { delete Document.prototype.startViewTransition; });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(B + '/');
  await page.evaluate(() => { document.getElementById('site-header').dataset.mark = 'persisted'; });
  const vt = await page.evaluate(() => 'startViewTransition' in document);
  // open menu, navigate via a menu link
  await page.click('#menu-open');
  const menuOpen = await page.evaluate(() => document.getElementById('mobile-menu').hasAttribute('data-open'));
  await page.click('#mobile-menu nav a[href="/services"]');
  await page.waitForURL('**/services');
  await page.waitForFunction(() => document.querySelector('h1')?.textContent.includes('Towing and roadside'));
  const afterNav1 = await page.evaluate(() => ({ persisted: document.getElementById('site-header').dataset.mark, menuClosed: !document.getElementById('mobile-menu').hasAttribute('data-open'), scrollUnlocked: document.documentElement.style.overflow === '', current: document.querySelector('#site-header nav a[aria-current="page"]')?.getAttribute('href'), heroAnim: getComputedStyle(document.querySelector('[data-hero-in] > *')).animationName }));
  // menu still works on second page
  await page.click('#menu-open');
  const menuAgain = await page.evaluate(() => ({ open: document.getElementById('mobile-menu').hasAttribute('data-open'), focus: document.activeElement.id, locked: document.documentElement.style.overflow }));
  await page.keyboard.press('Escape');
  const menuClosedAgain = await page.evaluate(() => ({ closed: !document.getElementById('mobile-menu').hasAttribute('data-open'), unlocked: document.documentElement.style.overflow === '', focus: document.activeElement.id }));
  // footer anchor offset
  await page.click('footer a[href="/services#flatbed-towing"]');
  await page.waitForTimeout(2500);
  const anchor = await page.evaluate(() => { const r = document.getElementById('flatbed-towing').getBoundingClientRect(); const hh = document.getElementById('site-header').getBoundingClientRect().height; return { top: Math.round(r.top), headerH: Math.round(hh), clearsHeader: r.top >= hh }; });
  // header hides on scroll down, shows on scroll up
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo(0, 600)); await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollTo(0, 900)); await page.waitForTimeout(250);
  const hidden = await page.evaluate(() => document.getElementById('site-header').hasAttribute('data-hidden'));
  await page.evaluate(() => window.scrollTo(0, 700)); await page.waitForTimeout(250);
  const shown = await page.evaluate(() => !document.getElementById('site-header').hasAttribute('data-hidden'));
  const callbarVisible = await page.evaluate(() => { const r = document.querySelector('aside[aria-label="Call now"] a').getBoundingClientRect(); return r.bottom <= innerHeight && r.height > 0; });
  // to contact via footer link
  await page.click('footer a[href="/contact"]');
  await page.waitForURL('**/contact');
  await page.waitForFunction(() => document.getElementById('contact-form')?.dataset.ready === '1');
  await page.click('#f-submit');
  const formErr = await page.evaluate(() => ({ alertVisible: !document.getElementById('form-alert').hidden, invalid: document.querySelectorAll('[aria-invalid="true"]').length }));
  await page.click('#map-load');
  const iframe = await page.evaluate(() => document.querySelector('#map-facade iframe')?.getAttribute('title'));
  // home via logo
  await page.click('#site-header a[aria-label]');
  await page.waitForURL(B + '/');
  await page.waitForFunction(() => document.querySelector('h1')?.textContent.includes('Stuck'));
  const home = await page.evaluate(() => ({ persisted: document.getElementById('site-header').dataset.mark, current: document.querySelector('#site-header nav a[aria-current="page"]')?.getAttribute('href') }));
  // stats count-up + reveal
  await page.evaluate(() => document.querySelector('[data-count]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(2600);
  const stats = await page.evaluate(() => [...document.querySelectorAll('dd')].map((d) => d.textContent));
  const revealed = await page.evaluate(() => document.querySelectorAll('.is-visible').length);
  console.log(label, JSON.stringify({ vt, menuOpen, afterNav1, menuAgain, menuClosedAgain, anchor, headerHidden: hidden, headerShown: shown, callbarVisible, formErr, iframe, home, stats, revealed, errors }, null, 1));
  await page.close();
}
if (!process.env.FF_ONLY) { const c = await chromium.launch({ channel: 'chrome' }); await run(c, 'CHROME'); await run(c, 'CHROME-NO-VT (Astro fallback path)', true); await c.close(); }
try { const f = await firefox.launch(); await run(f, 'FIREFOX'); await f.close(); } catch (e) { console.log('FIREFOX unavailable:', e.message.split('\n')[0]); }
server.kill(); process.exit(0);
