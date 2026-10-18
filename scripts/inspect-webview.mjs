// Debug APK only. First: adb forward tcp:19223 localabstract:webview_devtools_remote_<APP_PID>
const pages = await (await fetch(`http://127.0.0.1:${process.env.RIVE_CDP_PORT || 19223}/json`, {signal:AbortSignal.timeout(10000)})).json();
const page = pages.find(p => p.type === 'page');
if (!page) throw new Error('No WebView page found');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { const t=setTimeout(()=>reject(new Error('WebSocket timeout')),10000);socket.onopen = ()=>{clearTimeout(t);resolve();}; socket.onerror = reject; });
const expression = process.argv[2] || `JSON.stringify({url:location.href,viewport:[innerWidth,innerHeight],navigation:!!window.RiveTV,focus:document.querySelector('[data-rive-focus]')?.outerHTML.slice(0,600),images:[...document.images].filter(i=>i.naturalWidth>0).length,body:document.body.innerText.slice(0,1600)})`;
socket.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true,awaitPromise:true}}));
const response = await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('CDP timeout')), 15000);
  socket.onmessage = ({data}) => { const value=JSON.parse(data); if(value.id===1) { clearTimeout(timer); resolve(value); } };
});
socket.close();
console.log(JSON.stringify(response.result, null, 2));
