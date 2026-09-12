import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
const port = process.argv[2] || '4200';
const server = spawn('npx', ['serve', 'dist', '-l', port, '-n', '-L'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const b = await chromium.launch({ channel: 'chrome' });
const out = {};
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  out[`home@${w}`] = await p.evaluate(() => {
    const hero = document.querySelector('main > section');
    const copy = document.querySelector('.hero-copy');
    const first = copy.firstElementChild.getBoundingClientRect().top;
    const call = copy.querySelector('a[href^="tel:"]').getBoundingClientRect();
    const proof = copy.querySelector('ul').getBoundingClientRect();
    return { pageHeight: document.documentElement.scrollHeight, heroHeight: Math.round(hero.getBoundingClientRect().height), eyebrowToCallBottom: Math.round(call.bottom - first), proofBottomFromTop: Math.round(proof.bottom), callBtnHeight: Math.round(call.height) };
  });
  await p.goto(`http://127.0.0.1:${port}/services`, { waitUntil: 'networkidle' });
  out[`services@${w}`] = await p.evaluate(() => ({ pageHeight: document.documentElement.scrollHeight }));
  await p.close();
}
console.log(JSON.stringify(out));
await b.close(); server.kill(); process.exit(0);
