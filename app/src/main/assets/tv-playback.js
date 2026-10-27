(function () {
  'use strict';
  if (window.RiveTVPlayback) return;
  var root = window === window.top;
  var context = null, route = '', videos = new WeakMap(), clicked = new WeakSet(), stale = new WeakMap();
  var started = false, controls = false, hideTimer, lastSaved = 0;
  var nextPanel, nextSettings, nextState = null, nextCountdown = 0, nextCancelled = false, advancing = false;
  var nextPreferences = {autoNext:false,outroSeconds:90,subtitles:null,subtitleKey:'',audioLanguage:''}, nextView = {eligible:false};
  var preferencesLoaded = false, AUDIO_LANGUAGES = ['','ja','en','pl'];
  var SUBTITLE_NAMES = {'wyłączone':'off','polski':'polish','angielski':'english','japoński':'japanese','czeski':'czech','niemiecki':'german','francuski':'french','hiszpański':'spanish','włoski':'italian','rosyjski':'russian','ukraiński':'ukrainian','portugalski':'portuguese','koreański':'korean','chiński':'chinese','turecki':'turkish','arabski':'arabic','niderlandzki':'dutch','szwedzki':'swedish'};
  function loadPreferences() {
    if (preferencesLoaded) return;
    preferencesLoaded = true;
    // Wait for body: the Android storage bootstrap follows this document-start script.
    try {
      var storedPreferences = JSON.parse(localStorage.getItem('RiveTVPlaybackSettings') || '{}');
      nextPreferences.autoNext = storedPreferences.autoNext === true;
      if ([0,30,60,90,120,180].indexOf(storedPreferences.outroSeconds) !== -1) nextPreferences.outroSeconds = storedPreferences.outroSeconds;
      if (typeof storedPreferences.subtitles === 'string' && storedPreferences.subtitles.length <= 80) nextPreferences.subtitles = storedPreferences.subtitles.replace(/^[^ ]+/,function (name) {return SUBTITLE_NAMES[name] || name;});
      if (typeof storedPreferences.subtitleKey === 'string' && /^[\w-]{0,100}$/.test(storedPreferences.subtitleKey)) nextPreferences.subtitleKey = storedPreferences.subtitleKey;
      if (AUDIO_LANGUAGES.indexOf(storedPreferences.audioLanguage) !== -1) nextPreferences.audioLanguage = storedPreferences.audioLanguage;
    } catch (_) {}
  }
  function persistPreferences() {
    localStorage.setItem('RiveTVPlaybackSettings',JSON.stringify(nextPreferences));
    nextCountdown = 0;
  }
  function nextEpisodeAction() {
    var button = document.querySelector('button[title^="Next Episode"]');
    if (button) return button.disabled ? null : function () {button.click();};
    // Quick Menu exposes availability even while its drawer is unmounted.
    // Use the committed React tree; the DOM's fiber can point at an old alternate.
    var handle = document.querySelector('[aria-label="Toggle Quick Menu"]');
    if (!handle) return null;
    var key = Object.keys(handle).find(function (name) {return name.indexOf('__reactFiber$') === 0;});
    var fiber = key && handle[key], top = fiber;
    if (!fiber) return null;
    while (top.return) top = top.return;
    if (top.stateNode && top.stateNode.current !== top) fiber = fiber.alternate;
    for (;fiber;fiber = fiber.return) {
      var props = fiber.memoizedProps;
      if (props && typeof props.hasNextEpisode === 'boolean' && typeof props.onNextEpisode === 'function') {
        if (!context || String(props.season) !== context.season || String(props.episode) !== context.episode) return null;
        return props.hasNextEpisode ? props.onNextEpisode : null;
      }
    }
    return null;
  }
  function advanceEpisode() {
    updateRoute();
    if (!context || context.type !== 'tv' || advancing || window.__riveSleepTriggered || window.__riveSleepEndOfVideoActive) return false;
    var action = nextEpisodeAction();
    if (!action) return false;
    advancing = true;nextCountdown = 0;
    if (nextState) save(Object.assign({},nextState,{ended:true}));
    command('pause');
    action();
    if (nextPanel) nextPanel.hidden = true;
    return true;
  }
  function playbackSettings() {
    if (!root) return;
    if (location.pathname !== '/settings') {
      if (nextSettings) nextSettings.remove();
      nextSettings = null;return;
    }
    if (nextSettings && nextSettings.isConnected) return;
    var mode = document.getElementById('mode');
    var group = mode && mode.closest('[class*="group__"]');
    if (!group) return;
    nextSettings = document.createElement('div');nextSettings.id = 'rive-next-settings';
    nextSettings.innerHTML = '<label for="rive-auto-next">Auto next — next episode</label><button id="rive-auto-next" type="button" role="switch"></button><label for="rive-outro-seconds">Show the button before the episode ends</label><select id="rive-outro-seconds"><option value="0">When it ends</option><option value="30">30 seconds</option><option value="60">1 minute</option><option value="90">1.5 minutes</option><option value="120">2 minutes</option><option value="180">3 minutes</option></select><p>The “Next episode” button moves on right away. Auto next switches after 15 seconds; you can cancel the countdown. The outro time is approximate.</p>' +
      '<label for="rive-audio-language">Preferred audio language</label><select id="rive-audio-language"><option value="">No preference</option><option value="ja">Japanese</option><option value="en">English</option><option value="pl">Polish</option></select>' +
      '<label for="rive-subtitle-key">Wyzie subtitles key</label><input id="rive-subtitle-key" type="text" autocomplete="off" spellcheck="false" placeholder="Enter key">' +
      '<p>Audio language: the server search picks a track in this language when the server labels it. A Wyzie key (free, store.wyzie.io/redeem) turns on the subtitles list in the player. It stays on this device only.</p>';
    var toggle = nextSettings.querySelector('button');
    function label() {toggle.textContent = nextPreferences.autoNext ? 'On' : 'Off';toggle.setAttribute('aria-checked',String(nextPreferences.autoNext));}
    label();toggle.onclick = function () {nextPreferences.autoNext = !nextPreferences.autoNext;persistPreferences();label();};
    var select = nextSettings.querySelector('select');select.value = String(nextPreferences.outroSeconds);
    select.onchange = function () {nextPreferences.outroSeconds = Number(select.value);persistPreferences();};
    var audio = nextSettings.querySelector('#rive-audio-language');audio.value = nextPreferences.audioLanguage;
    audio.onchange = function () {nextPreferences.audioLanguage = AUDIO_LANGUAGES.indexOf(audio.value) !== -1 ? audio.value : '';persistPreferences();};
    var key = nextSettings.querySelector('#rive-subtitle-key');key.value = nextPreferences.subtitleKey;
    key.oninput = key.onchange = function () {var value = key.value.trim();if (/^[\w-]{0,100}$/.test(value)) {nextPreferences.subtitleKey = value;persistPreferences();}};
    group.appendChild(nextSettings);
  }
  function updateNext() {
    if (!root) return;
    var state = nextState;
    var eligible = context && context.type === 'tv' && state && state.session === context.session &&
      (state.ended || state.duration - state.time <= Math.min(nextPreferences.outroSeconds,state.duration * .1)) &&
      !advancing && !!nextEpisodeAction() && !window.__riveSleepTriggered && !window.__riveSleepEndOfVideoActive;
    var overlay = !!(window.RiveTVPlayer && window.RiveTVPlayer.active());
    if (!eligible) {nextCountdown = 0;nextView = {eligible:false};if (nextPanel) nextPanel.hidden = true;return;}
    if (!nextPanel) {
      nextPanel = document.createElement('div');nextPanel.id = 'rive-next-episode';nextPanel.hidden = true;
      nextPanel.innerHTML = '<button type="button">Next episode</button><button type="button">Cancel auto next</button>';
      nextPanel.querySelectorAll('button')[0].onclick = advanceEpisode;
      nextPanel.querySelectorAll('button')[1].onclick = function () {nextCancelled = true;nextCountdown = 0;updateNext();};
      document.body.appendChild(nextPanel);
    }
    var appeared = nextPanel.hidden;
    nextPanel.hidden = overlay;
    var auto = nextPreferences.autoNext && !nextCancelled;
    // Buffering, pauses, a background app and stale provider reports freeze the countdown.
    if (auto && (!state.paused || state.ended) && !state.buffering && !document.hidden && Date.now() - state.received < 2500) nextCountdown++;
    var label = auto ? 'Next episode (in ' + Math.max(0,15-nextCountdown) + ' s)' : 'Next episode';
    var button = nextPanel.querySelector('button');if (button.textContent !== label) button.textContent = label;
    nextPanel.querySelectorAll('button')[1].hidden = !auto;
    nextView = {eligible:true,auto:auto,remaining:auto ? Math.max(0,15-nextCountdown) : null};
    if (appeared && !overlay && window.RiveTV) window.RiveTV.focusNext();
    if (nextCountdown >= 15) advanceEpisode();
  }
  var style = document.createElement('style');
  style.textContent = 'html[data-rive-cinema="hidden"] .art-controls,html[data-rive-cinema="hidden"] .art-mask,html[data-rive-cinema="hidden"] .art-layer,html[data-rive-cinema="hidden"] .vjs-control-bar,html[data-rive-cinema="hidden"] .vjs-big-play-button,html[data-rive-cinema="hidden"] .jw-controlbar,html[data-rive-cinema="hidden"] .jw-display,html[data-rive-cinema="hidden"] .plyr__controls{opacity:0!important;pointer-events:none!important}';
  function child(source) {
    return Array.prototype.some.call(document.querySelectorAll('iframe'),function (f) {return f.contentWindow === source;});
  }
  function sendChildren(message) {
    document.querySelectorAll('iframe').forEach(function (frame) {
      // No account data or native bridge is passed to providers.
      try { frame.contentWindow.postMessage(message,'*'); } catch (_) {}
    });
  }
  function read() {
    try { var data = JSON.parse(localStorage.getItem('RiveTVProgress')); return data && typeof data === 'object' && !Array.isArray(data) ? data : {}; }
    catch (_) { return {}; }
  }
  function save(state) {
    if (root) updateRoute();
    if (!context || state.session !== context.session || !Number.isFinite(state.time) ||
        !Number.isFinite(state.duration) || state.duration <= 0 || state.time < 0 || state.time > state.duration + 1) return;
    if (!root) { window.parent.postMessage({riveTV:'state',state:state},'*'); return; }
    nextState = Object.assign({},state,{received:Date.now()});
    if (advancing && !state.ended) return;
    if (!state.ended && state.force !== true && Date.now()-lastSaved < 4000) return;
    lastSaved = Date.now();
    if (state.time === 0 && !state.ended) return;
    var data = read();
    var complete = state.ended || (state.duration - state.time < 30 && state.time / state.duration > .98);
    data[context.key] = {time:complete ? 0 : state.time,duration:state.duration,updated:Date.now(),complete:complete};
    Object.keys(data).sort(function (a,b) {return data[b].updated-data[a].updated;}).slice(400).forEach(function (key) {delete data[key];});
    localStorage.setItem('RiveTVProgress',JSON.stringify(data));
    context.resume = complete ? 0 : state.time;
    // Keep the site's Continue Watching and episode badges useful in Embed too.
    try {
      var tracker = JSON.parse(localStorage.getItem('RiveStreamWatchTracker') || '{}');
      var list = Array.isArray(tracker[context.type]) ? tracker[context.type] : [];
      var item = list.find(function (entry) {return String(entry.id) === context.id;});
      if (!item) {item = {id:context.id};list.unshift(item);}
      var progress = item;
      if (context.type === 'tv') {
        if (!Array.isArray(item.data)) item.data = [];
        progress = item.data.find(function (entry) {return String(entry.season) === context.season && String(entry.episode) === context.episode;});
        if (!progress) {progress = {season:context.season,episode:context.episode};item.data.unshift(progress);}
      }
      progress.watchTime = complete ? 0 : state.time;
      progress.watchPercentage = complete ? 100 : state.time/state.duration*100;
      tracker[context.type] = list;tracker.timestamp = Date.now();
      localStorage.setItem('RiveStreamWatchTracker',JSON.stringify(tracker));
      var continuing = JSON.parse(localStorage.getItem('RiveStreamContinueWatching') || '{}');
      var entries = Array.isArray(continuing[context.type]) ? continuing[context.type] : [];
      continuing[context.type] = [context.type === 'tv' ? {id:context.id,season:context.season,episode:context.episode} : context.id].concat(entries.filter(function (entry) {return String(context.type === 'tv' ? entry.id : entry) !== context.id;}));
      localStorage.setItem('RiveStreamContinueWatching',JSON.stringify(continuing));
    } catch (_) {}
  }
  function source(video) {return video.currentSrc || video.src || '';}
  function markStale() {document.querySelectorAll('video').forEach(function (video) {if (videos.get(video) && source(video)) stale.set(video,source(video));});}
  function report(video,force) {
    if (!context || !video || !videos.get(video) || !videos.get(video).restored) return;
    if (videos.get(video).session !== context.session) return;
    save({session:context.session,time:video.currentTime,duration:video.duration,ended:video.ended,paused:video.paused,
      buffering:!video.ended && (video.readyState < 3 || !!video.seeking),force:force === true});
  }
  function setControls(visible) {
    controls = visible;
    document.documentElement.setAttribute('data-rive-cinema',visible ? 'visible' : 'hidden');
    sendChildren({riveTV:'controls',visible:visible});
    clearTimeout(hideTimer);
    if (root && visible) hideTimer = setTimeout(function () {
      if (document.querySelector('[role="dialog"],[aria-expanded="true"]') || nextPanel && !nextPanel.hidden) {setControls(true);return;}
      setControls(false);
      if (window.RiveTV) window.RiveTV.suspend();
    },6000);
  }
  function updateRoute() {
    if (!root) return;
    var next = location.pathname + location.search;
    if (next === route) return;
    // Context is immutable per route, so late events cannot save into the next episode.
    if (context) markStale();
    route = next;context = null;started = false;videos = new WeakMap();clicked = new WeakSet();
    nextState = null;nextCountdown = 0;nextCancelled = false;advancing = false;lastSaved = 0;
    if (nextPanel) nextPanel.hidden = true;
    clearTimeout(hideTimer);
    var params = new URLSearchParams(location.search), type = params.get('type') || 'movie', id = params.get('id');
    if (location.pathname !== '/watch' || !id || !/^(movie|tv)$/.test(type)) {
      document.documentElement.removeAttribute('data-rive-cinema');return;
    }
    var season = params.get('season') || '1', episode = params.get('episode') || '1';
    var key = type + ':' + id + (type === 'tv' ? ':' + season + ':' + episode : '');
    var saved = read()[key];
    context = {key:key,id:id,type:type,season:season,episode:episode,
      session:next + ':' + Math.random(),resume:saved && !saved.complete ? saved.time : 0};
    setControls(false);
  }
  function command(action) {
    if (root) updateRoute();
    if (!context || ['toggle','play','pause','forward','rewind'].indexOf(action) === -1) return false;
    // An explicit transport command takes over from the one-time autostart.
    if (action === 'toggle' || action === 'play' || action === 'pause') started = true;
    document.querySelectorAll('video').forEach(function (v) {
      if (action === 'forward' || action === 'rewind') v.currentTime = Math.max(0,Math.min(v.duration || Infinity,v.currentTime + (action === 'forward' ? 10 : -10)));
      else if (action === 'pause' || (action === 'toggle' && !v.paused)) v.pause();
      else { var p = v.play();if (p && p.catch) p.catch(function () {}); }
      report(v,true);
    });
    sendChildren({riveTV:'command',action:action});return true;
  }
  window.addEventListener('message',function (event) {
    var msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    if (!root && event.source === window.parent) {
      if (msg.riveTV === 'context' && msg.context) {
        if (!context || context.session !== msg.context.session) {
          if (context) markStale();
          context = msg.context;videos = new WeakMap();clicked = new WeakSet();started = false;setControls(msg.visible);
        }
        sendChildren(msg);
      }
      if (msg.riveTV === 'controls') setControls(msg.visible);
      if (msg.riveTV === 'command') command(msg.action);
    } else if (msg.riveTV === 'state' && child(event.source)) save(msg.state || {});
  });
  function tick() {
    if (!document.body) return;
    loadPreferences();
    updateRoute();
    playbackSettings();
    if (!context || !document.body) return;
    if (!style.isConnected) (document.head || document.documentElement).appendChild(style);
    sendChildren({riveTV:'context',context:context,visible:controls});
    document.querySelectorAll('video').forEach(function (video) {
      if (stale.has(video)) {if (stale.get(video) === source(video)) return;stale.delete(video);}
      var state = videos.get(video);
      if (!state) {
        state = {restored:false,attempts:0,session:context.session};videos.set(video,state);
        ['pause','ended','seeked'].forEach(function (name) {video.addEventListener(name,function () {report(video,true);});});
        video.addEventListener('playing',function () {started = true;});
      }
      if (!state.restored && video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
        try {
          if (context.resume > 0 && context.resume < video.duration - 5) video.currentTime = context.resume;
          state.restored = true;
        } catch (_) {}
      }
      // Start once; a deliberate pause must remain paused.
      if (!started && video.paused && video.readyState >= 2 && state.attempts < 3) {
        state.attempts++;
        var promise = video.play();if (promise && promise.catch) promise.catch(function () {});
      }
      if (!video.paused && video.currentTime > 0) started = true;
      report(video);
    });
    updateNext();
    if (!started) {
      // Known provider gates only; never click arbitrary page buttons or ads.
      var button = document.querySelector('.spla,.server-menu-item,button[aria-label="Play"],.vjs-big-play-button,.jw-display-icon-container');
      if (button && !clicked.has(button) && button.getBoundingClientRect().width > 0) {clicked.add(button);button.click();}
    }
  }
  window.RiveTVPlayback = {
    next:advanceEpisode,
    isWatch:function () {updateRoute();return root && !!context;},
    hidden:function () {return this.isWatch() && !controls;},
    reveal:function () {if (!this.hidden()) return false;setControls(true);return true;},
    touch:function () {if (context && controls) setControls(true);},
    command:command,
    session:function () {if (root) updateRoute();return context ? context.session : null;},
    info:function () {
      if (!root) return null;
      updateRoute();
      if (!context) return null;
      return {type:context.type,id:context.id,season:context.season,episode:context.episode,next:nextView,
        hasNext:context.type === 'tv' && !advancing && !!nextEpisodeAction(),subtitles:nextPreferences.subtitles,audioLanguage:nextPreferences.audioLanguage};
    },
    cancelNext:function () {nextCancelled = true;nextCountdown = 0;updateNext();},
    subtitles:function (value) {
      if (value !== null && (typeof value !== 'string' || value.length > 80)) return;
      loadPreferences();nextPreferences.subtitles = value;persistPreferences();
    },
    subtitleKey:function () {if (!root) return '';loadPreferences();return nextPreferences.subtitleKey;},
    audioLanguage:function () {loadPreferences();return nextPreferences.audioLanguage;},
    setAudioLanguage:function (value) {if (AUDIO_LANGUAGES.indexOf(value) === -1) return;loadPreferences();nextPreferences.audioLanguage = value;persistPreferences();},
    conceal:function () {if (!controls) return false;setControls(false);return true;},
    state:function () {return nextState;},
    flush:function () {document.querySelectorAll('video').forEach(report);sendChildren({riveTV:'command',action:'pause'});}
  };
  // Own the end transition so the site's unconditional auto-next cannot bypass
  // the preference or the cancellation. Capture runs before player listeners.
  document.addEventListener('ended',function (event) {
    if (context && context.type === 'tv' && event.target.tagName === 'VIDEO' && videos.has(event.target)) {
      report(event.target);event.stopImmediatePropagation();
    }
  },true);
  window.addEventListener('pagehide',function () {document.querySelectorAll('video').forEach(report);});
  document.addEventListener('visibilitychange',function () {if (document.hidden) document.querySelectorAll('video').forEach(report);});
  tick();setInterval(tick,1000);
})();
