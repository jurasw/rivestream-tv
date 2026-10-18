// Apply CSS changes to an already connected debug WebView without rebuilding.
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../app/src/main/assets/tv-theme.css',import.meta.url),'utf8');
process.argv[2]=`document.getElementById('rive-tv-style').textContent=${JSON.stringify(css)};window.RiveTV.resume();'theme updated'`;
await import('./inspect-webview.mjs');
