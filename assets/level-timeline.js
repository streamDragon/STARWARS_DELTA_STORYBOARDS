(function(root){
'use strict';
function project(p,b){return {x:(p.x-b.minX)/(b.maxX-b.minX),y:1-(p.y-b.minY)/(b.maxY-b.minY)};}
function viewport(p,d,t){
 // The playback is a fixed 16:9 game camera. A wider QA capture must not distort world units.
 const camera=d.camera||{x:0,y:0,height:27};
 const height=Number(camera.height)>0?Number(camera.height):27;
 const width=height*1000/562.5;
 const cameraX=(Number(camera.x)||0)+(Number(d.scrollSpeed)||0)*(Number(t)||0);
 return {x:(Number(p.x)-cameraX)/width*1000+500,
         y:((Number(camera.y)||0)-Number(p.y))/height*562.5+281.25};
}
function position(w,t,d){
 let p=w.spawn;if(!p)return null;
 let x=p.x,y=p.y;
 if(w.prediction==='spline'&&w.path?.length>1){
  const lens=[0];let total=0;
  for(let i=1;i<w.path.length;i++){total+=Math.hypot(w.path[i].x-w.path[i-1].x,w.path[i].y-w.path[i-1].y);lens.push(total);}
  let dist=Math.max(0,t-w.at-(w.teleportDelay||0))*Math.max(0,w.speed);
  if(total>0){
   if(w.loop==='PingPong'){dist%=2*total;if(dist>total)dist=2*total-dist;}
   else if(w.loop==='Loop'||w.loop==='LoopEaseInOnce')dist%=total;
   else dist=Math.min(dist,total);
   let i=1;while(i<lens.length-1&&lens[i]<dist)i++;
   const f=(dist-lens[i-1])/(lens[i]-lens[i-1]||1);
   x=w.path[i-1].x+(w.path[i].x-w.path[i-1].x)*f;
   y=w.path[i-1].y+(w.path[i].y-w.path[i-1].y)*f;
  }
  // position() returns world coordinates; viewport() applies Layer0 scroll exactly once.
 }
 return {x,y};
}
function pathDistance(path){
 if(!Array.isArray(path)||path.length<2)return 0;
 let total=0;
 for(let i=1;i<path.length;i++)total+=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y);
 return total;
}
function closedPath(path){
 if(!Array.isArray(path)||path.length<2)return false;
 return Math.hypot(path[0].x-path[path.length-1].x,path[0].y-path[path.length-1].y)<0.25;
}
function activeShips(w,t){
 if(!w.spawn||!Number.isFinite(w.spawn.x)||!Number.isFinite(w.spawn.y))return [];
 const count=Math.min(200,Math.max(0,Math.floor(Number(w.count)||1)));
 const start=(Number(w.at)||0)+(Number(w.teleportDelay)||0);
 const interval=Math.max(0,Number(w.interval)||0);
 const spline=w.prediction==='spline'&&w.path?.length>1;
 const speed=Math.max(0,Number(w.speed)||0);
 const closed=spline&&closedPath(w.path);
 // A spline with distinct endpoints is a single traversal, even when an exported
 // Unity loop mode says "Loop": wrapping would visibly teleport ships to spawn.
 const duration=Number(w.lifetime)>0?Number(w.lifetime):
  spline&&speed>0&&!closed?pathDistance(w.path)/speed:15;
 const result=[];
 for(let i=0;i<count;i++){
  const at=start+i*interval,age=t-at;
  if(age<0||age>duration)continue;
  const individual={...w,at,teleportDelay:0,loop:closed?w.loop:'Once'};
  result.push({index:i,at,position:position(individual,t)});
 }
 return result;
}
root.LevelTimeline={project,viewport,position,activeShips};
if(typeof document==='undefined')return;
root.mountLevelTimeline=async function(host,url){
 const controller=new AbortController();host._dispose=()=>{controller.abort();cancelAnimationFrame(raf);};let raf=0;
 const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Timeline HTTP '+response.status);
 const d=await response.json();if(d.version!=='LEVEL_QA_TIMELINE_V1'||!Array.isArray(d.waves)||!d.bounds)throw Error('Invalid timeline');
 if(!host.isConnected)return;
 const base=new URL(url,location.href),asset=name=>{if(!/^[A-Za-z0-9_.-]+\.(png|webp)$/.test(name))return '';return new URL(name,base).href;};
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
 host.replaceChildren();const title=el('h3','הרמה והגלים לאורך הזמן'),note=el('p','המחשה משוערת לפי נתוני הסצנה. מסלולי NAV, קרבות, חסימות והמתנות בין שלבים אינם מדומים.','timeline-note');
 const stage=el('div',null,'timeline-stage'),image=el('img');const playbackImage=d.sceneName==='GRADIUS_VOLCANO_01'&&d.image==='scene_overview.png'?'scene_overview_playback.png':d.image;image.src=asset(playbackImage);image.alt=d.sceneName+' — רקע גולל בחלון מצלמה קבוע';image.style.display='none';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1000 562.5');svg.style.display='block';svg.style.width='100%';svg.style.aspectRatio='16 / 9';svg.classList.add('timeline-overlay');svg.style.position='relative';svg.setAttribute('aria-label','מצלמה קבועה, רקע גולל וכל הגלים');stage.append(image,svg);
 const controls=el('div',null,'timeline-controls'),play=el('button','▶ נגן'),reset=el('button','חזרה להתחלה'),range=el('input'),readout=el('output');
 play.type=reset.type='button';range.type='range';range.min=0;range.step='0.1';range.value=0;range.setAttribute('aria-label','זמן והתקדמות הרמה');
 const end=Math.max(1,...d.waves.map(w=>w.at+Math.max(0,w.count-1)*Math.max(0,w.interval)+(w.teleportDelay||0)+15));range.max=end;const first=d.waves.find(w=>w.spawn);if(first)range.value=first.at+(first.teleportDelay||0);
 const rate=el('select');rate.setAttribute('aria-label','מהירות הניגון');for(const n of [1,2,5,10]){const opt=el('option','×'+n);opt.value=n;rate.append(opt);}rate.value=5;
 const showAll=el('input');showAll.type='checkbox';showAll.checked=false;const label=el('label','הצג מסלולים ונקודות תכנון (QA)');label.prepend(showAll);
 const showRoads=el('input');showRoads.type='checkbox';const roadsLabel=el('label','דרכי SpriteShape (לא מסלולי אויב)');roadsLabel.prepend(showRoads);
 controls.append(play,reset,range,readout,rate,label,roadsLabel);
 const legend=el('p','מסגרת צהובה קבועה: מצלמת המשחק · הרקע גולל שמאלה · חלליות נעות לפי ה־Spline ויוצאות מהמסך · מסלולי QA לפי בחירה','timeline-note');
 const list=el('div',null,'timeline-waves');const buttons=[];
 const roads=(Array.isArray(d.roads)?d.roads:[]).filter(r=>Array.isArray(r.points)&&r.points.length>1).map(r=>({id:r.id,coords:r.points.filter((v,i)=>i%Math.max(1,Math.ceil(r.points.length/180))===0||i===r.points.length-1).map(v=>project(v,d.bounds)).filter(v=>Number.isFinite(v.x)&&Number.isFinite(v.y))}));
 for(const w of d.waves){const b=el('button',w.id+'. '+w.name+' ×'+w.count+' · '+w.at+' שנ׳');b.type='button';b.title=w.note||'מסלול משוער';b.onclick=()=>{stop();range.value=w.at+(w.teleportDelay||0);draw();};list.append(b);buttons.push([w,b]);}
 host.append(title,note,stage,controls,legend,list);let playing=false,last=0;
 function stop(){playing=false;play.textContent='▶ נגן';cancelAnimationFrame(raf);}
 function S(tag,attrs){const node=document.createElementNS(svg.namespaceURI,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);svg.append(node);return node;}
 function xy(p,t){return viewport(p,d,t);}
 function draw(){
  const t=Number(range.value);readout.textContent=t.toFixed(1)+' שניות / ק״מ משוערים';svg.replaceChildren();
  // Overview image is a world-space map. Move it behind the stationary yellow camera frame.
  const left=xy({x:d.bounds.minX,y:d.bounds.maxY},t),right=xy({x:d.bounds.maxX,y:d.bounds.minY},t);
  S('image',{href:asset(playbackImage),x:left.x,y:left.y,width:right.x-left.x,height:right.y-left.y,preserveAspectRatio:'none'});
  if(showRoads.checked){for(const road of roads){const points=road.coords.map(v=>{const wx=d.bounds.minX+v.x*(d.bounds.maxX-d.bounds.minX),wy=d.bounds.maxY-v.y*(d.bounds.maxY-d.bounds.minY);const q=xy({x:wx,y:wy},t);return q.x.toFixed(1)+','+q.y.toFixed(1);}).join(' ');S('polyline',{points,fill:'none',stroke:'#69c9df','stroke-width':1.15,'stroke-dasharray':'3 6',opacity:0.55,class:'timeline-road'});}}
  // The camera frame is drawn LAST so no ship or image can cover it.
  let unresolved=0;
  for(const [w,b]of buttons){
   const active=activeShips(w,t).length>0;
   b.classList.toggle('current',active);b.setAttribute('aria-pressed',String(active));
   if(!w.spawn){unresolved++;continue;}
   if(showAll.checked&&w.path?.length>1){
    const points=w.path.map(v=>xy(v,t)).map(q=>q.x+','+q.y).join(' ');
    S('polyline',{points,fill:'none',stroke:'#ffd166','stroke-width':1.5,'stroke-dasharray':'5 4',opacity:active?0.65:0.18});
   }
   const ships=activeShips(w,t);
   for(const ship of ships){
    const p=xy(ship.position,t);
    if(p.x<-25||p.x>1025||p.y<-25||p.y>587.5)continue;
    const g=S('g',{opacity:1});
    const dot=document.createElementNS(svg.namespaceURI,'circle');
    for(const[k,v]of Object.entries({cx:p.x,cy:p.y,r:13,fill:'#132336',stroke:'#ffd166','stroke-width':1.6}))dot.setAttribute(k,v);
    g.append(dot);
    if(w.icon){const icon=document.createElementNS(svg.namespaceURI,'image');icon.setAttribute('href',asset(w.icon));icon.setAttribute('x',p.x-12);icon.setAttribute('y',p.y-12);icon.setAttribute('width',24);icon.setAttribute('height',24);g.append(icon);}
    if(showAll.checked){
     const text=document.createElementNS(svg.namespaceURI,'text');
     text.setAttribute('x',p.x+16);text.setAttribute('y',p.y-10);text.setAttribute('fill','#fff');text.setAttribute('font-size',12);
     text.setAttribute('paint-order','stroke');text.setAttribute('stroke','#0b1526');text.setAttribute('stroke-width',3);
     text.textContent=w.id+' #'+(ship.index+1);g.append(text);
    }
    const tip=document.createElementNS(svg.namespaceURI,'title');
    tip.textContent=w.name+' #'+(ship.index+1)+' — '+(w.prediction==='spline'?'מיקום משוער לאורך הספליין':'נקודת הופעה בלבד');
    g.append(tip);
   }
  }
  S('rect',{x:2,y:2,width:996,height:558.5,fill:'none',stroke:'#ffd166','stroke-width':4});
  note.textContent='מצלמה קבועה · גלילת הרקע: '+d.scrollSpeed+' יח׳/שנ׳. הערכה ללא קרבות והמתנות. '+(unresolved?unresolved+' גלים ללא נקודת הופעה מאומתת.':'')+' סקירה: '+new Date(d.generatedUtc).toLocaleString('he-IL');
 }
 function tick(now){if(!playing)return;if(last)range.value=Math.min(end,Number(range.value)+(now-last)/1000*Number(rate.value));last=now;draw();if(Number(range.value)>=end)stop();else raf=requestAnimationFrame(tick);}
 play.onclick=()=>{if(playing){stop();return;}if(Number(range.value)>=end)range.value=0;playing=true;last=0;play.textContent='⏸ עצור';raf=requestAnimationFrame(tick);};
 reset.onclick=()=>{stop();range.value=0;draw();};range.oninput=()=>{stop();draw();};showAll.onchange=draw;showRoads.onchange=draw;draw();
};
})(typeof window==='undefined'?this:window);