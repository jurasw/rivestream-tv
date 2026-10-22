(function () {
  'use strict';
  if (window.RiveTV) return;
  var selected = null;
  var candidates = [];
  var dirty = true;
  var timer;
  var currentRoute = location.pathname + location.search;
  var hasNavigated = false;
  var active = true;
  var activeScope = document;
  var beforeDialog = null;
  var playerEngaged = false;
  var nativeDropdown = null;
  var styleCache = null;
  var scrollTargets = [], scrollFrame = 0, scrollTime = 0;
  var episodesRoute = null;
  function computed(el) {
    if (!styleCache) return getComputedStyle(el);
    if (!styleCache.has(el)) styleCache.set(el, getComputedStyle(el));
    return styleCache.get(el);
  }
  var detailTabs = '[class*="MetaDetails__"] > [class*="category__"] > p';
  var base = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,iframe,video,[role="button"],[role="tab"],[role="link"],[role="option"],[role="menuitem"],[tabindex]:not([tabindex="-1"])';
  var style = document.createElement('style');
  style.id = 'rive-tv-style';
  style.textContent = window.RiveTVTheme || '';
  document.head.appendChild(style);

  // Android 9 TVs often have an older WebView. Rivestream uses dynamic viewport
  // units throughout its player; unsupported dvh otherwise collapses it to 150px.
  var adaptedSheets = {};
  function viewportFallbacks() {
    if (window.CSS && CSS.supports('height', '100dvh')) return;
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="stylesheet"]'), function (link) {
      var href = link.href;
      if (adaptedSheets[href] || href.indexOf(location.origin + '/_next/') !== 0) return;
      adaptedSheets[href] = true;
      fetch(href).then(function (response) {
        if (!response.ok) throw new Error('Stylesheet unavailable');
        return response.text();
      }).then(function (css) {
        if (!/[0-9][dsl]v[hw]/.test(css)) return;
        var fallback = document.createElement('style');
        fallback.setAttribute('data-rive-viewport-fallback', 'true');
        fallback.textContent = css.replace(/([0-9.]+)[dsl]v([hw])\b/g, '$1v$2')
          .replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/g, function (all, quote, path) {
            if (path.indexOf('data:') === 0) return all;
            try { return 'url("' + new URL(path.trim(), href).href + '")'; } catch (_) { return all; }
          });
        link.parentNode.insertBefore(fallback, link.nextSibling);
      }).catch(function () { delete adaptedSheets[href]; });
    });
  }
  document.addEventListener('load', function (event) { if (event.target.tagName === 'LINK') viewportFallbacks(); }, true);
  viewportFallbacks();

  function available(el) {
    if (!el || !el.isConnected || el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
    // Checking only the child misses hidden menus and transparent loading wrappers.
    for (var parent = el; parent && parent !== document.body; parent = parent.parentElement) {
      var parentStyle = computed(parent);
      if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden' || Number(parentStyle.opacity) === 0) return false;
    }
    var css = computed(el);
    if (css.display === 'none' || css.visibility === 'hidden' || Number(css.opacity) === 0) return false;
    var r = el.getBoundingClientRect();
    return r.width > 3 && r.height > 3 && el.getClientRects().length > 0;
  }
  function dialogScope() {
    var dialogs = document.querySelectorAll('[role="dialog"],dialog[open],[class*="modalCard__"],[class*="settingsPopoverCard__"],[role="listbox"],[class*="desktopPopover__"],[class*="mobileSheet__"]');
    for (var i = dialogs.length - 1; i >= 0; i--) if (available(dialogs[i])) return dialogs[i];
    return document;
  }
  function collect() {
    if (!dirty) return candidates;
    styleCache = new WeakMap();
    var scope = dialogScope();
    var scopeChanged = scope !== activeScope;
    if (scopeChanged) {
      if (scope !== document && activeScope === document) beforeDialog = selected;
      if (selected) selected.removeAttribute('data-rive-focus');
      selected = scope === document && available(beforeDialog) ? beforeDialog : null;
      activeScope = scope;
    }
    Array.prototype.forEach.call(document.querySelectorAll(detailTabs), function (tab) {
      if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
      if (!tab.parentElement.hasAttribute('role')) tab.parentElement.setAttribute('role', 'tablist');
      tab.setAttribute('aria-selected', /(?:^|_)active__/.test(tab.className) ? 'true' : 'false');
    });
    candidates = Array.prototype.slice.call(scope.querySelectorAll(base)).filter(function (e) {
      return available(e) && !/\bid=undefined\b/.test(e.getAttribute('href') || '') && !e.matches('h1 a,h2 a,h3 a') && !e.parentElement.closest('a[href],button,[role="button"]');
    });
    // Rivestream also uses React click handlers on poster divs with no tabindex.
    var cards = scope.querySelectorAll('[class*="card"],[class*="Card"],[class*="poster"],[class*="Poster"],img,svg[data-tooltip-content]');
    Array.prototype.forEach.call(cards, function (el) {
      if (el.tagName === 'IMG') el = el.parentElement;
      if (!available(el) || el.closest('a,button,[role="button"]') || candidates.indexOf(el) !== -1) return;
      if ((getComputedStyle(el).cursor !== 'pointer' && !el.matches('[class*="HomeHeroIcons__"]')) || el.querySelector('a,button,[role="button"]')) return;
      candidates.push(el);
    });
    candidates.forEach(function (el) { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0'); });
    dirty = false;
    styleCache = null;
    if (scopeChanged && active && selected) setFocus(selected, false);
    return candidates;
  }
  function animateScroll(time) {
    var dt = Math.min(40, Math.max(1, time - scrollTime));
    scrollTime = time;
    var moving = false;
    scrollTargets.forEach(function (item) {
      var y = item.root ? window.scrollY : item.el.scrollTop;
      var delta = item.top - y;
      var step = delta * (1 - Math.exp(-dt / 35));
      step = Math.max(-dt * 2.4, Math.min(dt * 2.4, step));
      var next = Math.abs(delta) < .8 ? item.top : y + step;
      if (item.root) window.scrollTo({top:next, left:window.scrollX, behavior:'auto'});
      else item.el.scrollTop = next;
      if (Math.abs(item.top - next) >= .8) moving = true;
    });
    if (moving) scrollFrame = requestAnimationFrame(animateScroll);
    else {scrollFrame = 0; scrollTargets = []; document.documentElement.removeAttribute('data-rive-scrolling');}
  }
  function scrollHeldFocus(el) {
    document.documentElement.setAttribute('data-rive-scrolling', 'true');
    var items = [];
    // One animator keeps its current velocity/position when another key step
    // arrives. Native smooth-scroll restarts and instant row jumps both stutter.
    for (var parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      var css = getComputedStyle(parent), r = el.getBoundingClientRect(), box = parent.getBoundingClientRect();
      if (/auto|scroll/.test(css.overflowY) && parent.scrollHeight > parent.clientHeight + 2) {
        var top = parent.scrollTop;
        if (r.top < box.top + 24 || r.bottom > box.bottom - 24) top += r.top + r.height / 2 - box.top - parent.clientHeight / 2;
        items.push({el:parent, top:Math.max(0, Math.min(parent.scrollHeight - parent.clientHeight, top))});
      }
      if (/auto|scroll/.test(css.overflowX) && parent.scrollWidth > parent.clientWidth + 2) {
        if (r.left < box.left) parent.scrollLeft += r.left - box.left;
        else if (r.right > box.right) parent.scrollLeft += r.right - box.right;
      }
    }
    var rect = el.getBoundingClientRect();
    // Keep the selected episode near the middle while browsing a long list.
    var top = window.scrollY;
    if (!items.length && (rect.top < innerHeight * .3 || rect.bottom > innerHeight * .7)) top += rect.top + rect.height / 2 - innerHeight / 2;
    items.push({root:true, top:Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, top))});
    scrollTargets = items;
    if (!scrollFrame) {scrollTime = performance.now();scrollFrame = requestAnimationFrame(animateScroll);}
  }
  function alignRow(el) {
    if (!el.matches('[class*="CardSmall__"]')) return;
    var row = el.parentElement;
    if (!row || row.scrollWidth <= row.clientWidth + 2 || !/auto|scroll/.test(getComputedStyle(row).overflowX)) return;
    var pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
    var left = Math.max(0, Math.min(row.scrollWidth - row.clientWidth, row.scrollLeft + el.getBoundingClientRect().left - row.getBoundingClientRect().left - pad));
    if (Math.abs(row.scrollLeft - left) > 1) row.scrollTo({left:left, behavior:document.documentElement.hasAttribute('data-rive-repeat') ? 'auto' : 'smooth'});
  }
  function setFocus(el, scroll, repeated) {
    if (!el) return false;
    if (window.RiveTVPlayback && RiveTVPlayback.hidden() && !el.closest('#rive-next-episode')) return false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-rive-focus],[data-rive-current]'), function (old) {old.removeAttribute('data-rive-focus');old.removeAttribute('data-rive-current');});
    selected = el;
    if (!active) return true;
    selected.setAttribute('data-rive-focus', 'true');
    var episodeRow = el.closest('[class*="EpisodeList__"] [class*="episode__"]');
    if (episodeRow) episodeRow.setAttribute('data-rive-current', 'true');
    try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); }
    if (scroll !== false) {
      var rect = el.getBoundingClientRect();
      if (repeated) { scrollHeldFocus(el); }
      else if (rect.top < 24 || rect.bottom > innerHeight - 24) {
        // Most pages scroll an inner container, where window.scrollY stays 0.
        var offset = rect.top, scrolled = [];
        for (var parent = el.parentElement; parent; parent = parent.parentElement) if (parent.scrollTop > 0) { offset += parent.scrollTop; scrolled.push(parent); }
        if (scrolled.length && offset < innerHeight * .8) scrolled.forEach(function (parent) { parent.scrollTo({top:0, behavior:'smooth'}); });
        else el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      } else el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      alignRow(el);
    }
    return true;
  }
  function first() {
    if (window.RiveTVPlayback && RiveTVPlayback.hidden()) {
      if (focusNext()) return true;
      if (selected) {selected.removeAttribute('data-rive-focus');selected.blur();}
      selected = null;return false;
    }
    var visible = collect().filter(function (el) {
      var r = el.getBoundingClientRect();
      return r.top >= 0 && r.top < innerHeight && r.left >= 0 && r.left < innerWidth;
    });
    var primary = visible.filter(function (el) {
      return location.pathname === '/search' ? /^(INPUT|TEXTAREA)$/.test(el.tagName) : el.tagName === 'A' && (el.getAttribute('href') || '').indexOf('/watch?') === 0;
    })[0];
    return setFocus(!hasNavigated && primary ? primary : selected && available(selected) ? selected : primary || visible[0], false);
  }
  function stopMove() { document.documentElement.removeAttribute('data-rive-repeat'); }
  function overlayKeys() {
    return !!(window.RiveTVPlayer && RiveTVPlayer.owns() && dialogScope() === document);
  }
  function move(direction, repeated) {
    if (overlayKeys()) {RiveTVPlayer.key(direction, repeated === true);return 'ok';}
    if (window.RiveTVPlayback && RiveTVPlayback.isWatch()) {
      if (RiveTVPlayback.hidden()) {
        if (direction === 'down') {revealPlayback();return 'ok';}
        if (direction === 'left' || direction === 'right') RiveTVPlayback.command(direction === 'right' ? 'forward' : 'rewind');
        return 'ok';
      }
      RiveTVPlayback.touch();
    }
    if (repeated) document.documentElement.setAttribute('data-rive-repeat', 'true');
    else stopMove();
    active = true;
    hasNavigated = true;
    collect();
    if (!selected || !available(selected)) { first(); return direction === 'left' && activeScope === document ? 'rail' : 'ok'; }
    if (selected.tagName === 'INPUT' && selected.type === 'range' && (direction === 'left' || direction === 'right')) {
      var step = Number(selected.step) || 1;
      var min = selected.min === '' ? 0 : Number(selected.min);
      var max = selected.max === '' ? 100 : Number(selected.max);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(selected, Math.max(min, Math.min(max, Number(selected.value) + (direction === 'right' ? step : -step))));
      selected.dispatchEvent(new Event('input', {bubbles:true}));
      selected.dispatchEvent(new Event('change', {bubbles:true}));
      return 'ok';
    }
    if (playerEngaged && selected.tagName === 'IFRAME') return 'native';
    if (selected.matches(detailTabs) && (direction === 'left' || direction === 'right')) {
      var tabs = Array.prototype.slice.call(selected.parentElement.querySelectorAll('[role="tab"]')).filter(available);
      var adjacent = tabs[tabs.indexOf(selected) + (direction === 'right' ? 1 : -1)];
      if (adjacent) setFocus(adjacent);
      return adjacent || direction === 'right' ? 'ok' : 'rail';
    }
    var r = selected.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var horizontal = direction === 'left' || direction === 'right';
    if (direction === 'left' && r.left < 65 && activeScope === document) return 'rail';
    var positive = direction === 'right' || direction === 'down';
    var best = null, bestScore = Infinity;
    var episode = selected.closest('[class*="EpisodeList__"] [class*="episode__"]');
    if (!horizontal && episode) {
      var rows = Array.prototype.slice.call(episode.parentElement.children).filter(function (row) {return row.matches('[class*="episode__"]');});
      var nextRow = rows[rows.indexOf(episode) + (positive ? 1 : -1)];
      if (nextRow) {
        var controls = collect().filter(function (el) {return nextRow.contains(el);});
        var watch = controls.filter(function (el) {return selected.matches('[class*="links__"],.btn') ? el.matches('[class*="links__"],.btn') : el.tagName === selected.tagName;})[0] || controls[0];
        if (watch) {setFocus(watch, true, repeated);return 'ok';}
      }
    }
    var band = null;
    if (!horizontal && selected.matches('[class*="CardSmall__"]')) {
      var nearest = Infinity;
      collect().forEach(function (el) {
        if (el === selected || el.contains(selected) || selected.contains(el)) return;
        var b = el.getBoundingClientRect(), gap = positive ? b.top - r.bottom : r.top - b.bottom;
        if (gap > -3 && gap < nearest) nearest = gap;
      });
      if (nearest !== Infinity) band = nearest + 40;
    }
    collect().forEach(function (el) {
      if (el === selected || el.contains(selected) || selected.contains(el)) return;
      if (band !== null) {
        var box = el.getBoundingClientRect(), gap = positive ? box.top - r.bottom : r.top - box.bottom;
        if (gap <= -3 || gap > band) return;
      }
      if (!horizontal && episode && el.closest('[class*="EpisodeList__"] [class*="episode__"]') === episode) return;
      var b = el.getBoundingClientRect();
      var dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy;
      var primary = horizontal ? dx : dy;
      if ((positive ? primary : -primary) < 4) return;
      var cross = horizontal ? Math.abs(dy) : Math.abs(dx);
      var overlap = horizontal ? b.bottom > r.top + 3 && b.top < r.bottom - 3 : b.right > r.left + 3 && b.left < r.right - 3;
      // A full-width selector overlaps every tab. Its distant center must not
      // make Down skip it in favour of a narrow episode link farther below.
      if (!horizontal && overlap) cross = 0;
      var score = Math.abs(primary) + cross * 2.5 + (overlap ? 0 : 700);
      if (score < bestScore) { best = el; bestScore = score; }
    });
    if (best) { setFocus(best, true, repeated); return 'ok'; }
    if (direction === 'left') return activeScope === document ? 'rail' : 'ok';
    if (activeScope !== document) return 'ok';
    if (direction === 'right') return 'edge-right';
    window.scrollBy(0, direction === 'up' ? -innerHeight * .65 : direction === 'down' ? innerHeight * .65 : 0);
    dirty = true;
    return direction === 'up' ? 'edge-up' : 'ok';
  }
  function focusNext() {
    var next = document.querySelector('#rive-next-episode button');
    if (!available(next) || dialogScope() !== document) return false;
    active = true;dirty = true;playerEngaged = false;
    return setFocus(next,false);
  }
  function playbackTarget() {
    return window.RiveTVPlayback && RiveTVPlayback.isWatch() &&
      (RiveTVPlayback.hidden() && !(selected && selected.closest('#rive-next-episode') && available(selected)) || selected && /^(IFRAME|VIDEO)$/.test(selected.tagName) && available(selected) && dialogScope() === document);
  }
  function target() {
    if (overlayKeys()) return {overlay:true};
    if (playbackTarget()) return {playback:true};
    collect();
    if (!selected || !available(selected)) first();
    if (!selected) return null;
    if (selected.tagName === 'SELECT') {
      return {select:true, title:selected.getAttribute('aria-label') || selected.name || 'Wybierz opcję', multiple:selected.multiple,
        options:Array.prototype.map.call(selected.options, function (option, index) {
          return {index:index,label:option.text,value:option.value,selected:option.selected,disabled:option.disabled || (option.parentElement.tagName === 'OPTGROUP' && option.parentElement.disabled)};
        })};
    }
    var r = selected.getBoundingClientRect();
    var input = /^(INPUT|TEXTAREA|SELECT)$/.test(selected.tagName) || selected.isContentEditable;
    var searchInput = input && location.pathname === '/search' && selected.matches('input[class*="searchInput__"],input[type="search"]');
    return { search:searchInput, text:searchInput ? selected.value : '',
      left:r.left/innerWidth, top:r.top/innerHeight, width:r.width/innerWidth, height:r.height/innerHeight,
      tap: input || /^(IFRAME|VIDEO)$/.test(selected.tagName), input: input, player:selected.tagName === 'IFRAME',
      x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
  }
  function activate() {
    if (overlayKeys()) return RiveTVPlayer.key('ok');
    if (playbackTarget()) return RiveTVPlayback.command('toggle');
    if (window.RiveTVPlayback) RiveTVPlayback.touch();
    collect();
    if (!selected || !available(selected)) first();
    if (!selected) return false;
    var dropdownTrigger = selected.matches('[aria-haspopup="listbox"]');
    if (dropdownTrigger) {
      nativeDropdown = {trigger:selected, container:null};
      // Set this before React opens its list, so it cannot paint even one frame.
      document.documentElement.setAttribute('data-rive-native-select', 'true');
      setTimeout(cleanupNativeDropdown, 80);
    }
    if (typeof selected.click === 'function') selected.click();
    else selected.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
    dirty = true;
    return dropdownTrigger ? 'dropdown' : true;
  }
  function sources() {
    siteControls();
    var trigger = document.getElementById('source');
    if (!available(trigger)) return false;
    active = true;
    setFocus(trigger, false);
    return activate();
  }
  function cleanupNativeDropdown() {
    if (!nativeDropdown) return;
    if (!nativeDropdown.trigger.isConnected ||
        (nativeDropdown.trigger.getAttribute('aria-expanded') !== 'true' &&
        (!nativeDropdown.container || !nativeDropdown.container.isConnected))) {
      nativeDropdown = null;
      document.documentElement.removeAttribute('data-rive-native-select');
    }
  }
  function dropdownContainer() {
    var containers = document.querySelectorAll('[class*="desktopPopover__"],[class*="mobileSheet__"],[role="listbox"]');
    for (var i=containers.length-1;i>=0;i--) {
      var container = containers[i];
      // Hidden backing lists supply options to the native dialog; normal page
      // navigation still excludes them and keeps focus on the original trigger.
      var rect = container.getBoundingClientRect();
      var staged = nativeDropdown && nativeDropdown.trigger.getAttribute('aria-expanded') === 'true' &&
        rect.width > 3 && rect.height > 3 && !container.closest('[hidden],[inert],[aria-hidden="true"]');
      if ((!staged && !available(container)) || !container.querySelector('[role="option"]')) continue;
      if (nativeDropdown) nativeDropdown.container = container;
      return container;
    }
    return null;
  }
  function dropdown() {
    var container = dropdownContainer();
    if (!container) return null;
    return {select:true, custom:true, options:Array.prototype.map.call(container.querySelectorAll('[role="option"]'),function (option,index) {
      return {index:index, label:option.getAttribute('title') || option.textContent.trim(), selected:option.getAttribute('aria-selected') === 'true', disabled:option.getAttribute('aria-disabled') === 'true'};
    })};
  }
  function closeDropdown() {
    var trigger = nativeDropdown ? nativeDropdown.trigger : document.querySelector('[aria-haspopup="listbox"][aria-expanded="true"]');
    if (!trigger || trigger.getAttribute('aria-expanded') !== 'true') { cleanupNativeDropdown(); return false; }
    if (nativeDropdown && !nativeDropdown.container) dropdownContainer();
    trigger.click();
    if (available(trigger)) setFocus(trigger, false);
    cleanupNativeDropdown();
    return true;
  }
  function choose(index) {
    var container = dropdownContainer();
    if (container) {
      var item = container.querySelectorAll('[role="option"]')[index];
      if (!item || item.getAttribute('aria-disabled') === 'true') return false;
      var trigger = nativeDropdown && nativeDropdown.trigger;
      item.click();
      if (available(trigger)) setFocus(trigger, false);
      cleanupNativeDropdown();
      return true;
    }
    if (!selected || selected.tagName !== 'SELECT' || !selected.options[index] || selected.options[index].disabled) return false;
    var option = selected.options[index];
    if (selected.multiple) option.selected = !option.selected;
    else {
      var setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(selected, option.value);
    }
    selected.dispatchEvent(new Event('input', {bubbles:true}));
    selected.dispatchEvent(new Event('change', {bubbles:true}));
    return true;
  }
  function search(query, preserveEditor) {
    if (location.pathname !== '/search') return false;
    var input = document.querySelector('input[class*="searchInput__"],input[type="search"],input[type="text"]');
    if (!input) return false;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, query);
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.dispatchEvent(new Event('change', {bubbles:true}));
    hasNavigated = true;
    if (!preserveEditor) setFocus(input, false);
    return true;
  }
  function releasePlayer() {
    if (!playerEngaged) return false;
    playerEngaged = false;
    active = true;
    if (selected) selected.blur();
    var control = collect().filter(function (el) {return el.tagName !== 'IFRAME' && el.tagName !== 'VIDEO';})[0];
    if (control) setFocus(control);
    return true;
  }
  function revealPlayback() {
    if (window.RiveTVPlayer && RiveTVPlayer.active()) return RiveTVPlayer.back();
    return siteControls();
  }
  function siteControls(preferSource) {
    if (!window.RiveTVPlayback || !RiveTVPlayback.reveal()) return false;
    active = true;dirty = true;playerEngaged = false;selected = null;
    var control = collect().filter(function (el) {return el.tagName !== 'IFRAME' && el.tagName !== 'VIDEO';})[0];
    var next = document.querySelector('#rive-next-episode button'), source = document.getElementById('source');
    if (preferSource && source) setTimeout(function () {if (available(source) && !RiveTVPlayback.hidden()) setFocus(source,false);},400);
    if (preferSource && available(source)) setFocus(source,false);
    else if (next && available(next)) setFocus(next,false);
    else if (control) setFocus(control,false);
    return true;
  }
  function media(action) {
    if (overlayKeys() && /^(toggle|forward|rewind)$/.test(action)) return RiveTVPlayer.key(action);
    if (window.RiveTVPlayback && RiveTVPlayback.isWatch()) return RiveTVPlayback.command(action);
    var found = false;
    function visit(doc) {
      Array.prototype.forEach.call(doc.querySelectorAll('video,audio'), function (v) {
        if (!v.currentSrc) return;
        found = true;
        if (action === 'forward' || action === 'rewind') {
          var end = isFinite(v.duration) ? v.duration : Infinity;
          v.currentTime = Math.max(0, Math.min(end, v.currentTime + (action === 'forward' ? 10 : -10)));
        }
        else if (action === 'pause' || (action === 'toggle' && !v.paused)) v.pause();
        else { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
      Array.prototype.forEach.call(doc.querySelectorAll('iframe'), function (frame) {
        try { if (frame.contentDocument) visit(frame.contentDocument); } catch (_) {}
      });
    }
    visit(document);
    return found;
  }
  var observer = new MutationObserver(function (records) {
    var changed = records.some(function (r) { return r.type === 'childList' || r.attributeName !== 'data-rive-focus'; });
    if (!changed) return;
    dirty = true;
    cleanupNativeDropdown();
    var route = location.pathname + location.search;
    if (route !== currentRoute) {
      if (selected) selected.removeAttribute('data-rive-focus');
      selected = null;
      currentRoute = route;
      hasNavigated = false;
      playerEngaged = false;
      window.scrollTo({top:0, left:0, behavior:'auto'});
      Array.prototype.forEach.call(document.querySelectorAll('[class*="MetaDetails__"],[class*="style_background__"]'), function (el) { el.scrollTop = 0; });
      viewportFallbacks();
    }
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (episodesRoute !== currentRoute && location.pathname === '/detail' && /[?&]type=tv(?:&|$)/.test(location.search)) {
        var episodes = Array.prototype.filter.call(document.querySelectorAll(detailTabs), function (tab) { return tab.textContent.trim() === 'Episodes'; })[0];
        if (episodes) {
          episodesRoute = currentRoute;
          if (!/(?:^|_)active__/.test(episodes.className)) episodes.click();
        }
      }
      collect();
      if (active && (!hasNavigated || !selected || !available(selected))) first();
    }, 180);
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true,
    attributeFilter: ['class', 'style', 'hidden', 'disabled', 'aria-hidden', 'href'] });
  document.addEventListener('focusin', function (e) {
    if (active && candidates.indexOf(e.target) !== -1 && selected !== e.target) setFocus(e.target, false);
  });
  window.addEventListener('popstate', function () { selected = null; dirty = true; });
  // The website recenters its active detail tab after a delayed effect. Only
  // move its horizontal strip; vertical scrolling belongs to D-pad navigation.
  var scrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (options) {
    if (this.matches(detailTabs) && options && options.inline === 'center') {
      this.parentElement.scrollLeft = Math.max(0, this.offsetLeft - this.parentElement.clientWidth / 2 + this.offsetWidth / 2);
      return;
    }
    return scrollIntoView.call(this, options);
  };
  function pageState() {
    // Ignore screen-reader announcements and hidden stale error messages. A
    // usable player must never be covered by our native full-page error panel.
    var player = Array.prototype.some.call(document.querySelectorAll('video,iframe[class*="Watch_iframe__"]'), function (el) {
      var r = el.getBoundingClientRect();
      return available(el) && r.width > 120 && r.height > 80;
    });
    var root = document.getElementById('__next') || document.body;
    var fatal = Array.prototype.some.call(root.querySelectorAll('h2'), function (el) {
      return available(el) && /Application error: a client-side exception/i.test(el.textContent);
    });
    if (fatal && !player) return 'error';
    if (document.readyState === 'loading') return 'loading';
    if (location.pathname === '/' || location.pathname === '/detail') {
      var watch = document.querySelector('a[href^="/watch?"]');
      return watch && !/id=(undefined|null)(?:&|$)/.test(watch.getAttribute('href')) && watch.getBoundingClientRect().width > 0 ? 'ready' : 'loading';
    }
    if (location.pathname === '/watch') return player || collect().some(function (el) { return el.tagName === 'BUTTON'; }) ? 'ready' : 'loading';
    return collect().length ? 'ready' : 'loading';
  }
  function suspend() {
    stopMove();
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;scrollTargets = [];document.documentElement.removeAttribute('data-rive-scrolling');
    active = false;
    if (selected) selected.removeAttribute('data-rive-focus');
  }
  function finishEditing() {
    var input = document.activeElement;
    if (input && (/^(INPUT|TEXTAREA)$/.test(input.tagName) || input.isContentEditable)) {
      input.dispatchEvent(new Event('input', {bubbles:true}));
      input.dispatchEvent(new Event('change', {bubbles:true}));
      input.blur();
    }
    hasNavigated = true;
    active = true;
    dirty = true;
    var control = collect().filter(function (el) {
      var r = el.getBoundingClientRect();
      return !/^(INPUT|TEXTAREA)$/.test(el.tagName) && !el.isContentEditable &&
        r.bottom > 0 && r.top < innerHeight;
    })[0];
    if (control) setFocus(control, false);
    else { if (selected) selected.removeAttribute('data-rive-focus'); selected = null; }
    return true;
  }
  function resume() {active = true; first();}
  window.RiveTV = { sources:sources, stopMove:stopMove, finishEditing:finishEditing, pageState:pageState, first: first, move: move, target: target, activate: activate, choose: choose, dropdown: dropdown, closeDropdown: closeDropdown, search: search, media: media, suspend: suspend, resume: resume,
    focusNext:focusNext, revealPlayback:revealPlayback, siteControls:siteControls, enterPlayer:function () {playerEngaged=true;}, releasePlayer:releasePlayer };
  setTimeout(first, 350);
})();
