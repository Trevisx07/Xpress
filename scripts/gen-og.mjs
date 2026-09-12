import { mkdirSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { textPath } from './text-path.mjs';

// Business strings come from site.ts so nothing is hardcoded here.
const siteTs = readFileSync('src/config/site.ts', 'utf8');
const field = (k) => siteTs.match(new RegExp(`\\b${k}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1].replace(/\\'/g, "'") ?? '';
const PHONE = field('phoneDisplay'), TAGLINE = field('tagline'), URL = field('url').replace(/^https?:\/\//, '');

const PAGES = [
  { file: 'default', line: '24/7 Towing in Mobile, AL' },
  { file: 'services', line: 'Towing and roadside services in Mobile' },
  { file: 'commercial-towing', line: 'Commercial towing accounts' },
  { file: 'contact', line: 'Call us, day or night' },
];
const wrap = (text, maxW, size) => {
  const lines = []; let cur = '';
  for (const w of text.split(' ')) { const n = cur ? `${cur} ${w}` : w; if (textPath(n, { font: 'condensed600', size }).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur); return lines;
};
const W = 1200, H = 630;
const logo = await sharp('src/assets/logo.png').resize(560).png().toBuffer();
const lm = await sharp(logo).metadata();
mkdirSync('public/og', { recursive: true });
for (const p of PAGES) {
  const band = Array.from({ length: 24 }, (_, i) => `<rect x="${i * 50}" y="0" width="50" height="16" fill="${i % 2 ? '#F4F1EA' : '#E8121E'}"/>`).join('');
  const heading = wrap(p.line.toUpperCase(), 1040, 64).map((l, i) => textPath(l, { font: 'condensed600', size: 64, x: 80, y: 440 + i * 70, fill: '#F4F1EA' }).svg).join('');
  const tag = textPath(TAGLINE.toUpperCase().replace(/'/g, '’'), { font: 'condensed600', size: 26, x: 80, y: 372, fill: '#C9CDD3', letterSpacing: 1.5 });
  const foot = textPath(`${URL.toUpperCase()}  |  ${PHONE}`, { font: 'body400', size: 24, x: 80, y: 584, fill: '#9AA3AE', letterSpacing: 1.5 });
  const base = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#0F1216"/>${band}<rect x="80" y="396" width="1040" height="1" fill="#8E949C" fill-opacity="0.5"/>${tag.svg}${heading}${foot.svg}</svg>`);
  const out = `public/og/${p.file}.jpg`;
  await sharp(base).composite([{ input: logo, left: 72, top: 48 }]).jpeg({ quality: 84, mozjpeg: true }).toFile(out);
  console.log(out, Math.round(statSync(out).size / 1024) + 'KB', 'logo', lm.width + 'x' + lm.height);
}
