import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import lighthouse from 'lighthouse';

const PAGES = ['/', '/services', '/commercial-towing', '/contact', '/404'];
const PORT = 4173;
const base = `http://127.0.0.1:${PORT}`;

const server = spawn('npx', ['serve', 'dist', '-l', String(PORT), '-n', '-L'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch({ channel: 'chrome', args: ['--remote-debugging-port=9222'] });
const axeSrc = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const rows = [];
for (const p of PAGES) {
  const url = base + p;
  const { lhr } = await lighthouse(url, { port: 9222, output: 'json', logLevel: 'silent', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75 }, throttlingMethod: 'simulate' });
  const sc = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]));
  const failing = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual').map((a) => `${a.id}(${a.score})`);
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.addScriptTag({ content: axeSrc });
  const axe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }));
  await ctx.close();
  rows.push({ page: p, ...sc, axe: axe.violations.length });
  if (failing.length) console.log(p, 'LH failing:', failing.join(', '));
  for (const v of axe.violations) console.log(p, 'AXE', v.id, v.impact, v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | '));
  const m = lhr.audits['largest-contentful-paint']?.displayValue, cls = lhr.audits['cumulative-layout-shift']?.displayValue, tbt = lhr.audits['total-blocking-time']?.displayValue;
  const bd = JSON.stringify(lhr.audits['lcp-breakdown-insight']?.details || {});
  const lcpEl = (bd.match(/\"nodeLabel\":\"([^\"]{0,60})/) || bd.match(/\"snippet\":\"<(\\w+)[^\"]{0,40}/) || [])[1] || (lhr.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.nodeLabel ?? '?');
  const weight = Math.round((lhr.audits['network-requests']?.details?.items || []).reduce((a, i) => a + (i.transferSize || 0), 0) / 1024);
  rows[rows.length - 1].metrics = `LCP ${m} CLS ${cls} TBT ${tbt}`;
  rows[rows.length - 1].lcpEl = lcpEl.replace(/\s+/g, ' ').slice(0, 48);
  rows[rows.length - 1].weightKB = weight;
}
console.table(rows);
await browser.close();
server.kill();
process.exit(0);
