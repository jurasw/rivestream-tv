(function () {
  'use strict';
  if (window.RiveTVServers || window !== window.top || !window.RiveTV) return;
  var WAIT = 9000, NO_SOURCE = 12000, MIN_DURATION = 90, AUDIO_WAIT = 2500;
  var IMG = 'https://image.tmdb.org/t/p/';
  var css = ':host{all:initial;position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483646;display:block;contain:strict}' +
    ':host([hidden]){display:none}*{box-sizing:border-box}svg{display:block;width:100%;height:100%}p{margin:0}' +
    '.stage{position:absolute;left:0;top:0;width:1440px;height:var(--h,810px);transform:scale(var(--s,1));transform-origin:0 0;overflow:hidden;background:#000;color:#fff;font-family:"Rive Inter",Inter,Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;opacity:1;transition:opacity .5s ease}' +
    '.stage.out{opacity:0}' +
    '.bg{position:absolute;inset:-40px;background:#000 center/cover no-repeat;opacity:.32;filter:blur(18px);transform:scale(1.04)}' +
    '.sh{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,.35) 0%,rgba(0,0,0,.85) 70%,#000 100%)}' +
    '.back{position:absolute;left:30px;top:30px;width:44px;height:44px;color:#fff}' +
    '.mid{position:absolute;left:0;right:0;top:50%;transform:translateY(-58%);display:flex;flex-direction:column;align-items:center;gap:30px}' +
    '.ring{position:relative;width:132px;height:132px}.ring svg.arc{position:absolute;inset:0;animation:spin 1.1s linear infinite}' +
    '.ring .mk{position:absolute;left:34px;top:34px;width:64px;height:64px;animation:breathe 2.2s ease-in-out infinite}' +
    '@keyframes spin{to{transform:rotate(360deg)}}@keyframes breathe{50%{transform:scale(.92);opacity:.85}}' +
    '.logo{max-width:440px;max-height:150px;object-fit:contain;filter:drop-shadow(0 2px 10px rgba(0,0,0,.6))}' +
    '.title{max-width:900px;text-align:center;font-size:40px;line-height:46px;font-weight:700;letter-spacing:-.5px}' +
    '.ep{font-size:22px;line-height:28px;color:#d2d2d2;text-align:center}' +
    '.st{display:flex;align-items:center;gap:14px;height:28px;font-size:19px;color:#b3b3b3;transition:opacity .2s}' +
    '.dots{display:flex;gap:5px}.dots i{width:8px;height:8px;border-radius:50%;background:#404040;transition:background-color .2s}.dots i.t{background:#808080}.dots i.c{background:#e50914}.dots i.ok{background:#46d369}' +
    '.fail{display:none;flex-direction:column;align-items:center;gap:22px}.failed .fail{display:flex}.failed .ring,.failed .st{display:none}' +
    '.fail p{font-size:24px;line-height:32px;color:#e5e5e5;text-align:center;max-width:760px}' +
    '.btns{display:flex;gap:14px}.tb{position:relative;display:inline-flex;align-items:center;height:52px;padding:0 30px;border-radius:4px;font-size:20px;font-weight:500;letter-spacing:.5px;background:rgba(109,109,110,.7);color:#fff;transition:background-color .1s,color .1s}' +
    '.tb.f{background:#fff;color:#000}.tb.f{transform:scale(1.05)}';
  var mark = '<svg viewBox="0 0 36 36"><defs><linearGradient id="rive-servers-logo" x1="0" y1="0" x2="1" y2=".75"><stop offset="0" stop-color="#f69b65"/><stop offset=".5" stop-color="#ed5c91"/><stop offset="1" stop-color="#ef009d"/></linearGradient></defs>' +
    '<rect x="1" y="1" width="34" height="34" rx="9" fill="url(#rive-servers-logo)"/><path d="M7.6 8.2h6.3q7.9 0 7.9 5.5 0 3.9-3.9 5.1l4.7 7.5h-4.8l-4.3-7.1v7.1H7.6zm4.3 3.9v3.9h2q2.7 0 2.7-2t-2.7-1.9z" fill="#141414"/>' +
    '<path d="M14.7 23.5q-1.2-2.4.8-3.5 2-1.2 3.1 1.2l2.8 5.5 5.1-11.8q1.2-2.8 3.5-1.6 2.4 1.2 1.2 3.5L25.1 30.5q-1.2 2.8-3.5 2.8t-3.5-2.4z" fill="#141414"/></svg>';
  var arc = '<svg class="arc" viewBox="0 0 132 132" fill="none"><circle cx="66" cy="66" r="60" stroke="rgba(255,255,255,.12)" stroke-width="5"/><path d="M66 6a60 60 0 0 1 60 60" stroke="#e50914" stroke-width="5" stroke-linecap="round"/></svg>';
  var back = '<svg viewBox="0 0 44 44" fill="none"><path d="M18 10L6 22.5L18 35" stroke-width="3" stroke-linecap="square" stroke="currentColor"/><path d="M38 22.5L7 22.5" stroke-width="3" stroke="currentColor"/></svg>';

  var nav = window.RiveTV, original = {};
  var host, shadow, el = {}, search = null, route = '', button = 0;

  function mount() {
    if (host) return;
    host = document.createElement('div');host.id = 'rive-servers';host.hidden = true;
    shadow = host.attachShadow({mode:'open'});
    shadow.innerHTML = '<style>' + css + '</style><div class="stage"><div class="bg"></div><div class="sh"></div><div class="back">' + back + '</div><div class="mid">' +
      '<div class="ring">' + arc + '<div class="mk">' + mark + '</div></div><div class="head"></div><p class="ep"></p>' +
      '<div class="st"><span class="msg"></span><div class="dots"></div></div>' +
      '<div class="fail"><p>Żaden serwer nie odtworzył tego tytułu. Spróbuj ponownie albo wybierz serwer ręcznie.</p><div class="btns"><div class="tb">Spróbuj ponownie</div><div class="tb">Wybierz serwer</div></div></div></div></div>';
    ['stage', 'bg', 'head', 'ep', 'msg', 'dots', 'mid'].forEach(function (name) { el[name] = shadow.querySelector('.' + name); });
    el.buttons = shadow.querySelectorAll('.tb');
    window.addEventListener('resize', layout);
    layout();
  }
  function layout() {
    if (!el.stage || !innerWidth) return;
    var scale = innerWidth / 1440;
    el.stage.style.setProperty('--s', String(scale));
    el.stage.style.setProperty('--h', (innerHeight / scale) + 'px');
  }
  function show() {
    mount();
    if (!host.isConnected) document.documentElement.appendChild(host);
    el.stage.classList.remove('out', 'failed');
    el.mid.classList.remove('failed');
    host.hidden = false;
    describe();
  }
  function hide(fade) {
    if (!host || host.hidden) return;
    if (!fade) { host.hidden = true; return; }
    el.stage.classList.add('out');
    setTimeout(function () { if (!search || search.phase === 'done' || search.phase === 'off') host.hidden = true; }, 520);
  }
  function describe() {
    var now = {}, params = new URLSearchParams(location.search);
    try { now = JSON.parse(sessionStorage.getItem('RiveTVNowPlaying')) || {}; } catch (_) {}
    if (String(now.id) !== params.get('id')) now = {};
    var parts = document.title.split(' | '), title = now.title || (parts.length > 2 ? parts[2] : '');
    el.bg.style.backgroundImage = now.backdrop ? 'url("' + IMG + 'w780' + now.backdrop + '")' : '';
    el.head.innerHTML = '';
    if (now.logo) {
      var img = document.createElement('img');img.className = 'logo';img.src = IMG + 'w500' + now.logo;img.alt = '';
      el.head.appendChild(img);
    } else {
      var p = document.createElement('p');p.className = 'title';p.textContent = title;
      el.head.appendChild(p);
    }
    el.ep.textContent = params.get('type') === 'tv' ? 'Sezon ' + (params.get('season') || 1) + ' · Odcinek ' + (params.get('episode') || 1) : '';
  }
  function status(text) {
    if (!el.msg) return;
    el.msg.textContent = text;
    if (!search || !search.labels) { el.dots.innerHTML = ''; return; }
    if (el.dots.children.length !== search.labels.length) {
      el.dots.innerHTML = search.labels.map(function () { return '<i></i>'; }).join('');
    }
    Array.prototype.forEach.call(el.dots.children, function (dot, index) {
      dot.className = search.tried.indexOf(index) !== -1 ? 't' : '';
      if (index === search.current) dot.className = search.phase === 'done' ? 'ok' : 'c';
    });
  }

  function trigger() {
    var node = document.getElementById('source');
    return node && node.getAttribute('aria-haspopup') === 'listbox' ? node : null;
  }
  function options() {
    var lists = document.querySelectorAll('[role="listbox"],[class*="desktopPopover__"],[class*="mobileSheet__"]');
    for (var i = lists.length - 1; i >= 0; i--) {
      var found = lists[i].querySelectorAll('[role="option"]');
      if (found.length) return found;
    }
    return null;
  }
  function label(option) { return (option.getAttribute('title') || option.textContent || '').trim(); }
  function number(text) { var m = /Server\s+(\d+)/i.exec(text || ''); return m ? Number(m[1]) : 0; }
  function openList(done) {
    var node = trigger();
    if (!node) return done(null);
    document.documentElement.setAttribute('data-rive-native-select', 'true');
    if (node.getAttribute('aria-expanded') !== 'true') node.click();
    var tries = 0;
    (function wait() {
      var found = options();
      if (found || ++tries > 20) return done(found);
      setTimeout(wait, 75);
    })();
  }
  function closeList() {
    var node = trigger();
    if (node && node.getAttribute('aria-expanded') === 'true') node.click();
    setTimeout(function () { document.documentElement.removeAttribute('data-rive-native-select'); }, 120);
  }
  function selectServer(index, done) {
    openList(function (found) {
      if (!found || !found[index]) { closeList(); return done(false); }
      var option = found[index];
      if (option.getAttribute('aria-selected') !== 'true') option.click();
      setTimeout(function () { closeList(); done(true); }, 60);
    });
  }

  function start() {
    var params = new URLSearchParams(location.search);
    if (location.pathname !== '/watch' || !params.get('id')) { stop(); return; }
    search = {route:location.pathname + location.search, phase:'waiting-source', began:Date.now(), labels:null, order:[], pos:0, tried:[], current:-1, switchedAt:0, workingAt:0, fallback:-1, final:false};
    button = 0;
    show();
    status('Szukam najlepszego serwera…');
  }
  function find() {
    if (!search || !search.labels || location.pathname !== '/watch') return false;
    var current = search.current;
    var order = search.labels.map(function (_, index) { return index; }).filter(function (index) { return index !== current; }).slice(0, 10);
    search = {route:search.route, phase:'switching', began:Date.now(), labels:search.labels, order:order, pos:0, tried:[], current:-1, switchedAt:0, workingAt:0,
      fallback:current, final:false, strict:true};
    button = 0;
    show();
    status('Szukam serwera z wybranym językiem audio…');
    next();
    return true;
  }
  function stop() {
    if (search) search.phase = 'off';
    search = null;
    hide(false);
  }
  function plan(found) {
    var labels = Array.prototype.map.call(found, label), last = Number(localStorage.getItem('RiveTVLastServer')) || 0, order = [];
    labels.forEach(function (text, index) { if (number(text) === last) order.push(index); });
    labels.forEach(function (text, index) { if (order.indexOf(index) === -1) order.push(index); });
    search.labels = labels;search.order = order;search.pos = 0;
  }
  function next() {
    if (!search) return;
    if (search.current !== -1 && search.tried.indexOf(search.current) === -1) search.tried.push(search.current);
    var index;
    if (search.pos < search.order.length) index = search.order[search.pos++];
    else if (search.fallback !== -1 && !search.final) { index = search.fallback;search.final = true; }
    else return fail();
    search.phase = 'switching';search.current = index;search.workingAt = 0;
    status('Sprawdzam ' + search.labels[index].replace(/\s*[✦*].*$/, '').replace(/\s*\(.*\)\s*$/, '') + '…');
    selectServer(index, function (ok) {
      if (!search || search.current !== index) return;
      if (!ok) return next();
      search.phase = 'probing';search.switchedAt = Date.now();
    });
  }
  function working() {
    var state = window.RiveTVPlayback && RiveTVPlayback.state && RiveTVPlayback.state();
    if (!state || state.received < search.switchedAt + 300 || !(state.duration > MIN_DURATION)) return false;
    return state.time > .5 || !state.buffering;
  }
  function language() {
    return window.RiveTVPlayback && RiveTVPlayback.audioLanguage ? RiveTVPlayback.audioLanguage() : '';
  }
  function audio() {
    var state = window.RiveTVPlayer && RiveTVPlayer.status();
    return state && state.audio || 'unknown';
  }
  function accept() {
    if (!language() || search.final) return true;
    if (!search.workingAt) search.workingAt = Date.now();
    var found = audio();
    if (found === 'match') return true;
    var waited = Date.now() - search.workingAt > AUDIO_WAIT;
    if (found === 'other' || (search.strict && waited)) {
      if (search.fallback === -1) search.fallback = search.current;
      status('Szukam serwera z wybranym językiem audio…');
      next();
      return false;
    }
    return !search.strict && waited;
  }
  function blocked() {
    if (!window.RiveTVAds || !RiveTVAds.captcha) return false;
    var raw = RiveTVAds.captcha(true);
    if (!raw) return false;
    try { return JSON.parse(raw).at >= search.switchedAt; } catch (_) { return false; }
  }
  function succeed() {
    search.phase = 'done';
    var text = search.labels[search.current];
    if (number(text)) localStorage.setItem('RiveTVLastServer', String(number(text)));
    var state = RiveTVPlayback.state();
    if (state && state.paused) RiveTVPlayback.command('play');
    if (search.strict && search.final) {
      status('Żaden serwer nie ma ścieżki w wybranym języku. Wracam do poprzedniego.');
      setTimeout(function () { hide(true); }, 3000);
    } else { status('Gotowe'); hide(true); }
  }
  function fail() {
    search.phase = 'failed';search.current = -1;
    el.mid.classList.add('failed');
    focusButton();
  }
  function focusButton() {
    Array.prototype.forEach.call(el.buttons, function (node, index) { node.classList.toggle('f', index === button); });
  }
  function tick() {
    var current = location.pathname + location.search;
    if (location.pathname !== '/watch') { if (search) stop(); route = current; return; }
    if (current !== route) { route = current; start(); }
    if (!search) return;
    if (search.phase === 'waiting-source') {
      if (trigger()) {
        search.phase = 'listing';
        openList(function (found) {
          closeList();
          if (!search || search.phase !== 'listing') return;
          if (!found || !found.length) { search.phase = 'off'; hide(true); return; }
          plan(found);
          next();
        });
      } else if (Date.now() - search.began > NO_SOURCE) { search.phase = 'off'; hide(true); }
      return;
    }
    if (search.phase !== 'probing') return;
    if (working()) { if (accept()) succeed(); return; }
    if (blocked() || Date.now() - search.switchedAt > WAIT) next();
    else status(el.msg.textContent);
  }

  function searching() { return !!search && ['waiting-source', 'listing', 'switching', 'probing', 'failed'].indexOf(search.phase) !== -1; }
  function leave() {
    stop();
    if (window.RiveTVPlayback && RiveTVPlayback.flush) RiveTVPlayback.flush();
    if (window.next && window.next.router) window.next.router.push('/'); else location.assign('/');
    return true;
  }
  var api = {
    move:function (direction) {
      if (search.phase === 'failed' && (direction === 'left' || direction === 'right')) { button = direction === 'left' ? 0 : 1; focusButton(); }
      return 'ok';
    },
    target:function () { return {servers:true}; },
    activate:function () {
      if (search.phase !== 'failed') return true;
      if (button === 0) { start(); return true; }
      search.phase = 'off';hide(false);
      return original.sources ? original.sources.call(nav) : false;
    },
    media:function () { return true; },
    closeDropdown:function () { return leave(); },
    revealPlayback:function () { return leave(); },
    releasePlayer:function () { return leave(); },
    pageState:function () { return 'ready'; }
  };
  Object.keys(api).forEach(function (name) {
    original[name] = nav[name];
    nav[name] = function () { return searching() ? api[name].apply(null, arguments) : original[name] ? original[name].apply(nav, arguments) : false; };
  });
  original.sources = nav.sources;
  window.RiveTVServers = {searching:searching, find:find, state:function () {
    return search && {phase:search.phase, current:search.current, label:search.labels && search.labels[search.current], tried:search.tried.length, total:search.order.length};
  }};
  setInterval(tick, 300);
  tick();
})();
