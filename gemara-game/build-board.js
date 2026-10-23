(()=>{"use strict";
const $=id=>document.getElementById(id);
const glyphs={demo:"✦",village:"⌂",beit:"✡",birds:"♧",shooter:"◎",atlas:"⌘"};
const stageLabels={verified:"נבדק",qa:"נדרש QA",implementation:"בפיתוח",integration:"חיבור בפיתוח"};
let board=null;
function el(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x;}
function statCard(x){
 const card=el("article","stat");
 card.append(el("div","value",x.value),el("div","title",x.label),el("div","sub",x.note));
 return card;
}
function buildCard(item){
 const article=el("article","build-card");article.id="build-"+item.id;
 const visual=el("div","card-visual");
 if(item.image){
  const image=document.createElement("img");image.src="./"+item.image;image.alt="צילום Unity אמיתי: "+item.name;image.loading="lazy";
  image.onerror=()=>{image.remove();visual.prepend(el("div","no-image","הצילום אינו זמין בגרסה שפורסמה."));};
  visual.append(image,el("span","photo-source","צילום מתוך Unity"));
 }else{
  const missing=el("div","no-image");
  missing.append(el("span","illustration",glyphs[item.id]||"◫"),el("span","",item.group==="built"?"צילום סצנה מאומת עדיין לא פורסם":"תמונת משחק עוד לא צולמה"));
  visual.append(missing);
 }
 visual.append(el("span","card-tag "+item.stage,item.stageLabel||stageLabels[item.stage]||"בפיתוח"));
 article.append(visual);
 const body=el("div","card-body");
 body.append(el("div","card-subtitle",item.group==="built"?"UNITY / SCENE":"GAME / DEVELOPMENT"));
 body.append(el("h3","",item.name),el("p","card-description",item.short));
 const pills=el("div","feature-pills");
 for(const f of item.features||[])pills.append(el("span","",f));
 body.append(pills);
 const proof=el("div","card-proof");
 proof.append(el("strong","","מה הוכח בפועל"),el("p","",item.proof));
 proof.append(el("strong","","הצעד הבא"),el("p","",item.next));
 const details=document.createElement("details");
 details.append(el("summary","","נתיב הקובץ בפרויקט"),el("code","scene-path",item.scene));
 proof.append(details);body.append(proof);
 if(item.link){const a=el("a","card-link","פתח את החלק שבנינו באתר ↗");a.href="./"+item.link;body.append(a);}
 article.append(body);
 return article;
}
function renderGallery(items){
 const gallery=$("gallery");gallery.replaceChildren();
 for(const item of items.filter(x=>x.group==="built")){
  if(item.image){
   const entry=el("article","gallery-entry");
   const btn=el("button","gallery-button");btn.type="button";
   btn.setAttribute("aria-label","הגדל צילום "+item.name);
   const im=document.createElement("img");im.src="./"+item.image;im.alt=item.imageLabel||item.name;im.loading="lazy";
   btn.append(im);btn.addEventListener("click",()=>showImage(im.src,item.imageLabel||item.name));
   const caption=el("div","gallery-caption");
   caption.append(el("h3","",item.name),el("p","",item.imageLabel||"צילום מתוך Unity"));
   entry.append(btn,caption);gallery.append(entry);
  }else{
   const missing=el("article","gallery-placeholder");
   missing.append(el("span","",glyphs[item.id]||"◫"),el("strong","",item.name),
    el("p","","הסצנה קיימת, אבל צילום מתוך Unity עדיין לא אומת. לא מציגים תמונת חנות במקומה."));
   gallery.append(missing);
  }
 }
}
function showImage(src,caption){
 const box=$("lightbox");$("lightboxImage").src=src;$("lightboxImage").alt=caption;
 $("lightboxCaption").textContent=caption;
 if(typeof box.showModal==="function")box.showModal();else window.open(src,"_blank","noopener");
}
function render(){
 $("asOf").textContent="נכון ל־"+board.asOf+" · תמונת מצב סטטית מתוך פרויקט Unity";
 $("stats").replaceChildren(...(board.indicators||[]).map(statCard));
 $("builtGrid").replaceChildren(...board.items.filter(x=>x.group==="built").map(buildCard));
 $("workGrid").replaceChildren(...board.items.filter(x=>x.group==="work").map(buildCard));
 renderGallery(board.items);
 const tasks=$("tasks");tasks.replaceChildren();
 (board.nextTasks||[]).forEach((item,i)=>{
  const card=el("article","task"),content=el("div","");
  content.append(el("h3","",item.title),el("p","",item.detail));
  content.append(el("span","task-status",item.state==="blocked"?"חסום עד להשלמת תנאי הבדיקה":item.state==="work"?"בעבודה":"המשימה הבאה"));
  card.append(el("span","task-num",String(i+1).padStart(2,"0")),content);tasks.append(card);
 });
}
async function load(){
 try {
  const response=await fetch("./data/build-board.json?ts="+Date.now(),{cache:"no-store"});
  if(!response.ok)throw new Error("HTTP "+response.status);
  const data=await response.json();
  if(data.schema!=="GEMARA_GAME_BUILD_BOARD"||!Array.isArray(data.items))throw new Error("שגיאת פורמט נתונים");
  board=data;render();
 } catch(error){
  $("stats").replaceChildren(el("div","error","קובץ הסטטוס לא זמין. פתח את האתר דרך שרת HTTP או GitHub Pages."));
  $("builtGrid").replaceChildren(el("div","error","לא ניתן לטעון את הבנייה: "+error.message));
  $("workGrid").replaceChildren();$("gallery").replaceChildren();
 }
}
$("reload").addEventListener("click",load);
$("closeLightbox").addEventListener("click",()=>$("lightbox").close());
$("lightbox").addEventListener("click",e=>{if(e.target===$("lightbox"))$("lightbox").close()});
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>{
 document.querySelectorAll(".main-nav a").forEach(x=>x.classList.toggle("active",x===a));
}));
load();
})();