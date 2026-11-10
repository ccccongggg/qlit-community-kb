'use strict';
const assert=require('node:assert/strict');
const World=require('../themes/butterfly/source/js/hero-physics.js');
// Large impulses must not let a logo escape the full-stage world or tunnel through UI.
for(const [w,h,radii] of [[1363,590,[62,50]],[390,525,[44,36]]]){
 const world=new World(w,h,radii);
 world.obstacles=[{left:24,right:Math.min(580,w-24),top:h-170,bottom:h-120}];
 world.launch();
 const [a,b]=world.bodies;a.x=w*.3;a.y=100;a.vx=-2200;a.vy=1800;
 b.x=w*.7;b.y=100;b.vx=2200;b.vy=1400;
 for(let frame=0;frame<1200;frame++){
  if(frame===150)world.impulse(w*.9,h*.7);
  if(frame===400){world.floating=true;a.vy=-250;b.vy=-320;}
  if(frame===700)world.floating=false;
  world.step(1/60);
  for(const ball of world.bodies){
   assert(Number.isFinite(ball.x)&&Number.isFinite(ball.y));
   assert(ball.x>=ball.r-.01&&ball.x<=w-ball.r+.01,'horizontal escape');
   assert(ball.y>=ball.r-.01&&ball.y<=h-ball.r+.01,'vertical escape');
   assert(!world.obstacles.some(o=>world.overlaps(ball,o)),'logo obscures a control');
  }
 }
}
// The logos can pass to the left side: there is no hidden right-hand wall.
const free=new World(1363,590,[62,50]);free.bodies[0].x=900;free.bodies[0].y=150;free.bodies[0].vx=-800;
for(let i=0;i<35;i++)free.step(1/60);
assert(free.bodies[0].x<600,'right-side restriction returned');
console.log('PASS: full-stage traversal, impulse, gravity toggle, bounded collisions and UI obstacle clearance.');
