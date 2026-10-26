package app.rivestream.tv;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.TextView;

/** Explicit, non-exported target of the platform PackageInstaller result. */
public final class UpdateInstallActivity extends Activity {
    private int targetVersion;
    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        TextView label=new TextView(this);label.setText(R.string.update_installing);label.setTextColor(Color.WHITE);label.setTextSize(16);label.setGravity(Gravity.CENTER);setContentView(label);
        handle(getIntent());
    }
    @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);handle(intent);}
    @SuppressWarnings("deprecation") private void handle(Intent intent){
        if(!AppUpdater.STATUS_ACTION.equals(intent.getAction())){finish();return;}
        targetVersion=intent.getIntExtra("target_version",0);
        int status=intent.getIntExtra(PackageInstaller.EXTRA_STATUS,PackageInstaller.STATUS_FAILURE);
        android.util.Log.i("RiveUpdate","Installer status "+status+" for version "+targetVersion);
        if(status==PackageInstaller.STATUS_PENDING_USER_ACTION){
            Intent confirm=intent.getParcelableExtra(Intent.EXTRA_INTENT);
            if(confirm==null){failure("Could not open the update installer.");return;}
            try{startActivityForResult(confirm,1);}catch(android.content.ActivityNotFoundException error){failure("This TV does not provide an app installer.");}
        }else if(status==PackageInstaller.STATUS_SUCCESS){
            UpdateResultReceiver.complete(this);finish();
        }else failure(status==PackageInstaller.STATUS_FAILURE_ABORTED?"Update postponed. You can return to it from the menu.":"The update was not installed. Try again from Updates in the menu.");
    }
    private void failure(String message){UpdateResultReceiver.markDeferred(this,targetVersion);returnToApp(message);}
    private void returnToApp(String message){startActivity(new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TASK).putExtra("update_message",message));finish();}
    @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==1&&result==RESULT_CANCELED)failure("Update postponed. You can return to it from the menu.");}
}
