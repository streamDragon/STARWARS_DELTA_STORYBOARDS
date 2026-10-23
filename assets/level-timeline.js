(function(root){
'use strict';
function project(p,b){return {x:(p.x-b.minX)/(b.maxX-b.minX),y:1-(p.y-b.minY)/(b.maxY-b.minY)};}
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
  x+=d.scrollSpeed*t;
 }else if(!w.layerAttached)x+=d.scrollSpeed*t;
 return {x,y};
}
root.LevelTimeline={project,position};
if(typeof document==='undefined')return;
root.mountLevelTimeline=async function(host,url){
 const controller=new AbortController();host._dispose=()=>{controller.abort();cancelAnimationFrame(raf);};let raf=0;
 const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Timeline HTTP '+response.status);
 const d=await response.json();if(d.version!=='LEVEL_QA_TIMELINE_V1'||!Array.isArray(d.waves)||!d.bounds)throw Error('Invalid timeline');
 if(!host.isConnected)return;
 const base=new URL(url,location.href),asset=name=>{if(!/^[A-Za-z0-9_.-]+\.(png|webp)$/.test(name))return '';return new URL(name,base).href;};
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
 host.replaceChildren();const title=el('h3','הרמה והגלים לאורך הזמן'),note=el('p','המחשה משוערת לפי נתוני הסצנה. מסלולי NAV, קרבות, חסימות והמתנות בין שלבים אינם מדומים.','timeline-note');
 const stage=el('div',null,'timeline-stage'),image=el('img');image.src=asset(d.image);image.alt=d.sceneName+' — צילום הרמה';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1000 562.5');svg.classList.add('timeline-overlay');svg.setAttribute('aria-label','חלון המשחק ונקודות הופעת הגלים');stage.append(image,svg);
 const controls=el('div',null,'timeline-controls'),play=el('button','▶ נגן'),reset=el('button','חזרה להתחלה'),range=el('input'),readout=el('output');
 play.type=reset.type='button';range.type='range';range.min=0;range.step='0.1';range.value=0;range.setAttribute('aria-label','זמן והתקדמות הרמה');
 const end=Math.max(1,...d.waves.map(w=>w.at+Math.max(0,w.count-1)*Math.max(0,w.interval)+(w.teleportDelay||0)+15));range.max=end;const first=d.waves.find(w=>w.spawn);if(first)range.value=first.at+(first.teleportDelay||0);
 const rate=el('select');rate.setAttribute('aria-label','מהירות הניגון');for(const n of [1,2,5,10]){const opt=el('option','×'+n);opt.value=n;rate.append(opt);}rate.value=5;
 const showAll=el('input');showAll.type='checkbox';const label=el('label','כל נקודות ההופעה והמסלולים');label.prepend(showAll);
 const showRoads=el('input');showRoads.type='checkbox';const roadsLabel=el('label','דרכי SpriteShape (לא מסלולי אויב)');roadsLabel.prepend(showRoads);
 controls.append(play,reset,range,readout,rate,label,roadsLabel);
 const legend=el('p','מסגרת תכלת: אזור המשחק · זהב: הופעה במועד שנבחר · קו מקווקו: מסלול מתוכנן · סימן ללא תנועה: הופעה ב־15 השניות האחרונות בלבד','timeline-note');
 const list=el('div',null,'timeline-waves');const buttons=[];
 const roads=(Array.isArray(d.roads)?d.roads:[]).filter(r=>Array.isArray(r.points)&&r.points.length>1).map(r=>({id:r.id,coords:r.points.filter((v,i)=>i%Math.max(1,Math.ceil(r.points.length/180))===0||i===r.points.length-1).map(v=>project(v,d.bounds)).filter(v=>Number.isFinite(v.x)&&Number.isFinite(v.y))}));
 for(const w of d.waves){const b=el('button',w.id+'. '+w.name+' ×'+w.count+' · '+w.at+' שנ׳');b.type='button';b.title=w.note||'מסלול משוער';b.onclick=()=>{stop();range.value=w.at+(w.teleportDelay||0);draw();};list.append(b);buttons.push([w,b]);}
 host.append(title,note,stage,controls,legend,list);let playing=false,last=0;
 function stop(){playing=false;play.textContent='▶ נגן';cancelAnimationFrame(raf);}
 function S(tag,attrs){const node=document.createElementNS(svg.namespaceURI,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);svg.append(node);return node;}
 function xy(p){const q=project(p,d.bounds);return {x:q.x*1000,y:q.y*562.5};}
 function draw(){
  const t=Number(range.value);readout.textContent=t.toFixed(1)+' שניות / ק״מ משוערים';svg.replaceChildren();
  if(showRoads.checked){const dx=1000*d.scrollSpeed*t/(d.bounds.maxX-d.bounds.minX||1);for(const road of roads){const points=road.coords.map(v=>(v.x*1000+dx).toFixed(1)+','+(v.y*562.5).toFixed(1)).join(' ');S('polyline',{points,fill:'none',stroke:'#69c9df','stroke-width':1.15,'stroke-dasharray':'3 6',opacity:0.55,class:'timeline-road'});}}
  const c=d.camera;if(c){const p=xy({x:c.x-c.width/2+d.scrollSpeed*t,y:c.y+c.height/2});S('rect',{x:p.x,y:p.y,width:c.width/(d.bounds.maxX-d.bounds.minX)*1000,height:c.height/(d.bounds.maxY-d.bounds.minY)*562.5,fill:'#67dcff18',stroke:'#7ce3ff','stroke-width':2});}
  let unresolved=0;
  for(const [w,b]of buttons){
   const start=w.at+(w.teleportDelay||0),active=t>=start&&t<=start+Math.max(0,w.count-1)*w.interval+(w.lifetime>0?w.lifetime:(w.prediction==='spline'?end:15));
   b.classList.toggle('current',active);b.setAttribute('aria-pressed',String(active));
   if(!active&&!showAll.checked)continue;
   if(!w.spawn){unresolved++;continue;}
   const when=showAll.checked&&!active?start:t;
   // Unknown motion is shown at its time-of-arrival position only, never as a live stationary enemy.
   const p=xy(position(w,w.prediction==='spline'?when:start,d));
   if(w.path?.length>1){const points=w.path.map(v=>xy({x:v.x+d.scrollSpeed*when,y:v.y})).map(q=>q.x+','+q.y).join(' ');S('polyline',{points,fill:'none',stroke:'#ffd166','stroke-width':1.5,'stroke-dasharray':'5 4',opacity:active?0.8:0.25});}
   if(p.x<0||p.x>1000||p.y<0||p.y>562.5){unresolved++;continue;}
   const g=S('g',{opacity:active?1:0.4});const dot=document.createElementNS(svg.namespaceURI,'circle');for(const[k,v]of Object.entries({cx:p.x,cy:p.y,r:13,fill:'#132336',stroke:'#ffd166','stroke-width':2}))dot.setAttribute(k,v);g.append(dot);
   if(w.icon){const icon=document.createElementNS(svg.namespaceURI,'image');icon.setAttribute('href',asset(w.icon));icon.setAttribute('x',p.x-12);icon.setAttribute('y',p.y-12);icon.setAttribute('width',24);icon.setAttribute('height',24);g.append(icon);}
   const text=document.createElementNS(svg.namespaceURI,'text');text.setAttribute('x',p.x+17);text.setAttribute('y',p.y-9);text.setAttribute('fill','#fff');text.setAttribute('font-size',12);text.setAttribute('paint-order','stroke');text.setAttribute('stroke','#0b1526');text.setAttribute('stroke-width',3);text.textContent=w.id+' · ×'+w.count;g.append(text);
   const tip=document.createElementNS(svg.namespaceURI,'title');tip.textContent=w.name+' — '+(w.prediction==='spline'?'מיקום משוער לאורך הספליין':'נקודת הופעה בלבד')+(w.note?' · '+w.note:'');g.append(tip);
  }
  note.textContent='מהירות גלילה מהסצנה: '+d.scrollSpeed+' יח׳/שנ׳. הערכה ללא קרבות והמתנות. '+(unresolved?unresolved+' גלים בתצוגה ללא מיקום פתור או מחוץ לצילום.':'')+' סקירה: '+new Date(d.generatedUtc).toLocaleString('he-IL');
 }
 function tick(now){if(!playing)return;if(last)range.value=Math.min(end,Number(range.value)+(now-last)/1000*Number(rate.value));last=now;draw();if(Number(range.value)>=end)stop();else raf=requestAnimationFrame(tick);}
 play.onclick=()=>{if(playing){stop();return;}if(Number(range.value)>=end)range.value=0;playing=true;last=0;play.textContent='⏸ עצור';raf=requestAnimationFrame(tick);};
 reset.onclick=()=>{stop();range.value=0;draw();};range.oninput=()=>{stop();draw();};showAll.onchange=draw;showRoads.onchange=draw;draw();
};
})(typeof window==='undefined'?this:window);