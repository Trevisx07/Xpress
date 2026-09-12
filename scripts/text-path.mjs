import * as fontkit from 'fontkit';

const FONTS = {
  condensed700: 'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2',
  condensed600: 'node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2',
  body400: 'node_modules/@fontsource/barlow/files/barlow-latin-400-normal.woff2',
};
const cache = new Map();
const load = (k) => cache.get(k) ?? cache.set(k, fontkit.openSync(FONTS[k])).get(k);

// Text as an SVG <path> so rendering does not depend on installed fonts.
export function textPath(text, { font = 'condensed700', size = 40, x = 0, y = 0, fill = '#000', letterSpacing = 0 } = {}) {
  const f = load(font);
  const scale = size / f.unitsPerEm;
  const run = f.layout(text);
  let cursor = 0;
  const parts = [];
  run.glyphs.forEach((g, i) => {
    const d = g.path.toSVG();
    if (d) parts.push(`<path transform="translate(${(x + cursor * scale).toFixed(2)} ${y}) scale(${scale} ${-scale})" d="${d}"/>`);
    cursor += run.positions[i].xAdvance + letterSpacing / scale;
  });
  return { svg: `<g fill="${fill}">${parts.join('')}</g>`, width: cursor * scale };
}

export function measure(text, font = 'condensed700', size = 40, letterSpacing = 0) {
  return textPath(text, { font, size, letterSpacing }).width;
}
