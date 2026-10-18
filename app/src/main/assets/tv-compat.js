(function () {
  'use strict';
  // Embedded providers use this API on WebViews predating its introduction.
  // This script runs in every origin, without settings access or a native bridge.
  if (typeof Object.groupBy !== 'function') {
    Object.defineProperty(Object, 'groupBy', {
      configurable: true, writable: true,
      value: function groupBy(items, callback) {
        if (items == null || typeof callback !== 'function') throw new TypeError('Invalid groupBy arguments');
        var groups = Object.create(null), index = 0;
        for (var item of items) {
          // Computed properties perform ToPropertyKey once, including symbols.
          var holder = { [callback(item, index++)]: true };
          var key = Reflect.ownKeys(holder)[0];
          if (!Object.prototype.hasOwnProperty.call(groups, key)) groups[key] = [];
          groups[key].push(item);
        }
        return groups;
      }
    });
  }
  // Android WebView can omit Media Session even when Chrome of the same
  // version implements it. The site's Direct player calls it unconditionally.
  // Native TV media keys already handle playback; this fallback only stores
  // metadata and accepts optional OS integration calls without crashing React.
  if (typeof window.MediaMetadata !== 'function') {
    window.MediaMetadata = function MediaMetadata(init) {
      init = init || {};
      this.title = String(init.title || '');
      this.artist = String(init.artist || '');
      this.album = String(init.album || '');
      this.artwork = Array.isArray(init.artwork) ? init.artwork.slice() : [];
    };
  }
  if (!navigator.mediaSession) {
    Object.defineProperty(navigator, 'mediaSession', {configurable:true, value:{
      metadata:null, playbackState:'none',
      setActionHandler:function () {}, setPositionState:function () {}
    }});
  }
})();
