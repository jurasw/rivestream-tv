package app.rivestream.tv;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/** App-private copy of viewing data; retained by Android package updates. */
final class ViewingStore {
    private static final Set<String> KEYS = new HashSet<>(Arrays.asList(
        "RiveStreamSettings", "RiveStreamWatchlist", "RiveStreamFBWatchlist",
        "RiveStreamWatchTracker", "RiveStreamContinueWatching", "RiveStreamFBContinueWatching",
        "RiveTVProgress", "RiveTVPlaybackSettings"));
    private final SharedPreferences prefs;

    ViewingStore(Context context) { prefs = context.getSharedPreferences("viewing_data", Context.MODE_PRIVATE); }

    void accept(String message) {
        try {
            JSONObject data = new JSONObject(message);
            String key = data.getString("key");
            if (!KEYS.contains(key)) return;
            if (data.isNull("value")) prefs.edit().remove(key).apply();
            else {
                String value = data.getString("value");
                if (value.length() <= 2_000_000) prefs.edit().putString(key, value).apply();
            }
        } catch (Exception ignored) { /* A malformed page message cannot change app state. */ }
    }

    String restoreScript() {
        JSONObject data = new JSONObject();
        for (String key : KEYS) {
            try { if (prefs.contains(key)) data.put(key, prefs.getString(key, null)); }
            catch (Exception ignored) { }
        }
        return "window.RiveTVSavedData=" + data + ";\n";
    }
}
