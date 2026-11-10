/* Full-stage logo playground. Physics remains independent of DOM for regression checks. */
(function (root) {
  'use strict';
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  class World {
    constructor(width, height, radii) {
      this.width=width; this.height=height; this.gravity=1500; this.floating=false;
      this.obstacles=[]; this.dragged=null; this.onImpact=()=>{};
      this.bodies=radii.map((r,i)=>({key:i?'w':'q',r,m:r*r,x:width*(i ? .84 : .67),y:height-r,vx:0,vy:0,angle:0}));
    }
    resize(width,height,radii) {
      this.width=width; this.height=height;
      this.bodies.forEach((b,i)=>{b.r=radii[i];b.m=b.r*b.r;this.constrain(b);});
    }
    constrain(b) {
      const e=this.floating ? .88 : .72;
      if(b.x<b.r){b.x=b.r;if(b.vx<0)b.vx=-b.vx*e;}
      if(b.x>this.width-b.r){b.x=this.width-b.r;if(b.vx>0)b.vx=-b.vx*e;}
      if(b.y<b.r){b.y=b.r;if(b.vy<0)b.vy=-b.vy*e;}
      if(b.y>this.height-b.r){
        b.y=this.height-b.r;
        if(b.vy>220)this.onImpact(b.x,this.height,b.r);
        if(b.vy>0)b.vy=-b.vy*e;
        if(!this.floating){b.vx*=.98;if(Math.abs(b.vy)<65)b.vy=0;}
      }
    }
    overlaps(b,r) {
      return b.x+b.r>r.left && b.x-b.r<r.right && b.y+b.r>r.top && b.y-b.r<r.bottom;
    }
    avoid(b) {
      for(const r of this.obstacles) {
        if(!this.overlaps(b,r))continue;
        const candidates=[
          {x:b.x,y:r.top-b.r-.5,nx:0,ny:-1},
          {x:b.x,y:r.bottom+b.r+.5,nx:0,ny:1},
          {x:r.left-b.r-.5,y:b.y,nx:-1,ny:0},
          {x:r.right+b.r+.5,y:b.y,nx:1,ny:0}
        ].filter(p=>p.x>=b.r&&p.x<=this.width-b.r&&p.y>=b.r&&p.y<=this.height-b.r
          &&!this.obstacles.some(o=>this.overlaps({...b,...p},o)))
          .sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y));
        if(!candidates.length)continue;
        const p=candidates[0], speed=b.vx*p.nx+b.vy*p.ny;
        b.x=p.x;b.y=p.y;
        if(speed<0){b.vx-=1.7*speed*p.nx;b.vy-=1.7*speed*p.ny;if(Math.abs(speed)>220)this.onImpact(b.x,b.y,b.r);}
        if(p.ny===-1&&!this.floating&&Math.abs(b.vy)<65){b.vy=0;b.vx*=.97;}
      }
    }
    hit(x,y) {return [...this.bodies].reverse().find(b=>Math.hypot(x-b.x,y-b.y)<=b.r+5);}
    launch() {
      this.dragged=null;
      this.bodies.forEach((b,i)=>{
        b.x=this.width*(i ? .83 : .65);b.y=clamp(this.height*(i ? .22 : .37),b.r,this.height-b.r);
        b.vx=(i?-1:1)*(180+Math.random()*260);b.vy=-200-Math.random()*300;b.angle=0;
        this.constrain(b);this.avoid(b);
      });
    }
    impulse(x,y) {
      this.bodies.forEach((b,i)=>{
        let dx=b.x-x,dy=b.y-y,d=Math.hypot(dx,dy);
        if(d<1){dx=i?1:-1;dy=-1;d=Math.SQRT2;}
        const power=clamp(1100-d*.65,340,1050);
        b.vx=clamp(b.vx+dx/d*power,-1900,1900);
        b.vy=clamp(b.vy+dy/d*power-260,-1900,1900);
      });
    }
    step(dt) {
      const n=Math.max(1,Math.ceil(Math.min(dt,.05)*120)), sub=Math.min(dt,.05)/n;
      for(let k=0;k<n;k++){
        for(const b of this.bodies){
          if(b===this.dragged)continue;
          if(!this.floating)b.vy+=this.gravity*sub;
          b.x+=b.vx*sub;b.y+=b.vy*sub;b.angle+=b.vx/b.r*sub*.4;
          this.constrain(b);this.avoid(b);
        }
        const [a,b]=this.bodies,dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;
        if(d<min&&d>.001){
          const nx=dx/d,ny=dy/d,overlap=min-d,total=a.m+b.m;
          if(this.dragged===a){b.x+=nx*overlap;b.y+=ny*overlap;}
          else if(this.dragged===b){a.x-=nx*overlap;a.y-=ny*overlap;}
          else{a.x-=nx*overlap*b.m/total;a.y-=ny*overlap*b.m/total;b.x+=nx*overlap*a.m/total;b.y+=ny*overlap*a.m/total;}
          const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
          if(relative<0){
            const j=-1.82*relative/(1/a.m+1/b.m);
            if(this.dragged!==a){a.vx-=j*nx/a.m;a.vy-=j*ny/a.m;}
            if(this.dragged!==b){b.vx+=j*nx/b.m;b.vy+=j*ny/b.m;}
            if(relative < -180)this.onImpact((a.x+b.x)/2,(a.y+b.y)/2,Math.min(a.r,b.r));
          }
          for(const c of this.bodies){this.constrain(c);this.avoid(c);}
        }
      }
    }
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=World;
  if(typeof document==='undefined')return;
  const stage=document.getElementById('kb-hero-stage'),canvas=document.getElementById('phys');
  if(!stage||!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const launchButton=document.getElementById('phys-launch'),gravityButton=document.getElementById('phys-gravity'),status=document.getElementById('phys-status');
  const world=new World(1,1,[1,1]);let dpr=1,frameId=0,last=0,visible=true,drag=null,ignoreClickUntil=0,impactTime=0;
  let ripples=[],images={},spritesReady=false;
  function radii(){return innerWidth<=760?[44,36]:[Math.max(50,Math.min(stage.clientWidth*.046,66)),Math.max(40,Math.min(stage.clientWidth*.037,53))];}
  function measure(){
    const rect=stage.getBoundingClientRect(),floor=stage.querySelector('.c-marquee').getBoundingClientRect();
    dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
    canvas.style.width=rect.width+'px';canvas.style.height=rect.height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    world.resize(rect.width,Math.max(100,floor.top-rect.top-3),radii());
    world.obstacles=[...stage.querySelectorAll('.h-cta a,.hero-search,.hero-toys__actions')].map(el=>{
      const r=el.getBoundingClientRect();return {left:r.left-rect.left-6,right:r.right-rect.left+6,top:r.top-rect.top-6,bottom:r.bottom-rect.top+6};
    });
    world.bodies.forEach(b=>world.avoid(b));requestFrame();
  }
  function announce(text){if(status)status.textContent=text;}
  function ripple(x,y,r=55){ripples.push({x,y,r,age:0});if(ripples.length>12)ripples.shift();}
  world.onImpact=(x,y,r)=>{if(performance.now()-impactTime>90){impactTime=performance.now();ripple(x,y,r);}};
  function loadSprite(key,src){
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
      x.fillStyle=key==='q'?'#f7f2e8':'#fff';x.beginPath();x.arc(128,128,124,0,Math.PI*2);x.fill();
      x.strokeStyle='#24425f';x.lineWidth=8;x.stroke();
      x.drawImage(img,32,32,192,192);images[key]=c;
      spritesReady=!!images.q&&!!images.w;requestFrame();
    };
    img.onerror=()=>{announce('商标图片暂未加载成功，请刷新重试。');};
    img.src=src;
  }
  function requestFrame(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(frame);}
  function draw(){
    ctx.clearRect(0,0,canvas.width/dpr,canvas.height/dpr);
    const light=document.body.classList.contains('light'),rgb=light?'8,112,82':'95,227,192';
    for(const r of ripples){
      ctx.beginPath();ctx.strokeStyle='rgba('+rgb+','+(Math.max(0,1-r.age)*.5)+')';ctx.lineWidth=1.5;
      ctx.arc(r.x,r.y,r.r+r.age*100,0,Math.PI*2);ctx.stroke();
    }
    for(const b of world.bodies){
      const image=images[b.key];if(!image)continue;
      const ground=Math.max(0,1-(world.height-b.y-b.r)/180);
      ctx.save();ctx.globalAlpha=.12*ground;ctx.fillStyle=light?'#143c31':'#000';
      ctx.beginPath();ctx.ellipse(b.x,world.height-2,b.r*.8,b.r*.09,0,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);
      ctx.shadowColor='rgba('+rgb+',.22)';ctx.shadowBlur=drag&&drag.body===b?22:8;
      ctx.drawImage(image,-b.r,-b.r,b.r*2,b.r*2);ctx.restore();
      if(drag&&drag.body===b){ctx.beginPath();ctx.strokeStyle='rgba('+rgb+',.7)';ctx.lineWidth=1.5;ctx.arc(b.x,b.y,b.r+7,0,Math.PI*2);ctx.stroke();}
    }
    if(spritesReady&&!document.body.classList.contains('phys-on'))document.body.classList.add('phys-on');
  }
  function frame(now){
    frameId=0;const dt=Math.min((now-last)/1000||.016,.04);last=now;
    if(!reduce)world.step(dt);
    ripples.forEach(r=>r.age+=dt*1.7);ripples=ripples.filter(r=>r.age<1);
    draw();if(!reduce)requestFrame();
  }
  const protectedTarget=e=>e.target.closest&&e.target.closest('a,button,input,textarea,select,summary');
  const local=e=>{const r=stage.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
  stage.addEventListener('pointerdown',e=>{
    if(reduce||protectedTarget(e)||e.button!==0)return;
    const p=local(e),b=world.hit(p.x,p.y);if(!b)return;
    drag={body:b,id:e.pointerId,dx:p.x-b.x,dy:p.y-b.y,samples:[{x:b.x,y:b.y,t:performance.now()}]};
    world.dragged=b;b.vx=b.vy=0;stage.setPointerCapture(e.pointerId);stage.classList.add('phys-dragging');
    ignoreClickUntil=performance.now()+500;e.preventDefault();requestFrame();
  });
  stage.addEventListener('pointermove',e=>{
    const p=local(e);
    if(drag&&drag.id===e.pointerId){
      const b=drag.body;b.x=clamp(p.x-drag.dx,b.r,world.width-b.r);b.y=clamp(p.y-drag.dy,b.r,world.height-b.r);world.avoid(b);
      const now=performance.now();drag.samples.push({x:b.x,y:b.y,t:now});drag.samples=drag.samples.filter(s=>now-s.t<110).slice(-8);
      requestFrame();if(e.cancelable)e.preventDefault();return;
    }
    stage.classList.toggle('phys-hover',!reduce&&!protectedTarget(e)&&!!world.hit(p.x,p.y));
    if(!reduce&&e.pointerType==='mouse'){
      stage.style.setProperty('--hero-x',((p.x/world.width-.5)*8).toFixed(1)+'px');
      stage.style.setProperty('--hero-y',((p.y/stage.clientHeight-.5)*6).toFixed(1)+'px');
    }
  });
  function release(e,cancelled){
    if(!drag||e.pointerId!==drag.id)return;
    const b=drag.body,samples=drag.samples,first=samples[0],end=samples[samples.length-1],elapsed=(end.t-first.t)/1000;
    if(!cancelled&&elapsed>.008&&performance.now()-end.t<100){
      b.vx=clamp((end.x-first.x)/elapsed,-2200,2200);b.vy=clamp((end.y-first.y)/elapsed,-2200,2200);
    }
    world.dragged=null;drag=null;stage.classList.remove('phys-dragging','phys-hover');ignoreClickUntil=performance.now()+250;requestFrame();
  }
  stage.addEventListener('pointerup',e=>release(e,false));
  stage.addEventListener('pointercancel',e=>release(e,true));
  stage.addEventListener('lostpointercapture',e=>release(e,true));
  stage.addEventListener('pointerleave',()=>{stage.classList.remove('phys-hover');stage.style.setProperty('--hero-x','0px');stage.style.setProperty('--hero-y','0px');});
  stage.addEventListener('touchstart',e=>{
    if(reduce||e.touches.length!==1||protectedTarget(e))return;
    const p=local(e.touches[0]);if(world.hit(p.x,p.y)&&e.cancelable)e.preventDefault();
  },{passive:false});
  stage.addEventListener('click',e=>{
    if(reduce||protectedTarget(e)||performance.now()<ignoreClickUntil||e.detail===0)return;
    const p=local(e);if(p.y<0||p.y>world.height)return;
    world.impulse(p.x,p.y);ripple(p.x,p.y,10);requestFrame();
  });
  if(launchButton)launchButton.addEventListener('click',()=>{world.launch();announce('两个商标已重新抛出，可以在整个首屏拖动。');requestFrame();});
  if(gravityButton)gravityButton.addEventListener('click',()=>{
    world.floating=!world.floating;gravityButton.setAttribute('aria-pressed',String(world.floating));
    gravityButton.textContent=world.floating?'恢复重力':'开启失重';
    if(world.floating)world.bodies.forEach((b,i)=>{b.vy=-220-i*80;b.vx=i?-230:230;});
    announce(world.floating?'失重已开启。':'已恢复重力。');requestFrame();
  });
  if(reduce){
    [launchButton,gravityButton].forEach(b=>{if(b){b.disabled=true;b.title='系统已开启减少动态效果';}});
    const hint=stage.querySelector('.phys-hint');if(hint)hint.textContent='已遵循系统的减少动态效果设置。';
  }
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;if(!visible&&frameId){cancelAnimationFrame(frameId);frameId=0;}
    if(visible){last=performance.now();requestFrame();}
  }).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;drag=null;world.dragged=null;stage.classList.remove('phys-dragging');}else{last=performance.now();requestFrame();}});
  new MutationObserver(()=>{requestFrame();}).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',measure);window.addEventListener('load',measure);
  if(document.fonts)document.fonts.ready.then(measure);
  measure();if(!reduce)world.launch();loadSprite('q',canvas.dataset.qlit);loadSprite('w',canvas.dataset.workbuddy);
  // Read-only diagnostics for local checks.
  window.__kbPhys={bodies:()=>world.bodies.map(({key,x,y,r})=>({key,x,y,r})),floor:()=>world.height,dragging:()=>!!drag};
})(typeof globalThis!=='undefined'?globalThis:this);

