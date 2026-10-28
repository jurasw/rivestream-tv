(function () {
  'use strict';
  var captchas = [['challenges.cloudflare.com','Cloudflare Turnstile'],['hcaptcha.com','hCaptcha'],['/recaptcha','reCAPTCHA']];
  function kindOf(url) {
    for (var i = 0; i < captchas.length; i++) if (String(url).indexOf(captchas[i][0]) !== -1) return captchas[i][1];
    return '';
  }
  var own = kindOf(location.hostname + location.pathname);
  if (own) {
    if (window !== window.top) setInterval(function () {
      if (innerWidth >= 100 && innerHeight >= 50) window.parent.postMessage({riveTV:'captcha',kind:own,x:innerWidth / 2,y:innerHeight / 2},'*');
    },1000);
    return;
  }
  if (window.RiveTVAds) return;
  var root = window === window.top;
  var scam = /not a robot|scan (?:the |this )?qr/i, interstitial = /skip ad|go to website/i;
  var widgets = '.cf-turnstile,.h-captcha,.g-recaptcha,iframe[src*="challenges.cloudflare.com"],iframe[src*="hcaptcha.com"],iframe[src*="/recaptcha"]';
  var keep = 'video,[id^="rive-"],.spla,.server-menu-item,button[aria-label="Play"],.vjs-big-play-button,.jw-display-icon-container,' + widgets;
  var player = '.jwplayer,.plyr,media-player,.video-js,.art-video-player,[id^="rive-"]';
  var players = new WeakSet(), seen = new WeakMap(), suspects = new WeakMap(), hidden = new WeakSet(), prints = [], removed = 0, blocked = 0, captcha = null, captchaSeen = 0;
  var points = [[.5,.5],[.25,.25],[.75,.25],[.25,.75],[.75,.75]];
  function frameOf(source) {
    return Array.prototype.find.call(document.querySelectorAll('iframe'),function (f) {return f.contentWindow === source;});
  }
  function protectedOverlay(el,frames) {
    if (el.matches(keep) || el.querySelector(keep)) return true;
    var inner = el.tagName === 'IFRAME' ? [el] : Array.prototype.slice.call(el.querySelectorAll('iframe'));
    return frames ? inner.some(function (f) {return players.has(f);}) : inner.length > 0;
  }
  function overlay(el,minZ,minArea) {
    var top = null, z = 0;
    for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
      var css = getComputedStyle(el);
      if (css.position !== 'static') z = Math.max(z,parseInt(css.zIndex,10) || 0);
      if (css.position === 'fixed') top = el;
    }
    if (!top || z < minZ) return null;
    var r = top.getBoundingClientRect();
    return r.width * r.height >= innerWidth * innerHeight * minArea ? top : null;
  }
  function overlays(minZ,minArea) {
    var found = [];
    points.forEach(function (p) {
      var el = overlay(document.elementFromPoint(innerWidth * p[0],innerHeight * p[1]),minZ,minArea);
      if (el && found.indexOf(el) === -1) found.push(el);
    });
    return found;
  }
  function tally(type,count) {
    if (type === 'adRemoved') removed += count; else blocked += count;
    if (!root && count) window.parent.postMessage({riveTV:type,count:count},'*');
  }
  function remove(el) {el.remove();tally('adRemoved',1);}
  var guard = new MutationObserver(function (records) {
    records.forEach(function (record) {
      var style = record.target.style;
      if (style.getPropertyValue('display') !== 'none' || style.getPropertyPriority('display') !== 'important') style.setProperty('display','none','important');
    });
  });
  function print(el) {return el.textContent.replace(/\d+/g,'#').replace(/\s+/g,' ').trim().slice(0,160);}
  function hide(el) {
    el.style.setProperty('display','none','important');
    if (hidden.has(el)) return;
    hidden.add(el);tally('adRemoved',1);
    guard.observe(el,{attributes:true,attributeFilter:['style','class','hidden']});
    var value = print(el);
    if (prints.indexOf(value) === -1) prints = prints.concat(value).slice(-20);
  }
  function scams(fast) {
    if (!document.body || Date.now() - captchaSeen < 5000) return;
    overlays(0,.15).forEach(function (el) {
      if (hidden.has(el) || protectedOverlay(el,true) || !scam.test(el.textContent)) return;
      if (prints.indexOf(print(el)) !== -1) {hide(el);return;}
      if (fast) return;
      var count = (suspects.get(el) || 0) + 1;suspects.set(el,count);
      if (count >= 2) hide(el);
    });
  }
  function relay(message) {
    document.querySelectorAll('iframe').forEach(function (frame) {
      try { frame.contentWindow.postMessage(message,'*'); } catch (_) {}
    });
  }
  function server() {
    var trigger = document.querySelector('[aria-label="Select Aggregator Server"]');
    return trigger ? trigger.textContent.trim() : '';
  }
  function report(message) {
    if (!root) {captchaSeen = Date.now();window.parent.postMessage(message,'*');return;}
    captcha = {kind:message.kind,x:Math.max(0,Math.min(1,message.x / innerWidth)),y:Math.max(0,Math.min(1,message.y / innerHeight)),server:server(),at:Date.now()};
  }
  function widget() {
    var found = null;
    document.querySelectorAll(widgets).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (found || r.width < 100 || r.height < 50 || getComputedStyle(el).visibility === 'hidden') return;
      var kind = kindOf(el.src || '') || (el.matches('.cf-turnstile') ? 'Cloudflare Turnstile' : el.matches('.h-captcha') ? 'hCaptcha' : 'reCAPTCHA');
      found = {riveTV:'captcha',kind:kind,x:r.left + r.width / 2,y:r.top + r.height / 2};
    });
    return found;
  }
  function clickjack(el) {
    if (!(el instanceof HTMLElement) || el.matches(keep) || el.querySelector(keep + ',img,canvas,iframe,svg')) return false;
    var css = getComputedStyle(el), r = el.getBoundingClientRect();
    return css.position === 'fixed' && (parseInt(css.zIndex,10) || 0) >= 1000 && css.pointerEvents !== 'none' &&
      r.width * r.height >= innerWidth * innerHeight * .9 && !el.textContent.trim() &&
      (Number(css.opacity) < .05 || (css.backgroundColor === 'rgba(0, 0, 0, 0)' && css.backgroundImage === 'none'));
  }
  function sweep() {
    if (root || !document.documentElement) return;
    Array.prototype.forEach.call(document.querySelectorAll('html > *,body > *'),function (el) {
      if (el.hasAttribute('doskip') || el.hasAttribute('prclck') || clickjack(el)) remove(el);
    });
  }
  function feature(el) {
    return Array.prototype.some.call(el.querySelectorAll('video'),function (v) {return v.duration > 120;});
  }
  function scan() {
    if (!document.body) return;
    var found = widget();
    if (found) report(found);
    var verifying = Date.now() - captchaSeen < 5000;
    scams(false);
    if (root) return;
    sweep();
    if (verifying) return;
    if (!document.querySelector('video') && scam.test(document.body.innerText)) window.parent.postMessage({riveTV:'adFrame'},'*');
    overlays(1000,.5).forEach(function (el) {
      if (el.isConnected && !el.matches(player) && !el.querySelector(player + ',' + widgets) && !feature(el) && interstitial.test(el.textContent)) remove(el);
    });
    var hosts = new Map();
    points.forEach(function (p) {
      var el = document.elementFromPoint(innerWidth * p[0],innerHeight * p[1]);
      if (!el || el === document.body || el === document.documentElement) return;
      var r = el.getBoundingClientRect();
      if (r.width * r.height < 1) hosts.set(el,(hosts.get(el) || 0) + 1);
    });
    hosts.forEach(function (hits,el) {if (hits >= 3 && !protectedOverlay(el,true)) remove(el);});
    overlays(1000,.3).forEach(function (el) {
      if (!el.isConnected || protectedOverlay(el,false)) return;
      var count = (seen.get(el) || 0) + 1;seen.set(el,count);
      if (count >= 3) remove(el);
    });
  }
  function dismiss() {
    if (!root && document.body) {sweep();overlays(1,.15).forEach(function (el) {if (!protectedOverlay(el,true)) remove(el);});}
    relay({riveTV:'adDismiss'});
  }
  if (!root) {
    var noop = function () {}, stub = {closed:false,opener:null,focus:noop,blur:noop,close:noop,postMessage:noop,
      document:{open:noop,write:noop,writeln:noop,close:noop},location:{href:'',assign:noop,replace:noop}};
    try { Object.defineProperty(window,'open',{configurable:false,writable:false,value:function () {tally('popupBlocked',1);return stub;}}); } catch (_) {}
    window.addEventListener('click',function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a[target]') : null;
      if (link && !/^_self$/i.test(link.target) && /^https?:/i.test(link.href)) {event.preventDefault();tally('popupBlocked',1);}
    },true);
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) if (records[i].target === document.body || records[i].target === document.documentElement) {sweep();return;}
    }).observe(document,{childList:true,subtree:true});
  }
  window.addEventListener('message',function (event) {
    var msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.riveTV === 'adDismiss' && !root && event.source === window.parent) {dismiss();return;}
    if (msg.riveTV === 'captcha' && event.source && event.source !== window && event.source.parent === window) {
      var kind = captchas.map(function (c) {return c[1];}).indexOf(msg.kind) === -1 ? '' : msg.kind;
      var host = frameOf(event.source), r = host ? host.getBoundingClientRect() : null;
      if (kind) report({riveTV:'captcha',kind:kind,x:r ? r.left + Math.max(0,Math.min(r.width,Number(msg.x) || 0)) : innerWidth / 2,y:r ? r.top + Math.max(0,Math.min(r.height,Number(msg.y) || 0)) : innerHeight / 2});
      return;
    }
    var frame = frameOf(event.source);
    if (!frame) return;
    if (msg.riveTV === 'state') players.add(frame);
    else if (msg.riveTV === 'adRemoved' || msg.riveTV === 'popupBlocked') tally(msg.riveTV,Math.max(0,Math.min(10,Number(msg.count) || 0)));
    else if (msg.riveTV === 'adFrame' && !root && !players.has(frame)) remove(frame);
  });
  window.RiveTVAds = {
    dismiss:function () {var before = removed;dismiss();return before;},
    removed:function () {return removed;},
    blocked:function () {return blocked;},
    captcha:function (probe) {
      if (!probe && window.RiveTVServers && window.RiveTVServers.searching()) return null;
      return captcha && Date.now() - captcha.at < 3500 ? JSON.stringify(captcha) : null;
    }
  };
  new MutationObserver(function () {if (prints.length) scams(true);}).observe(document,{childList:true,subtree:true,characterData:true});
  setInterval(scan,1000);
})();
