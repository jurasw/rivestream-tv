package app.rivestream.tv;

import android.app.Activity;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import android.app.Instrumentation;
import android.content.Intent;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.webkit.WebView;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** On-device regressions using a local fixture, not the availability of a provider. */
public final class InputRegressionTest extends Instrumentation {
    private MainActivity activity;
    private WebView web;
    private boolean liveNavigation,updaterTests;
    private final StringBuilder results=new StringBuilder();
    @Override public void onCreate(Bundle args){super.onCreate(args);liveNavigation=args!=null && "true".equals(args.getString("liveNavigation"));updaterTests=args!=null && "true".equals(args.getString("updaterTests"));start();}
    private Object field(String name) throws Exception {Field f=MainActivity.class.getDeclaredField(name);f.setAccessible(true);return f.get(activity);}
    private void invoke(String name,Class<?>[] types,Object... args) throws Exception {Method m=MainActivity.class.getDeclaredMethod(name,types);m.setAccessible(true);m.invoke(activity,args);}
    private String js(String script) throws Exception {
        AtomicReference<String> value=new AtomicReference<>();CountDownLatch done=new CountDownLatch(1);
        runOnMainSync(()->web.evaluateJavascript(script,result->{value.set(result);done.countDown();}));
        if(!done.await(20,TimeUnit.SECONDS))throw new AssertionError("JS timeout: "+script);
        return value.get();
    }
    private void check(String name,boolean condition){if(!condition)throw new AssertionError(name);android.util.Log.i("RiveInputTest","PASS "+name);results.append("PASS ").append(name).append('\n');}
    private void waitJs(String condition) throws Exception {long end=SystemClock.uptimeMillis()+20000;do{if("true".equals(js(condition)))return;Thread.sleep(60);}while(SystemClock.uptimeMillis()<end);throw new AssertionError("Timed out: "+condition);}
    private void load(String path,String body) throws Exception {
        String html="<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{margin:0;padding:24px}a{display:block;width:180px;height:40px}input,button{display:block;width:240px;height:48px;margin:12px}</style></head><body>"+body+"</body></html>";
        runOnMainSync(()->{web.stopLoading();web.loadDataWithBaseURL("https://www.rivestream.app"+path,html,"text/html","UTF-8","https://www.rivestream.app"+path);web.requestFocus();});
        long committedDeadline=SystemClock.uptimeMillis()+12000;
        do{AtomicReference<Integer> progress=new AtomicReference<>();runOnMainSync(()->progress.set(web.getProgress()));if(progress.get()==100)break;Thread.sleep(60);}while(SystemClock.uptimeMillis()<committedDeadline);
        Thread.sleep(150);
        waitJs("!!window.RiveTV && RiveTV.pageState()==='ready'");
        long end=SystemClock.uptimeMillis()+8000;
        while(SystemClock.uptimeMillis()<end){AtomicReference<Boolean> visible=new AtomicReference<>();runOnMainSync(()->{try{visible.set(((View)field("loading")).getVisibility()==View.VISIBLE);}catch(Exception e){throw new RuntimeException(e);}});if(!visible.get())return;Thread.sleep(60);}
        throw new AssertionError("Native loader did not finish");
    }
    private boolean systemKeyboardShown(){
        for(AccessibilityWindowInfo window:getUiAutomation().getWindows())if(window.getType()==AccessibilityWindowInfo.TYPE_INPUT_METHOD)return true;
        return false;
    }
    private void key(int action,int code,long start,int repeat){sendKeySync(new KeyEvent(start,SystemClock.uptimeMillis(),action,code,repeat));}
    private void liveEpisodes() throws Exception {
        runOnMainSync(()->web.loadUrl("https://www.rivestream.app/detail?type=tv&id=12971"));
        waitJs("!!window.RiveTV && !!document.querySelector('a[href*=\"id=12971\"]')");
        waitJs("!!document.querySelector('[role=tab]')");
        js("Array.from(document.querySelectorAll('[role=tab]')).find(e=>e.textContent.trim()==='Episodes').click()");
        waitJs("document.querySelectorAll('[class*=EpisodeList__] [class*=episode__]').length===39");
        Thread.sleep(400);
        js("RiveTV.resume();document.documentElement.setAttribute('data-rive-repeat','true');let a=document.querySelector('a[class*=links__][href$=\"episode=38\"]');a.focus();a.scrollIntoView({block:'center',behavior:'auto'});RiveTV.stopMove()");
        Thread.sleep(300);
        for(int direction:new int[]{KeyEvent.KEYCODE_DPAD_UP,KeyEvent.KEYCODE_DPAD_DOWN}){
            int initialEpisode=Integer.parseInt(js("new URL(document.querySelector('[data-rive-focus]').href).searchParams.get('episode')").replace("\"",""));
            long down=SystemClock.uptimeMillis();key(KeyEvent.ACTION_DOWN,direction,down,0);
            js("(()=>{window.riveTestFrames=null;let rows=[],start=performance.now();function tick(t){let e=document.querySelector('[data-rive-focus]');rows.push({time:t-start,y:scrollY,episode:e?.getAttribute('href')?.match(/episode=(\\d+)/)?.[1]});if(t-start<1800)requestAnimationFrame(tick);else window.riveTestFrames=rows}requestAnimationFrame(tick);return true})()");
            waitJs("!!window.riveTestFrames");String frames=js("JSON.stringify(window.riveTestFrames)");
            key(KeyEvent.ACTION_UP,direction,down,0);Thread.sleep(350);
            String focused=js("document.querySelector('[data-rive-focus]').getAttribute('href')"),stopped=js("scrollY");Thread.sleep(300);
            check("real DBZ list stops after held "+direction,focused.equals(js("document.querySelector('[data-rive-focus]').getAttribute('href')")) && stopped.equals(js("scrollY")));
            org.json.JSONArray values=new org.json.JSONArray(new org.json.JSONTokener(frames).nextValue().toString());
            int previous=initialEpisode,changes=0;boolean ordered=true,intermediate=false,bounded=true;double lastY=values.getJSONObject(0).getDouble("y");
            for(int i=0;i<values.length();i++){
                org.json.JSONObject row=values.getJSONObject(i);int episode=row.optInt("episode",previous);
                if(episode!=previous){ordered&=Math.abs(episode-previous)==1 && (direction==KeyEvent.KEYCODE_DPAD_UP?episode<previous:episode>previous);previous=episode;changes++;}
                double y=row.getDouble("y");if(row.getDouble("time")>500 && Math.abs(y-lastY)>100)bounded=false;if(Math.abs(y-lastY)>0.1 && Math.abs(y-lastY)<100)intermediate=true;lastY=y;
            }
            check("real DBZ list keeps episode order while held "+direction,ordered && changes>=4);
            check("real DBZ scroll paints intermediate frames while held "+direction,intermediate);
            check("real DBZ scroll limits frame jumps while held "+direction,bounded);
            results.append("FRAMES ").append(frames).append('\n');
            // Down starts from the position reached by Up.
        }
    }
    @Override public void onStart(){
        Bundle result=new Bundle();int outcome=Activity.RESULT_CANCELED;
        try{
            AccessibilityServiceInfo service=getUiAutomation().getServiceInfo();service.flags|=AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS;getUiAutomation().setServiceInfo(service);
            Intent intent=new Intent(Intent.ACTION_MAIN).setClassName(getTargetContext(),MainActivity.class.getName()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity=(MainActivity)startActivitySync(intent);web=(WebView)field("web");
            if(updaterTests){UpdateRegressionTests checks=new UpdateRegressionTests(this);String report=checks.run();result.putString("stream","\n"+report);result.putInt("passed",checks.passed());MainActivity finishedActivity=activity;runOnMainSync(()->finishedActivity.finish());activity=null;finish(Activity.RESULT_OK,result);return;}
            if(liveNavigation){liveEpisodes();result.putString("stream","\n"+results);result.putInt("passed",8);MainActivity finishedActivity=activity;runOnMainSync(()->finishedActivity.finish());activity=null;finish(Activity.RESULT_OK,result);return;}
            StringBuilder body=new StringBuilder("<a href='/watch?type=tv&id=1'>Watch</a><div class='style_EpisodeList__test'>");
            for(int i=0;i<24;i++)body.append("<div class='style_episode__test' style='height:100px'><a id='poster-").append(i).append("' href='/watch?type=tv&id=1&episode=").append(i).append("'>Episode ").append(i).append("</a><a href='/watch?type=tv&id=1'>Watch episode</a></div>");
            body.append("</div>");load("/detail?type=tv&id=1",body.toString());
            js("RiveTV.resume();document.getElementById('poster-0').focus()");
            long down=SystemClock.uptimeMillis();key(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DPAD_DOWN,down,0);
            Thread.sleep(420);String during=js("document.querySelector('[data-rive-focus]').id");
            Thread.sleep(300);String later=js("document.querySelector('[data-rive-focus]').id");
            check("focus advances while Down is held",!during.equals(later)&&!"\"poster-0\"".equals(during));
            key(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_DOWN,down,0);Thread.sleep(180);
            String released=js("document.querySelector('[data-rive-focus]').id");Thread.sleep(350);
            check("release drains no backlog of repeated arrows",released.equals(js("document.querySelector('[data-rive-focus]').id")));
            check("release clears the native held key",((Integer)field("heldArrow"))==0);
            check("release clears repeated scrolling mode","false".equals(js("document.documentElement.hasAttribute('data-rive-repeat')")));
            runOnMainSync(()->{try{invoke("showError",new Class<?>[]{String.class},"Test błędu — odśwież");}catch(Exception e){throw new RuntimeException(e);}});
            AtomicReference<Boolean> compact=new AtomicReference<>();runOnMainSync(()->{try{View bar=(View)field("errorBar");compact.set(bar.getVisibility()==View.VISIBLE&&bar.getLayoutParams().height<activity.getWindow().getDecorView().getHeight()/4&&((View)field("loading")).getVisibility()!=View.VISIBLE);}catch(Exception e){throw new RuntimeException(e);}});
            check("refresh warning stays compact and does not cover the page",compact.get());
            check("refresh warning preserves web focus",web.hasFocus());
            load("/search","<input id='editing' type='search'><button id='result'>Search result</button>");
            js("RiveTV.resume();document.getElementById('editing').focus()");
            runOnMainSync(()->{try{invoke("activate",new Class<?>[0]);}catch(Exception e){throw new RuntimeException(e);}});
            long until=SystemClock.uptimeMillis()+8000;boolean open=false;while(SystemClock.uptimeMillis()<until){AtomicReference<Boolean> state=new AtomicReference<>();runOnMainSync(()->{try{Method m=MainActivity.class.getDeclaredMethod("keyboardOpen");m.setAccessible(true);state.set((Boolean)m.invoke(activity));}catch(Exception e){throw new RuntimeException(e);}});open=state.get();if(open)break;Thread.sleep(80);}
            check("TV keyboard owns input after activation",open);
            long shownDeadline=SystemClock.uptimeMillis()+8000;boolean shown=false;
            do{shown=systemKeyboardShown();if(shown)break;Thread.sleep(100);}while(SystemClock.uptimeMillis()<shownDeadline);
            if(!shown){results.append("WINDOWS ").append(getUiAutomation().getWindows()).append('\n');results.append("EDITOR ").append(js("JSON.stringify({focus:document.activeElement.id,target:RiveTV.target(),viewport:[innerWidth,innerHeight]})")).append('\n');
                {android.graphics.Bitmap shot=getUiAutomation().takeScreenshot();try{if(shot!=null){java.io.File file=new java.io.File(getTargetContext().getExternalFilesDir(null),"input-failure.png");java.io.FileOutputStream output=new java.io.FileOutputStream(file);shot.compress(android.graphics.Bitmap.CompressFormat.PNG,100,output);output.close();}}catch(Exception ignored){}}
            }
            check("system IME window is actually visible",shown);
            key(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DPAD_DOWN,SystemClock.uptimeMillis(),0);key(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_DOWN,SystemClock.uptimeMillis(),0);
            check("keyboard arrows are not queued as page navigation",((Integer)field("heldArrow"))==0);
            runOnMainSync(()->{InputConnection c;try{android.widget.EditText editor=(android.widget.EditText)field("searchEditor");if(editor==null)throw new AssertionError("No native search editor");c=editor.onCreateInputConnection(new EditorInfo());}catch(Exception e){throw new RuntimeException(e);}if(c==null)throw new AssertionError("No input connection");c.commitText("Sintel",1);c.performEditorAction(EditorInfo.IME_ACTION_SEARCH);});
            waitJs("document.activeElement.id==='result'");check("IME Search commits text and leaves the editor","\"Sintel\"".equals(js("document.getElementById('editing').value")));
            long closeDeadline=SystemClock.uptimeMillis()+4000;AtomicReference<Boolean> closed=new AtomicReference<>(false);
            do{runOnMainSync(()->{try{Method m=MainActivity.class.getDeclaredMethod("keyboardOpen");m.setAccessible(true);closed.set(!(Boolean)m.invoke(activity));}catch(Exception e){throw new RuntimeException(e);}});if(closed.get())break;Thread.sleep(60);}while(SystemClock.uptimeMillis()<closeDeadline);
            check("IME Search ends keyboard input ownership",closed.get());
            long hiddenDeadline=SystemClock.uptimeMillis()+4000;while(systemKeyboardShown()&&SystemClock.uptimeMillis()<hiddenDeadline)Thread.sleep(80);
            check("IME Search removes the system IME window",!systemKeyboardShown());
            key(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_CENTER,SystemClock.uptimeMillis(),0);Thread.sleep(500);
            check("IME confirmation key-up cannot reactivate the field","\"result\"".equals(js("document.activeElement.id")));
            js("document.getElementById('editing').focus()");
            runOnMainSync(()->{try{invoke("activate",new Class<?>[0]);}catch(Exception e){throw new RuntimeException(e);}});
            long enterDeadline=SystemClock.uptimeMillis()+8000;while(!systemKeyboardShown()&&SystemClock.uptimeMillis()<enterDeadline)Thread.sleep(80);
            // TV IMEs can send a raw Enter DOWN instead of an action ID.
            runOnMainSync(()->{try{android.widget.EditText editor=(android.widget.EditText)field("searchEditor");editor.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_ENTER));}catch(Exception e){throw new RuntimeException(e);}});
            waitJs("document.activeElement.id==='result'");
            check("raw Enter also finishes native search",field("searchEditor")==null);
            js("document.getElementById('editing').focus()");
            runOnMainSync(()->{try{invoke("activate",new Class<?>[0]);}catch(Exception e){throw new RuntimeException(e);}});
            long editorDeadline=SystemClock.uptimeMillis()+4000;while(field("searchEditor")==null && SystemClock.uptimeMillis()<editorDeadline)Thread.sleep(40);
            if(field("searchEditor")==null)throw new AssertionError("Next test could not open search editor");
            long nextDeadline=SystemClock.uptimeMillis()+8000;while(!systemKeyboardShown()&&SystemClock.uptimeMillis()<nextDeadline)Thread.sleep(80);
            runOnMainSync(()->{try{android.widget.EditText editor=(android.widget.EditText)field("searchEditor");InputConnection connection=editor.onCreateInputConnection(new EditorInfo());connection.performEditorAction(EditorInfo.IME_ACTION_NEXT);}catch(Exception e){throw new RuntimeException(e);}});
            waitJs("document.activeElement.id==='result'");
            long nextHidden=SystemClock.uptimeMillis()+4000;while(systemKeyboardShown()&&SystemClock.uptimeMillis()<nextHidden)Thread.sleep(80);
            check("TV keyboard Next arrow commits and hides the IME",field("searchEditor")==null && !systemKeyboardShown());
            load("/watch?type=movie&id=45745","<button id='source' aria-haspopup='listbox' aria-expanded='false' onclick=\"this.setAttribute('aria-expanded','true');document.getElementById('servers').hidden=false\">Servers</button><div id='servers' role='listbox' hidden><button role='option'>Server 1</button><button role='option'>Server 2</button></div>");
            runOnMainSync(()->{try{invoke("showSourceError",new Class<?>[0]);}catch(Exception e){throw new RuntimeException(e);}});
            check("blocked provider offers Servers instead of reload","Serwery".contentEquals(((android.widget.Button)field("errorRetry")).getText()) && !((Boolean)field("pageFailed")));
            runOnMainSync(()->{try{((android.widget.Button)field("errorRetry")).performClick();}catch(Exception e){throw new RuntimeException(e);}});
            long dialogDeadline=SystemClock.uptimeMillis()+4000;while(field("activeDialog")==null&&SystemClock.uptimeMillis()<dialogDeadline)Thread.sleep(80);
            check("provider warning opens the native server chooser",field("activeDialog")!=null && "true".equals(js("document.documentElement.hasAttribute('data-rive-native-select')")));
            runOnMainSync(()->{try{((android.app.Dialog)field("activeDialog")).dismiss();}catch(Exception e){throw new RuntimeException(e);}});
            js("RiveTV.closeDropdown();localStorage.setItem('RiveStreamWatchMode','direct');localStorage.setItem('RiveStreamEmbedMode','false');document.body.innerHTML='<h2>Application error: a client-side exception</h2>';delete window.RiveTV");
            runOnMainSync(()->{try{invoke("showError",new Class<?>[]{String.class},"Błąd odtwarzacza");}catch(Exception e){throw new RuntimeException(e);}});
            check("Direct and Embed stay available after the entire web UI fails",((View)field("errorPlayback")).getVisibility()==View.VISIBLE && ((View)field("watchQuick")).getVisibility()==View.VISIBLE);
            key(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DPAD_RIGHT,SystemClock.uptimeMillis(),0);key(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_RIGHT,SystemClock.uptimeMillis(),0);
            check("remote can reach recovery controls with no web targets",((View)field("watchQuick")).hasFocus());
            key(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DPAD_CENTER,SystemClock.uptimeMillis(),0);key(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_CENTER,SystemClock.uptimeMillis(),0);
            check("native quick menu opens without the website navigation script",field("activeDialog")!=null);
            runOnMainSync(()->{try{((android.app.Dialog)field("activeDialog")).dismiss();invoke("setPlaybackMode",new Class<?>[]{String.class},"embed");}catch(Exception e){throw new RuntimeException(e);}});
            waitJs("localStorage.getItem('RiveStreamWatchMode')==='embed' && localStorage.getItem('RiveStreamEmbedMode')==='true'");
            check("Embed recovery persists the mode without React","\"embed\"".equals(js("localStorage.getItem('RiveStreamWatchMode')")));
            result.putString("stream","\n"+results);result.putInt("passed",21);outcome=Activity.RESULT_OK;
        }catch(Throwable error){result.putString("stream","\n"+results+"FAIL "+error+"\n");}
        finally{if(activity!=null)runOnMainSync(()->activity.finish());}
        finish(outcome,result);
    }
}
