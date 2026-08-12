(()=>{
'use strict';
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const qs=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];

function bindPointerGlow(){
  if(reduced)return;
  qsa('.hub-card,.workflow-step,.storyboard-browser-row').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--mx',`${e.clientX-r.left}px`);
      el.style.setProperty('--my',`${e.clientY-r.top}px`);
    },{passive:true});
  });
}

function bindReveal(){
  const nodes=qsa('.hub-card,.storyboard-workflow,.my-storyboards,.storyboard-section,.storyboard-browser-row');
  if(reduced||!('IntersectionObserver'in window)){nodes.forEach(x=>x.classList.add('ui-visible'));return;}
  const io=new IntersectionObserver(entries=>{
    for(const e of entries)if(e.isIntersecting){e.target.classList.add('ui-visible');io.unobserve(e.target)}
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  nodes.forEach(x=>{x.classList.add('ui-reveal');io.observe(x)});
}

function workflowState(){
  const steps=qsa('.workflow-step');
  if(steps.length<4)return;
  const source=qs('#storyboardSourceStatus'),copy=qs('#storyboardCopyStatus'),ret=qs('#storyboardReturnStatus'),request=qs('#storyboardDownloadRequest');
  const sourceGood=source?.classList.contains('good')||(!request?.disabled&&!!request);
  const copied=copy?.classList.contains('good')&&/copied|ready/i.test(copy.textContent||'');
  const returned=ret?.classList.contains('good')&&/success/i.test(ret.textContent||'');
  const completed=[sourceGood,sourceGood,copied,returned];
  let active=completed.findIndex(x=>!x);if(active<0)active=3;
  steps.forEach((s,i)=>{
    s.classList.toggle('complete',!!completed[i]);
    s.classList.toggle('active',i===active&&!completed[i]);
    const n=qs('.step-number',s);if(n)n.setAttribute('aria-label',completed[i]?`Step ${i+1} complete`:`Step ${i+1}`);
  });
}

function observeWorkflow(){
  workflowState();
  const targets=['#storyboardSourceStatus','#storyboardCopyStatus','#storyboardReturnStatus','#storyboardDownloadRequest'].map(qs).filter(Boolean);
  if(!targets.length)return;
  const mo=new MutationObserver(workflowState);
  targets.forEach(t=>mo.observe(t,{attributes:true,childList:true,characterData:true,subtree:true}));
  ['change','click'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(workflowState,20),true));
}

function enhanceHeader(){
  const h=qs('.site-header');if(!h)return;
  let last=window.scrollY;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;h.classList.toggle('compact',y>80);h.classList.toggle('scrolling-down',y>last&&y>180);last=y;
  },{passive:true});
}

function init(){bindPointerGlow();bindReveal();observeWorkflow();enhanceHeader();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();