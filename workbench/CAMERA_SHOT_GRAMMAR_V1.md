# מערכת 4: דקדוק תנועות מצלמה בעולם המשחק
מעודכן: 23.10.2026
מקור: Unity MAIN, חוזה CUTSCENE_SCRIPT_V1, בדיקות MY_CutsceneZoomRegressionTests

## הבחנה בסיסית
מערכת Anime Emotion אחראית להבעה, פנים ודיאלוג. מצלמת העולם אינה תחליף לאנימה: היא מכוונת לעולם, למגדלים, לתותחים, לספינות, לתנועה במרחב ולמשמעות דרמטית. כל דוגמה משתמשת בשדות V1 קיימים בלבד: `beats[].camera.framing`, `movement`, `subject`, `direction`, `intensity`, `zoomMultiplier`, `zoomReturnMultiplier`, `zoomHoldSeconds`, `purpose` ו־`transition.style=cut`. אין `cameraPlan` ציבורי ברמת השורש של V1.

## שבעת השלבים: טיפוס לאורך מגדל וחשיפת התותח

| שוט | פעולה אמיתית נדרשת | נתיב V1 קיים | הוכחת קבלה |
| --- | --- | --- | --- |
| 1. שוט מכונן | רואים בסיס וראש של אותו מגדל | framing extreme_wide, movement hold, subject TOWER | כל המגדל נראה, פרופורציות יציבות |
| 2. טיפוס לאורך מגדל | המצלמה עולה לאורך המגדל בלי חיתוך | movement pan, direction up, subject TOWER | camera.localPosition.y עולה בתחילת/אמצע/סוף הפעולה |
| 3. גילוי התותח | חתך לתותח הפיזי שנמצא בראש המגדל | transition cut, movement cut, subject GUN | התותח באמת קשור למגדל ולא ספרייט זר שצף |
| 4. תקריב על הקנה | התקרבות של המצלמה, לא שינוי scale לספרייט | movement zoom_in, zoomMultiplier=0.42, framing close | OrthographicSize קטן, הקנה ממלא יותר פיקסלים |
| 5. רגע הירי | פלאש/כדור יוצא מעוגן הקנה, רתיעה | action fire, camera impact_shake | muzzleAnchor בעולם, projectile visible, gun recoil; לא מספיק טקסט על ירי |
| 6. חזרה רחבה | תוצאת הירי חוזרת להקשר המרחבי | movement zoom_out, zoomMultiplier=1.9 | OrthographicSize עולה ברצף ולא קופץ |
| 7. Hold לאחר אירוע | רואים מה השתנה | movement hold | נזק או נסיגת מטרה נראים בסוף |

**קובץ QA שנכתב ב־Unity workspace מחוץ ל־Assets:** `C:\Users\nlpis\wkspaces\STARWARS_DELTA_WORK\qa\semantic_director_4_20261022\TOWER_ASCENT_CANNON_22S_CUTSCENE_SCRIPT_V1.json`. הוא אורך 22 שניות, שבעה Beats, ומשתמש ב־CURRENT Actor handles `tower_upright_alpha_trimmed__56e56e1b`, `cannon__6315b58a`, `spaceship_p1__0abe8156`. **הוא אינו הוכחת מיקום הקנה במגדל** או של Play Mode.

## עוד תשע תנועות קולנועיות רצויות

| תבנית | מה הקהל צריך לראות | מימוש חוקי או פער |
| --- | --- | --- |
| Gun barrel insert | רחב → פרט קנה → ירי | cut, detail, zoom_in; muzzle anchor דורש פתרון נכסים |
| Tower vertical climb | מלמטה למעלה, ראש מתגלה | pan up; camera Y requires measured native proof |
| Tower orbit illusion | מצלמה עוברת מצד אחד לשני בגאומטריית 2D | track/pan סביב layout בלבד; סיבוב 3D אמיתי **אינו מובטח** |
| Face → weapon → face | מבט אנושי אל נשק, החלטה ותגובה | LOOK_TARGET_LOOK / OBJECT_MEMORY_FACE; בחירת פנים אמיתיות |
| Rack-focus illusion | דגש על לוחם קרוב ואז אויב רחוק | cut/framing; depth-of-field אמיתי **אינו מובטח** |
| Impact recoil | רעד רגעי אחרי הפגיעה בלבד | impact_shake בצמוד ל־fire/impact, לא כל הזמן |
| Moving ship midpoint focus | עוקבים אחרי ספינה מסתובבת בזמן תנועה | follow/track, בדיקה ב־t=5, לא רק בהתחלה ובסוף |
| Zoom in, hold, return | תקריב, השהיה דרמטית, חזרה | zoom_in_out, zoomHoldSeconds, zoomReturnMultiplier |
| Pull to reveal a fleet | מהאדם הבודד לצי שלם | pull/zoom_out, wide, Scale comparison ולכידות חזותית |

## מה מאומת ומה לא
- 2026-10-23: **7/7 בדיקות Unity Test Runner במחלקה `MY_CutsceneZoomRegressionTests` עברו**, כולל שני שלבי זום רציפים ושמירת המצב לאחר התנועה.
- קיימת בדיקת `CutsceneSkyWalkGoldenE2ETests` שבודקת שינוי Camera Y בזמני Timeline, אך היא **לא הורצה בסבב זה** כי היא פותחת סצנה ועלולה להפריע לעריכת MAIN.
- ניסיון STRICT על הסרט החדש נשלח בזמן שה־Editor נכנס ל־`Running managed callbacks`. **אין תוצאת STRICT**, לא לסמן PASS. אין Build, Preview, צילום פריימים או Play Mode לגרסת המגדל.
- גורם שמחייב אבחון: `camera.subject=GUN` הוא Cast ID נפרד ולא עוגן muzzle קשור למגדל. עבור תקריב מדויק יש לבחור/לאמת child transform קיים או להכין קשר אובייקטים במנגנון Unity **הקיים**. V1 לא מאפשר להמציא `muzzleAnchor` כשדה שורש חדש.
- מגדל עם Sprite יחיד שאינו גבוה באמת לא ייתן צילום טיפוס מרשים. בדיקת גאומטריה והרכב נכסים נחוצה לפני הפקה.
- כל שינוי ב־MAIN דורש תיאום עם הסוכן שעורך כרגע `MY_CutsceneV1CinematicDirectorAudit.cs`, `MY_CinematicDirectorMode.cs` ו־`MY_CutsceneStudioWindow.cs`. לא לדרוס שינויים.

## מדד הצלחה האמיתי
תמונות של מצלמה בגבהים שונים, לפני/במהלך/אחרי זום לקנה, פלאש ירי במקום הנכון, חזרה לרחב עם תוצאה חדשה. עלילות אנושיות צריכות לשלב את התנועות האלה רק כשהן משרתות החלטה או מחיר אנושי. מערכת 4 צריכה **לביים עולם**, לא סתם לעשות Zoom על כל אובייקט כדי להיראות עסוקה.
