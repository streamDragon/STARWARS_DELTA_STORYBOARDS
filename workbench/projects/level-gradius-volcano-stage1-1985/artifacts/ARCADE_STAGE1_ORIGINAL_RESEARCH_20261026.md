# GRADIUS_ARCADE_STAGE1 — מחקר מקור לשחזור גיימפליי מדויק
**תאריך:** 2026-10-26
**מעמד:** SOURCE_RESEARCH_VERIFIED / SPATIAL_MAPPING_PENDING
**חשוב:** זהו תיק מקורות בלבד. אין עדיין מפת מיקומי אויבים מלאה, אין ייבוא Level Builder, ואין אישור משחק.

## 1. ההגדרה המחייבת של המשימה
- מקור האמת: **Gradius 1985 Arcade, Japanese Gradius, Stage 1: Volcano**, לא NES, לא Gradius III, לא Stage 2 Stonehenge, ולא גרסת Nemesis המערבית.
- סרט ייחוס ראשי (VICIOGAME): https://www.youtube.com/watch?v=WJu9xSRh02g
- הסרט מתחיל Stage 1 ב-00:03 ומתחיל Stage 2 ב-02:34. בצילום המשתמש בזמן 01:53 רואים שני הרי געש משליכים סלעים. אלה עוגני זמן לסרט המסוים, **לא** זמן אירוע אוניברסלי.
- היקף שהוגדר בידי המשתמש: שחזור **אחד-לאחד של הקרקע, תקרה, מגדלים, משגרים, אויבים, מסלולי אויבים, קצב ואירועים** מתחילת Stage 1 ועד **סוף אירוע הרי הגעש**. לא חייבים להמשיך לקרב Big Core. האמנות והאנימציות **מקוריות ומשופרות**, לא העתקת הספרייטים של Konami.
- מבנה הבוס המבוקש בהמשך: גוף יחיד בצורת הר עם שתי פסגות ושני מוצאי `MLB_Gravitation`, נייח. זהו תחליף משחקי מוגדר, **לא** עובדה לגבי מנגנון הבוס המקורי.

## 2. מקורות שנמצאו
| ID | מקור | כתובת | מה אומת |
|---|---|---|---|
| SRC-MAP-ARC-01 | The Spriters Resource, Stage 1 (Arcade), העלאה ב-2026-10-04 | https://www.spriters-resource.com/arcade/gradius/asset/615475/ | מקור מפה בגודל 2304x256, 8.64KB, Arcade — **לא** פורט NES. קישור זוהה, אבל הורדת התמונה עצמה נחסמה ב-403; **אין עדיין פענוח פיקסלים**. |
| SRC-VIDEO-01 | VICIOGAME, Gradius (Arcade) Complete Gameplay | https://www.youtube.com/watch?v=WJu9xSRh02g | פרקי זמן: 00:03 Stage1, 02:34 Stage2; הצילום שסיפק המשתמש ב-01:53 מאשר הרי געש. |
| SRC-VIDEO-02 | Replay Burners, Gradius arcade chapter | https://replayburners.blog.jp/archives/26763820.html | ציר בלתי תלוי: 00:09 Stage1, 01:51 Stage1 Boss, 02:26 Stage2; זמני הרצה שונים! |
| SRC-RULES-01 | StrategyWiki, Stage1 | https://strategywiki.org/wiki/Gradius/Stage_1 | Dogfight קודם לשטח, רוב איומי הקרקע מלמטה, שני הרי געש מתפרצים בו זמנית, סלעים, ואחר כך Big Core. |
| SRC-RULES-02 | Gradius arcade Wiki / Shmups Wiki | https://shmups.wiki/library/Gradius | כלי נשק/קפסולות/Rank/הבדלי Gradius-Nemesis. במערב ההתפרצות קצרה ושכיחות/מיקום אויבים משתנים. |
| SRC-RULES-03 | מדריך יפני מפורט לתחילת השלב | https://yuugikyo-rerise.net/gradius_stage1-4/ | תותחים על רצפה ותקרה, Ducker/Jumper, Hatches המשגרים מטוסים קודם בניצב ואז במאוזן, סלע מרכזי חמוש בלייזרים לפני ההתפרצות, סלעי התפרצות הניתנים להריסה. |
| SRC-RULES-04 | Japanese Stage1 play study | https://ameblo.jp/dbh-washi/entry-12781896346.html | סלע מרחף עם **חמש עמדות ירי**, שינוי צבע הרקע לפני התפרצות, שני הרי געש, Safe zone שמאל-עליון. |
| SRC-RULES-05 | GAME Watch arcade retrospective | https://game.watch.impress.co.jp/docs/kikaku/1503807.html | בגרסת ארקייד Stage1 ההרים הפעילים רק בסוף; Stage2 הוא Stonehenge, והוא שונה לחלוטין. |
| SRC-RULES-06 | GAME Watch (פורט PC Engine) | https://game.watch.impress.co.jp/docs/feature/1240367.html | תיאור סיקוונס: עצירת גלילה לפני התפרצות שתי פסגות, סיום מתקפת סלעים, Big Core. מקור זה עוסק בפורט; חייבים לאמת בארקייד לפני קביעת פרמטרים. |
| SRC-ENEMIES-01 | Volcano stage enemy catalog | https://gradius.fandom.com/wiki/Volcano_%28Gradius%29 | Fan, Rugal, Garun, Uros, Dee-01, Dagumu Hatch, Ducker, Rush, Jumper; 2 volcanoes, Big Core after. |
| SRC-NES-EXCLUDE | Map of NES Stage 1 | https://vgmaps.de/maps/view?m=2772 | **לא מקור למיקומי ה-Arcade!** |
| SRC-MOBY | Arcade screenshots | https://www.mobygames.com/game/4512/gradius/screenshots/arcade/ | קובצי צילום ארקייד 256x224, מועיל לקנה מידה חזותי. |

## 3. סדר האירועים המקורי לפי המקורות (לא מרחקים שהומצאו)
A. **Pre-stage Dogfight**: חלל פתוח, קבוצות אויבים, קפסולות כוח. עדיין אין מגדלי שטח.
B. **Terrain Entry**: קרקע מלמטה ותקרה מלמעלה; תותחים נייחים ורובוטים רצים/קופצים לאורך צורת השטח.
C. **Hatch corridor**: משגרים על הקרקע ועל התקרה מוציאים קבוצות חלליות; אין סיבה להניח Spawn חופשי במלבן המשחק שלנו. צריך לשמור על מקור שיגור יחסית למשגר ובזמן שנמדד.
D. **Armed floating rock**: סלע מרחף מרכזי עם חמישה מקורות ירי לייזר; חוסם/משנה את מסלול הטיסה לפני אירוע ההרים.
E. **Twin Volcano Eruption**: שני הרי געש על הקרקע; רקע הופך אדמדם, הגלילה נעצרת, שתי פסגות משגרות סלעים במסלולים מעופפים/בליסטיים. סלעים ניתנים להשמדה. אירוע מתוזמן/מצבי, לא גל אויבים רגיל.
F. **Original arcade only after user's target end:** התפרצות מסתיימת ואז Big Core. **לפי בקשת המשתמש אנו עוצרים בסיום אירוע הרי הגעש**, ומותר לבחור בבוס הר משותף כתחליף לאחר התאמת מכניקה.

## 4. מיפוי אויבי מקור -> תפקיד פונקציונלי
| מקור | תפקיד מדויק מחויב | אופן מיפוי |
|---|---|---|
| Dee-01 | תותח נייח צמוד גאומטריה עליון/תחתון | entity static with exact X,Y, surface, facing, HP, firing cadence |
| Dagumu Hatch | שיגור רציף/מתוזמן של אויבים, במקום מוגדר במפה | world-position and local launch anchor, door event, per-ship path |
| Ducker | תותח דו-רגלי נייד **על גאומטריה** (גם בתקרה) | terrain-follow movement, relative to player, stop/shoot/move |
| Jumper | אויב נע בקפיצות/תמרונים | precise route/timing after video analysis |
| Fan/Rugal/Garun/Rush/Uros | טייסות אוויר | individual spawn order, screen entry position, count, paths |
| Armed floating rock | מכשול שאינו רק רקע, עם 5 לייזרים | collision profile + five firing anchors |
| 2 Volcanoes | מפגע סביבתי מתוזמן עם התקפות בנות השמדה | two eruption points; freeze scrolling; trajectory and duration |

## 5. כללי שחזור קואורדינטות והוכחה (חובה לפני LevelBuilder)
1. לחלץ/לצפות בפועל במפת הארקייד 2304x256. **כרגע ידוע רק גודל הקובץ, לא פוענחו מיקומי האלמנטים**.
2. לייצר מזה עמודות שטח topBoundary(x), bottomBoundary(x), בקואורדינטת מקור במפה, ואובייקטי סטטיים עם anchor:
   `{sourceId, originalMapX, originalMapY, surface: TOP|BOTTOM|FLOATING, facing, atlasFrameId, evidenceFrame, confidence}`.
3. לבחור עוגן וידאו תואם למפה, לכייל PixelScrollPerFrame ו־OriginalVideoTime; **לא** להמיר אוטומטית 2304px ל-210KM או 125KM. היקף השלב באורך ק"מ טרם נמדד.
4. לחלץ מתוך סרט הארקייד האחד בזמן אחיד לכל Spawn:
   `{videoTime, originalScreenX, originalScreenY, enemyType, count, formation, route, arrivalOrder, firing, dynamicOrFixed, evidenceFrame}`.
5. למפות עצירת גלילה כ־`scrollMode=PAUSED_VOLCANO`, אחריה `VOLCANO_ERUPTION_ACTIVE`, ואז `VOLCANO_EVENT_CLEAR`. למשחק שלנו סיום כאן, ללא Big Core.
6. לקבע Virtual Reference Viewport בנפח תצוגת Gradius הנכון. סקיצה של Unity עם PlayerBounds רחב יותר **אינה** הוכחה לשחזור מיקומים; יש למדוד כניסה למסך שממנו השחקן רואה את האויבים.
7. Rank/PowerUps משנים קצב וירי. קודם לשחזר במסלול קבוע את ה-run הספציפי בסרט; לאחר מכן, אם רוצים התאמה דינמית, להוסיף Rank/PowerUp כך שלא ישנה את הגיאומטריה הממופה.
8. כל מיקום חייב לציין רמת הוכחה: VERIFIED_MAP_PIXEL, VERIFIED_VIDEO_FRAME, SUPPORTED_MECHANIC, HYPOTHESIS_ONLY. אין להנפיק X/Y דמיוניים.

## 6. מה עדיין חסר, ואסור להציג כידוע
- התמונה המלאה של מפת הארקייד 2304x256 לא הורדה עקב HTTP 403; לכן **אין עדיין טבלת X/Y אמיתית** למגדלים ולמסלולים.
- לא חולצו פריימים רציפים מסרט YouTube. לכן **אין עדיין מיקומים מדויקים, מספר מגדלים, ספירת טייסות לכל קטע או תזמון פתיחת דלתות**.
- לא נמדד קצב Scroll בפיקסלים/שנייה.
- לא נמדדו זוויות, מהירויות, כמות ואקראיות הסלעים בהר.
- לא אומתה התאמה אחד-לאחד של מכניקות Rank/PowerUps.
- טיוטות ה־210KM וה־125KM וכן 15 גלים מקומיים הם קונספטים בלבד, **לא** מיפוי ארקייד. לא להשתמש בהם כבסיס לבנייה עד מדידה.
- לא נוצרה סצנת `GRADIUS_VOLCANO_01.unity`, ולא רץ Play QA כחלק מהמחקר.

## 7. אמנות ובנייה
- רק לאחר השלמת מפת המקור: להפיק ארט מקורי עכשווי, בלי להעתיק ספרייטים. שלוש אנימציות: CUTE turret idle/open/fire/recoil; hangar closed/opening/launch/closing; volcano eruption anticipation/burst/cooldown.
- להשתמש במנועי המשחק הקיימים: `TOWER_MISSILES_CUTE`, `TOWER_SHIP_SPAWNER_WHITE`, `MLB_Gravitation`, Enemy/Spline, SpriteShape, WavesManager.
- קודם עוגני הסצנה והגאומטריה ב־Level Builder, רק אחר כך Reverse Wave Authoring. לא לעבור Build gate עד שיש טבלת מקור עם ראיות וצילום QA.

**תוצאת המחקר:** VERIFIED MECHANICS + VERIFIED STAGE IDENTITY, BUT EXACT SPATIAL/TIMING REPRODUCTION NOT YET PROVEN.
