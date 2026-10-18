package app.rivestream.tv;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInstaller;
import android.os.Build;
import android.util.Log;
import android.widget.Toast;
import org.json.JSONObject;

/** Receives install results even after Android kills the replaced application. */
public final class UpdateResultReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){
        SharedPreferences prefs=context.getSharedPreferences(AppUpdater.PREFS,Context.MODE_PRIVATE);
        if(Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())){
            boolean ownUpdate=prefs.getInt("session_target",0)==BuildConfig.VERSION_CODE;
            try{ownUpdate|=new JSONObject(prefs.getString("ready_json","{}")).optInt("versionCode")==BuildConfig.VERSION_CODE;}catch(Exception ignored){}
            if(ownUpdate)complete(context);
            return;
        }
        if(!AppUpdater.STATUS_ACTION.equals(intent.getAction()))return;
        int status=intent.getIntExtra(PackageInstaller.EXTRA_STATUS,PackageInstaller.STATUS_FAILURE),target=intent.getIntExtra("target_version",0),session=intent.getIntExtra("target_session",-1);
        Log.i("RiveUpdate","Installer broadcast status "+status+" for version "+target);
        if(status==PackageInstaller.STATUS_SUCCESS){complete(context);return;}
        // A delayed cancellation from an abandoned session must not affect a retry.
        if(session>=0&&prefs.getInt("session_id",-1)!=session)return;
        if(status==PackageInstaller.STATUS_PENDING_USER_ACTION){
            Intent screen=new Intent(context,UpdateInstallActivity.class).setAction(AppUpdater.STATUS_ACTION).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK).putExtras(intent);
            try{context.startActivity(screen);}catch(RuntimeException missing){Log.w("RiveUpdate","Installer confirmation unavailable",missing);defer(context,target,"Otwórz Rivestream TV, aby ponowić aktualizację w menu.");}
        }else defer(context,target,status==PackageInstaller.STATUS_FAILURE_ABORTED?"Aktualizacja odłożona. Możesz wrócić do niej w menu.":"Aktualizacja nie została zainstalowana. Spróbuj ponownie w menu.");
    }
    static void complete(Context context){
        SharedPreferences prefs=context.getSharedPreferences(AppUpdater.PREFS,Context.MODE_PRIVATE);
        boolean first=prefs.getInt("completed_version",0)!=BuildConfig.VERSION_CODE;
        String message="Zaktualizowano Rivestream TV do wersji "+BuildConfig.VERSION_NAME+".";
        SharedPreferences.Editor edit=prefs.edit().remove("ready_json").remove("deferred_version").remove("session_id").remove("session_started").remove("session_target").putInt("completed_version",BuildConfig.VERSION_CODE);
        if(first)edit.putString("completion_message",message);edit.apply();
        new java.io.File(context.getFilesDir(),"updates/ready.apk").delete();
        Log.i("RiveUpdate","Update completed, installed version "+BuildConfig.VERSION_CODE);
        if(!first)return;
        if(Build.VERSION.SDK_INT<29){
            try{context.startActivity(new Intent(context,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TASK));}catch(RuntimeException blocked){Toast.makeText(context,message,Toast.LENGTH_LONG).show();}
        }else Toast.makeText(context,message+" Otwórz aplikację z menu TV.",Toast.LENGTH_LONG).show();
    }
    static void markDeferred(Context context,int target){
        context.getSharedPreferences(AppUpdater.PREFS,Context.MODE_PRIVATE).edit().putInt("deferred_version",target).remove("session_id").remove("session_started").remove("session_target").apply();
    }
    static void defer(Context context,int target,String message){
        markDeferred(context,target);Toast.makeText(context,message,Toast.LENGTH_LONG).show();
    }
}
