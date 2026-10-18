(function () {
  'use strict';
  if (window.RiveTVAds) return;
  var root = window === window.top;
  var scam = /not a robot|scan (?:the |this )?qr/i;
  var keep = 'video,[id^="rive-"],.spla,.server-menu-item,button[aria-label="Play"],.vjs-big-play-button,.jw-display-icon-container';
  var players = new WeakSet(), seen = new WeakMap(), removed = 0;
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
  function counted(count) {
    removed += count;
    if (!root && count) window.parent.postMessage({riveTV:'adRemoved',count:count},'*');
  }
  function remove(el) {el.remove();counted(1);}
  function relay(message) {
    document.querySelectorAll('iframe').forEach(function (frame) {
      try { frame.contentWindow.postMessage(message,'*'); } catch (_) {}
    });
  }
  function scan() {
    if (!document.body) return;
    overlays(0,.15).forEach(function (el) {if (!protectedOverlay(el,true) && scam.test(el.textContent)) remove(el);});
    if (root) return;
    if (!document.querySelector('video') && scam.test(document.body.innerText)) window.parent.postMessage({riveTV:'adFrame'},'*');
    // Provider pages stack ads above the player; a persistent, image-only cover is never part of it.
    overlays(1000,.3).forEach(function (el) {
      if (protectedOverlay(el,false)) return;
      var count = (seen.get(el) || 0) + 1;seen.set(el,count);
      if (count >= 3) remove(el);
    });
  }
  function dismiss() {
    if (!root && document.body) overlays(1,.15).forEach(function (el) {if (!protectedOverlay(el,true)) remove(el);});
    relay({riveTV:'adDismiss'});
  }
  window.addEventListener('message',function (event) {
    var msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.riveTV === 'adDismiss' && !root && event.source === window.parent) {dismiss();return;}
    var frame = frameOf(event.source);
    if (!frame) return;
    if (msg.riveTV === 'state') players.add(frame);
    else if (msg.riveTV === 'adRemoved') counted(Math.max(0,Math.min(10,Number(msg.count) || 0)));
    else if (msg.riveTV === 'adFrame' && !root && !players.has(frame)) remove(frame);
  });
  window.RiveTVAds = {
    dismiss:function () {var before = removed;dismiss();return before;},
    removed:function () {return removed;}
  };
  setInterval(scan,1000);
})();
