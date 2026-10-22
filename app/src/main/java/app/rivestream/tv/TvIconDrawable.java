package app.rivestream.tv;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;

/** Small, consistent outline icons; state follows the native TV focus. */
final class TvIconDrawable extends Drawable {
    private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);
    private final String name;
    private final int size;
    TvIconDrawable(Context context,String name){this.name=name;size=Math.round(18*context.getResources().getDisplayMetrics().density);setBounds(0,0,size,size);}
    @Override public int getIntrinsicWidth(){return size;}
    @Override public int getIntrinsicHeight(){return size;}
    @Override public boolean isStateful(){return true;}
    @Override protected boolean onStateChange(int[] states){invalidateSelf();return true;}
    @Override public void draw(Canvas canvas){
        paint.setColorFilter(null);
        boolean focused=false,selected=false;for(int s:getState()){if(s==android.R.attr.state_focused)focused=true;if(s==android.R.attr.state_selected)selected=true;}
        paint.setColor(focused||selected?Color.WHITE:0xffe5e5e5);paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(1.8f);paint.setStrokeCap(Paint.Cap.ROUND);paint.setStrokeJoin(Paint.Join.ROUND);
        canvas.save();canvas.translate(getBounds().left,getBounds().top);canvas.scale(getBounds().width()/24f,getBounds().height()/24f);
        Path p=new Path();
        switch(name){
            case "menu":canvas.drawLine(4,6,20,6,paint);canvas.drawLine(4,12,20,12,paint);canvas.drawLine(4,18,20,18,paint);break;
            case "voice":canvas.drawRoundRect(9,2,15,15,3,3,paint);p.moveTo(5,10);p.lineTo(5,12);p.cubicTo(5,22,19,22,19,12);p.lineTo(19,10);canvas.drawPath(p,paint);canvas.drawLine(12,20,12,23,paint);break;
            case "search":canvas.drawCircle(10,10,6.5f,paint);canvas.drawLine(15,15,21,21,paint);break;
            case "movie":canvas.drawRoundRect(3,4,21,21,2,2,paint);canvas.drawLine(3,10,21,10,paint);canvas.drawLine(8,4,5,10,paint);canvas.drawLine(15,4,12,10,paint);break;
            case "tv":canvas.drawRoundRect(3,6,21,20,2,2,paint);canvas.drawLine(8,2,12,6,paint);canvas.drawLine(16,2,12,6,paint);break;
            case "library":canvas.drawRoundRect(6,5,21,21,2,2,paint);canvas.drawLine(3,3,3,17,paint);canvas.drawLine(3,3,17,3,paint);canvas.drawLine(10,10,17,10,paint);canvas.drawLine(10,14,17,14,paint);break;
            case "settings":canvas.drawCircle(12,12,7,paint);canvas.drawCircle(12,12,2.7f,paint);for(int i=0;i<8;i++){double a=i*Math.PI/4;canvas.drawLine(12+(float)Math.cos(a)*7,12+(float)Math.sin(a)*7,12+(float)Math.cos(a)*10,12+(float)Math.sin(a)*10,paint);}break;
            default:p.moveTo(2,11);p.lineTo(12,3);p.lineTo(22,11);p.moveTo(5,9);p.lineTo(5,21);p.lineTo(10,21);p.lineTo(10,15);p.lineTo(14,15);p.lineTo(14,21);p.lineTo(19,21);p.lineTo(19,9);canvas.drawPath(p,paint);
        }
        canvas.restore();
    }
    @Override public void setAlpha(int alpha){paint.setAlpha(alpha);}
    @Override public void setColorFilter(ColorFilter filter){paint.setColorFilter(filter);}
    @Override public int getOpacity(){return PixelFormat.TRANSLUCENT;}
}
