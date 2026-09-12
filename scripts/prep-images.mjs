import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import sharp from 'sharp';

// Source folder -> src/assets. EXIF orientation applied, all metadata stripped, no upscaling.
const SRC = 'images';
const PHOTOS = [
  { from: 'flatbed.jpg', to: 'hero-flatbed.jpg', w: 2400, h: 2000, slot: 'hero: empty flatbed, three-quarter front' },
  { from: 'light-duty.jpg', to: 'truck-light-duty.jpg', w: 1200, h: 800, slot: 'light duty: sedan winched onto tilted deck' },
  { from: 'medium-duty.jpg', to: 'truck-medium-duty.jpg', w: 1200, h: 800, slot: 'medium duty: rear three-quarter, empty deck' },
  { from: 'flatbed-1.jpg', to: 'truck-flatbed.jpg', w: 1200, h: 800, slot: 'flatbed: loaded SUV strapped on deck' },
  // 4:3 source cropped to the 3:2 article slot; the truck sits in the vertical middle so a centre crop keeps it whole.
  { from: 'recovery-dusk.jpg', to: 'recovery-dusk.jpg', w: 1800, h: 1200, slot: 'accident recovery: dusk, beacons lit', position: 'centre' },
  { from: 'roadside.jpg', to: 'roadside.jpg', w: 1200, h: 800, slot: 'roadside: tire change beside the truck' },
  { from: 'lockout.jpg', to: 'lockout.jpg', w: 1200, h: 800, slot: 'lockout: air wedge and long reach tool at the door' },
  { from: 'jumps-start.jpg', to: 'jump-start.jpg', w: 1200, h: 800, slot: 'jump start: jump pack on the battery' },
  { from: 'commercial.jpg', to: 'commercial-shop.jpg', w: 1200, h: 800, slot: 'commercial: truck at the shop bays' },
];

for (const p of PHOTOS) {
  const input = `${SRC}/${p.from}`;
  if (!existsSync(input)) throw new Error(`missing ${input}`);
  const meta = await sharp(input).metadata();
  const oriented = sharp(input).rotate();
  const { width: ow, height: oh } = await oriented.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const scale = Math.min(1, ow / p.w, oh / p.h);
  const w = Math.round(p.w * scale), h = Math.round(p.h * scale);
  await oriented.resize(w, h, { fit: 'cover', position: p.position ?? 'attention' }).jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(`src/assets/${p.to}`);
  const outMeta = await sharp(`src/assets/${p.to}`).metadata();
  console.log(`${p.from} -> ${p.to} | ${meta.width}x${meta.height} -> ${outMeta.width}x${outMeta.height}${scale < 1 ? ' (source smaller than target, kept native)' : ''} | exif ${meta.exif ? 'stripped' : 'none'} | ${Math.round(statSync(`src/assets/${p.to}`).size / 1024)}KB | ${p.slot}`);
}

// Logo: SVG wrapper around a PNG. Extract the raster, key the exterior white with a flood fill (no tracing), trim.
const svg = readFileSync(`${SRC}/Logo.svg`, 'utf8');
const b64 = svg.match(/href="data:image\/png;base64,([^"]+)"/)?.[1];
if (!b64) throw new Error('Logo.svg has no embedded PNG');
const raw = sharp(Buffer.from(b64, 'base64')).ensureAlpha();
const { data, info } = await raw.raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const idx = (x, y) => (y * W + x) * 4;
const isBg = (i) => data[i] > 225 && data[i + 1] > 225 && data[i + 2] > 225;
const seen = new Uint8Array(W * H);
const stack = [];
for (let x = 0; x < W; x++) { stack.push([x, 0], [x, H - 1]); }
for (let y = 0; y < H; y++) { stack.push([0, y], [W - 1, y]); }
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= W || y >= H) continue;
  const k = y * W + x;
  if (seen[k]) continue;
  seen[k] = 1;
  const i = idx(x, y);
  if (!isBg(i)) { // soften the antialiased rim against the former white
    const luma = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (luma > 150) data[i + 3] = Math.round(255 * (1 - (luma - 150) / 105));
    continue;
  }
  data[i + 3] = 0;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}
const keyed = sharp(data, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 });
await keyed.png({ compressionLevel: 9, palette: false }).toFile('src/assets/logo.png');
const lm = await sharp('src/assets/logo.png').metadata();
console.log(`Logo.svg (embedded PNG ${W}x${H}, white background) -> logo.png ${lm.width}x${lm.height} transparent | ${Math.round(statSync('src/assets/logo.png').size / 1024)}KB`);
