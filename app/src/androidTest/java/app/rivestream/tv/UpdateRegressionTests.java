package app.rivestream.tv;

import android.app.Instrumentation;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import org.json.JSONObject;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/** Verifies real APK signatures and the system confirmation/cancellation path. */
final class UpdateRegressionTests {
    private final Instrumentation test;private final Context context;private final StringBuilder report=new StringBuilder();private int passed;
    UpdateRegressionTests(Instrumentation test){this.test=test;context=test.getTargetContext();}
    private void check(String name,boolean condition){if(!condition)throw new AssertionError(name);passed++;android.util.Log.i("RiveUpdateTest","PASS "+name);report.append("PASS ").append(name).append('\n');}
    private interface Checked {void run() throws Exception;}
    private void rejects(String name,Checked action,String expected) throws Exception {boolean rejected=false;try{action.run();}catch(Exception failure){rejected=expected==null||String.valueOf(failure.getMessage()).contains(expected);}check(name,rejected);}
    private JSONObject manifest(File apk) throws Exception{
        PackageInfo info=context.getPackageManager().getPackageArchiveInfo(apk.getAbsolutePath(),0);
        return new JSONObject().put("versionCode",info.getLongVersionCode()).put("versionName",info.versionName).put("apkUrl","https://github.com/jurasw/rivestream-tv/releases/download/v"+info.versionName+"/Rivestream-TV.apk").put("sha256",AppUpdater.sha256(apk)).put("sizeBytes",apk.length());
    }
    private JSONObject copy(JSONObject value) throws Exception{return new JSONObject(value.toString());}
    String run() throws Exception{
        File good=new File(context.getExternalFilesDir(null),"update-valid-future.apk"),foreign=new File(context.getExternalFilesDir(null),"update-wrong-signer.apk");
        if(!good.isFile()||!foreign.isFile())throw new AssertionError("Missing APK test fixtures");
        JSONObject valid=manifest(good);AppUpdater.Release release=new AppUpdater.Release(valid);
        check("valid GitHub release metadata is accepted",release.code>context.getPackageManager().getPackageInfo(context.getPackageName(),0).getLongVersionCode());
        rejects("HTTP APK URLs are rejected",()->new AppUpdater.Release(copy(valid).put("apkUrl",release.url.replace("https:","http:"))),null);
        rejects("another GitHub repository cannot supply an update",()->new AppUpdater.Release(copy(valid).put("apkUrl",release.url.replace("jurasw/rivestream-tv","someone/other"))),null);
        rejects("raw CDN APK URLs cannot bypass the owned release",()->new AppUpdater.Release(copy(valid).put("apkUrl","https://release-assets.githubusercontent.com/test.apk")),null);
        rejects("credential-bearing APK URLs are rejected",()->new AppUpdater.Release(copy(valid).put("apkUrl",release.url.replace("https://","https://name:secret@"))),null);
        rejects("malformed SHA-256 is rejected",()->new AppUpdater.Release(copy(valid).put("sha256","123")),null);
        rejects("oversized downloads are rejected before connection",()->new AppUpdater.Release(copy(valid).put("sizeBytes",AppUpdater.MAX_APK+1L)),null);
        rejects("invalid release versions are rejected",()->new AppUpdater.Release(copy(valid).put("versionCode",-1)),null);
        File text=new File(context.getCacheDir(),"update-hash-test.apk");try(FileOutputStream output=new FileOutputStream(text)){output.write(new byte[]{97,98,99});}
        check("download hashing matches the standard SHA-256 vector",AppUpdater.sha256(text).equals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));
        AppUpdater.verifyApk(context,good,release);check("a newer APK with the installed signing key is accepted",true);
        rejects("tampered download hashes are rejected",()->AppUpdater.verifyApk(context,good,new AppUpdater.Release(copy(valid).put("sha256",new String(new char[64]).replace('\0','0')))),"checksum");
        rejects("partial download sizes are rejected",()->AppUpdater.verifyApk(context,good,new AppUpdater.Release(copy(valid).put("sizeBytes",good.length()-1))),"checksum");
        String later=release.version.replaceAll("\\d+$","")+(Integer.parseInt(release.version.replaceAll("^.*\\.",""))+1);
        rejects("APK version must match the release manifest",()->AppUpdater.verifyApk(context,good,new AppUpdater.Release(copy(valid).put("versionName",later).put("versionCode",AppUpdater.versionCode(later)).put("apkUrl",release.url.replace("/v"+release.version+"/","/v"+later+"/")))),"version");
        rejects("version codes must follow the version name",()->new AppUpdater.Release(copy(valid).put("versionCode",release.code+1)),null);
        JSONObject latest=new JSONObject().put("tag_name","v"+release.version).put("assets",new org.json.JSONArray().put(new JSONObject().put("name","Rivestream-TV.apk").put("size",release.size).put("digest","sha256:"+release.sha)));
        check("a GitHub release with only the APK yields the verified manifest",new AppUpdater.Release(new JSONObject(AppUpdater.manifest(latest.toString()))).sha.equals(release.sha));
        File current=new File(context.getApplicationInfo().sourceDir);
        rejects("reinstalling the installed version is rejected",()->AppUpdater.verifyApk(context,current,new AppUpdater.Release(manifest(current))),"version");
        rejects("a valid APK signed with a foreign key is rejected",()->AppUpdater.verifyApk(context,foreign,new AppUpdater.Release(manifest(foreign))),"signer");
        rejects("a matching hash cannot turn a non-APK into an update",()->AppUpdater.verifyApk(context,text,new AppUpdater.Release(copy(valid).put("sizeBytes",text.length()).put("sha256",AppUpdater.sha256(text)))),"identity");
        rejects("HTTP redirect targets are rejected before connection",()->AppUpdater.open("http://github.com/test","application/octet-stream"),null);
        rejects("foreign HTTPS hosts are rejected before connection",()->AppUpdater.open("https://example.org/update.apk","application/octet-stream"),null);
        confirmationCanBeCancelled(good,release);
        text.delete();return report.toString();
    }
    int passed(){return passed;}
    private void confirmationCanBeCancelled(File apk,AppUpdater.Release release) throws Exception{
        check("installation permission is available for the isolated TV test",context.getPackageManager().canRequestPackageInstalls());
        PackageInstaller installer=context.getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams params=new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);params.setAppPackageName(context.getPackageName());params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_REQUIRED);
        int id=installer.createSession(params);long oldCode=context.getPackageManager().getPackageInfo(context.getPackageName(),0).getLongVersionCode();
        try{
            try(PackageInstaller.Session session=installer.openSession(id)){
                try(InputStream input=new FileInputStream(apk);OutputStream output=session.openWrite("base.apk",0,apk.length())){byte[] buffer=new byte[65536];int n;while((n=input.read(buffer))!=-1)output.write(buffer,0,n);session.fsync(output);}
                Intent status=new Intent(context,UpdateResultReceiver.class).setAction(AppUpdater.STATUS_ACTION).putExtra("target_version",release.code).putExtra("target_session",id).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                PendingIntent result=PendingIntent.getBroadcast(context,id,status,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_MUTABLE);
                context.getSharedPreferences(AppUpdater.PREFS,0).edit().putInt("session_id",id).putInt("session_target",release.code).apply();
                session.commit(result.getIntentSender());
            }
            long deadline=SystemClock.uptimeMillis()+15000;boolean shown=false;
            while(SystemClock.uptimeMillis()<deadline){AccessibilityNodeInfo root=test.getUiAutomation().getRootInActiveWindow();String pkg=root==null?"":String.valueOf(root.getPackageName());if(pkg.contains("packageinstaller")){shown=true;break;}Thread.sleep(80);}
            check("system-required confirmation opens the Android TV installer",shown);
            test.sendKeyDownUpSync(KeyEvent.KEYCODE_BACK);
            deadline=SystemClock.uptimeMillis()+10000;
            while(context.getSharedPreferences(AppUpdater.PREFS,0).getInt("deferred_version",0)!=release.code&&SystemClock.uptimeMillis()<deadline)Thread.sleep(80);
            check("cancel keeps the installed APK and defers automatic retry",context.getPackageManager().getPackageInfo(context.getPackageName(),0).getLongVersionCode()==oldCode && context.getSharedPreferences(AppUpdater.PREFS,0).getInt("deferred_version",0)==release.code);
        }finally{try{if(installer.getSessionInfo(id)!=null)installer.abandonSession(id);}catch(Exception ignored){}}
    }
}
