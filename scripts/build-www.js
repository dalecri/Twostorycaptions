// Copies the static web app into www/ for Capacitor.
// index.html stays the source of truth (and keeps working as a plain website);
// the native build swaps the Google Fonts stylesheet for bundled local copies so the app
// works fully offline.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'vendor', 'fonts'), { recursive: true });

const FONTS_LINK = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/;
const FONTS_PRECONNECT = '<link rel="preconnect" href="https://fonts.googleapis.com">\n';
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!FONTS_LINK.test(html)) {
  throw new Error('Google Fonts <link> not found in index.html; update scripts/build-www.js');
}
html = html
  .replace(FONTS_PRECONNECT, '')
  .replace(FONTS_LINK, '<link href="vendor/fonts/fonts.css" rel="stylesheet">');
fs.writeFileSync(path.join(out, 'index.html'), html);

// Latin + Latin Extended cover English and French
const FONTS = [
  { family: 'Space Mono', pkg: '@fontsource/space-mono', file: 'space-mono', weights: [400, 700] },
  { family: 'Press Start 2P', pkg: '@fontsource/press-start-2p', file: 'press-start-2p', weights: [400] }
];
const SUBSETS = {
  'latin-ext': 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
  'latin': 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
};
let css = '';
for (const font of FONTS) {
  const filesDir = path.join(path.dirname(require.resolve(font.pkg + '/package.json')), 'files');
  for (const weight of font.weights) {
    for (const [subset, range] of Object.entries(SUBSETS)) {
      const name = `${font.file}-${subset}-${weight}-normal.woff2`;
      fs.copyFileSync(path.join(filesDir, name), path.join(out, 'vendor', 'fonts', name));
      css += `@font-face{font-family:'${font.family}';font-style:normal;font-display:swap;font-weight:${weight};` +
        `src:url(${name}) format('woff2');unicode-range:${range};}\n`;
    }
  }
}
fs.writeFileSync(path.join(out, 'vendor', 'fonts', 'fonts.css'), css);

fs.copyFileSync(path.join(root, 'tst.png'), path.join(out, 'tst.png'));
for (const dir of ['css', 'js']) fs.cpSync(path.join(root, dir), path.join(out, dir), { recursive: true });

console.log('Built www/');
