(()=>{
  const controls=document.querySelector('.controls');
  if(!controls||document.getElementById('golden40Test'))return;
  const btn=document.createElement('button');
  btn.id='golden40Test';
  btn.className='btn';
  btn.textContent='GOLDEN 40S';
  btn.title='Decisive authoring-vs-preview test using proven CURRENT Simple V1 handles';
  btn.style.borderColor='#8a6f24';
  btn.style.background='#2a2208';
  btn.style.color='#ffd96b';
  const test90=document.getElementById('test');
  if(test90&&test90.parentNode===controls)controls.insertBefore(btn,test90);
  else controls.appendChild(btn);

  btn.onclick=async()=>{
    const old=btn.textContent;
    btn.disabled=true;
    btn.textContent='LOADING...';
    try{
      const r=await fetch('cutscene-preview-golden-40s.json?ts='+Date.now(),{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const text=await r.text();
      if(typeof loadText!=='function')throw new Error('Preview loadText is unavailable');
      loadText(text,'GOLDEN 40S - THE RED ROUTE');
    }catch(e){
      if(typeof drop!=='undefined')drop.textContent='Could not load GOLDEN 40S: '+e.message;
      if(typeof diag!=='undefined')diag.innerHTML='<span class="bad">✕ GOLDEN 40S load failed: '+String(e.message).replace(/[&<>"']/g,'')+'</span>';
    }finally{
      btn.disabled=false;
      btn.textContent=old;
    }
  };

  console.info('[CUTSCENE_PREVIEW] GOLDEN 40S test button ready');
})();