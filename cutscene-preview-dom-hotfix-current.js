(()=>{
  if(typeof ph!=='function')return;
  const previousPh=ph;
  ph=function(text,x=.5,y=.5,w=.2){
    const before=stage?.lastElementChild||null;
    const result=previousPh(text,x,y,w);
    if(result instanceof Node)return result;
    const after=stage?.lastElementChild||null;
    if(after&&after!==before&&after.classList?.contains('ph'))return after;
    const e=document.createElement('div');
    e.className='ph';
    e.style.left=(x*100)+'%';
    e.style.top=((1-y)*100)+'%';
    e.style.width=(w*100)+'%';
    e.textContent=text;
    stage.appendChild(e);
    return e;
  };

  const originalAppend=Element.prototype.appendChild;
  const safeMove=(parent,node)=>{
    if(node instanceof Node)return originalAppend.call(parent,node);
    console.warn('[CUTSCENE_PREVIEW] prevented invalid appendChild payload',node);
    return null;
  };

  // Do not monkey-patch appendChild globally. Expose only a diagnostic helper for future patches.
  window.__cutsceneSafeAppend=safeMove;
  console.info('[CUTSCENE_PREVIEW] DOM placeholder hotfix ready');
})();