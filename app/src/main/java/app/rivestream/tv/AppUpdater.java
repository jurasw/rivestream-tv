package app.rivestream.tv;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Downloads only this app's signed GitHub releases; no credentials or WebView bridge. */
final class AppUpdater {
    static final String REPO="jurasw/rivestream-tv";
    static final String LATEST_URL="https://api.github.com/repos/"+REPO+"/releases/latest";
    static final String APK_NAME="Rivestream-TV.apk";
    static final String STATUS_ACTION="app.rivestream.tv.UPDATE_INSTALL_STATUS";
    static final String PREFS="app_updates";
    static final int MAX_APK=64*1024*1024;
    private static final long CHECK_INTERVAL=6*60*60*1000L;
    interface Host {
        boolean canInstallUpdate();
        void updateMessage(String message,boolean explicit);
        void updateReady(String version,Runnable install,Runnable later);
        void updatePermission(Runnable settings,Runnable later);
    }
    static final class Release {
        final int code;final String version,url,sha,notes;final long size;
        Release(JSONObject json) throws Exception {
            long number=json.getLong("versionCode");
            if(number<1 || number>Integer.MAX_VALUE)throw new IOException("Invalid version");
            code=(int)number;version=json.getString("versionName");url=json.getString("apkUrl");sha=json.getString("sha256");size=json.getLong("sizeBytes");notes=json.optString("notes","");
            if(!version.matches("[0-9]+\\.[0-9]+\\.[0-9]+") || code!=versionCode(version) || !sha.matches("[a-f0-9]{64}") || size<1 || size>MAX_APK)throw new IOException("Invalid release manifest");
            Uri uri=Uri.parse(url);
            if(!"https".equals(uri.getScheme()) || !"github.com".equals(uri.getHost()) || uri.getUserInfo()!=null || uri.getPort()!=-1 || uri.getQuery()!=null || uri.getFragment()!=null || !uri.getPath().equals("/"+REPO+"/releases/download/v"+version+"/"+APK_NAME))throw new IOException("Untrusted APK URL");
        }
    }
    static long versionCode(String version){
        String[] parts=version.split("\\.");
        int major=Integer.parseInt(parts[0]),minor=Integer.parseInt(parts[1]),patch=Integer.parseInt(parts[2]);
        if(minor>99 || patch>99)throw new IllegalArgumentException("Version part above 99");
        return major*10000L+minor*100L+patch;
    }
    static String manifest(String latest) throws Exception{
        JSONObject release=new JSONObject(latest);
        String tag=release.getString("tag_name");
        if(release.optBoolean("draft") || release.optBoolean("prerelease") || !tag.matches("v[0-9]+\\.[0-9]+\\.[0-9]+"))return null;
        String version=tag.substring(1);
        org.json.JSONArray assets=release.getJSONArray("assets");
        for(int i=0;i<assets.length();i++){
            JSONObject asset=assets.getJSONObject(i);
            if(!APK_NAME.equals(asset.optString("name")))continue;
            String digest=asset.optString("digest");
            if(!digest.startsWith("sha256:"))throw new IOException("Missing APK digest");
            return new JSONObject().put("versionCode",versionCode(version)).put("versionName",version)
                .put("apkUrl","https://github.com/"+REPO+"/releases/download/"+tag+"/"+APK_NAME)
                .put("sha256",digest.substring(7)).put("sizeBytes",asset.getLong("size")).put("notes",release.optString("body","")).toString();
        }
        return null;
    }
    private final Context context;
    private final Host host;
    private final SharedPreferences prefs;
    private final Handler main=new Handler(Looper.getMainLooper());
    private final ExecutorService worker=Executors.newSingleThreadExecutor();
    private volatile boolean busy,destroyed,manual;
    private boolean foreground,installing,permissionPrompted;
    private Release ready;
    private String status="Installed version "+BuildConfig.VERSION_NAME;
    AppUpdater(Context context,Host host){this.context=context.getApplicationContext();this.host=host;prefs=this.context.getSharedPreferences(PREFS,Context.MODE_PRIVATE);}
    private final Runnable periodicCheck=new Runnable(){@Override public void run(){if(!destroyed&&foreground){check(false);tryInstall(false);main.postDelayed(this,CHECK_INTERVAL);}}};
    void onResume(){foreground=true;main.removeCallbacks(periodicCheck);main.postDelayed(periodicCheck,5000);}
    void onPause(){foreground=false;main.removeCallbacks(periodicCheck);main.removeCallbacks(waitForIdle);}
    void close(){destroyed=true;main.removeCallbacksAndMessages(null);worker.shutdownNow();}
    String status(){return status;}
    void check(boolean explicit){
        if(destroyed)return;
        if(explicit){manual=true;prefs.edit().remove("deferred_version").apply();permissionPrompted=false;}
        if(busy || installing){if(explicit)host.updateMessage(status,true);return;}
        if(ready!=null && !explicit && System.currentTimeMillis()-prefs.getLong("last_check",0)<CHECK_INTERVAL){tryInstall(false);return;}
        if(!explicit && System.currentTimeMillis()-prefs.getLong("last_check",0)<CHECK_INTERVAL && !prefs.contains("ready_json"))return;
        busy=true;status="Checking for updates…";
        worker.execute(()->{
            try{
                Release release=null;
                String cached=prefs.getString("ready_json",null);
                if(cached!=null){try{Release candidate=new Release(new JSONObject(cached));if(candidate.code>installedCode() && readyFile().exists()){verifyApk(context,readyFile(),candidate);release=candidate;}else {readyFile().delete();prefs.edit().remove("ready_json").apply();}}catch(Exception ignored){readyFile().delete();prefs.edit().remove("ready_json").apply();}}
                boolean recent=System.currentTimeMillis()-prefs.getLong("last_check",0)<CHECK_INTERVAL;
                String json=release!=null && !explicit && recent ? cached : fetchManifest();
                if(json==null){finishCheck("No update has been published yet.");return;}
                Release candidate=new Release(new JSONObject(json));
                if(candidate.code<=installedCode()){
                    readyFile().delete();prefs.edit().remove("ready_json").putLong("last_check",System.currentTimeMillis()).apply();
                    post(()->ready=null);finishCheck("You have the latest version "+BuildConfig.VERSION_NAME+".");return;
                }
                if(release==null || release.code!=candidate.code || !release.sha.equals(candidate.sha)){
                    post(()->{status="Downloading update "+candidate.version+"…";host.updateMessage(status,false);});
                    File part=new File(directory(),"download.apk");
                    try{download(candidate,part);verifyApk(context,part,candidate);Files.move(part.toPath(),readyFile().toPath(),StandardCopyOption.REPLACE_EXISTING);}catch(Exception failure){part.delete();throw failure;}
                }else verifyApk(context,readyFile(),candidate);
                prefs.edit().putString("ready_json",json).putLong("last_check",System.currentTimeMillis()).apply();release=candidate;
                final Release update=release;
                Log.i("RiveUpdate","Verified release "+update.version+" ("+update.code+")");
                post(()->{busy=false;ready=update;status="Update "+update.version+" gotowa.";if(manual){manual=false;showReady();}else {host.updateMessage(status,false);tryInstall(false);}});
            }catch(Exception failure){Log.w("RiveUpdate","Update check/download failed",failure);finishCheck("Could not check or download the update. Try again from the menu.");}
        });
    }
    private void finishCheck(String message){post(()->{busy=false;status=message;boolean explicit=manual;manual=false;if(explicit)host.updateMessage(message,true);});}
    private void post(Runnable action){main.post(()->{if(!destroyed)action.run();});}
    private long installedCode() throws Exception{return context.getPackageManager().getPackageInfo(context.getPackageName(),0).getLongVersionCode();}
    private File directory() throws IOException{File dir=new File(context.getFilesDir(),"updates");if(!dir.isDirectory()&&!dir.mkdirs())throw new IOException("Cannot create update directory");return dir;}
    private File readyFile() throws IOException{return new File(directory(),"ready.apk");}
    private void showReady(){if(ready==null)return;host.updateReady(ready.version,()->tryInstall(true),this::defer);}
    private void defer(){if(ready!=null)prefs.edit().putInt("deferred_version",ready.code).apply();}
    private final Runnable waitForIdle=()->tryInstall(false);
    private void tryInstall(boolean explicit){
        main.removeCallbacks(waitForIdle);
        if(destroyed || ready==null || installing || !foreground)return;
        if(!explicit && prefs.getInt("deferred_version",0)==ready.code)return;
        if(!explicit && !host.canInstallUpdate()){main.postDelayed(waitForIdle,2000);return;}
        if(!context.getPackageManager().canRequestPackageInstalls()){
            if(!permissionPrompted || explicit){permissionPrompted=true;host.updatePermission(()->openPermissionSettings(),this::defer);}return;
        }
        int previousSession=prefs.getInt("session_id",-1);
        if(previousSession>=0){
            PackageInstaller installer=context.getPackageManager().getPackageInstaller();
            if(installer.getSessionInfo(previousSession)!=null){
                if(!explicit && System.currentTimeMillis()-prefs.getLong("session_started",0)<5*60*1000L){main.postDelayed(waitForIdle,5000);return;}
                try{installer.abandonSession(previousSession);}catch(Exception ignored){}
            }
            prefs.edit().remove("session_id").remove("session_started").apply();
        }
        installing=true;status="Installing update "+ready.version+"…";host.updateMessage(status,false);
        Release release=ready;
        worker.execute(()->{try{verifyApk(context,readyFile(),release);commit(context,readyFile(),release);}catch(Exception failure){Log.w("RiveUpdate","Install failed",failure);post(()->{installing=false;defer();host.updateMessage("Could not start the installation. Try again from Updates in the menu.",true);});}});
    }
    private void openPermissionSettings(){
        Intent intent=new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+context.getPackageName())).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try{context.startActivity(intent);}catch(android.content.ActivityNotFoundException missing){try{context.startActivity(new Intent(Settings.ACTION_SECURITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));}catch(android.content.ActivityNotFoundException ignored){host.updateMessage("Open the TV settings and allow Rivestream TV to install apps.",true);}}
    }
    private String fetchManifest() throws Exception {
        HttpURLConnection connection=open(LATEST_URL,"application/vnd.github+json");
        try{
            if(connection.getResponseCode()==404)return null;
            if(connection.getResponseCode()!=200)throw new IOException("GitHub HTTP "+connection.getResponseCode());
            ByteArrayOutputStream output=new ByteArrayOutputStream();
            try(InputStream input=connection.getInputStream()){byte[] buffer=new byte[4096];int n;while((n=input.read(buffer))!=-1){if(output.size()+n>262144)throw new IOException("Release metadata too large");output.write(buffer,0,n);}}
            return manifest(new String(output.toByteArray(),StandardCharsets.UTF_8));
        }finally{connection.disconnect();}
    }
    private static void download(Release release,File destination) throws Exception{
        HttpURLConnection connection=open(release.url,"application/octet-stream");
        try{
            if(connection.getResponseCode()!=200)throw new IOException("APK HTTP "+connection.getResponseCode());
            long length=connection.getContentLengthLong();if(length>=0&&length!=release.size)throw new IOException("Unexpected APK length");
            try(InputStream input=connection.getInputStream();FileOutputStream output=new FileOutputStream(destination)){
                byte[] buffer=new byte[65536];long total=0;int n;
                while((n=input.read(buffer))!=-1){if(Thread.currentThread().isInterrupted())throw new IOException("Interrupted");total+=n;if(total>release.size)throw new IOException("APK too large");output.write(buffer,0,n);}
                if(total!=release.size)throw new IOException("Incomplete APK");output.getFD().sync();
            }
        }finally{connection.disconnect();}
    }
    static HttpURLConnection open(String address,String accept) throws Exception{
        URL url=new URL(address);
        for(int redirect=0;redirect<6;redirect++){
            String host=url.getHost();
            if(!"https".equals(url.getProtocol()) || url.getUserInfo()!=null || (url.getPort()!=-1&&url.getPort()!=443) || !(host.equals("github.com")||host.equals("api.github.com")||host.equals("release-assets.githubusercontent.com")||host.equals("objects.githubusercontent.com")))throw new IOException("Untrusted download host");
            HttpURLConnection connection=(HttpURLConnection)url.openConnection();connection.setConnectTimeout(15000);connection.setReadTimeout(30000);connection.setInstanceFollowRedirects(false);connection.setUseCaches(false);connection.setRequestProperty("User-Agent","Rivestream-TV/"+BuildConfig.VERSION_NAME);connection.setRequestProperty("Accept",accept);
            int code=connection.getResponseCode();
            if(code==301||code==302||code==303||code==307||code==308){String location=connection.getHeaderField("Location");connection.disconnect();if(location==null)throw new IOException("Missing redirect");url=new URL(url,location);continue;}
            return connection;
        }
        throw new IOException("Too many redirects");
    }
    static String sha256(File file) throws Exception{
        MessageDigest digest=MessageDigest.getInstance("SHA-256");try(InputStream input=new FileInputStream(file)){byte[] buffer=new byte[65536];int n;while((n=input.read(buffer))!=-1)digest.update(buffer,0,n);}StringBuilder hex=new StringBuilder();for(byte value:digest.digest())hex.append(String.format(java.util.Locale.ROOT,"%02x",value&255));return hex.toString();
    }
    static void verifyApk(Context context,File file,Release release) throws Exception{
        if(file.length()!=release.size || !MessageDigest.isEqual(sha256(file).getBytes(StandardCharsets.US_ASCII),release.sha.getBytes(StandardCharsets.US_ASCII)))throw new IOException("APK checksum mismatch");
        PackageManager manager=context.getPackageManager();// Android 13's archive parser only collects certificates when GET_SIGNATURES
        // is included, even though callers consume the modern SigningInfo result.
        PackageInfo candidate=manager.getPackageArchiveInfo(file.getAbsolutePath(),PackageManager.GET_SIGNING_CERTIFICATES|PackageManager.GET_SIGNATURES),installed=manager.getPackageInfo(context.getPackageName(),PackageManager.GET_SIGNING_CERTIFICATES);
        if(candidate==null || !context.getPackageName().equals(candidate.packageName) || candidate.getLongVersionCode()!=release.code || candidate.getLongVersionCode()<=installed.getLongVersionCode() || !release.version.equals(candidate.versionName))throw new IOException("APK identity/version mismatch");
        if(candidate.signingInfo==null || installed.signingInfo==null)throw new IOException("Missing APK signing information: archive="+(candidate.signingInfo!=null)+", installed="+(installed.signingInfo!=null));
        HashSet<Signature> expected=new HashSet<>(Arrays.asList(installed.signingInfo.getApkContentsSigners())),actual=new HashSet<>(Arrays.asList(candidate.signingInfo.getApkContentsSigners()));
        if(expected.isEmpty()||!expected.equals(actual))throw new IOException("APK signer mismatch");
    }
    static void commit(Context context,File apk,Release release) throws Exception{
        PackageInstaller installer=context.getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams params=new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);params.setAppPackageName(context.getPackageName());params.setSize(apk.length());
        if(Build.VERSION.SDK_INT>=31)params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
        int id=installer.createSession(params);boolean committed=false;
        try(PackageInstaller.Session session=installer.openSession(id)){
            try(InputStream input=new FileInputStream(apk);OutputStream output=session.openWrite("base.apk",0,apk.length())){byte[] buffer=new byte[65536];int n;while((n=input.read(buffer))!=-1)output.write(buffer,0,n);session.fsync(output);}
            Intent status=new Intent(context,UpdateResultReceiver.class).setAction(STATUS_ACTION).putExtra("target_version",release.code).putExtra("target_session",id).addFlags(Intent.FLAG_RECEIVER_FOREGROUND);
            int flags=PendingIntent.FLAG_UPDATE_CURRENT;if(Build.VERSION.SDK_INT>=31)flags|=PendingIntent.FLAG_MUTABLE;
            PendingIntent result=PendingIntent.getBroadcast(context,id,status,flags);
            context.getSharedPreferences(PREFS,Context.MODE_PRIVATE).edit().putInt("session_id",id).putInt("session_target",release.code).putLong("session_started",System.currentTimeMillis()).apply();session.commit(result.getIntentSender());committed=true;
        }finally{if(!committed)installer.abandonSession(id);}
    }
}
