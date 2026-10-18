(function () {
  'use strict';
  // Restore only absent values, before React reads them. Existing WebView data
  // wins during migration; explicit removals are mirrored too.
  if (!window.RiveTVStorageInstalled) {
    window.RiveTVStorageInstalled = true;
    var keys = ['RiveStreamSettings','RiveStreamWatchlist','RiveStreamFBWatchlist',
      'RiveStreamWatchTracker','RiveStreamContinueWatching','RiveStreamFBContinueWatching','RiveTVProgress','RiveTVPlaybackSettings'];
    var originalSet = Storage.prototype.setItem, originalRemove = Storage.prototype.removeItem, originalClear = Storage.prototype.clear;
    function mirror(key, value) {
      if (keys.indexOf(key) !== -1 && window.RiveTVStorage) {
        try { window.RiveTVStorage.postMessage(JSON.stringify({key:key,value:value})); } catch (_) {}
      }
    }
    try {
      var saved = window.RiveTVSavedData || {};
      keys.forEach(function (key) {
        if (localStorage.getItem(key) === null && typeof saved[key] === 'string') originalSet.call(localStorage,key,saved[key]);
        if (localStorage.getItem(key) !== null) mirror(key,localStorage.getItem(key));
      });
    } catch (_) {}
    Storage.prototype.setItem = function (key,value) {
      originalSet.call(this,key,value);
      if (this === localStorage) mirror(String(key),String(value));
    };
    Storage.prototype.removeItem = function (key) {
      originalRemove.call(this,key);
      if (this === localStorage) mirror(String(key),null);
    };
    Storage.prototype.clear = function () {
      originalClear.call(this);
      if (this === localStorage) keys.forEach(function (key) { mirror(key,null); });
    };
  }
  // The site's progress tracker dereferences settings on first playback, even
  // before the Settings screen has ever saved them. Keep valid user data intact.
  try {
    var raw = localStorage.getItem('RiveStreamSettings');
    var settings;
    try { settings = JSON.parse(raw); } catch (_) {}
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      if (raw) localStorage.setItem('RiveTVSettingsBackup', raw);
      localStorage.setItem('RiveStreamSettings', '{}');
    }
  } catch (_) {}
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (window.RiveTVBootstrapped) return;
  window.RiveTVBootstrapped = true;
  var setInterval = window.setInterval;
  window.setInterval = function (handler, delay) {
    if (delay === 15e3 && typeof handler === 'function' && /^\(\)=>\{\w+\(\)\}$/.test(String(handler))) return 0;
    return setInterval.apply(this, arguments);
  };
  var sizes = {original:'w1280', w92:'w342', w154:'w342', w185:'w342'};
  function tvImage(url) {
    return typeof url === 'string' ? url.replace(/^(https:\/\/image\.tmdb\.org\/t\/p\/)(original|w92|w154|w185)\//, function (all, base, size) {
      return base + sizes[size] + '/';
    }) : url;
  }
  var src = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', {configurable:true, enumerable:src.enumerable, get:src.get,
    set:function (value) { src.set.call(this, tvImage(value)); }});
  var setAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (name, value) {
    return setAttribute.call(this, name, this instanceof HTMLImageElement && name === 'src' ? tvImage(value) : value);
  };
})();
