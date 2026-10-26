package app.rivestream.tv;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.view.animation.LinearInterpolator;
import android.view.animation.DecelerateInterpolator;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import java.util.Arrays;
import java.util.HashSet;
import android.app.Dialog;
import android.content.res.ColorStateList;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.LayerDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.WindowInsets;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.view.inputmethod.InputConnectionWrapper;
import android.view.inputmethod.InputMethodManager;
import android.webkit.CookieManager;
import android.webkit.JsResult;
import android.webkit.JsPromptResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ImageView;
import android.widget.ScrollView;
import android.widget.TextView;
import android.text.Editable;
import android.text.TextWatcher;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.io.InputStreamReader;
import java.util.ArrayList;

/** A small TV browser dedicated to Rivestream; no scraping or private API dependency. */
public final class MainActivity extends Activity implements AppUpdater.Host {
    private static final String HOME = "https://www.rivestream.app/";
    static final String[] AD_HOSTS={"adsco.re","cdn4ads.com","llvpn.com","luugy.com","rtmark.net","rapidadexchange.com","adexchangerapid.com","usrpubtrck.com","usrpubtrk.com","intellipopup.com","histats.com","predictivdisplay.com","trackzonas.com","rlsredirect.com","misradstore.com","panterlorius.com","cokedpariti.com","unlaxguttus.com","urbanfungose.com","mc.yandex.ru","mc.yandex.com","clarity.ms"};
    static boolean adHost(String host){if(host==null)return false;host=host.toLowerCase(java.util.Locale.ROOT);for(String ad:AD_HOSTS)if(host.equals(ad)||host.endsWith("."+ad))return true;return false;}
    private static final String ASSET_HOST = "rivetv.assets";
    private static final int VOICE_SEARCH = 7;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView web;
    private FrameLayout root, content;
    private LinearLayout loading;
    private SpinnerView progress;
    private Typeface interRegular, interMedium, interBold;
    private TextView status;
    private CursorView cursor;
    private View customView;
    private WebChromeClient.CustomViewCallback customCallback;
    private String navigationScript, bootstrapScript, compatibilityScript;
    private ViewingStore viewingStore;
    private androidx.webkit.ScriptHandler storageBootstrap;
    private int pageGeneration;
    private long loadingStarted;
    private String loadingUrl;
    private boolean documentStartSupported;
    private boolean pointerMode, centerLongPress, pageFailed, backPressedHere, backForKeyboard;
    private Dialog activeDialog;
    private TextView notice, errorText;
    private LinearLayout errorBar;
    private Button errorRetry, watchQuick;
    private LinearLayout errorPlayback;
    private Button errorCursor;
    private boolean sourceError;
    private String captchaKind;
    private float captchaX=.5f,captchaY=.5f;
    private long lastBlockNotice, watchBackAt, leftWatchAt;
    private final HashSet<String> captchaServers=new HashSet<>();
    private int heldArrow, arrowGeneration;
    private boolean arrowInFlight, arrowRepeated, centerPressedHere, keyboardRequested;
    private long suppressCenterUntil;
    private EditText searchEditor;
    private Runnable updateSearch;
    private AppUpdater updater;

    @Override @SuppressLint("SetJavaScriptEnabled")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        immersive();
        interRegular=getResources().getFont(R.font.inter);
        interMedium=Typeface.create(interRegular,500,false);
        interBold=Typeface.create(interRegular,700,false);
        root = new FrameLayout(this);
        root.setBackgroundColor(0xff141414);
        FrameLayout layout = new FrameLayout(this);
        root.addView(layout, new FrameLayout.LayoutParams(-1,-1));
        content = new FrameLayout(this);
        layout.addView(content,new FrameLayout.LayoutParams(-1,-1));
        web=new TvWebView();
        web.setBackgroundColor(0xff141414);
        content.addView(web,new FrameLayout.LayoutParams(-1,-1));
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setDatabaseEnabled(true);
        web.getSettings().setMediaPlaybackRequiresUserGesture(false);
        web.getSettings().setUseWideViewPort(true);
        web.getSettings().setLoadWithOverviewMode(true);
        web.getSettings().setSupportMultipleWindows(true);
        web.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setNeedInitialFocus(false);
        // Keep the installed engine's genuine Chrome version. A fabricated version hides compatibility issues.
        String ua=web.getSettings().getUserAgentString();
        web.getSettings().setUserAgentString(ua.replace("; wv", "").replace("Version/4.0 ", "").replace(" Mobile", ""));
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        viewingStore=new ViewingStore(this);
        if(WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){
            WebViewCompat.addWebMessageListener(web,"RiveTVStorage",new HashSet<>(Arrays.asList("https://www.rivestream.app","https://rivestream.app")),
                (view,message,origin,mainFrame,reply)->{if(mainFrame){viewingStore.accept(message.getData());refreshStorageBootstrap();}});
        }
        bootstrapScript=readAsset("tv-bootstrap.js");
        compatibilityScript=readAsset("tv-compat.js")+"\n"+readAsset("tv-playback.js")+"\n"+readAsset("tv-player.js")+"\n"+readAsset("tv-ads.js");
        if(WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)){
            documentStartSupported=true;
            WebViewCompat.addDocumentStartJavaScript(web,compatibilityScript,new HashSet<>(Arrays.asList("*")));
            refreshStorageBootstrap();
        }
        navigationScript=compatibilityScript+"\n"+bootstrapScript+"\nwindow.RiveTVTheme="+JSONObject.quote(readAsset("tv-theme.css"))+";\n"+readAsset("tv-navigation.js")+"\n"+readAsset("tv-shell.js")+"\n"+readAsset("tv-servers.js");
        web.setOnFocusChangeListener((v,focus)->{if(!focus)stopArrowNavigation();syncWebFocus(focus && !pointerMode);});
        cursor=new CursorView();
        cursor.setVisibility(View.GONE);
        content.addView(cursor,new FrameLayout.LayoutParams(-1,-1));
        loading=new LinearLayout(this);
        loading.setOrientation(LinearLayout.VERTICAL);
        loading.setGravity(Gravity.CENTER);
        GradientDrawable glow=new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,new int[]{0xff2a0f22,0xff120b14,0xff0a0a0a});
        glow.setGradientType(GradientDrawable.RADIAL_GRADIENT);glow.setGradientRadius(dp(420));glow.setGradientCenter(.5f,.42f);
        loading.setBackground(glow);
        FrameLayout loader=new FrameLayout(this);
        progress=new SpinnerView();
        loader.addView(progress,new FrameLayout.LayoutParams(dp(104),dp(104),Gravity.CENTER));
        ImageView loadingMark=new ImageView(this);loadingMark.setImageResource(R.drawable.rive_mark);
        loader.addView(loadingMark,new FrameLayout.LayoutParams(dp(52),dp(52),Gravity.CENTER));
        ObjectAnimator breathe=ObjectAnimator.ofPropertyValuesHolder(loadingMark,android.animation.PropertyValuesHolder.ofFloat(View.SCALE_X,1f,.9f),android.animation.PropertyValuesHolder.ofFloat(View.SCALE_Y,1f,.9f));
        breathe.setDuration(1100);breathe.setRepeatCount(ValueAnimator.INFINITE);breathe.setRepeatMode(ValueAnimator.REVERSE);breathe.setInterpolator(new android.view.animation.AccelerateDecelerateInterpolator());breathe.start();
        loading.addView(loader,new LinearLayout.LayoutParams(dp(104),dp(104)));
        TextView wordmark=label("rive",30,Color.WHITE);wordmark.setTypeface(interBold);wordmark.setLetterSpacing(-.02f);
        wordmark.addOnLayoutChangeListener((v,l,t,r,b,ol,ot,or,ob)->wordmark.getPaint().setShader(new android.graphics.LinearGradient(0,0,r-l,0,new int[]{0xfff69b65,0xffed5c91,0xffef009d},null,android.graphics.Shader.TileMode.CLAMP)));
        LinearLayout.LayoutParams wordmarkParams=new LinearLayout.LayoutParams(-2,-2);wordmarkParams.topMargin=dp(18);
        loading.addView(wordmark,wordmarkParams);
        status=label("Connecting to Rivestream…",12,0xff9a9a9a);
        status.setGravity(Gravity.CENTER);status.setLetterSpacing(.04f);
        status.setPadding(dp(24),dp(6),dp(24),dp(16));
        loading.addView(status);
        Button retry=makeButton("Refresh");
        retry.setOnClickListener(v->web.reload());
        retry.setVisibility(View.GONE);
        loading.addView(retry,new LinearLayout.LayoutParams(dp(140),dp(32)));
        content.addView(loading,new FrameLayout.LayoutParams(-1,-1));
        errorBar=new LinearLayout(this);errorBar.setGravity(Gravity.CENTER_VERTICAL);
        errorBar.setPadding(dp(18),dp(8),dp(10),dp(8));errorBar.setBackground(errorBackground());errorBar.setElevation(dp(8));
        errorText=label("",12,Color.WHITE);errorText.setMaxLines(2);errorText.setEllipsize(android.text.TextUtils.TruncateAt.END);
        errorBar.addView(errorText,new LinearLayout.LayoutParams(0,-2,1));
        errorRetry=makeButton("Refresh");errorRetry.setOnClickListener(v->{web.requestFocus();if(sourceError){sourceError=false;errorCursor.setVisibility(View.GONE);watchQuick.setVisibility(View.GONE);errorBar.setVisibility(View.GONE);web.evaluateJavascript("window.RiveTV && RiveTV.sources()",result->{if("\"dropdown\"".equals(result))showCustomSelect(0);});}else web.reload();});
        LinearLayout.LayoutParams retryParams=new LinearLayout.LayoutParams(dp(105),dp(32));retryParams.leftMargin=dp(8);errorBar.addView(errorRetry,retryParams);
        Button dismissError=makeButton("Close");dismissError.setOnClickListener(v->{errorBar.setVisibility(View.GONE);if(!pageFailed)watchQuick.setVisibility(View.GONE);web.requestFocus();});
        LinearLayout.LayoutParams dismissParams=new LinearLayout.LayoutParams(dp(95),dp(32));dismissParams.leftMargin=dp(8);errorBar.addView(dismissError,dismissParams);
        View.OnKeyListener errorKeys=(v,key,event)->{if(key==KeyEvent.KEYCODE_DPAD_DOWN){if(event.getAction()==KeyEvent.ACTION_DOWN)web.requestFocus();return true;}return false;};
        errorRetry.setOnKeyListener(errorKeys);dismissError.setOnKeyListener(errorKeys);
        errorBar.setVisibility(View.GONE);
        FrameLayout.LayoutParams errorParams=new FrameLayout.LayoutParams(-1,dp(52),Gravity.TOP);errorParams.setMargins(dp(16),dp(10),dp(16),0);
        content.addView(errorBar,errorParams);
        errorPlayback=new LinearLayout(this);errorPlayback.setGravity(Gravity.CENTER_VERTICAL);
        for(String mode:new String[]{"direct","embed"}){
            Button button=makeButton("direct".equals(mode)?"Direct":"Embed");
            button.setOnClickListener(v->setPlaybackMode(mode));button.setOnKeyListener(errorKeys);
            LinearLayout.LayoutParams modeParams=new LinearLayout.LayoutParams(dp(88),dp(32));modeParams.leftMargin=dp(8);errorPlayback.addView(button,modeParams);
        }
        errorBar.addView(errorPlayback,1,new LinearLayout.LayoutParams(-2,-2));errorPlayback.setVisibility(View.GONE);
        errorCursor=makeButton("Cursor");errorCursor.setOnKeyListener(errorKeys);
        errorCursor.setOnClickListener(v->{if(!pointerMode)togglePointer();cursor.x=captchaX*web.getWidth();cursor.y=captchaY*web.getHeight();cursor.invalidate();web.requestFocus();});
        LinearLayout.LayoutParams cursorParams=new LinearLayout.LayoutParams(dp(95),dp(32));cursorParams.leftMargin=dp(8);errorBar.addView(errorCursor,2,cursorParams);errorCursor.setVisibility(View.GONE);
        watchQuick=makeButton("⋮");watchQuick.setBackgroundResource(R.drawable.circle_button);watchQuick.setTextSize(18);watchQuick.setPadding(0,0,0,0);watchQuick.setTextColor(Color.WHITE);watchQuick.setContentDescription("Playback options");watchQuick.setOnClickListener(v->showMenu());
        watchQuick.setOnKeyListener((v,key,event)->{if(key==KeyEvent.KEYCODE_DPAD_LEFT){if(event.getAction()==KeyEvent.ACTION_DOWN)web.requestFocus();return true;}return false;});
        FrameLayout.LayoutParams quickParams=new FrameLayout.LayoutParams(dp(44),dp(44),Gravity.RIGHT|Gravity.BOTTOM);quickParams.rightMargin=dp(12);quickParams.bottomMargin=dp(12);
        watchQuick.setVisibility(View.GONE);content.addView(watchQuick,quickParams);
        notice=label("",12,Color.WHITE);notice.setGravity(Gravity.CENTER);
        notice.setPadding(dp(22),dp(12),dp(22),dp(12));notice.setBackground(panelBackground(0xff262626,3));notice.setElevation(dp(8));notice.setVisibility(View.GONE);
        FrameLayout.LayoutParams noticeParams=new FrameLayout.LayoutParams(-2,-2,Gravity.BOTTOM|Gravity.CENTER_HORIZONTAL);
        noticeParams.bottomMargin=dp(28);root.addView(notice,noticeParams);
        ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient(){
            @Override public WebResourceResponse shouldInterceptRequest(WebResourceRequest request){return assetResponse(request.getUrl());}
        });
        web.setWebViewClient(new WebViewClient(){
            @Override public void onPageCommitVisible(WebView w,String url){
                if(!pageFailed){if(isRive(Uri.parse(url)))injectNavigation(w);else loading.setVisibility(View.GONE);}
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView w,WebResourceRequest request){
                WebResourceResponse asset=assetResponse(request.getUrl());if(asset!=null)return asset;
                return adHost(request.getUrl().getHost())?new WebResourceResponse("text/plain","UTF-8",204,"No Content",null,new java.io.ByteArrayInputStream(new byte[0])):null;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView w,WebResourceRequest request){
                Uri uri=request.getUrl();
                if(!request.isForMainFrame()) return adHost(uri.getHost());
                if(isRive(uri)) return false;
                String current=w.getUrl();
                if(adHost(uri.getHost()) || !"https".equals(uri.getScheme()) || (current!=null && isRive(Uri.parse(current)) && "/watch".equals(Uri.parse(current).getPath()))){blockedNotice("Blocked an ad redirect.");return true;}
                if(request.hasGesture()) {
                    showTvDialog("Link outside Rivestream",uri.getHost(),new String[]{"Cancel","Open"},new Runnable[]{null,()->web.loadUrl(uri.toString())},false);
                }
                return true;
            }
            @Override public void onPageStarted(WebView w,String url,android.graphics.Bitmap icon){
                updateNavigation(url);
                beginLoading(url);
                if(!documentStartSupported && isRive(Uri.parse(url)))w.evaluateJavascript(viewingStore.restoreScript()+compatibilityScript+"\n"+bootstrapScript,null);
            }
            @Override public void onPageFinished(WebView w,String url){
                if(pageFailed) return;
                if(isRive(Uri.parse(url)))injectNavigation(w);else loading.setVisibility(View.GONE);
            }
            @Override public void doUpdateVisitedHistory(WebView w,String url,boolean reload){updateNavigation(url);if(!url.equals(loadingUrl))beginLoading(url);}
            @Override public void onReceivedError(WebView w,WebResourceRequest req,WebResourceError error){
                if(!req.isForMainFrame())return;
                showError("Could not load the page.\nCheck your connection and select Refresh.");
            }
            @Override public void onReceivedHttpError(WebView w,WebResourceRequest req,android.webkit.WebResourceResponse response){
                if(!req.isForMainFrame() && response.getStatusCode()==403 && "primesrc.me".equals(req.getUrl().getHost()) && "/api/v1/l".equals(req.getUrl().getPath()))showSourceError();
                if(req.isForMainFrame() && response.getStatusCode()>=400)showError("The server returned error "+response.getStatusCode()+".\nTry again in a moment.");
            }
            @Override public boolean onRenderProcessGone(WebView w,android.webkit.RenderProcessGoneDetail detail){
                // Activity recreation destroys the failed renderer and restores a usable browser.
                content.removeView(w);w.destroy();web=null;recreate();return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onJsAlert(WebView view,String url,String message,JsResult result){
                showTvDialog("Rivestream",message,new String[]{"Got it"},new Runnable[]{result::confirm},false);
                activeDialog.setOnCancelListener(d->result.cancel());return true;
            }
            @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result){
                showTvDialog("Confirm choice",message,new String[]{"Cancel","Confirm"},new Runnable[]{result::cancel,result::confirm},false);
                activeDialog.setOnCancelListener(d->result.cancel());return true;
            }
            @Override public boolean onJsPrompt(WebView view,String url,String message,String defaultValue,JsPromptResult result){
                EditText input=new EditText(MainActivity.this);input.setSingleLine(true);input.setText(defaultValue);input.setTextColor(Color.WHITE);input.setTextSize(13);input.setTypeface(interRegular);input.setHintTextColor(0xff808080);
                input.setBackground(inputBackground());input.setPadding(dp(11),dp(6),dp(16),dp(6));
                showTvDialog("Enter a response",message,new String[]{"Cancel","Save"},new Runnable[]{result::cancel,()->result.confirm(input.getText().toString())},false,input);
                activeDialog.setOnCancelListener(d->result.cancel());return true;
            }
            @Override public void onShowCustomView(View view,CustomViewCallback callback){
                loading.animate().cancel();loading.setVisibility(View.GONE);
                if(customView!=null){callback.onCustomViewHidden();return;}
                customView=view;customCallback=callback;
                root.addView(view,new FrameLayout.LayoutParams(-1,-1));
                if(pointerMode)root.addView(detachCursor(),new FrameLayout.LayoutParams(-1,-1));
                immersive();
            }
            @Override public void onHideCustomView(){hideFullscreen();}
            @Override public boolean onCreateWindow(WebView view,boolean dialog,boolean gesture,android.os.Message result){blockedNotice("Blocked a pop-up.");return false;}
        });
        setContentView(root);
        web.requestFocus();
        if(state==null || web.restoreState(state)==null)web.loadUrl(HOME);
        updater=new AppUpdater(this,this);
        android.content.SharedPreferences updates=getSharedPreferences(AppUpdater.PREFS,MODE_PRIVATE);
        String updateMessage=getIntent().getStringExtra("update_message");if(updateMessage==null)updateMessage=updates.getString("completion_message",null);
        if(updateMessage!=null){showNotice(updateMessage);updates.edit().remove("completion_message").apply();}
    }

    private void updateNavigation(String url){
        Uri uri=Uri.parse(url);
        if(!isRive(uri))return;
        String path=uri.getPath();
        boolean watch="/watch".equals(path);
        if(watchQuick!=null)watchQuick.setVisibility(watch && pageFailed?View.VISIBLE:View.GONE);
        if(errorPlayback!=null)errorPlayback.setVisibility(watch?View.VISIBLE:View.GONE);
        if(watch)web.requestFocus();
    }
    private Button makeButton(String title){
        Button b=configureButton(new Button(this),title);
        b.setBackgroundResource(R.drawable.action_background);b.setGravity(Gravity.CENTER);b.setTypeface(interMedium);b.setTextSize(12);
        b.setLetterSpacing(.02f);b.setPadding(dp(14),0,dp(14),0);
        b.setTextColor(new ColorStateList(new int[][]{new int[]{android.R.attr.state_focused},new int[]{}},new int[]{Color.BLACK,Color.WHITE}));
        return b;
    }
    private Button configureButton(Button b,String title){
        b.setText(title);b.setAllCaps(false);b.setSingleLine(true);b.setEllipsize(android.text.TextUtils.TruncateAt.END);b.setTextSize(12);
        b.setContentDescription(title);
        b.setTypeface(interRegular);b.setStateListAnimator(null);
        b.setGravity(Gravity.CENTER_VERTICAL|Gravity.START);b.setMinHeight(0);b.setMinimumHeight(0);
        b.setBackgroundResource(R.drawable.nav_background);
        b.setCompoundDrawableTintList(null);
        b.setPadding(dp(18),0,dp(12),0);
        b.setTextColor(new ColorStateList(new int[][]{new int[]{android.R.attr.state_focused},new int[]{android.R.attr.state_selected},new int[]{}},new int[]{Color.WHITE,Color.WHITE,0xffe5e5e5}));
        return b;
    }
    private void syncWebFocus(boolean focused){if(web!=null)web.evaluateJavascript("window.RiveTV && RiveTV."+(focused?"resume":"suspend")+"()",null);}
    private TextView label(String value,int size,int color){TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(color);t.setTypeface(interRegular);return t;}
    private void beginLoading(String url){
        if(searchEditor!=null)finishKeyboardEditing();
        stopArrowNavigation();arrowGeneration++;
        errorBar.setVisibility(View.GONE);
        sourceError=false;captchaKind=null;errorCursor.setVisibility(View.GONE);watchQuick.setVisibility(View.GONE);loadingUrl=url;pageFailed=false;pageGeneration++;loadingStarted=SystemClock.uptimeMillis();
        loading.animate().cancel();loading.setAlpha(1f);
        progress.setVisibility(View.VISIBLE);
        status.setText("/watch".equals(Uri.parse(url).getPath())?"Preparing the player…":"Loading your cinema…");
        loading.getChildAt(loading.getChildCount()-1).setVisibility(View.GONE);
        loading.setVisibility(View.VISIBLE);
        if(isRive(Uri.parse(url))){pollPageReady(pageGeneration);monitorCaptcha(pageGeneration);}
    }
    private void monitorCaptcha(int generation){
        handler.postDelayed(()->{
            if(web==null || generation!=pageGeneration)return;
            web.evaluateJavascript("window.RiveTVAds ? RiveTVAds.captcha() : null",result->{
                if(web==null || generation!=pageGeneration)return;
                JSONObject found=null;
                try{Object value=new org.json.JSONTokener(result).nextValue();if(value instanceof String)found=new JSONObject((String)value);}catch(Exception ignored){}
                if(found!=null){captchaX=(float)found.optDouble("x",.5);captchaY=(float)found.optDouble("y",.5);if(captchaKind==null)showCaptcha(found.optString("kind","Cloudflare"),found.optString("server"));}
                else if(captchaKind!=null){captchaKind=null;if(sourceError && errorCursor.getVisibility()==View.VISIBLE){sourceError=false;errorCursor.setVisibility(View.GONE);watchQuick.setVisibility(View.GONE);errorBar.setVisibility(View.GONE);}}
                monitorCaptcha(generation);
            });
        },1500);
    }
    private void showCaptcha(String kind,String server){
        if(web==null || pageFailed || web.getUrl()==null || !"/watch".equals(Uri.parse(web.getUrl()).getPath()))return;
        captchaKind=kind;if(!server.isEmpty())captchaServers.add(server);
        sourceError=true;errorRetry.setText(R.string.source_servers);errorCursor.setVisibility(View.VISIBLE);watchQuick.setVisibility(View.VISIBLE);
        errorText.setText(getString(R.string.source_captcha,kind));errorBar.setVisibility(View.VISIBLE);
        if(customView==null && activeDialog==null && !keyboardOpen()){stopArrowNavigation();errorCursor.requestFocus();}
    }
    private void blockedNotice(String message){
        long now=SystemClock.uptimeMillis();if(now-lastBlockNotice<8000)return;
        lastBlockNotice=now;showNotice(message);
    }
    private void monitorPageError(int generation){
        handler.postDelayed(()->{
            if(web==null || generation!=pageGeneration || pageFailed)return;
            String stateScript=sourceError ? "window.RiveTV ? (window.RiveTVPlayer && RiveTVPlayer.active() ? 'source-changed' : Array.from(document.querySelectorAll('iframe')).some(f=>/^https:\\/\\/primesrc\\.me\\//.test(f.src)) ? RiveTV.pageState() : 'source-changed') : 'loading'" : "window.RiveTV ? RiveTV.pageState() : 'loading'";
            web.evaluateJavascript(stateScript,result->{
                if(web==null || generation!=pageGeneration || pageFailed)return;
                if("\"source-changed\"".equals(result)){sourceError=false;watchQuick.setVisibility(View.GONE);errorBar.setVisibility(View.GONE);}
                if("\"error\"".equals(result) && customView==null)showError("The page ran into an error.\nSelect Refresh to try again.");
                else monitorPageError(generation);
            });
        },1500);
    }
    private void injectNavigation(WebView view){
        view.evaluateJavascript(viewingStore.restoreScript()+navigationScript,result->{if(web!=null)syncWebFocus(web.hasFocus() && !pointerMode && activeDialog==null);});
    }
    private void refreshStorageBootstrap(){
        if(!documentStartSupported || web==null || bootstrapScript==null)return;
        if(storageBootstrap!=null)storageBootstrap.remove();
        storageBootstrap=WebViewCompat.addDocumentStartJavaScript(web,viewingStore.restoreScript()+bootstrapScript,
            new HashSet<>(Arrays.asList("https://www.rivestream.app","https://rivestream.app")));
    }
    private void pollPageReady(int generation){
        handler.postDelayed(()->{
            if(web==null || generation!=pageGeneration || pageFailed)return;
            web.evaluateJavascript("window.RiveTV ? RiveTV.pageState() : 'loading'",result->{
                if(web==null || generation!=pageGeneration || pageFailed)return;
                if("\"ready\"".equals(result)){
                    web.postVisualStateCallback(generation,new WebView.VisualStateCallback(){
                        @Override public void onComplete(long id){
                            if(web==null || generation!=pageGeneration || pageFailed)return;
                            loading.animate().alpha(0f).setDuration(220).withEndAction(()->{if(generation==pageGeneration && !pageFailed)loading.setVisibility(View.GONE);}).start();
                            monitorPageError(generation);
                        }
                    });
                }else if("\"error\"".equals(result))showError("The page failed while starting.\nSelect Refresh to try again.");
                else if(SystemClock.uptimeMillis()-loadingStarted>30000)showError("Loading is taking too long.\nCheck your connection or select Refresh.");
                else pollPageReady(generation);
            });
        },250);
    }
    private void showSourceError(){
        if(web==null || pageFailed || !"/watch".equals(Uri.parse(web.getUrl()).getPath()))return;
        web.evaluateJavascript("!!(window.RiveTVServers && RiveTVServers.searching())",result->{if(!"true".equals(result))revealSourceError();});
    }
    private void revealSourceError(){
        if(web==null || pageFailed || !"/watch".equals(Uri.parse(web.getUrl()).getPath()))return;
        sourceError=true;errorCursor.setVisibility(View.GONE);watchQuick.setVisibility(View.VISIBLE);errorRetry.setText(R.string.source_servers);
        errorText.setText(R.string.source_blocked);
        errorBar.setVisibility(View.VISIBLE);
        if(customView==null && activeDialog==null && !keyboardOpen()){stopArrowNavigation();errorRetry.requestFocus();}
    }
    private void showError(String message){
        sourceError=false;errorCursor.setVisibility(View.GONE);errorRetry.setText(R.string.error_refresh);
        pageFailed=true;if(web!=null && web.getUrl()!=null && "/watch".equals(Uri.parse(web.getUrl()).getPath()))watchQuick.setVisibility(View.VISIBLE);loading.animate().cancel();loading.setVisibility(View.GONE);
        errorText.setText(message.replace('\n',' '));errorBar.setVisibility(View.VISIBLE);
        // Keep the page and playback controls usable; Up at the top enters this bar.
        recoverPage(pageGeneration);
    }
    private void recoverPage(int generation){
        handler.postDelayed(()->{
            if(web==null || generation!=pageGeneration || !pageFailed)return;
            web.evaluateJavascript("window.RiveTV ? RiveTV.pageState() : 'loading'",result->{
                if(web==null || generation!=pageGeneration || !pageFailed)return;
                if("\"ready\"".equals(result)){pageFailed=false;watchQuick.setVisibility(View.GONE);errorBar.setVisibility(View.GONE);monitorPageError(generation);}
                else recoverPage(generation);
            });
        },1500);
    }
    private WebResourceResponse assetResponse(Uri uri){
        if(!"https".equals(uri.getScheme()) || !ASSET_HOST.equals(uri.getHost()))return null;
        Map<String,String> headers=new HashMap<>();
        headers.put("Access-Control-Allow-Origin","*");
        headers.put("Cache-Control","public, max-age=31536000, immutable");
        String path=uri.getPath();
        if(path!=null && path.matches("/[A-Za-z0-9_-]+(/[A-Za-z0-9_-]+)*\\.[a-z0-9]+")){
            String extension=path.substring(path.lastIndexOf('.')+1);
            String mime;
            switch(extension){
                case "woff2": mime="font/woff2";break;
                case "woff": mime="font/woff";break;
                case "ttf": mime="font/ttf";break;
                case "css": mime="text/css";break;
                case "js": mime="text/javascript";break;
                case "json": mime="application/json";break;
                case "svg": mime="image/svg+xml";break;
                case "png": mime="image/png";break;
                case "webp": mime="image/webp";break;
                case "txt": mime="text/plain";break;
                default: mime=null;
            }
            if(mime!=null){
                try{return new WebResourceResponse(mime,mime.startsWith("font/")||mime.startsWith("image/png")||mime.startsWith("image/webp")?null:"utf-8",200,"OK",headers,getAssets().open("rivetv"+path));}
                catch(IOException ignored){}
            }
        }
        return new WebResourceResponse("text/plain","utf-8",404,"Not Found",headers,new ByteArrayInputStream(new byte[0]));
    }
    private boolean isRive(Uri uri){String host=uri.getHost();return "https".equals(uri.getScheme()) && host!=null && (host.equals("rivestream.app") || host.endsWith(".rivestream.app"));}
    private String readAsset(String name){try(BufferedReader reader=new BufferedReader(new InputStreamReader(getAssets().open(name)))){StringBuilder s=new StringBuilder();String l;while((l=reader.readLine())!=null)s.append(l).append('\n');return s.toString();}catch(Exception e){throw new IllegalStateException(e);}}
    private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
    private void immersive(){getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_LAYOUT_STABLE);}
    @Override public void onWindowFocusChanged(boolean focused){super.onWindowFocusChanged(focused);if(focused)immersive();syncWebFocus(focused && web!=null && web.hasFocus() && !pointerMode && activeDialog==null);}
    private CursorView detachCursor(){((ViewGroup)cursor.getParent()).removeView(cursor);return cursor;}
    private void hideFullscreen(){
        if(customView==null)return;
        root.removeView(customView);customView=null;
        content.addView(detachCursor(),new FrameLayout.LayoutParams(-1,-1));
        WebChromeClient.CustomViewCallback callback=customCallback;customCallback=null;
        if(callback!=null)callback.onCustomViewHidden();
        web.requestFocus();immersive();
    }
    private void togglePointer(){
        pointerMode=!pointerMode;
        if(customView!=null && cursor.getParent()!=root)root.addView(detachCursor(),new FrameLayout.LayoutParams(-1,-1));
        cursor.x=cursor.getWidth()/2f;cursor.y=cursor.getHeight()/2f;
        cursor.setVisibility(pointerMode?View.VISIBLE:View.GONE);cursor.invalidate();
        showNotice(pointerMode?"Cursor on  ·  Arrows move  ·  OK selects":"Remote navigation on");
        web.requestFocus();
        syncWebFocus(!pointerMode);
    }
    private void setPlaybackMode(String mode){
        if(web==null || !("direct".equals(mode)||"embed".equals(mode)))return;
        String url=web.getUrl();if(url==null || !isRive(Uri.parse(url)) || !"/watch".equals(Uri.parse(url).getPath()))return;
        if(keyboardOpen())finishKeyboardEditing();hideFullscreen();stopArrowNavigation();
        // These preferences are also used by the site's own mode selector.
        // Recovery must work even when React has replaced the whole watch page.
        web.evaluateJavascript("localStorage.setItem('RiveStreamWatchMode',"+JSONObject.quote(mode)+");localStorage.setItem('RiveStreamEmbedMode','"+("embed".equals(mode)?"true":"false")+"');document.querySelectorAll('video,audio').forEach(function(v){v.pause();});",result->{if(web!=null){web.reload();web.requestFocus();}});
    }
    private void showPlaybackMenu(){
        showTvDialog("Playback","Choose a mode or source",new String[]{"Direct","Embed","Servers","Close ad","App options"},new Runnable[]{()->setPlaybackMode("direct"),()->setPlaybackMode("embed"),()->{if(pageFailed){setPlaybackMode("embed");}else web.evaluateJavascript("window.RiveTV && RiveTV.sources()",result->{if("\"dropdown\"".equals(result))showCustomSelect(0);else showNotice("Server choice appears once the player loads.");});},this::dismissAds,()->showAppMenu()},true);
    }
    private void dismissAds(){
        if(web==null)return;
        web.evaluateJavascript("window.RiveTVAds ? RiveTVAds.dismiss() : -1",before->handler.postDelayed(()->{
            if(web!=null)web.evaluateJavascript("window.RiveTVAds ? RiveTVAds.removed() : -1",after->{
                web.requestFocus();
                showNotice(!before.equals(after)?"Closed a pop-up.":"No window to close. Turn on the cursor (hold OK) and click X.");
            });
        },600));
    }
    private void showMenu(){
        if(web!=null && web.getUrl()!=null && "/watch".equals(Uri.parse(web.getUrl()).getPath())){showPlaybackMenu();return;}
        showAppMenu();
    }
    private void showAppMenu(){
        if(keyboardOpen())finishKeyboardEditing();
        String[] actions={"Home","Search",pointerMode?"Cursor off":"Cursor on","Reload page","Updates · "+BuildConfig.VERSION_NAME,"Controls and info"};
        Runnable[] callbacks=new Runnable[actions.length];
        for(int i=0;i<actions.length;i++){final int index=i;callbacks[i]=()->{
            switch(index){
                case 0: hideFullscreen();web.loadUrl(HOME);web.requestFocus();break;
                case 1: hideFullscreen();web.loadUrl(HOME+"search");web.requestFocus();break;
                case 2:togglePointer();break;
                case 3:web.reload();web.requestFocus();break;
                case 4:updater.check(true);break;
                default:showHelp();
            }
        };}
        showTvDialog("Playback and app options","RIVESTREAM TV  /  REMOTE MENU",actions,callbacks,true);
    }
    @Override public boolean canInstallUpdate(){
        return !isFinishing() && hasWindowFocus() && activeDialog==null && !keyboardOpen() && customView==null && loading.getVisibility()!=View.VISIBLE && web!=null && web.getUrl()!=null && isRive(Uri.parse(web.getUrl())) && !"/watch".equals(Uri.parse(web.getUrl()).getPath());
    }
    @Override public void updateMessage(String message,boolean explicit){
        if(explicit)showTvDialog("Updates",message,new String[]{"Close"},new Runnable[]{null},false);
        else showNotice(message);
    }
    @Override public void updateReady(String version,Runnable install,Runnable later){
        showTvDialog("Update "+version,"A new version is downloaded and ready to install.",new String[]{"Install","Later"},new Runnable[]{install,later},false);
    }
    @Override public void updatePermission(Runnable settings,Runnable later){
        showTvDialog("Updates without a USB drive","Allow Rivestream TV to install updates. Turn on the permission for this app in the TV settings, then come back with Back.",new String[]{"Open settings","Later"},new Runnable[]{settings,later},false);
    }
    private void showHelp(){
        android.content.pm.PackageInfo engine=WebView.getCurrentWebViewPackage();
        String version=engine==null?"brak":engine.versionName;
        showTvDialog("Remote controls","Arrows — move between items\nOK — open / select\nHold OK — cursor in the player\nMenu or F1 — app options\nBack — controls, then Back again to leave a video\nPlay / pause — control the video\n\nIf the player ignores the arrows, turn on the cursor.\n\nRivestream TV "+BuildConfig.VERSION_NAME+" · Android "+android.os.Build.VERSION.RELEASE+" · WebView "+version,new String[]{"Got it"},new Runnable[]{null},false);
    }
    private GradientDrawable panelBackground(int color,int radius){GradientDrawable bg=new GradientDrawable();bg.setColor(color);bg.setCornerRadius(dp(radius));return bg;}
    private Drawable errorBackground(){
        GradientDrawable stripe=new GradientDrawable();stripe.setColor(0xffe50914);stripe.setCornerRadii(new float[]{dp(3),dp(3),0,0,0,0,dp(3),dp(3)});
        LayerDrawable layers=new LayerDrawable(new Drawable[]{panelBackground(0xff262626,3),stripe});
        layers.setLayerWidth(1,dp(3));layers.setLayerGravity(1,Gravity.START|Gravity.FILL_VERTICAL);return layers;
    }
    private GradientDrawable inputBackground(){GradientDrawable bg=panelBackground(0x80000000,3);bg.setStroke(dp(1),Color.WHITE);return bg;}
    private void showNotice(String message){
        notice.setText(message);handler.removeCallbacks(hideNotice);handler.postDelayed(hideNotice,4000);
        if(notice.getVisibility()!=View.VISIBLE){notice.setAlpha(0f);notice.setTranslationY(dp(6));notice.setVisibility(View.VISIBLE);}
        notice.animate().cancel();notice.animate().alpha(1f).translationY(0).setDuration(200).setInterpolator(new DecelerateInterpolator()).withEndAction(null).start();
    }
    private final Runnable hideNotice=()->{if(notice!=null)notice.animate().alpha(0f).translationY(dp(6)).setDuration(150).withEndAction(()->notice.setVisibility(View.GONE)).start();};
    /** All app dialogs share the TV palette, focus treatment and predictable D-pad order. */
    private void showTvDialog(String title,String message,String[] actions,Runnable[] callbacks,boolean vertical){
        showTvDialog(title,message,actions,callbacks,vertical,null);
    }
    private void showTvDialog(String title,String message,String[] actions,Runnable[] callbacks,boolean vertical,EditText input){
        if(activeDialog!=null)activeDialog.dismiss();
        final View previousFocus=getCurrentFocus();
        Dialog dialog=new Dialog(this);activeDialog=dialog;
        dialog.requestWindowFeature(android.view.Window.FEATURE_NO_TITLE);
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setPadding(dp(32),dp(26),dp(32),dp(26));
        panel.setBackground(panelBackground(vertical?0xff262626:0xff181818,3));
        LinearLayout header=new LinearLayout(this);header.setGravity(Gravity.CENTER_VERTICAL);
        ImageView mark=new ImageView(this);mark.setImageResource(R.drawable.rive_mark);header.addView(mark,new LinearLayout.LayoutParams(dp(18),dp(18)));
        TextView heading=label(title,16,Color.WHITE);heading.setTypeface(interMedium);heading.setPadding(dp(10),0,0,0);heading.setSingleLine(true);heading.setEllipsize(android.text.TextUtils.TruncateAt.END);
        header.addView(heading,new LinearLayout.LayoutParams(0,-2,1));
        LinearLayout.LayoutParams headerParams=new LinearLayout.LayoutParams(-1,-2);headerParams.bottomMargin=dp(12);panel.addView(header,headerParams);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(false);
        LinearLayout body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);
        TextView description=label(message,12,0xffd2d2d2);description.setLineSpacing(dp(5),1);description.setPadding(0,0,0,dp(18));body.addView(description);
        if(input!=null){LinearLayout.LayoutParams fieldParams=new LinearLayout.LayoutParams(-1,dp(38));fieldParams.bottomMargin=dp(18);body.addView(input,fieldParams);}
        LinearLayout buttons=new LinearLayout(this);buttons.setOrientation(vertical?LinearLayout.VERTICAL:LinearLayout.HORIZONTAL);
        for(int i=0;i<actions.length;i++){
            final int index=i;Button b=makeButton(actions[i]);
            if(vertical){
                boolean chosen=actions[i].startsWith("✓");
                b.setBackgroundResource(R.drawable.list_item_background);b.setGravity(Gravity.CENTER_VERTICAL|Gravity.START);b.setTypeface(chosen?interMedium:interRegular);b.setTextSize(13);b.setPadding(dp(16),0,dp(16),0);
                b.setTextColor(new ColorStateList(new int[][]{new int[]{android.R.attr.state_focused},new int[]{}},new int[]{Color.WHITE,chosen?Color.WHITE:0xffb3b3b3}));
            }
            b.setTag("rive-dialog-action-"+i);
            LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(vertical?-1:0,vertical?dp(37):dp(32),vertical?0:1);if(vertical)lp.bottomMargin=dp(3);else if(i>0)lp.leftMargin=dp(8);
            b.setOnClickListener(v->{dialog.dismiss();if(callbacks[index]!=null)callbacks[index].run();});buttons.addView(b,lp);
        }
        body.addView(buttons);scroll.addView(body);panel.addView(scroll,new LinearLayout.LayoutParams(-1,-2));
        dialog.setContentView(panel);
        dialog.setOnDismissListener(d->{if(activeDialog==dialog)activeDialog=null;if(previousFocus!=null && previousFocus.isShown())previousFocus.requestFocus();syncWebFocus(web!=null && web.hasFocus() && !pointerMode);});
        dialog.show();
        android.view.Window window=dialog.getWindow();
        if(window!=null){
            window.setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));window.addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);window.setWindowAnimations(0);
            WindowManager.LayoutParams params=window.getAttributes();params.dimAmount=.7f;window.setAttributes(params);
            int width=Math.min(dp(vertical?490:540),getResources().getDisplayMetrics().widthPixels-dp(64));
            panel.measure(View.MeasureSpec.makeMeasureSpec(width,View.MeasureSpec.EXACTLY),View.MeasureSpec.makeMeasureSpec(0,View.MeasureSpec.UNSPECIFIED));
            int height=Math.min(panel.getMeasuredHeight(),getResources().getDisplayMetrics().heightPixels-dp(72));
            window.setLayout(width,height);window.getDecorView().setSystemUiVisibility(root.getSystemUiVisibility());
        }
        panel.setAlpha(0f);panel.setScaleX(.9f);panel.setScaleY(.9f);
        panel.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(250).setInterpolator(new DecelerateInterpolator()).start();
        syncWebFocus(false);buttons.getChildAt(0).requestFocus();
    }
    private boolean keyboardOpen(){
        WindowInsets insets=root.getRootWindowInsets();
        if(keyboardRequested)return true;
        if(android.os.Build.VERSION.SDK_INT>=30 && insets!=null && insets.isVisible(WindowInsets.Type.ime()))return true;
        Rect frame=new Rect();root.getWindowVisibleDisplayFrame(frame);
        return getResources().getDisplayMetrics().heightPixels-frame.bottom>dp(48) ||
            (insets!=null && insets.getSystemWindowInsetBottom()>dp(48));
    }
    private void showSearchEditor(JSONObject target){
        if(searchEditor!=null)return;
        stopArrowNavigation();
        EditText editor=new EditText(this);searchEditor=editor;
        editor.setSingleLine(true);editor.setTextSize(13);editor.setTypeface(interRegular);editor.setTextColor(Color.WHITE);editor.setHintTextColor(0xff808080);
        editor.setHint("Type a movie or show title");editor.setContentDescription("Search titles");
        editor.setInputType(android.text.InputType.TYPE_CLASS_TEXT);
        editor.setImeOptions(EditorInfo.IME_ACTION_SEARCH|EditorInfo.IME_FLAG_NO_EXTRACT_UI);
        GradientDrawable bg=inputBackground();bg.setColor(0xff000000);bg.setStroke(dp(2),Color.WHITE);editor.setBackground(bg);editor.setPadding(dp(35),dp(6),dp(16),dp(6));
        editor.setText(target.optString("text"));editor.setSelection(editor.length());
        FrameLayout.LayoutParams params=new FrameLayout.LayoutParams(Math.max(dp(180),(int)(target.optDouble("width",.8)*web.getWidth())),Math.max(dp(44),(int)(target.optDouble("height",.09)*web.getHeight())));
        params.leftMargin=(int)(target.optDouble("left")*web.getWidth());params.topMargin=(int)(target.optDouble("top")*web.getHeight());
        content.addView(editor,params);
        editor.addTextChangedListener(new TextWatcher(){
            @Override public void beforeTextChanged(CharSequence value,int start,int count,int after){}
            @Override public void onTextChanged(CharSequence value,int start,int before,int count){}
            @Override public void afterTextChanged(Editable value){
                if(updateSearch!=null)handler.removeCallbacks(updateSearch);
                final String query=value.toString();updateSearch=()->{if(web!=null && searchEditor==editor)web.evaluateJavascript("window.RiveTV && RiveTV.search("+JSONObject.quote(query)+",true)",null);};handler.postDelayed(updateSearch,160);
            }
        });
        editor.setOnEditorActionListener((view,action,event)->{
            if(action==EditorInfo.IME_ACTION_SEARCH || action==EditorInfo.IME_ACTION_DONE || action==EditorInfo.IME_ACTION_GO || action==EditorInfo.IME_ACTION_NEXT || (event!=null && event.getKeyCode()==KeyEvent.KEYCODE_ENTER)){finishKeyboardEditing();return true;}return false;
        });
        editor.requestFocus();keyboardRequested=true;handler.postDelayed(()->requestKeyboard(0),80);
    }
    private void requestKeyboard(int attempt){
        if(web==null || !keyboardRequested)return;
        View editor=searchEditor!=null?searchEditor:web;editor.requestFocus();
        ((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showSoftInput(editor,InputMethodManager.SHOW_IMPLICIT);
        if(android.os.Build.VERSION.SDK_INT>=30 && editor.getWindowInsetsController()!=null)editor.getWindowInsetsController().show(WindowInsets.Type.ime());
        if(attempt<4)handler.postDelayed(()->requestKeyboard(attempt+1),100);
    }
    private void finishKeyboardEditing(){
        keyboardRequested=false;
        suppressCenterUntil=SystemClock.uptimeMillis()+400;centerPressedHere=false;
        handler.removeCallbacks(longPress);stopArrowNavigation();
        if(updateSearch!=null)handler.removeCallbacks(updateSearch);
        String query=null;
        View editor=searchEditor!=null?searchEditor:web;
        ((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(editor.getWindowToken(),0);
        if(searchEditor!=null){query=searchEditor.getText().toString();content.removeView(searchEditor);searchEditor=null;}
        web.requestFocus();
        String commit=query==null?"":"RiveTV.search("+JSONObject.quote(query)+",true);";
        web.evaluateJavascript("window.RiveTV && (function(){"+commit+"return RiveTV.finishEditing();})()",null);
    }
    private final class TvWebView extends WebView{
        TvWebView(){super(MainActivity.this);}
        @Override public boolean onKeyPreIme(int key,KeyEvent event){
            if((key==KeyEvent.KEYCODE_BACK || key==KeyEvent.KEYCODE_ESCAPE) && keyboardRequested){
                if(event.getAction()==KeyEvent.ACTION_UP)finishKeyboardEditing();return true;
            }
            return super.onKeyPreIme(key,event);
        }
        @Override public InputConnection onCreateInputConnection(EditorInfo info){
            InputConnection connection=super.onCreateInputConnection(info);
            if(connection==null)return null;
            final boolean singleLine=(info.inputType & android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE)==0;
            return new InputConnectionWrapper(connection,false){
                @Override public boolean sendKeyEvent(KeyEvent event){
                    if(singleLine && event.getKeyCode()==KeyEvent.KEYCODE_ENTER && event.getAction()==KeyEvent.ACTION_UP){
                        super.finishComposingText();super.sendKeyEvent(event);
                        handler.post(()->{if(web!=null)finishKeyboardEditing();});return true;
                    }
                    return super.sendKeyEvent(event);
                }
                @Override public boolean performEditorAction(int action){
                    if(action==EditorInfo.IME_ACTION_DONE || action==EditorInfo.IME_ACTION_SEARCH || action==EditorInfo.IME_ACTION_GO || action==EditorInfo.IME_ACTION_SEND || (singleLine && action==EditorInfo.IME_ACTION_NEXT)){
                        super.finishComposingText();super.performEditorAction(action);
                        handler.post(()->{if(web!=null)finishKeyboardEditing();});return true;
                    }
                    return super.performEditorAction(action);
                }
            };
        }
    }
    private void stopArrowNavigation(){
        boolean moving=heldArrow!=0 || arrowRepeated;
        heldArrow=0;arrowRepeated=false;handler.removeCallbacks(repeatArrow);
        if(web!=null && moving)web.evaluateJavascript("window.RiveTV && RiveTV.stopMove()",null);
    }
    private final Runnable repeatArrow=()->sendArrow();
    private void sendArrow(){
        if(web==null || heldArrow==0 || arrowInFlight || keyboardOpen() || !web.hasFocus())return;
        final int key=heldArrow,generation=arrowGeneration;
        final boolean repeated=arrowRepeated;arrowRepeated=true;arrowInFlight=true;
        String direction=key==19?"up":key==20?"down":key==21?"left":"right";
        long deadline=System.currentTimeMillis()+350;
        web.evaluateJavascript("Date.now()>"+deadline+" ? 'stale' : (window.RiveTV ? RiveTV.move('"+direction+"',"+repeated+") : 'native')",result->{
            arrowInFlight=false;
            if(web==null)return;
            if(generation!=arrowGeneration){if(heldArrow!=0)handler.post(repeatArrow);return;}
            if("\"edge-up\"".equals(result) && errorBar.getVisibility()==View.VISIBLE){stopArrowNavigation();errorRetry.requestFocus();}
            else if("\"edge-right\"".equals(result) && watchQuick.getVisibility()==View.VISIBLE){stopArrowNavigation();watchQuick.requestFocus();}
            else if("\"native\"".equals(result)){web.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,key));web.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,key));}
            if(heldArrow!=0)handler.postDelayed(repeatArrow,repeated?150:300);
        });
    }
    private void showSelect(JSONObject target){
        JSONArray options=target.optJSONArray("options");if(options==null)return;
        ArrayList<String> labels=new ArrayList<>();ArrayList<Runnable> callbacks=new ArrayList<>();int selectedIndex=0;
        boolean multiple=target.optBoolean("multiple");
        for(int i=0;i<options.length();i++){
            JSONObject option=options.optJSONObject(i);if(option==null || option.optBoolean("disabled"))continue;
            final int index=option.optInt("index");if(option.optBoolean("selected"))selectedIndex=labels.size();
            labels.add((option.optBoolean("selected")?"✓  ":"     ")+option.optString("label")+(captchaServers.contains(option.optString("label").trim())?"  · weryfikacja":""));
            callbacks.add(()->web.evaluateJavascript("window.RiveTV && RiveTV.choose("+index+")",result->{if(multiple)activate();}));
        }
        if(labels.isEmpty())return;
        if(multiple){labels.add("Done");callbacks.add(null);}
        showTvDialog("Choose an option",multiple?"OK selects; Done closes the list.":"Arrows choose  ·  OK confirms  ·  Back cancels",labels.toArray(new String[0]),callbacks.toArray(new Runnable[0]),true);
        if(target.optBoolean("custom"))activeDialog.setOnCancelListener(d->web.evaluateJavascript("window.RiveTV && RiveTV.closeDropdown()",null));
        ViewGroup panel=(ViewGroup)activeDialog.findViewById(android.R.id.content);
        View selected=panel.findViewWithTag("rive-dialog-action-"+selectedIndex);if(selected!=null)selected.requestFocus();
    }
    private void showCustomSelect(int attempt){
        if(web==null || activeDialog!=null)return;
        web.evaluateJavascript("window.RiveTV && RiveTV.dropdown()",raw->{
            try{JSONObject target=new JSONObject(raw);showSelect(target);}
            catch(Exception ignored){if(attempt<30)handler.postDelayed(()->showCustomSelect(attempt+1),40);else {web.evaluateJavascript("window.RiveTV && RiveTV.closeDropdown()",null);showNotice("Could not open the list. Try again.");}}
        });
    }
    private void tap(float x,float y){
        View target=customView!=null?customView:web;
        long time=SystemClock.uptimeMillis();
        MotionEvent down=MotionEvent.obtain(time,time,MotionEvent.ACTION_DOWN,x,y,0);
        MotionEvent up=MotionEvent.obtain(time,time+50,MotionEvent.ACTION_UP,x,y,0);
        target.dispatchTouchEvent(down);target.dispatchTouchEvent(up);down.recycle();up.recycle();
    }
    private void activate(){
        stopArrowNavigation();
        if(pointerMode){tap(cursor.x,cursor.y);return;}
        // A real touch opens Android's IME and can enter cross-origin players.
        web.evaluateJavascript("window.RiveTV ? RiveTV.target() : null",raw->{
            try{
                JSONObject target=new JSONObject(raw);
                if(target.optBoolean("playback")){web.evaluateJavascript("window.RiveTV && RiveTV.media('toggle')",null);}
                else if(target.optBoolean("search")){showSearchEditor(target);}
                else if(target.optBoolean("select")){showSelect(target);}
                else if(target.optBoolean("tap")){
                    if(target.optBoolean("player"))web.evaluateJavascript("window.RiveTV && RiveTV.enterPlayer()",null);
                    tap((float)target.getDouble("x")*web.getWidth(),(float)target.getDouble("y")*web.getHeight());
                    if(target.optBoolean("input")){
                        keyboardRequested=true;
                        handler.postDelayed(()->requestKeyboard(0),80);
                    }
                }else web.evaluateJavascript("window.RiveTV && RiveTV.activate()",result->{if("\"dropdown\"".equals(result))handler.postDelayed(()->showCustomSelect(0),20);else if("\"voice\"".equals(result))startVoiceSearch();});
            }catch(Exception ignored){web.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_ENTER));web.dispatchKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_ENTER));}
        });
    }
    private void startVoiceSearch(){
        android.content.Intent intent=new android.content.Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL,android.speech.RecognizerIntent.LANGUAGE_MODEL_WEB_SEARCH);
        intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE,"en-US");
        intent.putExtra(android.speech.RecognizerIntent.EXTRA_PROMPT,"Say a movie or show title");
        intent.setPackage("com.google.android.katniss");
        if(intent.resolveActivity(getPackageManager())==null)intent.setPackage(null);
        try{startActivityForResult(intent,VOICE_SEARCH);}catch(android.content.ActivityNotFoundException e){showNotice("Voice search is not available on this TV.");}
    }
    @Override protected void onActivityResult(int request,int result,android.content.Intent data){
        super.onActivityResult(request,result,data);
        if(request!=VOICE_SEARCH || result!=RESULT_OK || data==null || web==null)return;
        ArrayList<String> matches=data.getStringArrayListExtra(android.speech.RecognizerIntent.EXTRA_RESULTS);
        if(matches!=null && !matches.isEmpty())web.evaluateJavascript("window.RiveTV && RiveTV.search("+JSONObject.quote(matches.get(0))+")",null);
    }
    @Override public boolean dispatchKeyEvent(KeyEvent event){
        int key=event.getKeyCode();boolean down=event.getAction()==KeyEvent.ACTION_DOWN;
        if(!down && key==heldArrow)stopArrowNavigation();
        if(key==KeyEvent.KEYCODE_SEARCH){if(down && event.getRepeatCount()==0){hideFullscreen();web.loadUrl(HOME+"search");web.requestFocus();}return true;}
        if(key==KeyEvent.KEYCODE_MENU || key==KeyEvent.KEYCODE_F1){if(down && event.getRepeatCount()==0)showMenu();return true;}
        if(key==KeyEvent.KEYCODE_BACK || key==KeyEvent.KEYCODE_ESCAPE){
            if(down && event.getRepeatCount()==0){backPressedHere=true;backForKeyboard=keyboardOpen();if(backForKeyboard)finishKeyboardEditing();}
            if(!down){boolean handle=backPressedHere && !backForKeyboard;backPressedHere=false;backForKeyboard=false;if(handle)goBack();}return true;
        }
        if(web==null)return super.dispatchKeyEvent(event);
        if(keyboardOpen()){centerPressedHere=false;handler.removeCallbacks(longPress);stopArrowNavigation();return super.dispatchKeyEvent(event);}
        if(pageFailed && web.hasFocus() && customView==null && key>=KeyEvent.KEYCODE_DPAD_UP && key<=KeyEvent.KEYCODE_DPAD_RIGHT){
            if(down && event.getRepeatCount()==0){
                stopArrowNavigation();
                if(watchQuick.getVisibility()==View.VISIBLE && (key==KeyEvent.KEYCODE_DPAD_RIGHT || errorBar.getVisibility()!=View.VISIBLE))watchQuick.requestFocus();
                else if(errorBar.getVisibility()==View.VISIBLE)errorRetry.requestFocus();
            }
            return true;
        }
        if(loading.getVisibility()==View.VISIBLE && web.hasFocus() && customView==null &&
            ((key>=19 && key<=23) || key==KeyEvent.KEYCODE_ENTER || key==KeyEvent.KEYCODE_NUMPAD_ENTER))return true;
        if(!web.hasFocus() && customView==null)return super.dispatchKeyEvent(event);
        if(key==KeyEvent.KEYCODE_DPAD_CENTER || key==KeyEvent.KEYCODE_ENTER || key==KeyEvent.KEYCODE_NUMPAD_ENTER){
            if(SystemClock.uptimeMillis()<suppressCenterUntil)return true;
            if(!down && !centerPressedHere)return true;
            if(down && event.getRepeatCount()==0){centerPressedHere=true;centerLongPress=false;handler.postDelayed(longPress,600);}
            else if(down && event.isLongPress() && !centerLongPress){handler.removeCallbacks(longPress);longPress.run();}
            else if(!down){centerPressedHere=false;handler.removeCallbacks(longPress);if(!centerLongPress){if(customView!=null&&!pointerMode)web.evaluateJavascript("window.RiveTV && RiveTV.media('toggle')",null);else activate();}}
            return true;
        }
        if(key>=KeyEvent.KEYCODE_DPAD_UP && key<=KeyEvent.KEYCODE_DPAD_RIGHT){
            if(pointerMode){if(down)moveCursor(key,event.getRepeatCount());return true;}
            if(customView!=null)return super.dispatchKeyEvent(event);
            if(down && event.getRepeatCount()==0){
                heldArrow=key;arrowGeneration++;arrowRepeated=false;
                handler.removeCallbacks(repeatArrow);sendArrow();
            }return true;
        }
        if(down && (key==KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE || key==KeyEvent.KEYCODE_MEDIA_PLAY || key==KeyEvent.KEYCODE_MEDIA_PAUSE)){
            web.evaluateJavascript("window.RiveTV && RiveTV.media('"+(key==126?"play":key==127?"pause":"toggle")+"')",null);
        }
        if(down && (key==KeyEvent.KEYCODE_MEDIA_FAST_FORWARD || key==KeyEvent.KEYCODE_MEDIA_REWIND)){
            web.evaluateJavascript("window.RiveTV && RiveTV.media('"+(key==KeyEvent.KEYCODE_MEDIA_FAST_FORWARD?"forward":"rewind")+"')",null);return true;
        }
        return super.dispatchKeyEvent(event);
    }
    private final Runnable longPress=()->{centerLongPress=true;togglePointer();};
    private void moveCursor(int key,int repeat){
        float step=dp(Math.min(45,12+repeat*2));
        if(key==19)cursor.y-=step;if(key==20)cursor.y+=step;if(key==21)cursor.x-=step;if(key==22)cursor.x+=step;
        if(customView==null && (cursor.y<dp(12) || cursor.y>cursor.getHeight()-dp(12))){web.evaluateJavascript("window.scrollBy(0,"+(key==19?-100:100)+")",null);}
        cursor.x=Math.max(dp(3),Math.min(cursor.getWidth()-dp(3),cursor.x));
        cursor.y=Math.max(dp(3),Math.min(cursor.getHeight()-dp(3),cursor.y));cursor.invalidate();
        // Hover is required by many embedded players before their controls become visible.
        View target=customView==null?web:customView;long t=SystemClock.uptimeMillis();
        MotionEvent hover=MotionEvent.obtain(t,t,MotionEvent.ACTION_HOVER_MOVE,cursor.x,cursor.y,0);
        hover.setSource(android.view.InputDevice.SOURCE_MOUSE);target.dispatchGenericMotionEvent(hover);hover.recycle();
    }
    private void goBack(){
        boolean watch=web!=null && web.getUrl()!=null && "/watch".equals(Uri.parse(web.getUrl()).getPath());
        long now=SystemClock.uptimeMillis();
        if(watch && now-watchBackAt<5000){
            watchBackAt=0;
            if(pointerMode)togglePointer();
            hideFullscreen();finishBack();
            return;
        }
        watchBackAt=watch?now:0;
        if(customView!=null){hideFullscreen();return;}
        if(pointerMode){togglePointer();return;}
        if(web!=null){web.evaluateJavascript("window.RiveTV && (RiveTV.closeDropdown() || RiveTV.revealPlayback() || RiveTV.releasePlayer())",result->{if(!"true".equals(result)){watchBackAt=0;finishBack();}});return;}
        finishBack();
    }
    private void finishBack(){
        Uri current=web==null || web.getUrl()==null?null:Uri.parse(web.getUrl());
        String path=current==null?null:current.getPath();
        if("/watch".equals(path)){
            leftWatchAt=SystemClock.uptimeMillis();hideFullscreen();
            web.evaluateJavascript("(function(){if(window.RiveTVPlayback)RiveTVPlayback.flush();if(window.next&&next.router){next.router.push('/');return true;}return false;})()",result->{if(!"true".equals(result))web.loadUrl(HOME);});
            return;
        }
        if(current!=null && isRive(current) && path!=null && !path.isEmpty() && !"/".equals(path)){
            android.webkit.WebBackForwardList list=web.copyBackForwardList();
            for(int i=list.getCurrentIndex()-1;i>=0;i--){
                Uri entry=Uri.parse(list.getItemAtIndex(i).getUrl());
                if(isRive(entry) && !"/watch".equals(entry.getPath())){web.goBackOrForward(i-list.getCurrentIndex());return;}
            }
            hideFullscreen();web.loadUrl(HOME);return;
        }
        if(current!=null && !isRive(current) && web.canGoBack()){web.goBack();return;}
        if(SystemClock.uptimeMillis()-leftWatchAt<3000 || loading.getVisibility()==View.VISIBLE)return;
        showTvDialog("Done watching?","You can come back to Rivestream any time.",new String[]{"Stay","Exit app"},new Runnable[]{null,()->finish()},false);
    }
    @Override public void onBackPressed(){goBack();}
    @Override protected void onSaveInstanceState(Bundle state){super.onSaveInstanceState(state);if(web!=null)web.saveState(state);}
    @Override protected void onPause(){if(updater!=null)updater.onPause();keyboardRequested=false;backPressedHere=false;centerPressedHere=false;stopArrowNavigation();arrowGeneration++;handler.removeCallbacks(longPress);if(web!=null){web.evaluateJavascript("window.RiveTV && RiveTV.media('pause')",null);web.onPause();}CookieManager.getInstance().flush();super.onPause();}
    @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();if(updater!=null)updater.onResume();}
    @Override protected void onDestroy(){if(updater!=null)updater.close();handler.removeCallbacksAndMessages(null);if(web!=null){web.stopLoading();content.removeView(web);web.destroy();web=null;}super.onDestroy();}
    private final class SpinnerView extends View{
        final Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);final RectF arc=new RectF();
        final ObjectAnimator spin=ObjectAnimator.ofFloat(this,View.ROTATION,0f,360f);
        android.graphics.Shader sweep;
        SpinnerView(){super(MainActivity.this);setFocusable(false);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(dp(3));p.setStrokeCap(Paint.Cap.ROUND);
            spin.setDuration(1200);spin.setRepeatCount(ValueAnimator.INFINITE);spin.setInterpolator(new LinearInterpolator());}
        @Override public void onVisibilityAggregated(boolean visible){super.onVisibilityAggregated(visible);if(visible){if(!spin.isStarted())spin.start();}else spin.cancel();}
        @Override protected void onDetachedFromWindow(){spin.cancel();super.onDetachedFromWindow();}
        @Override protected void onDraw(Canvas c){
            float inset=dp(2);arc.set(inset,inset,getWidth()-inset,getHeight()-inset);
            p.setShader(null);p.setColor(0x1affffff);c.drawOval(arc,p);
            if(sweep==null)sweep=new android.graphics.SweepGradient(getWidth()/2f,getHeight()/2f,new int[]{0x00f69b65,0xfff69b65,0xffed5c91,0xffef009d,0x00ef009d},new float[]{0f,.15f,.5f,.8f,1f});
            p.setShader(sweep);p.setColor(Color.WHITE);c.drawArc(arc,0,300,false,p);p.setShader(null);
        }
    }
    private final class CursorView extends View{
        float x,y;final Paint p=new Paint(Paint.ANTI_ALIAS_FLAG);
        CursorView(){super(MainActivity.this);setClickable(false);setFocusable(false);}
        @Override protected void onDraw(Canvas c){
            p.setColor(0xcc141414);p.setStyle(Paint.Style.FILL);c.drawCircle(x,y,dp(9),p);
            p.setColor(Color.WHITE);p.setStyle(Paint.Style.STROKE);p.setStrokeWidth(dp(2));c.drawCircle(x,y,dp(9),p);
            c.drawLine(x-dp(14),y,x-dp(5),y,p);c.drawLine(x+dp(5),y,x+dp(14),y,p);
            c.drawLine(x,y-dp(14),x,y-dp(5),p);c.drawLine(x,y+dp(5),x,y+dp(14),p);
        }
    }
}
