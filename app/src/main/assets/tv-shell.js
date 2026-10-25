(function () {
  'use strict';
  if (window.RiveTVShell || window !== window.top || !window.RiveTV) return;
  var PATHS = ['/', '/movie', '/tv', '/library', '/search', '/detail'];
  var IMG = 'https://image.tmdb.org/t/p/';
  var ASSETS = 'https://rivetv.assets/';
  var LANG = 'pl-PL';
  var ROW_Y = 500, GRID_Y = 260, COLUMNS = 6;
  var KEYS = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  var NAV = [
    {id:'home', label:'Strona główna'},
    {id:'tv', label:'Seriale'},
    {id:'movie', label:'Filmy'},
    {id:'new', label:'Nowe i popularne'},
    {id:'list', label:'Moja lista'},
    {id:'lang', label:'Przeglądaj według języka'}
  ];
  var LANGUAGES = [
    {label:'Polski', country:'PL'}, {label:'Angielski', country:'US'}, {label:'Brytyjski angielski', country:'GB'},
    {label:'Koreański', country:'KR'}, {label:'Japoński', country:'JP'}, {label:'Hiszpański', country:'ES'},
    {label:'Francuski', country:'FR'}, {label:'Niemiecki', country:'DE'}, {label:'Włoski', country:'IT'},
    {label:'Turecki', country:'TR'}, {label:'Hindi', country:'IN'}, {label:'Duński', country:'DK'}
  ];
  var icons = {
    play:'<svg viewBox="0 0 24 24"><path d="M18.38 11.04c.78.4.78 1.51 0 1.92L4.58 20.17A1.08 1.08 0 0 1 3 19.22V4.78c0-.81.86-1.33 1.58-.95z" fill="currentColor"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.23" stroke="currentColor" stroke-width="1.54"/><path d="M12.46 9.67a.95.95 0 0 1-.68-.28.9.9 0 0 1-.29-.69.9.9 0 0 1 .3-.69.95.95 0 0 1 .67-.28c.26 0 .5.1.69.28.18.19.28.42.28.69a.9.9 0 0 1-.28.69.98.98 0 0 1-.69.28zm-.78 7.1v-6.36h1.56v6.36z" fill="currentColor"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none"><path d="M3 12h18M12 3v18" stroke="currentColor" stroke-width="1.6"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="1.8"/></svg>',
    thumb:'<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.98 5.38V8c0 .17-.03.35-.1.52-1.17 2.63-2.89 3.93-4.53 4.22-.04 0-.08.03-.1.05v4.24h.03c1.35-.08 2.22.07 2.9.3.32.11.6.24.82.35l.06.03c.2.1.35.17.52.23.09.03.36.07.84.1.45.02 1 .02 1.6 0 1.18-.01 2.48-.08 3.32-.13h.04c.09 0 .15-.01.18-.02l.06-.12c.05-.23 0-.56-.07-.95-.08-.43.14-.8.43-1 .5-.33.52-.74.47-.87-.08-.25-.11-.63.1-.96.21-.33.2-.54.17-.68-.04-.16-.14-.31-.3-.46a1.04 1.04 0 0 1-.18-1.24c.08-.16.08-.27.07-.34-.01-.08-.06-.16-.14-.26a1.3 1.3 0 0 0-.4-.29h-3.42V8.47c0-1.96-.45-2.7-.83-2.97-.38-.28-.91-.27-1.54-.12zm2.27-.92c.88.65 1.35 1.92 1.35 4.01v.96h2.22c.14 0 .26.04.35.07.1.03.2.08.3.14.2.11.43.27.63.5.2.22.38.52.45.89.06.33.02.68-.12 1.02.2.23.42.54.52.95.12.5.04 1.04-.29 1.6.21.71-.07 1.6-.84 2.19.06.34.12.82.04 1.25-.06.28-.19.6-.47.83-.28.24-.62.33-1 .34-.85.05-2.16.12-3.36.14-.6.01-1.19 0-1.67-.02-.46-.02-.91-.06-1.2-.16-.23-.08-.45-.19-.64-.29l-.06-.03a5.6 5.6 0 0 0-.68-.29c-.49-.17-1.2-.3-2.43-.23A1.27 1.27 0 0 1 5 17.03V12.8c0-.72.56-1.22 1.13-1.32 1.15-.21 2.57-1.15 3.6-3.49V5.37c0-.57.38-1.1.96-1.24.66-.15 1.7-.3 2.56.33z" fill="currentColor"/></svg>',
    caret:'<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none"><circle cx="10.7" cy="10.7" r="7.83" stroke="currentColor" stroke-width="1.74"/><path d="M21.56 22l-5.96-6.03" stroke="currentColor" stroke-width="1.74"/></svg>',
    mic:'<svg viewBox="0 0 24 24" fill="none"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5 11.5a7 7 0 0 0 14 0M12 18.5V22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    space:'<svg viewBox="0 0 24 24" fill="none"><path d="M3 10v4.5h18V10" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    del:'<svg viewBox="0 0 24 24" fill="none"><path d="M8.5 5H21v14H8.5L2 12z" fill="currentColor"/><path d="M11.5 9l6 6m0-6l-6 6" stroke="#2a2a2a" stroke-width="1.8"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5c-3.2 0-5.6 2.5-5.6 5.7v3.6L4.6 16v1h14.8v-1l-1.8-3.2V9.2c0-3.2-2.4-5.7-5.6-5.7zM9.7 19.2a2.4 2.4 0 0 0 4.6 0" stroke="currentColor" stroke-width="1.6"/></svg>',
    close:'<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#181818"/><path fill-rule="evenodd" d="M17.18 18l-5.09-5.09 1.13-1.13 5.09 5.09 5.1-5.09 1.13 1.13L19.45 18l5.09 5.09-1.13 1.13-5.09-5.09-5.1 5.09-1.13-1.13z" fill="#fff"/></svg>',
    mute:'<svg viewBox="0 0 24 24" fill="none"><path d="M11 5L6.5 8.6H3.5v6.8h3L11 19z" stroke="currentColor" stroke-width="1.5"/><path d="M15 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.5"/></svg>',
    bigPlay:'<svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="35" fill="#000" fill-opacity=".45" stroke="#fff" stroke-width="2"/><path d="M53 34.3c1.3.8 1.3 2.6 0 3.4L29.8 51.3c-1.3.8-3-.2-3-1.7V22.4c0-1.5 1.7-2.5 3-1.7z" fill="#fff"/></svg>'
  };
  var logo = '<svg class="logo" viewBox="0 0 132 36"><defs><linearGradient id="rive-shell-logo" x1="0" y1="0" x2="1" y2=".75"><stop offset="0" stop-color="#f69b65"/><stop offset=".5" stop-color="#ed5c91"/><stop offset="1" stop-color="#ef009d"/></linearGradient></defs>' +
    '<rect x="1" y="1" width="34" height="34" rx="9" fill="url(#rive-shell-logo)"/>' +
    '<path d="M7.6 8.2h6.3q7.9 0 7.9 5.5 0 3.9-3.9 5.1l4.7 7.5h-4.8l-4.3-7.1v7.1H7.6zm4.3 3.9v3.9h2q2.7 0 2.7-2t-2.7-1.9z" fill="#141414"/>' +
    '<path d="M14.7 23.5q-1.2-2.4.8-3.5 2-1.2 3.1 1.2l2.8 5.5 5.1-11.8q1.2-2.8 3.5-1.6 2.4 1.2 1.2 3.5L25.1 30.5q-1.2 2.8-3.5 2.8t-3.5-2.4z" fill="#141414"/>' +
    '<text x="44" y="28" fill="url(#rive-shell-logo)" font-family="Rive Inter,Inter,Roboto,Arial,sans-serif" font-size="27" font-weight="800" letter-spacing="-.6">rive</text></svg>';
  var css = ':host{all:initial;position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483600;display:block;contain:strict;background:#141414}' +
    ':host([hidden]){display:none}' +
    '*{box-sizing:border-box}svg{display:block;width:100%;height:100%}p{margin:0}' +
    '.stage{position:absolute;left:0;top:0;width:1440px;height:var(--h,810px);transform:scale(var(--s,1));transform-origin:0 0;overflow:hidden;background:#141414;color:#fff;font-family:"Rive Inter",Inter,Roboto,"Helvetica Neue",Arial,sans-serif;font-size:16px;line-height:1.2;letter-spacing:-.01em;-webkit-font-smoothing:antialiased}' +
    '.hdr{position:absolute;left:0;top:0;right:0;height:84px;padding:0 58px;display:flex;align-items:center;gap:45px;z-index:6;transition:background-color .4s}' +
    '.hdr::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.7) 13%,rgba(0,0,0,0));z-index:-1}' +
    '.hdr.solid{background-color:#141414}' +
    '.logo{width:120px;height:33px;flex:none}' +
    '.nav{display:flex;align-items:center;gap:24px}' +
    '.ni{position:relative;font-size:18px;line-height:22px;color:#e5e5e5;white-space:nowrap;padding:7px 14px;margin:0 -14px;border-radius:20px;transition:color .15s,background-color .15s}' +
    '.ni.on{color:#fff;font-weight:500}.ni.f{color:#000;background:#fff}' +
    '.tools{margin-left:auto;display:flex;align-items:center;gap:15px}' +
    '.ic{position:relative;width:44px;height:44px;padding:8px;border-radius:50%;color:#fff;transition:background-color .15s}.ic.f{background:#fff;color:#000}' +
    '.av{display:flex;align-items:center;gap:9px;padding:4px;border-radius:6px}.av b{display:block;width:38px;height:38px;border-radius:4px;background:linear-gradient(135deg,#0071eb,#54b9c5);position:relative;overflow:hidden}' +
    '.av b::before,.av b::after{content:"";position:absolute;background:#fff;border-radius:50%}.av b::before{left:10px;top:12px;width:5px;height:5px;box-shadow:13px 0 0 #fff}' +
    '.av b::after{left:9px;top:21px;width:20px;height:8px;border-radius:0 0 10px 10px;background:none;border:2.5px solid #fff;border-top:0}' +
    '.av i{width:14px;height:14px;color:#fff;transition:transform .15s}.av.f{background:rgba(255,255,255,.2)}.av.f i{transform:rotate(180deg)}' +
    '.page{position:absolute;left:0;top:0;width:1440px;transition:transform .45s cubic-bezier(.25,.1,.25,1);will-change:transform}' +
    '.hero{position:relative;height:810px;background:#000;overflow:hidden}' +
    '.hero .bg{position:absolute;inset:0;background:#000 center top/cover no-repeat;transition:opacity .6s}' +
    '.hero .v1{position:absolute;inset:0;background:linear-gradient(196deg,rgba(0,0,0,.6) 0%,rgba(0,0,0,0) 81%);opacity:.2}' +
    '.hero .v2{position:absolute;inset:0;background:linear-gradient(77deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,0) 62%)}' +
    '.tp{position:absolute;left:58px;top:150px;width:560px;display:flex;flex-direction:column;gap:20px;z-index:1}' +
    '.kick{display:flex;align-items:center;gap:8px;height:26px;font-size:16px;font-weight:500;letter-spacing:.32em;color:#dcdcdc;text-transform:uppercase}.kick svg{width:22px;height:22px;flex:none}' +
    '.art{height:207px;display:flex;align-items:flex-end}.art img{display:block;max-width:518px;max-height:207px;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 2px 8px rgba(0,0,0,.4))}' +
    '.art b{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;font-size:64px;line-height:1.02;font-weight:800;letter-spacing:-1.5px;text-shadow:0 2px 12px rgba(0,0,0,.45)}' +
    '.hsyn{font-size:20px;line-height:27px;text-shadow:2px 2px 4px rgba(0,0,0,.45);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}' +
    '.btns{display:flex;gap:11px;align-items:center;margin-top:2px}' +
    '.tb{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:12px;height:52px;padding:0 30px 0 26px;border-radius:4px;font-size:20px;line-height:24px;font-weight:500;letter-spacing:.5px;white-space:nowrap;transition:background-color .1s linear,color .1s linear}' +
    '.tb svg{width:28px;height:28px;flex:none}.tb.white{background:#fff;color:#000}.tb.grey{background:rgba(109,109,110,.7);color:#fff}' +
    '.fo .tb:not(.f){background:rgba(109,109,110,.7);color:#fff}.tb.f{background:#fff;color:#000;transform:scale(1.05)}.tb{transition:background-color .1s linear,color .1s linear,transform .15s ease-out}' +
    '.rating{position:absolute;right:0;top:520px;display:flex;align-items:center;gap:16px;z-index:1}' +
    '.rating span{display:block;height:44px;min-width:120px;padding:10px 50px 10px 15px;background:rgba(51,51,51,.6);border-left:3px solid #dcdcdc;font-size:20px;line-height:24px}' +
    '.rows{position:relative;z-index:2}.rows.over{margin-top:-211px}.rows.top{padding-top:118px}' +
    '.row{position:relative;padding:20px 0 46px 58px}.row.first{background:linear-gradient(180deg,rgba(20,20,20,0) 0%,rgba(20,20,20,.15) 12%,rgba(20,20,20,.35) 26%,rgba(20,20,20,.58) 52%,#141414 100%)}' +
    '.rt{font-size:24px;line-height:24px;font-weight:500;color:#e5e5e5;margin-bottom:15px;white-space:nowrap}' +
    '.trk{display:flex;gap:6px;transition:transform .3s cubic-bezier(.25,.1,.25,1);will-change:transform}' +
    '.cd{position:relative;flex:none;width:218px;height:123px;border-radius:2px;background:#333 center/cover no-repeat}' +
    '.cd{transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s}.cd.f{transform:scale(1.08);box-shadow:0 8px 22px rgba(0,0,0,.7);z-index:2}.trk .cd.f{transform-origin:0 50%}' +
    '.cd .lg{position:absolute;left:10px;bottom:12px;max-width:62%;max-height:46%;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 1px 3px rgba(0,0,0,.6))}' +
    '.cd .tt{position:absolute;left:0;right:0;bottom:0;padding:24px 10px 10px;border-radius:0 0 2px 2px;background:linear-gradient(0deg,rgba(0,0,0,.75),rgba(0,0,0,0));font-size:17px;line-height:20px;font-weight:700;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}' +
    '.cd .mk{position:absolute;left:7px;top:7px;width:16px;height:16px}' +
    '.badge{position:absolute;left:50%;bottom:0;transform:translateX(-50%);padding:3px 7px 2px;border-radius:2px 2px 0 0;background:#f50723;font-size:13px;line-height:15px;font-weight:500;white-space:nowrap;z-index:1}' +
    '.top10{position:absolute;right:0;top:0;width:24px;height:34px;padding-top:4px;background:#f50723;border-radius:0 2px 0 0;font-size:8px;line-height:9px;font-weight:700;text-align:center;letter-spacing:.02em}.top10 b{display:block;font-size:13px;line-height:14px;letter-spacing:-.5px}' +
    '.top10::after{content:"";position:absolute;left:0;right:0;bottom:-6px;border-left:12px solid #f50723;border-right:12px solid #f50723;border-bottom:6px solid transparent}' +
    '.pb{position:absolute;left:43px;top:131px;width:132px;height:3px;background:rgba(255,255,255,.35)}.pb i{display:block;height:100%;background:#f50723}' +
    '.cw .cd{margin-bottom:12px}' +
    '.cd.t10{width:215px;height:154px;background:none}.t10 .n{position:absolute;left:-6px;bottom:-26px;font-size:204px;line-height:1;font-weight:800;letter-spacing:-22px;color:#141414;-webkit-text-stroke:4px #595959;z-index:0}' +
    '.t10 .po{position:absolute;right:0;top:0;width:109px;height:154px;border-radius:2px;background:#333 center/cover no-repeat;z-index:1;transition:transform .2s cubic-bezier(.4,0,.2,1),box-shadow .2s}.cd.t10.f{transform:none;box-shadow:none}.t10.f .po{transform:scale(1.08);box-shadow:0 8px 22px rgba(0,0,0,.7)}' +
    '.sk{flex:none;width:218px;height:123px;border-radius:2px;background:#2f2f2f;animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{50%{background:#3a3a3a}}' +
    '.pv{position:absolute;left:0;top:0;width:1440px;height:500px;z-index:4;background:#141414;opacity:0;visibility:hidden;transition:opacity .3s,visibility 0s .3s;pointer-events:none}' +
    '.pv.on{opacity:1;visibility:visible;transition:opacity .3s}' +
    '.pv .im{position:absolute;right:0;top:0;width:1010px;height:500px;background:#141414 center top/cover no-repeat;transition:background-image .3s}' +
    '.pv .im::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#141414 0%,rgba(20,20,20,.8) 20%,rgba(20,20,20,0) 55%),linear-gradient(0deg,#141414 0%,rgba(20,20,20,0) 38%)}' +
    '.pt{position:absolute;left:58px;top:104px;width:620px;display:flex;flex-direction:column;gap:14px}' +
    '.pt .art{height:130px}.pt .art img{max-width:420px;max-height:130px}.pt .art b{font-size:50px;-webkit-line-clamp:2}' +
    '.pt .meta,.pt .tags{padding:0;margin:0}.pt .tags:empty{display:none}' +
    '.pt .syn{font-size:19px;line-height:27px;color:#e5e5e5;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}' +
    '.bs{display:flex;align-items:center;gap:8px;padding:0 20px}' +
    '.cb{position:relative;flex:none;width:44px;height:44px;padding:11px;border-radius:50%;background:#2a2a2a;border:2px solid rgba(255,255,255,.5);color:#fff;transition:background-color .1s,border-color .1s}' +
    '.cb.p{background:#fff;border-color:#fff;color:#000;padding:10px 9px 10px 11px}.cb.dn{margin-left:auto}.cb.f{background:#fff;border-color:#fff;color:#000;transform:scale(1.08)}.cb{transition:background-color .1s,border-color .1s,color .1s,transform .15s}' +
    '.meta{display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;padding:0 20px;margin-top:16px;font-size:18px;line-height:24px;color:#bcbcbc;white-space:nowrap}' +
    '.grn{color:#46d369;font-weight:500;letter-spacing:.3px}.mat{border:1px solid #bcbcbc;padding:1px 8px;line-height:22px}.hd{border:1px solid #808080;border-radius:4px;padding:0 6px;font-size:13px;line-height:18px;color:#e5e5e5}' +
    '.tags{display:flex;flex-wrap:wrap;gap:4px 8px;padding:0 20px;margin-top:14px;font-size:18px;line-height:24px}.tags span+span::before{content:"";display:inline-block;width:5px;height:5px;margin:0 8px 3px 0;border-radius:50%;background:#646464}' +
    '.ph{display:flex;align-items:center;gap:40px;padding:0 58px 26px}.ph h1{margin:0;font-size:38px;line-height:46px;font-weight:500}' +
    '.dd{position:relative;display:inline-flex;align-items:center;justify-content:space-between;gap:20px;min-width:180px;height:44px;padding:0 14px 0 16px;background:#000;border:1px solid #fff;font-size:18px;letter-spacing:-.2px;white-space:nowrap;transition:background-color .1s}' +
    '.dd i{display:block;width:22px;height:22px;flex:none}.dd.f{background:#fff;color:#000}' +
    '.grid{display:flex;flex-wrap:wrap;gap:64px 6px;padding:10px 58px 80px}.grid .cd{width:214px;height:121px}' +
    '.empty{padding:40px 58px;font-size:22px;line-height:30px;color:#b3b3b3}' +
    '.kb{position:absolute;left:58px;top:118px;width:396px}' +
    '.kr{display:flex;gap:6px;margin-bottom:6px}.kg{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}' +
    '.k{position:relative;height:56px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:#2a2a2a;color:#e5e5e5;font-size:24px;line-height:1;transition:background-color .1s,color .1s,transform .15s}' +
    '.kr .k{flex:1}.k svg{width:26px;height:26px}.k.f{background:#fff;color:#000;transform:scale(1.06);z-index:1}' +
    '.k.mic{color:#fff;background:linear-gradient(135deg,#f69b65,#ed5c91 55%,#ef009d)}.k.mic.f{background:#fff;color:#ed5c91}' +
    '.sug{margin-top:26px}.sug div{padding:9px 14px;margin:0 -14px;border-radius:4px;font-size:20px;line-height:26px;color:#b3b3b3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sug div.f{background:#fff;color:#000}' +
    '.sr{position:absolute;left:496px;top:118px;width:944px;height:calc(var(--h,810px) - 118px)}' +
    '.sq{height:46px;margin-bottom:22px;font-size:34px;line-height:46px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sq.ph2{font-size:26px;font-weight:400;color:#808080}' +
    '.gw{position:absolute;left:-20px;top:58px;right:0;bottom:0;overflow:hidden}' +
    '.sr .grid{position:relative;padding:12px 58px 80px 20px;gap:56px 6px;transition:transform .3s cubic-bezier(.25,.1,.25,1)}' +
    '.ov{position:absolute;inset:0;z-index:10;background:rgba(0,0,0,.7);opacity:0;visibility:hidden;transition:opacity .25s,visibility 0s .25s}.ov.on{opacity:1;visibility:visible;transition:opacity .25s}' +
    '.mw{position:absolute;left:265px;top:0;width:910px;transition:transform .4s cubic-bezier(.25,.1,.25,1);will-change:transform}' +
    '.md{position:relative;margin:30px 0 60px;background:#181818;border-radius:6px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.75);transform:scale(.9);opacity:0;transition:transform .25s ease-out,opacity .25s ease-out}.ov.on .md{transform:none;opacity:1}' +
    '.mh{position:relative;height:514px;background:#000 center top/cover no-repeat}.mh::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(24,24,24,0) 49%,#181818 100%),linear-gradient(90deg,rgba(24,24,24,.55) 0%,rgba(24,24,24,0) 55%)}' +
    '.mh .x{position:absolute;right:16px;top:16px;width:40px;height:40px;z-index:2}' +
    '.mh .tp2{position:absolute;left:52px;bottom:112px;width:420px;z-index:1;display:flex;flex-direction:column;gap:12px}.mh .art{height:150px}.mh .art img{max-width:400px;max-height:150px}.mh .art b{font-size:46px}' +
    '.mh .bs{position:absolute;left:52px;bottom:44px;padding:0;z-index:1}.mh .tb{height:52px}.mh .mt2{position:absolute;right:52px;bottom:48px;width:44px;height:44px;padding:10px;border-radius:50%;border:2px solid rgba(255,255,255,.5);color:rgba(255,255,255,.8);z-index:1}' +
    '.mi{display:flex;gap:32px;padding:4px 52px 20px}.ml{flex:1;min-width:0}.ml .meta{padding:0;margin:0}.ms{margin-top:18px;font-size:19px;line-height:29px}' +
    '.mr{width:250px;flex:none;font-size:17px;line-height:23px}.mr p{margin-bottom:12px}.mr span{color:#777}' +
    '.sec{display:flex;align-items:center;justify-content:space-between;padding:0 52px;margin:34px 0 20px}.sec h2{margin:0;font-size:28px;line-height:34px;font-weight:500}.sec em{font-style:normal;font-size:20px;color:#d2d2d2}' +
    '.ei{position:relative;display:flex;align-items:center;gap:0;margin:0 52px;padding:20px 40px 20px 16px;min-height:136px;border-radius:4px;border-bottom:1px solid #404040;transition:background-color .1s}' +
    '.ei.cur{background:#333;border-bottom-color:transparent}.ei.f{background:#4a4a4a;border-bottom-color:transparent}' +
    '.en{width:54px;flex:none;font-size:26px;line-height:30px;color:#dcdcdc;text-align:center}' +
    '.et{position:relative;flex:none;width:156px;height:88px;margin:0 20px 0 6px;border-radius:4px;background:#333 center/cover no-repeat;overflow:hidden}' +
    '.et::before{content:"";position:absolute;inset:0;background:linear-gradient(207deg,rgba(23,23,23,.7) 0%,rgba(23,23,23,.5) 13%,rgba(23,23,23,0) 29%)}' +
    '.et svg{position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;opacity:0;transition:opacity .15s}.ei.f .et svg{opacity:1}' +
    '.et .pb2{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(128,128,128,.85)}.et .pb2 i{display:block;height:100%;background:#f50723}' +
    '.ex{flex:1;min-width:0}.ex div{display:flex;justify-content:space-between;gap:20px;font-size:20px;line-height:26px;font-weight:500;margin-bottom:8px}.ex div span:first-child{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.ex div span+span{font-weight:400;flex:none}' +
    '.ex p{font-size:17px;line-height:24px;color:#d2d2d2;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}' +
    '.sg{display:flex;flex-wrap:wrap;gap:18px 21px;padding:0 52px 52px}' +
    '.sc{position:relative;width:254px;height:380px;border-radius:4px;background:#2f2f2f;overflow:hidden;transition:background-color .15s,transform .2s,box-shadow .2s}.sc.f{background:#4a4a4a;transform:scale(1.04);box-shadow:0 8px 22px rgba(0,0,0,.6);z-index:1}' +
    '.sc .si{position:relative;height:143px;background:#333 center/cover no-repeat}.sc .si .lg{position:absolute;left:10px;bottom:10px;max-width:60%;max-height:44%;object-fit:contain;object-position:left bottom}' +
    '.sc .si .tt{position:absolute;left:0;right:0;bottom:0;padding:20px 10px 8px;background:linear-gradient(0deg,rgba(0,0,0,.75),rgba(0,0,0,0));font-size:17px;font-weight:700}' +
    '.sc .sm{display:flex;align-items:center;justify-content:space-between;padding:14px 16px}.sc .sm .meta{padding:0;margin:0;font-size:17px}.sc .cb{width:40px;height:40px;padding:9px}' +
    '.sc p{padding:0 16px;font-size:16px;line-height:22px;color:#d2d2d2;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:7;overflow:hidden}' +
    '.list{position:absolute;z-index:12;min-width:220px;max-height:420px;overflow:hidden;padding:11px 0;background:rgba(0,0,0,.92);border:1px solid #2a2a2a;box-shadow:0 8px 24px rgba(0,0,0,.6)}' +
    '.list .li{padding:12px 22px;font-size:20px;line-height:24px;color:#e5e5e5;white-space:nowrap}.list .li.sel{font-weight:500;color:#fff}.list .li.f{background:#414141;color:#fff}' +
    '.list .in2{transition:transform .2s}' +
    '.spin{position:absolute;left:50%;top:50%;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;border:6px solid rgba(255,255,255,.15);border-top-color:#e50914;animation:spin 1s linear infinite;opacity:0;transition:opacity .2s;z-index:20}.spin.on{opacity:1}' +
    '@keyframes spin{to{transform:rotate(360deg)}}' +
    '.idle .cd.f{transform:none;box-shadow:none}';
  var documentStyle = '@font-face{font-family:"Rive Inter";src:url("' + ASSETS + 'fonts/Inter-Variable.woff2") format("woff2");font-weight:100 900;font-display:swap}' +
    'html[data-rive-shell],html[data-rive-shell] body{overflow:hidden!important;background:#141414!important}html[data-rive-shell] body{display:none!important}';

  var nav = window.RiveTV, original = {};
  var host, shadow, el = {}, active = false, ready = false, suspended = false;
  var view = null, focus = {block:-1, index:0}, navIndex = 0, pageY = 0;
  var modal = null, modalStack = [], list = null;
  var previewTimer = 0, previewFor = null, renderToken = 0;
  var cache = {}, siteCache = {}, require = null, auth = null, genreNames = null;
  var watchlist = {movie:[], tv:[]}, liked = readJSON('RiveTVLiked', []);

  function readJSON(key, fallback) {
    try { var value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch (_) { return fallback; }
  }
  function esc(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function plural(n, one, few, many) {
    var t = n % 100, u = n % 10;
    return n === 1 ? one : (u >= 2 && u <= 4 && (t < 12 || t > 14)) ? few : many;
  }
  function duration(minutes) {
    if (!minutes) return '';
    var h = Math.floor(minutes / 60), m = minutes % 60;
    return h ? h + ' godz.' + (m ? ' ' + m + ' min' : '') : m + ' min';
  }
  function image(path, size) { return path ? IMG + size + path : ''; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function daysSince(date) { return date ? (Date.now() - new Date(date).getTime()) / 864e5 : Infinity; }

  function siteRequire() {
    if (require) return require;
    var chunks = window.webpackChunk_N_E;
    if (!chunks || !chunks.push) return null;
    try { chunks.push([['rive-tv-shell'], {}, function (r) { require = r; }]); } catch (_) {}
    return require;
  }
  function siteModule(marker) {
    if (siteCache.hasOwnProperty(marker)) return siteCache[marker];
    var req = siteRequire();
    if (!req || !req.m) return null;
    for (var id in req.m) {
      if (String(req.m[id]).indexOf(marker) !== -1) {
        try { siteCache[marker] = req(id); } catch (_) { siteCache[marker] = null; }
        return siteCache[marker];
      }
    }
    siteCache[marker] = null;
    return null;
  }
  function siteFunction(marker, test) {
    var mod = siteModule(marker);
    if (!mod) return null;
    for (var key in mod) {
      var fn;
      try { fn = mod[key]; } catch (_) { continue; }
      if (typeof fn === 'function' && test(String(fn))) return fn;
    }
    return null;
  }
  function userId() {
    var req = siteRequire();
    if (!auth && req && req.c) {
      for (var id in req.c) {
        var ex = req.c[id] && req.c[id].exports;
        if (!ex || typeof ex !== 'object') continue;
        for (var key in ex) {
          var value;
          try { value = ex[key]; } catch (_) { continue; }
          if (value && typeof value === 'object' && 'currentUser' in value && 'app' in value) { auth = value; break; }
        }
        if (auth) break;
      }
    }
    try { return auth && auth.currentUser ? auth.currentUser.uid : null; } catch (_) { return null; }
  }
  function request(params) {
    var query = {language:LANG};
    for (var key in params) query[key] = params[key];
    var id = JSON.stringify(query);
    if (cache[id]) return cache[id];
    var fetcher = siteFunction('backendfetch', function (src) { return src.indexOf('requestID') !== -1; });
    if (!fetcher) return Promise.resolve(null);
    cache[id] = Promise.resolve().then(function () { return fetcher(query); }).then(function (data) {
      if (!data || data.success === false) { delete cache[id]; return null; }
      return data;
    }, function () { delete cache[id]; return null; });
    return cache[id];
  }
  function normalize(raw, type) {
    if (!raw || !raw.id) return null;
    type = raw.media_type || type;
    if (type !== 'movie' && type !== 'tv') return null;
    var date = raw.release_date || raw.first_air_date || '';
    return {type:type, id:String(raw.id), title:raw.title || raw.name || raw.original_title || raw.original_name || '',
      backdrop:raw.backdrop_path || '', poster:raw.poster_path || '', overview:raw.overview || '', date:date, year:date.slice(0, 4),
      vote:raw.vote_average || 0, genres:raw.genre_ids || (raw.genres || []).map(function (g) { return g.id; }), raw:raw};
  }
  function results(params, type, limit) {
    return request(params).then(function (data) {
      var seen = {}, out = [];
      ((data && data.results) || []).forEach(function (raw) {
        var item = normalize(raw, type);
        if (!item || !item.backdrop || seen[item.type + item.id]) return;
        seen[item.type + item.id] = true;
        out.push(item);
      });
      return out.slice(0, limit || 20);
    });
  }
  function details(item) {
    return request({requestID:item.type === 'tv' ? 'tvData' : 'movieData', id:item.id}).then(function (data) {
      if (data && !data.overview && LANG !== 'en-US') {
        return request({requestID:item.type === 'tv' ? 'tvData' : 'movieData', id:item.id, language:'en-US'}).then(function (en) {
          if (en && en.overview) data.overview = en.overview;
          return data;
        });
      }
      return data;
    });
  }
  function logoFor(item) {
    if (item.logo !== undefined) return Promise.resolve(item.logo);
    var key = item.type + ':' + item.id;
    if (logoFor.cache[key] !== undefined) { item.logo = logoFor.cache[key]; return Promise.resolve(item.logo); }
    return request({requestID:item.type === 'tv' ? 'tvImages' : 'movieImages', id:item.id}).then(function (data) {
      var logos = (data && data.logos) || [], pick = null;
      ['pl', 'en', null].some(function (lang) {
        pick = logos.filter(function (l) { return l.iso_639_1 === lang && !/\.svg$/.test(l.file_path); })[0];
        return !!pick;
      });
      item.logo = logoFor.cache[key] = pick ? pick.file_path : '';
      return item.logo;
    });
  }
  logoFor.cache = {};
  function genres() {
    if (genreNames) return Promise.resolve(genreNames);
    return Promise.all([request({requestID:'genresMovie'}), request({requestID:'genresTv'})]).then(function (all) {
      genreNames = {};
      all.forEach(function (data) { ((data && data.genres) || []).forEach(function (g) { genreNames[g.id] = g.name; }); });
      return genreNames;
    });
  }

  function loadWatchlist() {
    var uid = userId();
    var get = siteFunction('"RiveStreamWatchlist"', function (src) { return src.indexOf('172800') !== -1; });
    var local = function () { var data = readJSON('RiveStreamWatchlist', {}); return {movie:data.movie || [], tv:data.tv || []}; };
    return (get ? Promise.resolve().then(function () { return get(uid); }) : Promise.resolve(local())).then(function (data) {
      watchlist = {movie:((data && data.movie) || []).map(String), tv:((data && data.tv) || []).map(String)};
      return watchlist;
    }, function () { watchlist = local(); return watchlist; });
  }
  function inList(item) { return (watchlist[item.type] || []).indexOf(String(item.id)) !== -1; }
  function toggleList(item) {
    var adding = !inList(item), uid = userId();
    var fn = siteFunction('"RiveStreamWatchlist"', function (src) { return src.indexOf(adding ? 'method:"PUT"' : 'method:"DELETE"') !== -1; });
    if (adding) watchlist[item.type].unshift(String(item.id));
    else watchlist[item.type] = watchlist[item.type].filter(function (id) { return id !== String(item.id); });
    if (fn) { try { fn({userId:uid, type:item.type, id:item.id}); } catch (_) {} }
    else localStorage.setItem('RiveStreamWatchlist', JSON.stringify({movie:watchlist.movie, tv:watchlist.tv, manga:[]}));
    invalidate('list');
    return adding;
  }
  function isLiked(item) { return liked.indexOf(item.type + ':' + item.id) !== -1; }
  function toggleLike(item) {
    var key = item.type + ':' + item.id;
    liked = isLiked(item) ? liked.filter(function (k) { return k !== key; }) : [key].concat(liked).slice(0, 500);
    try { localStorage.setItem('RiveTVLiked', JSON.stringify(liked)); } catch (_) {}
  }
  function continueEntries() {
    var get = siteFunction('"RiveStreamContinueWatching"', function (src) { return !/method:"(PUT|DELETE)"/.test(src); });
    var local = function () { var data = readJSON('RiveStreamContinueWatching', {}); return {movie:data.movie || [], tv:data.tv || []}; };
    return (get ? Promise.resolve().then(function () { return get(); }) : Promise.resolve(local())).then(function (data) {
      return data || local();
    }, local).then(function (data) {
      var tracker = readJSON('RiveStreamWatchTracker', {}), out = [];
      (data.movie || []).forEach(function (id) { out.push({type:'movie', id:String(id), date:0}); });
      (data.tv || []).forEach(function (entry) { if (entry && entry.id) out.push({type:'tv', id:String(entry.id), season:Number(entry.season) || 1, episode:Number(entry.episode) || 1}); });
      out.forEach(function (entry) { entry.progress = progress(entry, tracker); });
      return out.slice(0, 20);
    });
  }
  function progress(entry, tracker) {
    tracker = tracker || readJSON('RiveStreamWatchTracker', {});
    if (entry.type === 'movie') {
      var movie = (tracker.movie || []).filter(function (m) { return String(m.id) === String(entry.id); })[0];
      return movie ? Number(movie.watchPercentage) || 0 : 0;
    }
    var show = (tracker.tv || []).filter(function (t) { return String(t.id) === String(entry.id); })[0];
    var episode = show && (show.data || []).filter(function (d) { return Number(d.season) === Number(entry.season) && Number(d.episode) === Number(entry.episode); })[0];
    return episode ? Number(episode.watchPercentage) || 0 : 0;
  }
  function episodeProgress(id) {
    var tracker = readJSON('RiveStreamWatchTracker', {}), map = {};
    var show = (tracker.tv || []).filter(function (t) { return String(t.id) === String(id); })[0];
    ((show && show.data) || []).forEach(function (d) { map[d.season + ':' + d.episode] = Number(d.watchPercentage) || 0; });
    return map;
  }
  function resumeEntry(item) {
    return continueEntries().then(function (entries) {
      return entries.filter(function (e) { return e.type === item.type && e.id === String(item.id); })[0] || null;
    });
  }
  function fromIds(entries) {
    return Promise.all(entries.map(function (entry) {
      return request({requestID:entry.type === 'tv' ? 'tvData' : 'movieData', id:entry.id}).then(function (data) {
        var item = normalize(data, entry.type);
        if (!item) return null;
        item.entry = entry;
        return item;
      });
    })).then(function (items) { return items.filter(function (item) { return item && (item.backdrop || item.poster); }); });
  }

  var sections = {
    home:function () {
      return [
        {key:'cw', title:'Kontynuuj oglądanie', kind:'cw', load:function () { return continueEntries().then(fromIds); }},
        {key:'trend', title:'Dopasowane dla Ciebie', load:function () { return results({requestID:'trending', page:1}); }, hero:true},
        {key:'new', title:'Nowości na Rive', load:function () { return results({requestID:'latestMovie', page:1}, 'movie'); }},
        {key:'top-movie', title:'Top 10 filmów w Polsce dzisiaj', kind:'top', load:function () { return results({requestID:'trendingMovieDay', page:1}, 'movie', 10); }},
        {key:'love', title:'Myślimy, że to pokochasz', load:function () { return results({requestID:'popularMovie', page:1}, 'movie'); }},
        {key:'list', title:'Moja lista', load:function () { return loadWatchlist().then(listItems); }},
        {key:'anim', title:'Animacja', load:function () { return results({requestID:'filterMovie', genreKeywords:'16', sortBy:'popularity.desc', page:1}, 'movie'); }},
        {key:'drama', title:'Inspirujące filmy', load:function () { return results({requestID:'filterMovie', genreKeywords:'18', sortBy:'popularity.desc', page:1}, 'movie'); }},
        {key:'weekend', title:'Do obejrzenia w jeden weekend', load:function () { return results({requestID:'popularTv', page:1}, 'tv'); }},
        {key:'top-tv', title:'Top 10 seriali w Polsce dzisiaj', kind:'top', load:function () { return results({requestID:'trendingTvDay', page:1}, 'tv', 10); }},
        {key:'critics', title:'Filmy docenione przez krytyków', load:function () { return results({requestID:'topRatedMovie', page:1}, 'movie'); }},
        {key:'fresh', title:'Dzisiejsze świeże propozycje', load:function () { return results({requestID:'onTheAirTv', page:1}, 'tv'); }},
        {key:'adult', title:'Animacja dla dorosłych', load:function () { return results({requestID:'filterTv', genreKeywords:'16', sortBy:'popularity.desc', page:1}, 'tv'); }}
      ];
    },
    tv:function () {
      return [
        {key:'tv-pop', title:'Popularne seriale', load:function () { return results({requestID:'popularTv', page:1}, 'tv'); }, hero:true},
        {key:'top-tv', title:'Top 10 seriali w Polsce dzisiaj', kind:'top', load:function () { return results({requestID:'trendingTvDay', page:1}, 'tv', 10); }},
        {key:'tv-air', title:'Nowe odcinki', load:function () { return results({requestID:'onTheAirTv', page:1}, 'tv'); }},
        {key:'tv-today', title:'Emitowane dzisiaj', load:function () { return results({requestID:'latestTv', page:1}, 'tv'); }},
        {key:'tv-crime', title:'Seriale kryminalne', load:function () { return results({requestID:'filterTv', genreKeywords:'80', sortBy:'popularity.desc', page:1}, 'tv'); }},
        {key:'tv-comedy', title:'Seriale komediowe', load:function () { return results({requestID:'filterTv', genreKeywords:'35', sortBy:'popularity.desc', page:1}, 'tv'); }},
        {key:'adult', title:'Anime i animacja', load:function () { return results({requestID:'filterTv', genreKeywords:'16', sortBy:'popularity.desc', page:1}, 'tv'); }},
        {key:'tv-scifi', title:'Sci-fi i fantasy', load:function () { return results({requestID:'filterTv', genreKeywords:'10765', sortBy:'popularity.desc', page:1}, 'tv'); }},
        {key:'tv-top', title:'Najwyżej oceniane seriale', load:function () { return results({requestID:'topRatedTv', page:1}, 'tv'); }}
      ];
    },
    movie:function () {
      return [
        {key:'movie-pop', title:'Popularne filmy', load:function () { return results({requestID:'popularMovie', page:1}, 'movie'); }, hero:true},
        {key:'top-movie', title:'Top 10 filmów w Polsce dzisiaj', kind:'top', load:function () { return results({requestID:'trendingMovieDay', page:1}, 'movie', 10); }},
        {key:'new', title:'Nowości', load:function () { return results({requestID:'latestMovie', page:1}, 'movie'); }},
        {key:'movie-action', title:'Filmy akcji', load:function () { return results({requestID:'filterMovie', genreKeywords:'28', sortBy:'popularity.desc', page:1}, 'movie'); }},
        {key:'movie-comedy', title:'Komedie', load:function () { return results({requestID:'filterMovie', genreKeywords:'35', sortBy:'popularity.desc', page:1}, 'movie'); }},
        {key:'movie-horror', title:'Horrory', load:function () { return results({requestID:'filterMovie', genreKeywords:'27', sortBy:'popularity.desc', page:1}, 'movie'); }},
        {key:'anim', title:'Animacja', load:function () { return results({requestID:'filterMovie', genreKeywords:'16', sortBy:'popularity.desc', page:1}, 'movie'); }},
        {key:'critics', title:'Filmy docenione przez krytyków', load:function () { return results({requestID:'topRatedMovie', page:1}, 'movie'); }}
      ];
    },
    'new':function () {
      return [
        {key:'new', title:'Nowości na Rive', load:function () { return results({requestID:'latestMovie', page:1}, 'movie'); }},
        {key:'tv-air', title:'Nowe odcinki', load:function () { return results({requestID:'onTheAirTv', page:1}, 'tv'); }},
        {key:'top-tv', title:'Top 10 seriali w Polsce dzisiaj', kind:'top', load:function () { return results({requestID:'trendingTvDay', page:1}, 'tv', 10); }},
        {key:'top-movie', title:'Top 10 filmów w Polsce dzisiaj', kind:'top', load:function () { return results({requestID:'trendingMovieDay', page:1}, 'movie', 10); }},
        {key:'week-movie', title:'Popularne w tym tygodniu', load:function () { return results({requestID:'trendingMovie', page:1}, 'movie'); }},
        {key:'tv-today', title:'Emitowane dzisiaj', load:function () { return results({requestID:'latestTv', page:1}, 'tv'); }}
      ];
    }
  };
  var dynamicRows = {cw:true, list:true};
  var rowCache = {};
  function invalidate(key) { delete rowCache[key]; }
  function loadRow(spec) {
    var hit = rowCache[spec.key];
    if (hit && !dynamicRows[spec.key] && Date.now() - hit.time < 6e5) return hit.promise;
    var promise = spec.load().then(function (items) { return items || []; }, function () { return []; });
    rowCache[spec.key] = {time:Date.now(), promise:promise};
    return promise;
  }
  function listItems() {
    var entries = watchlist.tv.map(function (id) { return {type:'tv', id:id}; }).concat(watchlist.movie.map(function (id) { return {type:'movie', id:id}; }));
    return fromIds(entries.slice(0, 60));
  }
  function topIds() {
    var ids = {};
    ['top-movie', 'top-tv'].forEach(function (key) {
      var hit = rowCache[key];
      if (hit && hit.items) hit.items.forEach(function (item) { ids[item.type + item.id] = true; });
    });
    return ids;
  }

  function mount() {
    if (host) return;
    var style = document.createElement('style');style.id = 'rive-shell-style';style.textContent = documentStyle;
    (document.head || document.documentElement).appendChild(style);
    el.documentStyle = style;
    host = document.createElement('div');host.id = 'rive-shell';host.hidden = true;
    shadow = host.attachShadow({mode:'open'});
    shadow.innerHTML = '<style>' + css + '</style><div class="stage"><div class="page"></div><div class="hdr"></div><div class="pv"><div class="im"></div><div class="pt"></div></div><div class="ov"><div class="mw"></div></div><div class="spin"></div></div>';
    el.stage = shadow.querySelector('.stage');el.page = shadow.querySelector('.page');el.hdr = shadow.querySelector('.hdr');
    el.pv = shadow.querySelector('.pv');el.pvImage = shadow.querySelector('.pv .im');el.pvText = shadow.querySelector('.pv .pt');el.ov = shadow.querySelector('.ov');el.mw = shadow.querySelector('.mw');el.spin = shadow.querySelector('.spin');
    renderHeader();
    window.addEventListener('resize', layout);
    layout();
  }
  function attach() {
    if (!host.isConnected) document.documentElement.appendChild(host);
    if (!el.documentStyle.isConnected) (document.head || document.documentElement).appendChild(el.documentStyle);
  }
  function layout() {
    if (!el.stage || !innerWidth) return;
    var scale = innerWidth / 1440;
    el.stage.style.setProperty('--s', String(scale));
    el.stage.style.setProperty('--h', (innerHeight / scale) + 'px');
  }
  function stageHeight() { return innerHeight / (innerWidth / 1440); }

  function renderHeader() {
    var html = logo + '<div class="nav">';
    NAV.forEach(function (item, index) { html += '<div class="ni" data-n="' + index + '">' + esc(item.label) + '</div>'; });
    html += '</div><div class="tools"><div class="ic" data-n="search">' + icons.search + '</div><div class="ic" data-n="bell">' + icons.bell + '</div><div class="av" data-n="profile"><b></b><i>' + icons.caret + '</i></div></div>';
    el.hdr.innerHTML = html;
    el.navItems = Array.prototype.slice.call(el.hdr.querySelectorAll('[data-n]'));
  }
  function updateHeader() {
    el.navItems.forEach(function (node, index) {
      var id = NAV[index] ? NAV[index].id : node.getAttribute('data-n');
      node.classList.toggle('on', view && id === view.section);
    });
    el.hdr.classList.toggle('solid', pageY > 20 || (view && !view.hero));
  }

  function cardHTML(item, kind, index, tops) {
    var badge = '';
    if (kind !== 'cw' && kind !== 'top') {
      if (daysSince(item.date) < 45) badge = '<span class="badge">' + (item.type === 'tv' ? 'Nowy serial' : 'Ostatnio dodane') + '</span>';
      else if (item.type === 'tv' && item.raw && item.raw.last_air_date && daysSince(item.raw.last_air_date) < 30) badge = '<span class="badge">Nowy sezon</span>';
    }
    if (kind === 'top') {
      return '<div class="cd t10" data-i="' + index + '"><span class="n">' + (index + 1) + '</span><div class="po" style="background-image:url(\'' + image(item.poster, 'w342') + '\')"></div></div>';
    }
    var top = kind !== 'cw' && tops[item.type + item.id] ? '<span class="top10">TOP<b>10</b></span>' : '';
    var bar = kind === 'cw' && item.entry ? '<div class="pb"><i style="width:' + Math.max(4, Math.min(100, item.entry.progress || 4)) + '%"></i></div>' : '';
    return '<div class="cd" data-i="' + index + '" data-img="' + esc(image(item.backdrop || item.poster, 'w300')) + '">' + top + badge + '<span class="tt">' + esc(item.title) + '</span>' + bar + '</div>';
  }
  function heroHTML(item) {
    var kicker = item.type === 'tv' ? 'Serial' : 'Film';
    return '<div class="hero"><div class="bg" style="background-image:url(\'' + image(item.backdrop, 'w1280') + '\')"></div><div class="v1"></div><div class="v2"></div>' +
      '<div class="tp"><div class="kick">' + logoMark() + esc(kicker) + '</div><div class="art"><b>' + esc(item.title) + '</b></div>' +
      '<p class="hsyn">' + esc(item.overview) + '</p>' +
      '<div class="btns"><div class="tb white" data-h="0">' + icons.play + '<span>Odtwórz</span></div><div class="tb grey" data-h="1">' + icons.info + '<span>Więcej informacji</span></div></div></div>' +
      '<div class="rating"><span>' + esc(item.year || (item.type === 'tv' ? 'Serial' : 'Film')) + '</span></div></div>';
  }
  function logoMark() {
    return '<svg viewBox="0 0 36 36"><rect x="1" y="1" width="34" height="34" rx="9" fill="url(#rive-shell-logo)"/><path d="M7.6 8.2h6.3q7.9 0 7.9 5.5 0 3.9-3.9 5.1l4.7 7.5h-4.8l-4.3-7.1v7.1H7.6zm4.3 3.9v3.9h2q2.7 0 2.7-2t-2.7-1.9z" fill="#141414"/><path d="M14.7 23.5q-1.2-2.4.8-3.5 2-1.2 3.1 1.2l2.8 5.5 5.1-11.8q1.2-2.8 3.5-1.6 2.4 1.2 1.2 3.5L25.1 30.5q-1.2 2.8-3.5 2.8t-3.5-2.4z" fill="#141414"/></svg>';
  }

  function openSection(section, keepFocus) {
    var token = ++renderToken;
    hidePreview();
    view = {section:section, blocks:[], hero:null};
    ready = false;
    el.spin.classList.add('on');
    if (section === 'list') return renderGrid(token, 'Moja lista', loadWatchlist().then(listItems), 'Dodawaj filmy i seriale do Mojej listy, żeby łatwo do nich wrócić.', keepFocus);
    if (section === 'search') return renderSearch(token, keepFocus);
    if (section === 'lang') return renderLanguage(token, keepFocus);
    var specs = sections[section]();
    var heroSpec = specs.filter(function (s) { return s.hero; })[0];
    return Promise.all(specs.map(function (spec) {
      return loadRow(spec).then(function (items) { rowCache[spec.key] && (rowCache[spec.key].items = items); return items; });
    })).then(function (all) {
      if (token !== renderToken) return;
      var tops = topIds(), html = '', heroItem = null;
      if (heroSpec) {
        var pool = all[specs.indexOf(heroSpec)].filter(function (item) { return item.overview; });
        heroItem = pool[Math.floor(Date.now() / 36e5) % Math.max(1, Math.min(5, pool.length))] || null;
      }
      if (heroItem) html += heroHTML(heroItem);
      else html += '<div class="ph" style="padding-top:118px"><h1>' + esc(NAV.filter(function (n) { return n.id === section; })[0].label) + '</h1></div>';
      html += '<div class="rows ' + (heroItem ? 'over' : '') + '">';
      var rows = [];
      specs.forEach(function (spec, index) {
        var items = all[index];
        if (!items.length) return;
        rows.push({spec:spec, items:items});
      });
      rows.forEach(function (row, index) {
        html += '<div class="row' + (index === 0 && heroItem ? ' first' : '') + (row.spec.kind === 'cw' ? ' cw' : '') + '" data-r="' + index + '"><div class="rt">' + esc(row.spec.title) + '</div><div class="trk">';
        row.items.forEach(function (item, i) { html += cardHTML(item, row.spec.kind, i, tops); });
        html += '</div></div>';
      });
      html += '</div>';
      el.page.innerHTML = html;
      view.hero = heroItem;
      if (heroItem) {
        view.blocks.push({type:'hero', el:el.page.querySelector('.hero'), items:[heroItem], index:0});
        heroLogo(heroItem);
      }
      var rowEls = el.page.querySelectorAll('.row');
      rows.forEach(function (row, index) {
        view.blocks.push({type:'row', el:rowEls[index], items:row.items, kind:row.spec.kind, key:row.spec.key, index:0, cards:rowEls[index].querySelectorAll('.cd')});
      });
      finishRender(keepFocus);
    });
  }
  function heroLogo(item) {
    logoFor(item).then(function (path) {
      if (!path || !view || view.hero !== item) return;
      var art = el.page.querySelector('.hero .art');
      if (art) art.innerHTML = '<img src="' + image(path, 'w500') + '" alt="">';
    });
  }
  function renderGrid(token, title, promise, emptyText, keepFocus, extra) {
    return promise.then(function (items) {
      if (token !== renderToken) return;
      var html = '<div class="ph" style="padding-top:118px"><h1>' + esc(title) + '</h1>' + (extra || '') + '</div>';
      if (!items.length) html += '<p class="empty">' + esc(emptyText) + '</p>';
      html += '<div class="grid">';
      var tops = topIds();
      items.forEach(function (item, i) { html += cardHTML(item, 'grid', i, tops); });
      html += '</div>';
      el.page.innerHTML = html;
      if (extra) view.blocks.push({type:'filter', el:el.page.querySelector('.ph'), index:0});
      if (items.length) view.blocks.push({type:'grid', el:el.page.querySelector('.grid'), items:items, index:0, cards:el.page.querySelectorAll('.grid .cd')});
      finishRender(keepFocus);
    });
  }
  function renderSearch(token, keepFocus) {
    view.query = (keepFocus && keepFocus.query) || '';
    var keys = '<div class="kr"><div class="k mic" data-k="mic">' + icons.mic + '</div><div class="k" data-k=" ">' + icons.space + '</div><div class="k" data-k="del">' + icons.del + '</div></div><div class="kg">';
    KEYS.forEach(function (key) { keys += '<div class="k" data-k="' + key + '">' + key + '</div>'; });
    el.page.innerHTML = '<div class="kb">' + keys + '</div><div class="sug"></div></div><div class="sr"><div class="sq"></div><div class="gw"><div class="grid"></div></div></div>';
    view.blocks.push({type:'keys', el:el.page.querySelector('.kb'), nodes:el.page.querySelectorAll('.k'), index:3, col:0});
    view.blocks.push({type:'sugg', el:el.page.querySelector('.sug'), items:[], nodes:[], index:0});
    view.blocks.push({type:'grid', el:el.page.querySelector('.sr .grid'), items:[], cards:[], index:0, columns:4, scroll:true});
    return searchResults(view.query).then(function (items) {
      if (token !== renderToken) return;
      fillSearch(items);
      finishRender(keepFocus && keepFocus.block != null ? keepFocus : {block:0, index:3});
    });
  }
  function searchResults(query) {
    if (!query) return results({requestID:'trending', page:1}, null, 30);
    return request({requestID:'searchMulti', query:query, page:1}).then(function (data) {
      return ((data && data.results) || []).map(function (raw) { return normalize(raw); }).filter(function (item) { return item && (item.backdrop || item.poster); }).slice(0, 36);
    });
  }
  function fillSearch(items) {
    var html = '', tops = topIds(), grid = view.blocks[2], sugg = view.blocks[1];
    showQuery();
    items.forEach(function (item, i) { html += cardHTML(item, 'grid', i, tops); });
    grid.el.innerHTML = items.length ? html : '<p class="empty" style="padding:0">Brak wyników. Spróbuj innego tytułu.</p>';
    grid.el.style.transform = '';
    grid.items = items;grid.cards = grid.el.querySelectorAll('.cd');grid.index = 0;
    sugg.items = view.query ? items.map(function (item) { return item.title; }).filter(function (title, i, all) { return all.indexOf(title) === i; }).slice(0, 4) : [];
    sugg.el.innerHTML = sugg.items.map(function (title) { return '<div>' + esc(title) + '</div>'; }).join('');
    sugg.nodes = sugg.el.querySelectorAll('div');sugg.index = 0;
    if (focus.block > 0 && !view.blocks[focus.block].items.length) focus.block = 0;
    hydrate();
    if (ready) applyFocus();
  }
  function showQuery() {
    var heading = el.page.querySelector('.sq');
    heading.textContent = view.query || 'Popularne wyszukiwania';
    heading.classList.toggle('ph2', !view.query);
  }
  function setQuery(query) {
    view.query = query;
    showQuery();
    clearTimeout(api.searchTimer);
    api.searchTimer = setTimeout(function () {
      var token = renderToken;
      searchResults(query).then(function (items) {
        if (token === renderToken && view.query === query) fillSearch(items);
      });
    }, 250);
  }
  function renderLanguage(token, keepFocus) {
    var lang = view.lang = keepFocus && keepFocus.lang != null ? keepFocus.lang : 0;
    var choice = LANGUAGES[lang];
    var promise = Promise.all([
      results({requestID:'filterTv', genreKeywords:'', country:choice.country, sortBy:'popularity.desc', page:1}, 'tv', 18),
      results({requestID:'filterMovie', genreKeywords:'', country:choice.country, sortBy:'popularity.desc', page:1}, 'movie', 18)
    ]).then(function (all) {
      var out = [], a = all[0], b = all[1];
      for (var i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
      return out;
    });
    var extra = '<span style="font-size:20px;color:#fff">Wybierz preferencje</span><div class="dd" data-d="lang"><span>' + esc(choice.label) + '</span><i>' + icons.caret + '</i></div>';
    return renderGrid(token, 'Przeglądaj według języka', promise, 'Brak tytułów w tym języku.', keepFocus, extra);
  }
  function finishRender(keepFocus) {
    el.spin.classList.remove('on');
    ready = true;
    if (keepFocus && keepFocus.block != null && view.blocks.length) {
      focus = {block:Math.min(keepFocus.block, view.blocks.length - 1), index:0};
      var block = view.blocks[focus.block];
      if (block && block.items) block.index = Math.min(keepFocus.index || 0, block.items.length - 1);
      focus.index = block ? block.index : 0;
    } else if (keepFocus && keepFocus.block === -1) {
      focus = {block:-1, index:navIndex};
    } else {
      focus = view.blocks.length ? {block:0, index:0} : {block:-1, index:navIndex};
    }
    pageY = -1;
    applyFocus(true);
    updateHeader();
    if (keepFocus && keepFocus.modal) {
      var m = keepFocus.modal;
      openModal({type:m.type, id:String(m.id), title:m.title || '', backdrop:m.backdrop || '', overview:'', genres:[]}, {season:m.season, episode:m.episode, zone:m.zone});
    }
  }

  function currentBlock() { return focus.block >= 0 && view ? view.blocks[focus.block] : null; }
  function focusedNode() {
    if (modal) return null;
    if (focus.block === -1) return el.navItems[navIndex];
    var block = currentBlock();
    if (!block) return null;
    if (block.type === 'hero') return block.el.querySelectorAll('.tb')[block.index];
    if (block.type === 'keys' || block.type === 'sugg') return block.nodes[block.index];
    if (block.type === 'filter') return block.el.querySelector('.dd');
    return block.cards[block.index];
  }
  function focusedItem() {
    if (modal) return modal.item;
    var block = currentBlock();
    if (!block || !block.items) return null;
    return block.items[block.type === 'hero' ? 0 : block.index];
  }
  function applyFocus(instant) {
    Array.prototype.forEach.call(shadow.querySelectorAll('.stage > .page .f, .hdr .f'), function (node) { node.classList.remove('f'); });
    var node = focusedNode();
    if (node) node.classList.add('f');
    group(node);
    scrollPage(instant);
    hydrate();
    schedulePreview();
  }
  function group(node) {
    Array.prototype.forEach.call(shadow.querySelectorAll('.fo'), function (row) { row.classList.remove('fo'); });
    var row = node && node.parentNode;
    if (row && row.classList && (row.classList.contains('btns') || row.classList.contains('bs'))) row.classList.add('fo');
  }
  function scrollPage(instant) {
    var block = currentBlock(), y = 0;
    if (block && block.type === 'row') {
      y = Math.max(0, block.el.offsetTop + block.el.parentNode.offsetTop - ROW_Y);
      var card = block.cards[block.index];
      block.el.querySelector('.trk').style.transform = 'translateX(' + (-(card ? card.offsetLeft - block.cards[0].offsetLeft : 0)) + 'px)';
    } else if (block && block.type === 'grid' && block.scroll) {
      var sc = block.cards[block.index];
      block.el.style.transform = 'translateY(' + (-Math.max(0, (sc ? sc.offsetTop - 12 : 0) - 177)) + 'px)';
    } else if (block && block.type === 'grid') {
      var c = block.cards[block.index];
      y = Math.max(0, (c ? c.offsetTop : block.el.offsetTop) - GRID_Y);
    }
    if (y === pageY) return;
    pageY = y;
    if (instant) el.page.style.transition = 'none';
    el.page.style.transform = 'translateY(' + (-y) + 'px)';
    if (instant) { void el.page.offsetHeight; el.page.style.transition = ''; }
    updateHeader();
  }
  function hydrate() {
    if (!view) return;
    view.blocks.forEach(function (block, b) {
      if (!block.cards) return;
      var near = Math.abs(b - Math.max(0, focus.block)) <= 3;
      if (!near) return;
      var from = block.type === 'grid' ? 0 : Math.max(0, block.index - 1);
      var to = block.type === 'grid' ? Math.min(block.cards.length, block.index + 30) : Math.min(block.cards.length, block.index + 8);
      for (var i = from; i < to; i++) hydrateCard(block.cards[i], block.items[i]);
    });
  }
  function hydrateCard(card, item) {
    if (!card || card.getAttribute('data-h') || !item) return;
    card.setAttribute('data-h', '1');
    var url = card.getAttribute('data-img');
    if (url) card.style.backgroundImage = 'url("' + url + '")';
    if (card.classList.contains('t10')) return;
    logoFor(item).then(function (path) {
      if (!path || !card.isConnected) return;
      var title = card.querySelector('.tt');
      if (title) title.remove();
      var img = document.createElement('img');img.className = 'lg';img.src = image(path, 'w300');img.alt = '';
      card.appendChild(img);
    });
  }

  function schedulePreview() {
    clearTimeout(previewTimer);
    var block = currentBlock();
    if (modal || !block || block.type !== 'row') { hidePreview(); return; }
    var item = block.items[block.index];
    el.pv.classList.add('on');
    previewTimer = setTimeout(function () { showPreview(item); }, previewFor ? 180 : 0);
  }
  function hidePreview() { if (el.pv) el.pv.classList.remove('on'); previewFor = null; }
  function showPreview(item) {
    if (!item || previewFor === item) return;
    previewFor = item;
    el.pvImage.style.backgroundImage = item.backdrop ? 'url("' + image(item.backdrop, 'w1280') + '")' : '';
    el.pvText.innerHTML = '<div class="art"><b>' + esc(item.title) + '</b></div><div class="meta">' + metaHTML(item, null) + '</div><div class="tags"></div><p class="syn">' + esc(item.overview) + '</p>';
    logoFor(item).then(function (path) {
      if (previewFor !== item || !path) return;
      el.pvText.querySelector('.art').innerHTML = '<img src="' + image(path, 'w500') + '" alt="">';
    });
    Promise.all([details(item), genres()]).then(function (all) {
      if (previewFor !== item || !all[0]) return;
      el.pvText.querySelector('.meta').innerHTML = metaHTML(item, all[0]);
      el.pvText.querySelector('.tags').innerHTML = genreList(item, all[0]).map(function (name) { return '<span>' + esc(name) + '</span>'; }).join('');
      if (!item.overview && all[0].overview) el.pvText.querySelector('.syn').textContent = all[0].overview;
    });
  }
  function metaHTML(item, data) {
    var parts = [];
    parts.push(daysSince(item.date) < 45 ? '<span class="grn">Nowość</span>' : '<span class="grn">' + Math.max(50, Math.round(item.vote * 10)) + '% dopasowania</span>');
    if (item.year) parts.push('<span>' + esc(item.year) + '</span>');
    if (data) {
      if (item.type === 'tv' && data.number_of_seasons) parts.push('<span>' + data.number_of_seasons + ' ' + plural(data.number_of_seasons, 'sezon', 'sezony', 'sezonów') + '</span>');
      if (item.type === 'movie' && data.runtime) parts.push('<span>' + duration(data.runtime) + '</span>');
    }
    parts.push('<span class="hd">HD</span>');
    return parts.join('');
  }
  function genreList(item, data) {
    var names = data && data.genres ? data.genres.map(function (g) { return g.name; }) : (item.genres || []).map(function (id) { return genreNames && genreNames[id]; }).filter(Boolean);
    return names.slice(0, 3);
  }
  function moveBrowse(direction) {
    var block = currentBlock();
    if (focus.block === -1) {
      var count = el.navItems.length;
      if (direction === 'left') navIndex = Math.max(0, navIndex - 1);
      else if (direction === 'right') navIndex = Math.min(count - 1, navIndex + 1);
      else if (direction === 'down' && view.blocks.length) focus.block = 0;
      else return 'edge';
      if (focus.block === -1) focus.index = navIndex;
      applyFocus();
      return 'ok';
    }
    if (!block) return 'edge';
    if (block.type === 'hero') {
      if (direction === 'left' || direction === 'right') block.index = direction === 'left' ? 0 : 1;
      else if (direction === 'up') return toNav();
      else if (focus.block + 1 < view.blocks.length) focus.block++;
      applyFocus();
      return 'ok';
    }
    if (block.type === 'keys') return moveKeys(block, direction);
    if (block.type === 'sugg') {
      if (direction === 'right') return toResults();
      if (direction === 'up') { if (block.index > 0) block.index--; else focus.block = 0; }
      else if (direction === 'down' && block.index + 1 < block.items.length) block.index++;
      applyFocus();
      return 'ok';
    }
    if (block.type === 'filter') {
      if (direction === 'up') return toNav();
      if (direction === 'down' && focus.block + 1 < view.blocks.length) { focus.block++; applyFocus(); }
      return 'ok';
    }
    if (block.type === 'row') {
      if (direction === 'left' || direction === 'right') {
        var next = block.index + (direction === 'left' ? -1 : 1);
        if (next < 0 || next >= block.items.length) return 'edge';
        block.index = next;
      } else if (direction === 'up') {
        if (focus.block === 0) return toNav();
        focus.block--;
      } else {
        if (focus.block + 1 >= view.blocks.length) return 'edge';
        focus.block++;
      }
      applyFocus();
      return 'ok';
    }
    if (block.type === 'grid') {
      var columns = block.columns || COLUMNS, i = block.index, n = block.items.length;
      if (direction === 'left') {
        if (i % columns) block.index--;
        else if (block.scroll) focus.block = 0;
        else return 'edge';
      }
      else if (direction === 'right') { if (i % columns === columns - 1 || i + 1 >= n) return 'edge'; block.index++; }
      else if (direction === 'up') {
        if (i - columns >= 0) block.index -= columns;
        else if (focus.block > 0 && !block.scroll) focus.block--;
        else return toNav();
      } else {
        if (i + columns < n) block.index += columns;
        else if (Math.floor(i / columns) < Math.floor((n - 1) / columns)) block.index = n - 1;
        else return 'edge';
      }
      applyFocus();
      return 'ok';
    }
    return 'edge';
  }
  function moveKeys(block, direction) {
    var i = block.index, top = i < 3, col = top ? block.col : (i - 3) % 6;
    if (direction === 'left' || direction === 'right') {
      var step = direction === 'left' ? -1 : 1;
      if (top ? i + step > 2 : col + step > 5) return toResults();
      if (top ? i + step < 0 : col + step < 0) return 'ok';
      block.index = i + step;
      block.col = top ? block.index * 2 : col + step;
    } else if (direction === 'up') {
      if (top) return toNav();
      block.index = i < 9 ? Math.floor(col / 2) : i - 6;
    } else if (top) block.index = 3 + (Math.floor(block.col / 2) === i ? block.col : i * 2);
    else if (i + 6 < block.nodes.length) block.index = i + 6;
    else if (view.blocks[1].items.length) { focus.block = 1; view.blocks[1].index = 0; }
    applyFocus();
    return 'ok';
  }
  function toResults() {
    var grid = view.blocks[2];
    if (!grid.items.length) return 'ok';
    focus.block = 2;grid.index -= grid.index % grid.columns;
    applyFocus();
    return 'ok';
  }
  function toNav() {
    focus.block = -1;
    var current = NAV.map(function (n) { return n.id; }).indexOf(view.section);
    navIndex = view.section === 'search' ? NAV.length : current >= 0 ? current : 0;
    applyFocus();
    return 'ok';
  }
  function activateBrowse() {
    if (focus.block === -1) {
      var node = el.navItems[navIndex], id = NAV[navIndex] ? NAV[navIndex].id : node.getAttribute('data-n');
      if (id === 'profile') { go('/settings'); return true; }
      if (id === 'bell') return true;
      if (id === view.section) { if (view.blocks.length) { focus.block = 0; applyFocus(); } return true; }
      openSection(id);
      return true;
    }
    var block = currentBlock();
    if (!block) return false;
    if (block.type === 'hero') {
      if (block.index === 0) resume(view.hero);
      else openModal(view.hero);
      return true;
    }
    if (block.type === 'filter') { openList(LANGUAGES.map(function (l) { return l.label; }), view.lang, block.el.querySelector('.dd'), function (index) { openSection('lang', {block:0, lang:index}); }); return true; }
    if (block.type === 'keys') {
      var key = block.nodes[block.index].getAttribute('data-k');
      if (key === 'mic') return 'voice';
      setQuery(key === 'del' ? view.query.slice(0, -1) : (view.query + key).replace(/^ +/, ''));
      return true;
    }
    if (block.type === 'sugg') { setQuery(block.items[block.index]); return true; }
    var item = block.items[block.index];
    if (!item) return false;
    if (block.kind === 'cw' && item.entry) play(item, item.entry.season, item.entry.episode);
    else openModal(item);
    return true;
  }

  function modalBase(item) {
    return '<div class="md"><div class="mh" style="background-image:url(\'' + image(item.backdrop, 'w1280') + '\')"><div class="x">' + icons.close + '</div>' +
      '<div class="tp2"><div class="kick">' + logoMark() + (item.type === 'tv' ? 'Serial' : 'Film') + '</div><div class="art"><b>' + esc(item.title) + '</b></div></div>' +
      '<div class="bs"><div class="tb white" data-a="0">' + icons.play + '<span>Odtwórz</span></div><div class="cb" data-a="1">' + (inList(item) ? icons.check : icons.plus) + '</div><div class="cb" data-a="2">' + icons.thumb + '</div></div><div class="mt2">' + icons.mute + '</div></div>' +
      '<div class="mi"><div class="ml"><div class="meta">' + metaHTML(item, null) + '</div><p class="ms">' + esc(item.overview) + '</p></div><div class="mr"></div></div>' +
      '<div class="eps"></div><div class="sim"></div></div>';
  }
  function openModal(item, options) {
    options = options || {};
    hidePreview();
    clearTimeout(previewTimer);
    if (modal) modalStack.push(modal);
    modal = {item:item, zone:'act', act:0, ep:0, sim:0, seasons:[], season:options.season || null, episodes:[], similar:[], data:null, wantEpisode:options.episode || null, wantZone:options.zone || null};
    var m = modal;
    el.mw.innerHTML = modalBase(item);
    el.mw.style.transition = 'none';el.mw.style.transform = 'none';void el.mw.offsetWidth;el.mw.style.transition = '';
    el.ov.classList.add('on');
    modalFocus();
    Promise.all([details(item), genres(), resumeEntry(item)]).then(function (all) {
      if (modal !== m) return;
      var data = all[0], entry = all[2];
      if (!data) return;
      var full = normalize(data, item.type);
      if (full) { ['title', 'backdrop', 'poster', 'overview', 'date', 'year', 'vote'].forEach(function (k) { if (!item[k] && full[k]) item[k] = full[k]; }); item.genres = full.genres; }
      m.data = data;m.entry = entry;
      var hero = el.mw.querySelector('.mh');
      if (item.backdrop) hero.style.backgroundImage = 'url("' + image(item.backdrop, 'w1280') + '")';
      el.mw.querySelector('.ml .meta').innerHTML = metaHTML(item, data);
      el.mw.querySelector('.ms').textContent = item.overview || '';
      var art = el.mw.querySelector('.mh .art b');if (art) art.textContent = item.title;
      var play = el.mw.querySelector('[data-a="0"] span');
      if (entry && entry.progress > 1) play.textContent = 'Wznów';
      renderCast(m, data);
      if (item.type === 'tv') {
        m.seasons = (data.seasons || []).filter(function (s) { return s.season_number > 0 && s.episode_count > 0 && (!s.air_date || s.air_date <= today()); });
        if (!m.seasons.length) m.seasons = (data.seasons || []).filter(function (s) { return s.episode_count > 0; });
        if (!m.season) m.season = entry ? entry.season : (m.seasons[0] ? m.seasons[0].season_number : 1);
        if (!m.wantEpisode && entry && entry.season === m.season) m.wantEpisode = entry.episode;
        loadEpisodes(m);
      }
      loadSimilar(m);
    });
    logoFor(item).then(function (path) {
      if (modal !== m || !path) return;
      var art = el.mw.querySelector('.mh .art');if (art) art.innerHTML = '<img src="' + image(path, 'w500') + '" alt="">';
    });
  }
  function renderCast(m, data) {
    request({requestID:m.item.type === 'tv' ? 'tvCasts' : 'movieCasts', id:m.item.id}).then(function (cast) {
      if (modal !== m) return;
      var names = ((cast && cast.cast) || []).slice(0, 3).map(function (p) { return p.name; });
      var html = '';
      if (names.length) html += '<p><span>Obsada: </span>' + esc(names.join(', ')) + '</p>';
      var g = genreList(m.item, data);
      if (g.length) html += '<p><span>Gatunki: </span>' + esc(g.join(', ')) + '</p>';
      if (data.original_title && data.original_title !== m.item.title) html += '<p><span>Tytuł oryginalny: </span>' + esc(data.original_title) + '</p>';
      if (data.original_name && data.original_name !== m.item.title) html += '<p><span>Tytuł oryginalny: </span>' + esc(data.original_name) + '</p>';
      el.mw.querySelector('.mr').innerHTML = html;
      modalScroll();
    });
  }
  function loadEpisodes(m) {
    request({requestID:'tvEpisodes', id:m.item.id, season:m.season}).then(function (data) {
      if (modal !== m) return;
      var now = today();
      m.episodes = ((data && data.episodes) || []).filter(function (e) { return !e.air_date || e.air_date <= now; });
      var done = episodeProgress(m.item.id), current = 0;
      if (m.wantEpisode) m.episodes.forEach(function (e, i) { if (e.episode_number === Number(m.wantEpisode)) current = i; });
      m.current = current;
      var season = m.seasons.filter(function (s) { return s.season_number === Number(m.season); })[0];
      var label = season ? season.name || ('Sezon ' + season.season_number) : 'Sezon ' + m.season;
      var head = '<div class="sec"><h2>Odcinki</h2>' + (m.seasons.length > 1 ? '<div class="dd" data-d="season"><span>' + esc(label) + '</span><i>' + icons.caret + '</i></div>' : '<em>' + esc(label) + '</em>') + '</div>';
      var html = '';
      m.episodes.forEach(function (e, i) {
        var pct = done[m.season + ':' + e.episode_number] || 0;
        html += '<div class="ei' + (i === current ? ' cur' : '') + '" data-e="' + i + '"><span class="en">' + e.episode_number + '</span>' +
          '<div class="et" style="background-image:url(\'' + image(e.still_path || m.item.backdrop, 'w300') + '\')">' + icons.bigPlay + (pct > 1 ? '<div class="pb2"><i style="width:' + Math.min(100, pct) + '%"></i></div>' : '') + '</div>' +
          '<div class="ex"><div><span>' + esc(e.name || 'Odcinek ' + e.episode_number) + '</span><span>' + esc(duration(e.runtime)) + '</span></div><p>' + esc(e.overview) + '</p></div></div>';
      });
      if (!m.episodes.length) html = '<p class="empty" style="padding:0 52px">Odcinki tego sezonu nie są jeszcze dostępne.</p>';
      el.mw.querySelector('.eps').innerHTML = head + html;
      if (m.wantZone === 'ep' && m.episodes.length) { m.zone = 'ep';m.ep = current;m.wantZone = null; }
      if (m.zone === 'ep') m.ep = Math.min(m.ep, Math.max(0, m.episodes.length - 1));
      modalFocus();
    });
  }
  function loadSimilar(m) {
    var type = m.item.type;
    results({requestID:type === 'tv' ? 'tvRelated' : 'movieRelated', id:m.item.id, page:1}, type, 12).then(function (items) {
      if (items.length) return items;
      return results({requestID:type === 'tv' ? 'tvSimilar' : 'movieSimilar', id:m.item.id, page:1}, type, 12);
    }).then(function (items) {
      if (modal !== m) return;
      m.similar = items;
      if (!items.length) return;
      var html = '<div class="sec"><h2>Więcej podobnych</h2></div><div class="sg">';
      items.forEach(function (item, i) {
        html += '<div class="sc" data-s="' + i + '"><div class="si" style="background-image:url(\'' + image(item.backdrop, 'w300') + '\')"><span class="tt">' + esc(item.title) + '</span></div>' +
          '<div class="sm"><div class="meta">' + (daysSince(item.date) < 45 ? '<span class="grn">Nowość</span>' : '<span class="grn">' + Math.max(50, Math.round(item.vote * 10)) + '%</span>') + '<span>' + esc(item.year) + '</span><span class="hd">HD</span></div><div class="cb">' + (inList(item) ? icons.check : icons.plus) + '</div></div>' +
          '<p>' + esc(item.overview) + '</p></div>';
      });
      el.mw.querySelector('.sim').innerHTML = html + '</div>';
      items.forEach(function (item, i) {
        logoFor(item).then(function (path) {
          if (modal !== m || !path) return;
          var box = el.mw.querySelector('.sc[data-s="' + i + '"] .si');
          if (!box) return;
          var title = box.querySelector('.tt');if (title) title.remove();
          box.insertAdjacentHTML('beforeend', '<img class="lg" src="' + image(path, 'w300') + '" alt="">');
        });
      });
      modalScroll();
    });
  }
  function modalZones() {
    var zones = ['act'];
    if (el.mw.querySelector('.dd[data-d="season"]')) zones.push('season');
    if (modal.episodes.length) zones.push('ep');
    if (modal.similar.length) zones.push('sim');
    return zones;
  }
  function modalNode() {
    if (!modal) return null;
    if (modal.zone === 'act') return el.mw.querySelector('[data-a="' + modal.act + '"]');
    if (modal.zone === 'season') return el.mw.querySelector('.dd[data-d="season"]');
    if (modal.zone === 'ep') return el.mw.querySelector('.ei[data-e="' + modal.ep + '"]');
    if (modal.zone === 'sim') return el.mw.querySelector('.sc[data-s="' + modal.sim + '"]');
    return null;
  }
  function modalFocus() {
    Array.prototype.forEach.call(el.mw.querySelectorAll('.f'), function (node) { node.classList.remove('f'); });
    var node = modalNode();
    if (node) node.classList.add('f');
    group(node);
    modalScroll();
  }
  function modalScroll() {
    if (!modal) return;
    var node = modalNode(), y = 0, box = el.mw.querySelector('.md');
    if (node && modal.zone !== 'act') {
      var top = 0;
      for (var n = node; n && n !== box; n = n.offsetParent) top += n.offsetTop;
      y = Math.max(0, top + 30 - (modal.zone === 'season' ? 220 : 260));
      var max = Math.max(0, box.offsetHeight + 90 - stageHeight());
      y = Math.min(y, max);
    }
    el.mw.style.transform = 'translateY(' + (-y) + 'px)';
  }
  function moveModal(direction) {
    var zones = modalZones(), z = zones.indexOf(modal.zone), m = modal;
    if (z === -1) { m.zone = 'act';z = 0; }
    function enter(index, fromAbove) {
      m.zone = zones[index];
      if (m.zone === 'ep') m.ep = fromAbove ? (m.current || 0) : m.episodes.length - 1;
      if (m.zone === 'sim') m.sim = fromAbove ? 0 : Math.min(m.sim, m.similar.length - 1);
    }
    if (m.zone === 'act') {
      if (direction === 'left') m.act = Math.max(0, m.act - 1);
      else if (direction === 'right') m.act = Math.min(2, m.act + 1);
      else if (direction === 'down' && zones.length > 1) enter(1, true);
      else return 'edge';
    } else if (m.zone === 'season') {
      if (direction === 'up') enter(z - 1, false);
      else if (direction === 'down' && z + 1 < zones.length) enter(z + 1, true);
      else return 'edge';
    } else if (m.zone === 'ep') {
      if (direction === 'up') { if (m.ep > 0) m.ep--; else enter(z - 1, false); }
      else if (direction === 'down') { if (m.ep + 1 < m.episodes.length) m.ep++; else if (z + 1 < zones.length) enter(z + 1, true); else return 'edge'; }
      else return 'edge';
    } else if (m.zone === 'sim') {
      var c = 3, i = m.sim, n = m.similar.length;
      if (direction === 'left') { if (i % c === 0) return 'edge'; m.sim--; }
      else if (direction === 'right') { if (i % c === c - 1 || i + 1 >= n) return 'edge'; m.sim++; }
      else if (direction === 'up') { if (i - c >= 0) m.sim -= c; else enter(z - 1, false); }
      else { if (i + c < n) m.sim += c; else if (Math.floor(i / c) < Math.floor((n - 1) / c)) m.sim = n - 1; else return 'edge'; }
    }
    modalFocus();
    return 'ok';
  }
  function activateModal() {
    var m = modal;
    if (m.zone === 'act') {
      if (m.act === 0) {
        if (m.item.type === 'tv') {
          var e = m.entry && m.entry.season ? m.entry : null;
          var ep = m.episodes[m.current || 0];
          play(m.item, e ? e.season : m.season, e ? e.episode : ep ? ep.episode_number : 1);
        } else resume(m.item);
      } else if (m.act === 1) {
        var added = toggleList(m.item);
        el.mw.querySelector('[data-a="1"]').innerHTML = added ? icons.check : icons.plus;
      } else {
        toggleLike(m.item);
        el.mw.querySelector('[data-a="2"]').style.background = isLiked(m.item) ? '#fff' : '';
        el.mw.querySelector('[data-a="2"]').style.color = isLiked(m.item) ? '#000' : '';
      }
      return true;
    }
    if (m.zone === 'season') {
      openList(m.seasons.map(function (s) { return (s.name || 'Sezon ' + s.season_number) + '  (' + s.episode_count + ' odc.)'; }),
        Math.max(0, m.seasons.map(function (s) { return s.season_number; }).indexOf(Number(m.season))), modalNode(), function (index) {
          m.season = m.seasons[index].season_number;m.wantEpisode = null;m.ep = 0;m.current = 0;
          loadEpisodes(m);
        });
      return true;
    }
    if (m.zone === 'ep') { var episode = m.episodes[m.ep]; if (episode) play(m.item, m.season, episode.episode_number); return true; }
    if (m.zone === 'sim') { var next = m.similar[m.sim]; if (next) openModal(next); return true; }
    return false;
  }
  function closeModal() {
    if (!modal) return false;
    if (modalStack.length) {
      var previous = modalStack.pop();
      modal = null;
      openModal(previous.item, {season:previous.season, episode:previous.episodes[previous.ep] && previous.episodes[previous.ep].episode_number, zone:previous.zone === 'ep' ? 'ep' : null});
      return true;
    }
    modal = null;
    el.ov.classList.remove('on');
    applyFocus();
    return true;
  }

  function openList(labels, selected, anchor, choose) {
    if (!anchor) return;
    var scale = innerWidth / 1440, r = anchor.getBoundingClientRect(), s = el.stage.getBoundingClientRect();
    var node = document.createElement('div');node.className = 'list';
    node.style.left = (r.left - s.left) / scale + 'px';
    node.style.top = ((r.bottom - s.top) / scale + 4) + 'px';
    var html = '<div class="in2">';
    labels.forEach(function (label, i) { html += '<div class="li' + (i === selected ? ' sel' : '') + '">' + esc(label) + '</div>'; });
    node.innerHTML = html + '</div>';
    el.stage.appendChild(node);
    var room = stageHeight() - (r.bottom - s.top) / scale - 30;
    node.style.maxHeight = Math.max(220, Math.min(420, room)) + 'px';
    if (room < 220) node.style.top = ((r.top - s.top) / scale - 4 - Math.min(420, node.offsetHeight)) + 'px';
    list = {node:node, items:node.querySelectorAll('.li'), index:Math.max(0, selected), choose:choose};
    listFocus();
  }
  function listFocus() {
    Array.prototype.forEach.call(list.items, function (item, i) { item.classList.toggle('f', i === list.index); });
    var item = list.items[list.index], inner = list.node.firstChild;
    var visible = list.node.clientHeight - 22, offset = item.offsetTop + item.offsetHeight - visible;
    inner.style.transform = 'translateY(' + (-Math.max(0, offset)) + 'px)';
  }
  function moveList(direction) {
    if (direction === 'up') list.index = Math.max(0, list.index - 1);
    else if (direction === 'down') list.index = Math.min(list.items.length - 1, list.index + 1);
    listFocus();
    return 'ok';
  }
  function closeList() { if (list) { list.node.remove(); list = null; } }

  function play(item, season, episode) {
    if (!item) return;
    var url = '/watch?type=' + item.type + '&id=' + encodeURIComponent(item.id);
    if (item.type === 'tv') url += '&season=' + encodeURIComponent(season || 1) + '&episode=' + encodeURIComponent(episode || 1);
    saveReturn();
    try { sessionStorage.setItem('RiveTVNowPlaying', JSON.stringify({type:item.type, id:item.id, title:item.title, backdrop:item.backdrop, logo:item.logo || ''})); } catch (_) {}
    go(url);
  }
  function resume(item) {
    if (item.type !== 'tv') return play(item);
    resumeEntry(item).then(function (entry) { play(item, entry && entry.season, entry && entry.episode); });
  }
  function saveReturn() {
    var state = {time:Date.now(), section:view ? view.section : 'home', block:focus.block, index:focus.block >= 0 && currentBlock() ? currentBlock().index : navIndex, query:view && view.query, lang:view && view.lang};
    if (modal) state.modal = {type:modal.item.type, id:modal.item.id, title:modal.item.title, backdrop:modal.item.backdrop, season:modal.season, episode:modal.episodes[modal.zone === 'ep' ? modal.ep : modal.current || 0] && modal.episodes[modal.zone === 'ep' ? modal.ep : modal.current || 0].episode_number, zone:modal.zone};
    try { sessionStorage.setItem('RiveTVShellReturn', JSON.stringify(state)); } catch (_) {}
  }
  function takeReturn() {
    try {
      var state = JSON.parse(sessionStorage.getItem('RiveTVShellReturn'));
      sessionStorage.removeItem('RiveTVShellReturn');
      return state && Date.now() - state.time < 216e5 ? state : null;
    } catch (_) { return null; }
  }
  function go(url) {
    hidePreview();
    if (window.next && window.next.router && typeof window.next.router.push === 'function') {
      try { window.next.router.push(url); return; } catch (_) {}
    }
    location.assign(url);
  }

  function shellRoute() { return PATHS.indexOf(location.pathname) !== -1; }
  function initialSection() {
    var path = location.pathname;
    return path === '/tv' ? 'tv' : path === '/movie' ? 'movie' : path === '/library' ? 'list' : path === '/search' ? 'search' : 'home';
  }
  function activate() {
    if (active) return;
    mount();attach();
    active = true;suspended = false;
    document.documentElement.setAttribute('data-rive-shell', '');
    host.hidden = false;
    if (original.suspend) original.suspend.call(nav);
    modal = null;modalStack = [];closeList();el.ov.classList.remove('on');
    var back = takeReturn(), params = new URLSearchParams(location.search);
    if (!back && location.pathname === '/detail' && /^(movie|tv)$/.test(params.get('type')) && params.get('id')) {
      back = {section:'home', block:0, index:0, modal:{type:params.get('type'), id:params.get('id')}};
    }
    loadWatchlist();
    openSection(back ? back.section : initialSection(), back);
  }
  function deactivate() {
    if (!active) return;
    active = false;
    clearTimeout(previewTimer);
    closeList();
    document.documentElement.removeAttribute('data-rive-shell');
    if (host) host.hidden = true;
    if (original.resume) original.resume.call(nav);
  }
  function pageHeader() {
    if (location.pathname !== '/settings' || !document.body) { if (el.pageHeader) el.pageHeader.remove(); return; }
    if (!el.pageHeader) {
      var header = document.createElement('div');
      header.id = 'rive-page-hdr';
      var html = logo + '<nav>';
      NAV.forEach(function (item) { html += '<a href="/" data-s="' + item.id + '">' + esc(item.label) + '</a>'; });
      html += '</nav><div class="tl"><a href="/search" data-s="search" class="ic" aria-label="Szukaj">' + icons.search + '</a><span class="av on"><b></b></span></div>';
      header.innerHTML = html;
      header.addEventListener('click', function (event) {
        var link = event.target.closest('a[data-s]');
        if (!link) return;
        event.preventDefault();
        try { sessionStorage.setItem('RiveTVShellReturn', JSON.stringify({time:Date.now(), section:link.getAttribute('data-s'), block:0, index:0})); } catch (_) {}
        go(link.getAttribute('data-s') === 'search' ? '/search' : '/');
      });
      el.pageHeader = header;
    }
    if (!el.pageHeader.isConnected) document.body.appendChild(el.pageHeader);
  }
  function sync() { if (shellRoute()) activate(); else deactivate(); pageHeader(); }
  ['pushState', 'replaceState'].forEach(function (name) {
    var fn = history[name];
    history[name] = function () { var result = fn.apply(this, arguments); setTimeout(sync, 0); return result; };
  });
  window.addEventListener('popstate', function () { setTimeout(sync, 0); });

  var api = {
    move:function (direction) {
      if (!ready) return 'ok';
      clearTimeout(previewTimer);
      if (list) return moveList(direction);
      if (modal) return moveModal(direction);
      return moveBrowse(direction);
    },
    target:function () { return {shell:true}; },
    activate:function () {
      if (!ready) return true;
      if (list) { var chosen = list.index, choose = list.choose; closeList(); choose(chosen); return true; }
      if (modal) return activateModal();
      return activateBrowse();
    },
    closeDropdown:function () {
      if (list) { closeList(); return true; }
      if (modal) return closeModal();
      if (!view) return false;
      if (view.section !== 'home') { openSection('home'); return true; }
      if (focus.block > 0 || (focus.block === -1 && view.blocks.length)) { focus.block = 0; view.blocks[0].index = 0; applyFocus(); return true; }
      return false;
    },
    pageState:function () { return ready ? 'ready' : 'loading'; },
    search:function (query) {
      if (!view || view.section !== 'search') return false;
      setQuery(query);
      return true;
    },
    finishEditing:function () { if (view && view.section === 'search') { focus.block = 0; applyFocus(); } return true; },
    resume:function () { suspended = false; if (host) host.classList.remove('idle'); el.stage && el.stage.classList.remove('idle'); if (view) applyFocus(); return true; },
    suspend:function () { suspended = true; clearTimeout(previewTimer); hidePreview(); if (el.stage) el.stage.classList.add('idle'); },
    first:function () { if (view) applyFocus(); return true; },
    media:function (action) {
      if (action !== 'toggle' && action !== 'play') return false;
      var item = focusedItem();
      if (!item) return false;
      var block = currentBlock();
      if (!modal && block && block.kind === 'cw' && item.entry) play(item, item.entry.season, item.entry.episode);
      else resume(item);
      return true;
    },
    revealPlayback:function () { return false; },
    releasePlayer:function () { return false; }
  };
  Object.keys(api).forEach(function (name) {
    original[name] = nav[name];
    nav[name] = function () { return active ? api[name].apply(null, arguments) : original[name] ? original[name].apply(nav, arguments) : false; };
  });
  window.RiveTVShell = {active:function () { return active; }, open:function (section) { if (active) openSection(section); }, state:function () {
    return {section:view && view.section, focus:focus, nav:navIndex, modal:modal && {zone:modal.zone, act:modal.act, ep:modal.ep, sim:modal.sim, season:modal.season, episodes:modal.episodes.length, similar:modal.similar.length, title:modal.item.title},
      blocks:view ? view.blocks.map(function (b) { return {type:b.type, kind:b.kind, key:b.key, index:b.index, count:b.items ? b.items.length : 0}; }) : [], list:list && list.index, ready:ready, pageY:pageY};
  }};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
  setInterval(sync, 1000);
})();
