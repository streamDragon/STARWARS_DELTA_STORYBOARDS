# דבורה: חיבור כתיבה לאתר באמצעות ChatGPT

## מה דבורה עושה
היא פותחת את [דבורה המלכה](https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/devora.html), לוחצת **העתק ל־ChatGPT (כולל שמירה באתר)**, מדביקה בצ'אט שלה ומתארת את הסרט. הצ'אט יוצר `CUTSCENE_SCRIPT_V1`, שומר אותו ב־GitHub ומחזיר קישור לפרויקט לאחר בדיקת השמירה.

## חיבור חד-פעמי
1. בעל המאגר נותן לחשבון GitHub האישי של דבורה הרשאת כתיבה ל־`streamDragon/STARWARS_DELTA_STORYBOARDS` ומוודא שהיא אישרה את ההזמנה.
2. דבורה מחברת GitHub מתוך ChatGPT (Settings → Plugins/Apps), נכנסת לחשבון שלה ומאשרת גישה למאגר. אימות דו-שלבי (2FA) מתבצע בשלב הכניסה אם נדרש. אין למסור סיסמה, קוד 2FA או token לצ'אט.
3. הצ'אט בודק שיש לו כלי כתיבה פעילים ולא רק קריאה. אם האינטגרציה מספקת קריאה בלבד, יש לחבר יכולת כתיבה מורשית (למשל סביבת Codex/Work תומכת), אחרת הפרסום אינו אפשרי.

## הוראת עבודה לסוכן
קרא תמיד מחדש את `AGENTS.md`, `workbench/AGENT_PROTOCOL.md`, `workbench/index.json` ואת CURRENT המאומת במאגר `streamDragon/STARWARS_DELTA_STORYBOARDS`, ענף `main`. צור סרט חדש עם מזהה חדש או המשך תיק קיים רק לפי בקשת דבורה. הפק קובץ JSON תקין לפי `CUTSCENE_SCRIPT_V1` והשתמש רק ב־CURRENT וב־handles המותרים. שמור את התוצר ותיק העבודה לפי טרנזקציית Git האטומית המוגדרת בפרוטוקול (בדיקת HEAD ו־revision, בלובים, tree, commit, update-ref לא כפוי עם expected SHA). אמת את ה־commit ואת האינדקס אחרי הכתיבה. החזר SHA וקישור ל־Workbench. אם אין הרשאות כתיבה, החזר UNSYNCED וקובץ JSON והסבר את החסם. אל תציג פרסום GitHub כאילו הוא אישור בניית Unity או Film QA.

## בדיקת חיבור ראשונית, בלי לשנות קבצים
דבורה מדביקה: "בדוק אם ChatGPT שלי יכול לקרוא וגם לכתוב ל־`streamDragon/STARWARS_DELTA_STORYBOARDS`. קרא AGENTS.md ואת workbench/AGENT_PROTOCOL.md. אל תשנה את main כרגע. כתוב לי רק מה מחובר ומה חסר."

**הבהרה:** GitHub Pages קורא קבצים מן המאגר; GitHub אינו מפעיל אוטומטית Unity. אישור שה־JSON הופיע באתר שונה מאישור ייבוא והרצה ב־Unity.
