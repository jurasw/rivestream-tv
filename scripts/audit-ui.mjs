// Debug-only visual audit of the app's own emulator. Connect with inspect-webview first.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const pages=await(await fetch('http://127.0.0.1:19223/json')).json();
const page=pages.find(p=>p.type==='page');
const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
let id=0;const pending=new Map();
socket.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}};
function call(method,params={}){return new Promise((resolve,reject)=>{const n=++id;const timeout=setTimeout(()=>{pending.delete(n);reject(new Error(method+' timed out'));},15000);pending.set(n,m=>{clearTimeout(timeout);m.error?reject(new Error(JSON.stringify(m.error))):resolve(m.result);});socket.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const css=readFileSync(new URL('../app/src/main/assets/tv-theme.css',import.meta.url),'utf8');
const report=[];
for(const [name,path] of [['home','/'],['detail','/detail?type=movie&id=45745'],['search','/search'],['movies','/movie'],['shows','/tv'],['library','/library'],['settings','/settings']]){
  await call('Page.navigate',{url:'https://www.rivestream.app'+path});
  for(let attempt=0;attempt<40;attempt++){await delay(500);try{if(await evaluate('!!window.RiveTV && document.readyState!=="loading"'))break;}catch{}}
  await evaluate(`document.getElementById('rive-tv-style').textContent=${JSON.stringify(css)};window.RiveTV.resume();window.scrollTo(0,0);`);
  await delay(7000);
  const result=await evaluate(`(function(){var e=document.querySelector('[data-rive-focus]');return {url:location.href,viewport:[innerWidth,innerHeight],body:document.body.innerText.slice(0,1200),scrollWidth:document.documentElement.scrollWidth,focus:e&&{tag:e.tagName,text:e.textContent.slice(0,90),rect:e.getBoundingClientRect().toJSON(),outline:getComputedStyle(e).outline},classes:[...document.querySelector('[class*="background__"]')?.querySelectorAll(':scope > div > div')||[]].map(e=>e.className)}})()`);
  const png=execFileSync(new URL('../.tools/android-sdk/platform-tools/adb',import.meta.url).pathname,['-s','emulator-5580','exec-out','screencap','-p'],{timeout:15000,maxBuffer:8*1024*1024});
  writeFileSync(new URL('../.artifacts/ui-'+name+'-v2.png',import.meta.url),png);report.push({name,...result});console.log(name+': '+result.scrollWidth+'px, '+result.focus?.text);
}
writeFileSync(new URL('../.artifacts/ui-audit.json',import.meta.url),JSON.stringify(report,null,2));socket.close();
