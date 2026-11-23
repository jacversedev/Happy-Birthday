(function(){
const $=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- THREE SCENE ---------- */
const renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(50,1,.1,100);camera.position.z=9;
scene.add(new THREE.AmbientLight(0xffffff,.75));
const key=new THREE.PointLight(0xffc2dc,1.5,40);key.position.set(4,5,8);scene.add(key);
const rim=new THREE.PointLight(0xf3c677,1,40);rim.position.set(-6,-3,5);scene.add(rim);

let vw=6;
function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  vw=2*camera.position.z*Math.tan(THREE.MathUtils.degToRad(25))*camera.aspect;
  layoutRing();
}

/* hearts + balloons */
function heartGeo(){
  const s=new THREE.Shape();
  s.moveTo(0,.25);s.bezierCurveTo(0,.25,-.05,0,-.25,0);s.bezierCurveTo(-.55,0,-.55,.35,-.55,.35);
  s.bezierCurveTo(-.55,.55,-.35,.77,0,.95);s.bezierCurveTo(.35,.77,.55,.55,.55,.35);
  s.bezierCurveTo(.55,.35,.55,0,.25,0);s.bezierCurveTo(.1,0,0,.25,0,.25);
  return new THREE.ExtrudeGeometry(s,{depth:.25,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:3,curveSegments:16}).center();
}
const HG=heartGeo(),BG=new THREE.SphereGeometry(.5,24,24);
const pal=[0xff5c9a,0xff8fb8,0xffc2dc,0xf3c677,0xffffff,0xd96bd0];
const floaters=[];
function rnd(a,b){return a+Math.random()*(b-a)}
for(let i=0;i<30;i++){
  const balloon=i%3===0;
  const m=new THREE.Mesh(balloon?BG:HG,new THREE.MeshStandardMaterial({color:pal[i%pal.length],metalness:.25,roughness:.3}));
  const sc=balloon?rnd(.6,1):rnd(.25,.55);
  m.scale.set(sc,balloon?sc*1.25:sc,sc);
  m.position.set(rnd(-1,1),rnd(-9,9),rnd(-5,2));
  m.userData={fx:rnd(-1,1),sp:rnd(.4,1.1)*(balloon?.8:1),rs:rnd(.4,1.4),ph:rnd(0,6.28)};
  scene.add(m);floaters.push(m);
}

/* confetti */
const CN=600,cp=new Float32Array(CN*3),cv=new Float32Array(CN*3),cc=new Float32Array(CN*3);
const cgeo=new THREE.BufferGeometry();
for(let i=0;i<CN;i++){const c=new THREE.Color(pal[i%pal.length]);cc.set([c.r,c.g,c.b],i*3);cp[i*3+1]=-50}
cgeo.setAttribute('position',new THREE.BufferAttribute(cp,3));
cgeo.setAttribute('color',new THREE.BufferAttribute(cc,3));
const confetti=new THREE.Points(cgeo,new THREE.PointsMaterial({size:.14,vertexColors:true,transparent:true,opacity:.95}));
confetti.frustumCulled=false;scene.add(confetti);
function burst(){
  for(let i=0;i<CN;i++){
    cp.set([rnd(-.5,.5),-3,3],i*3);
    const a=rnd(0,6.28),s=rnd(.06,.22);
    cv.set([Math.cos(a)*s*1.4,rnd(.12,.34),Math.sin(a)*s*.5],i*3);
  }
}

/* 3D title (layered planes = extruded look) */
const title=new THREE.Group();title.visible=false;scene.add(title);
const TW=1024,TH=900;
async function buildTitle(){
  try{await Promise.all([document.fonts.load('italic 600 100px "Playfair Display"'),document.fonts.load('100px "Great Vibes"')])}catch(e){}
  const lines=[['italic 600 175px "Playfair Display", serif','Happy',210],['250px "Great Vibes", cursive','Birthday',440],['200px "Great Vibes", cursive','dear Bestie',680]];
  function draw(front){
    const c=document.createElement('canvas');c.width=TW;c.height=TH;const x=c.getContext('2d');
    x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
    lines.forEach(([f,t,y])=>{
      x.font=f;
      if(front){
        x.lineWidth=12;x.strokeStyle='#c2467f';x.strokeText(t,TW/2,y);
        const g=x.createLinearGradient(0,y-100,0,y+100);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffb3d1');x.fillStyle=g;
      }else{x.lineWidth=16;x.strokeStyle='#7a2457';x.strokeText(t,TW/2,y);x.fillStyle='#7a2457'}
      x.fillText(t,TW/2,y);
    });
    const tex=new THREE.CanvasTexture(c);tex.anisotropy=8;return tex;
  }
  const back=draw(false),front=draw(true),geo=new THREE.PlaneGeometry(1,TH/TW);
  for(let i=0;i<12;i++){
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:back,alphaTest:.45}));
    m.position.z=-i*.012;title.add(m);
  }
  const f=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:front,alphaTest:.45}));
  f.position.z=.02;title.add(f);
}
buildTitle();

/* pointer parallax */
let mx=0,my=0;
addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2});

/* ---------- 3D CAROUSEL (CSS 3D) ---------- */
const N=8,ring=$('ring'),stage=$('stage');
for(let i=1;i<=N;i++){
  const d=document.createElement('div');d.className='card';
  const im=new Image();im.src='assets/'+i+'.jpg';im.alt='Birthday wish '+i;im.draggable=false;
  im.addEventListener('click',()=>{if(moved<6)openLB(im.src)});
  im.addEventListener('error',()=>{if(!im.dataset.f){im.dataset.f=1;im.src=i+'.jpg'}});
  d.appendChild(im);ring.appendChild(d);
}
function layoutRing(){
  const cw=ring.offsetWidth||200,R=cw/2/Math.tan(Math.PI/N)+14;
  ring.dataset.r=R;
  [...ring.children].forEach((c,i)=>c.style.transform='rotateY('+(i*360/N)+'deg) translateZ('+R+'px)');
}
let ang=0,vel=0,drag=false,lastX=0,moved=0;
stage.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;moved=0});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lastX;lastX=e.clientX;moved+=Math.abs(dx);vel=dx*.3;ang+=vel});
addEventListener('pointerup',()=>{drag=false});
addEventListener('pointercancel',()=>{drag=false});

/* lightbox */
const lb=$('lb');
function openLB(src){$('lbImg').src=src;lb.classList.remove('hide')}
lb.addEventListener('click',()=>lb.classList.add('hide'));

/* ---------- FLOW ---------- */
const audio=$('wish'),gate=$('gate'),gallery=$('gallery'),next=$('next'),snd=$('snd');
audio.addEventListener('error',()=>{if(!audio.dataset.f){audio.dataset.f=1;audio.src='wish.mp3';audio.load();if(phase==='title')audio.play().catch(()=>{})}});
let phase='gate',tStart=0,titleOut=1;
function start(){
  if(phase!=='gate')return;
  phase='title';tStart=performance.now()/1000;
  gate.classList.add('hide');snd.classList.remove('hide');
  title.visible=true;burst();
  audio.currentTime=0;audio.play().catch(()=>{});
  setTimeout(()=>next.classList.remove('hide'),6000);
  audio.addEventListener('ended',()=>setTimeout(toGallery,1500),{once:true});
}
function toGallery(){
  if(phase!=='title')return;
  phase='gallery';next.classList.add('hide');gallery.classList.remove('hide');burst();layoutRing();
}
$('openBtn').addEventListener('click',start);
next.addEventListener('click',toGallery);
snd.addEventListener('click',()=>{audio.muted=!audio.muted;snd.textContent=audio.muted?'🔇':'🔊'});

/* ---------- LOOP ---------- */
const easeBack=t=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
let last=performance.now();
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min((now-last)/1000,.05);last=now;const t=now/1000;
  floaters.forEach(m=>{
    const u=m.userData;
    m.position.y+=u.sp*dt;m.position.x+=Math.sin(t*.8+u.ph)*.004;
    m.rotation.y+=u.rs*dt;m.rotation.x=Math.sin(t+u.ph)*.25;
    if(m.position.y>9){m.position.y=-9;m.position.x=rnd(-vw/2-1,vw/2+1)}
  });
  for(let i=0;i<CN;i++){
    const j=i*3;if(cp[j+1]<-20)continue;
    cv[j+1]-=.005;cv[j]*=.992;cv[j+2]*=.992;
    cp[j]+=cv[j]+Math.sin(t*3+i)*.003;cp[j+1]+=cv[j+1];cp[j+2]+=cv[j+2];
    if(cp[j+1]<-9)cp[j+1]=-50;
  }
  cgeo.attributes.position.needsUpdate=true;
  if(title.visible){
    const base=Math.min(7.4,vw*.94);
    let e=1,spin=0;
    if(phase==='title'){const p=Math.min((t-tStart)/1.8,1);e=easeBack(p);spin=(1-p)*Math.PI*4}
    else if(phase==='gallery'){titleOut=Math.max(titleOut-dt*1.6,0);e=titleOut;if(!titleOut)title.visible=false}
    title.scale.setScalar(Math.max(base*e,.001));
    title.rotation.y=spin+(reduce?0:Math.sin(t*.7)*.28)+mx*.25;
    title.rotation.x=my*.12;
    title.position.y=Math.sin(t*1.2)*.12+(vw<5?.6:.3);
  }
  camera.position.x+=(mx*.4-camera.position.x)*.04;camera.lookAt(0,0,0);
  if(phase==='gallery'){
    if(!drag){vel*=.94;ang+=vel+(reduce?0:.14)}
    ring.style.transform='translateZ(-'+(ring.dataset.r||300)+'px) rotateY('+ang+'deg)';
  }
  renderer.render(scene,camera);
}
addEventListener('resize',resize);resize();requestAnimationFrame(loop);
})();
