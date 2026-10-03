// Copies the static web app into www/ for Capacitor.
// index.html stays the source of truth (and keeps working as a plain website);
// the native build swaps the Supabase CDN script for a bundled local copy.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'vendor'), { recursive: true });

const CDN_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!html.includes(CDN_SRC)) {
  throw new Error('Supabase CDN <script> not found in index.html; update scripts/build-www.js');
}
html = html.replace(CDN_SRC, 'vendor/supabase.js');
fs.writeFileSync(path.join(out, 'index.html'), html);

fs.copyFileSync(
  require.resolve('@supabase/supabase-js/dist/umd/supabase.js'),
  path.join(out, 'vendor', 'supabase.js')
);
fs.copyFileSync(path.join(root, 'tst.png'), path.join(out, 'tst.png'));

console.log('Built www/');
