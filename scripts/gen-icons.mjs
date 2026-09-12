import { writeFileSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

// Favicons use the X mark cut from the real logo raster; the full lockup is illegible at 32px.
const LOGO = 'src/assets/logo.png';
const meta = await sharp(LOGO).metadata();
const sx = meta.width / 1302, sy = meta.height / 706;
const mark = await sharp(LOGO).extract({ left: Math.round(28 * sx), top: Math.round(78 * sy), width: Math.round(590 * sx), height: Math.round(400 * sy) }).png().toBuffer();

const tile = async (size, radius) => {
  const inner = Math.round(size * 0.86);
  const m = await sharp(mark).resize(inner, inner, { fit: 'inside' }).png().toBuffer();
  const mm = await sharp(m).metadata();
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#0F1216"/></svg>`);
  return sharp(bg).composite([{ input: m, left: Math.round((size - mm.width) / 2), top: Math.round((size - mm.height) / 2) }]).png({ palette: true, quality: 90, compressionLevel: 9 });
};

await (await tile(180, 0)).toFile('public/icons/apple-touch-icon.png');
await (await tile(192, 24)).toFile('public/icons/icon-192.png');
await (await tile(512, 64)).toFile('public/icons/icon-512.png');
const p32 = await (await tile(32, 4)).toBuffer();
const p64 = await (await tile(64, 8)).toBuffer();
writeFileSync('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${p64.toString('base64')}"/></svg>\n`);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(p32.length, 14); header.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([header, p32]));

// Full lockup for schema.org logo and social embeds
await sharp(LOGO).resize(1200).png({ compressionLevel: 9 }).toFile('public/og/logo.png');
writeFileSync('public/site.webmanifest', JSON.stringify({
  name: 'Xpress Towing & Recovery', short_name: 'Xpress Towing', start_url: '/', display: 'standalone', theme_color: '#0F1216', background_color: '#0F1216',
  icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 2) + '\n');
const lm = await sharp('public/og/logo.png').metadata();
console.log('icons written; og/logo.png', lm.width + 'x' + lm.height, '| ico', readFileSync('public/favicon.ico').length, 'bytes');
