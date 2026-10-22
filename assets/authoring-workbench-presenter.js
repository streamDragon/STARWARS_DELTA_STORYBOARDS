(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AuthoringPresentation=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const stages={BRIEF:'הרעיון',STORYBOARD:'תכנון השוטים',DESIGN:'תכנון השלב',ASSETS:'בחירת חומרים',TARGET_REVIEW:'בדיקת תמונת היעד',AUTHORING:'הכנת הסרט',LEVEL_JSON:'הכנת קובץ השלב',UNITY_BUILD:'בנייה ביוניטי',LEVEL_BUILD:'בניית השלב',QA:'בדיקת התוצאה',LEVEL_QA:'בדיקת השלב',WAVES:'גלים ונקודות הופעה',GAMEPLAY_QA:'בדיקת משחק',REVISION:'תיקונים',COMPLETE:'סיום'};
const statuses={PASS:'עבר',PASS_CLEAN:'עבר',STRICT_PASS_CLEAN:'עבר',COMPLETED:'הושלם',CAPTURED:'צילום שמור',PARTIAL:'הושלם חלקית',FAILED:'לא עבר',FAIL:'לא עבר',ERROR:'נמצאה שגיאה',PLANNING:'בתכנון',IN_PROGRESS:'בעבודה',PENDING:'ממתין להמשך',PENDING_REMOTE:'ממתין לביצוע ביוניטי',NOT_RUN:'טרם בוצע',NOT_TESTED:'טרם נבדק',NOT_RECHECKED:'לא נבדק מחדש',NOT_REVIEWED:'טרם נבדק',REVIEW_REQUIRED:'דרושה בדיקה',IMPLEMENTED_PENDING_USER_REVIEW:'מוכן לעיון',WARNINGS:'יש הערות',READY_WITH_WARNINGS:'מוכן עם הערות',SOURCE_ATTACHED:'המקור צורף',RESOLVED:'טופל',CLOSED:'נסגר',UNKNOWN:'לא תועד',ACCEPTED:'אושר'};
Object.assign(statuses,{IMPORTED_QA_REVIEW_REQUIRED:'ממתין לבדיקת התוצאה',PREPARATION_ONLY:'הכנה בלבד',PREPARED_NATIVE_PENDING:'הוכן · ממתין לביצוע ביוניטי'});
const stageLabel=v=>stages[v]||'שלב לא ידוע';
const statusLabel=v=>statuses[v]||'מצב לא מוכר';
const evidenceName=v=>({REFERENCE:'תמונת השראה או מקור',PLAN:'תכנון / סטוריבורד',ASSET_COMPOSITION:'הרכבה מחומרים',ACTUAL_CAPTURE:'צילום מתוך המערכת',UNKNOWN:'קובץ מצורף'})[v]||'קובץ מצורף';
const openGaps=items=>(items||[]).filter(g=>!['RESOLVED','CLOSED','FIXED','COMPLETE'].includes(String(g?.status||'').toUpperCase())).length;
function advice(s,run){
 const result=(code,title,body,target='details')=>({code,title,body,target});
 if(s.inFlightAction)return result('INSPECT_OPERATION','קודם מבררים מה קרה לפעולה האחרונה','ביומן נרשמה פעולה שנשלחה לביצוע. צריך לבדוק את התוצאה לפני פעולה נוספת.','operation');
 if(s.stage==='COMPLETE')return (s.decisions||[]).some(d=>d.type==='USER_ACCEPTANCE'&&d.accepted===true&&typeof d.reference==='string'&&d.reference.trim())?result('ACCEPTED','הפרויקט הסתיים באישור שלך','אפשר לפתוח את התוצרים וההיסטוריה. שינוי נוסף מתחיל מהתוצאה שנשמרה.','evidence'):result('ACCEPTANCE_MISSING','צריך לתעד אישור סיום','היומן מסומן בסיום, אבל לא נמצא אישור משתמש עם הפניה. לא נסמן את התוצאה כמאושרת.','decisions');
 if(['QA','LEVEL_QA','GAMEPLAY_QA'].includes(s.stage)){
  const runId=run&&(run.id||run.runId);const exact=typeof runId==='string'&&runId.trim()&&(s.runs||[]).find(r=>(r.id||r.runId)===runId);
  if(!exact)return result('SELECT_RUN','בחרו איזו בדיקה לראות','יש לבחור ריצה מדויקת באזור הבדיקות. כך לא מערבבים צילום ישן עם גרסה חדשה.','qa');
  const st=k=>exact[k]??exact[({capture:'captureStatus',technical:'technicalVisualQa',cinematic:'cinematicQa',runtime:'runtimeQa'})[k]]??'NOT_TESTED';
  if(!['PASS','COMPLETED','CAPTURED'].includes(st('capture')))return result('CHECK_CAPTURE','בודקים את הצילום של הריצה','הצילום חסר, חלקי או לא הצליח. צריך לפתוח את פרטי הריצה ולברר מה זמין לפני שמסיקים שהתוצאה מוכנה.','qa');
  if(!['PASS','PASS_CLEAN','STRICT_PASS_CLEAN'].includes(st('technical')))return result('CHECK_TECHNICAL','עוברים על הבדיקה הטכנית','הבדיקה הטכנית של הריצה שנבחרה חסרה או כוללת הערות וכשלים. יש לבדוק את הדוח ולתעד מה טופל; אפשר להמשיך לעבוד על הפרויקט.','qa');
  if(!['PASS','ACCEPTED'].includes(st('cinematic')))return result('REVIEW_VISUAL','בודקים איך התוצאה נראית','יש לעבור על הצילומים של הריצה שנבחרה ולהשוות לתכנון: חיתוכים, תנועה, פנים ותוצאה נראית. בדיקה טכנית שעברה אינה אישור חזותי.','qa');
  if(s.kind==='level'&&s.stage==='LEVEL_QA')return result('WAVES','ממשיכים לגלים ולנקודות הופעה','בדיקת השלב בריצה שנבחרה עברה. השלב הבא הוא הגדרת גלים בכלי Reverse וה־Wave Manager, ואחריהם בדיקת משחק.','details');
  if(!['PASS','ACCEPTED'].includes(st('runtime')))return result('CHECK_RUNTIME','בודקים גם את ההתנהגות בהרצה','הבדיקה החזותית של הריצה שנבחרה עברה. עדיין צריך לבדוק את ההתנהגות בזמן הרצה ולתעד את התוצאה.','qa');
  return result('USER_REVIEW','התוצאה מוכנה לעיון שלך','יש תוצאות בדיקה בריצה שנבחרה. צריך לוודא שהיא תואמת לגרסת התוצר שרוצים לסיים. סיום הפרויקט דורש גם אישור שלך; אין כאן אישור אוטומטי.','decisions');
 }
 const plan={
  BRIEF:['מחדדים מה רוצים ליצור','הסוכן מתחיל מהרעיון המקורי ומתכנן את הרצף או השלב לפני הבנייה.'],
  STORYBOARD:['עוברים על תכנון השוטים','בודקים מה רואים בכל שוט, מה מבינים ממנו ולאן חותכים אחריו.'],
  DESIGN:['עוברים על מבנה השלב','בודקים אזורים, קירות, מעברים, שכבות ומקומות לפעולה.'],
  ASSETS:['בוחרים חומרים קיימים','בודקים נכסים ואנימציות מהקטלוג, ומתעדים מה חסר ומה יופיע כמציין מקום.'],
  TARGET_REVIEW:['משווים לתמונת היעד','מסתכלים על התכנון ועל החומרים שנבחרו לפני שממשיכים לבנייה.'],
  AUTHORING:['מכינים את הסרט לבנייה','הסוכן מכין V1 לפי התכנון ובודק תזמון, חיתוכים ונכסים.'],
  LEVEL_JSON:['מכינים את השלב לבנייה','הסוכן מכין את קובץ Level Builder לפי התכנון והחומרים שנבחרו.'],
  UNITY_BUILD:['בונים ומצלמים ביוניטי','ממשיכים דרך הסטודיו הקיים, שומרים את התוצאה ומצרפים צילום של הריצה המדויקת.'],
  LEVEL_BUILD:['בונים ומצלמים את השלב','ממשיכים דרך Level Builder הקיים ומצרפים צילומי Level QA של התוצאה.'],
  WAVES:['מוסיפים גלים ונקודות הופעה','ממשיכים דרך כלי Reverse וה־Wave Manager הקיימים, ואז בודקים את המשחק.'],
  REVISION:['מתקנים לפי ההשוואה','משווים בין התכנון לתוצאה המתועדת ומתקנים את הפער שנמצא. אין לבנות מחדש מעל תיקונים ידניים.']
 }[s.stage];
 return plan?result(s.stage,...plan):result('UNKNOWN','קוראים את הוראת ההמשך','אין מספיק מידע להמלצה מדויקת. פתחו את פרטי הסוכן ואת התיעוד הקיים.');
}
return {stageLabel,statusLabel,evidenceName,openGaps,advice};
});
