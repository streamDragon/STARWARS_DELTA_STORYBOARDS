# GEMARA GAME | AGENTS

Portal: https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/gemara-game/

## Truth and workflow
- Unity source of truth: Plastic MAIN, GEMARA_GAME@firebird721@cloud.
- Local project: C:\Users\nlpis\wkspaces\GEMARA_GAME\UnityProject (Unity 6000.7.0b5, Universal 2D).
- Open existing project; never recreate or import old demo again.
- First scene: Assets/GemaraGame/Generated/GemaraGameDemo.unity. Portrait 390x844.
- Lesson contract GEMARA_GAME_LESSON schemaVersion 3. Draft bekhorot-34-demo-v3 is not published or current Daf Yomi.
- Evidence as of 2026-10-23: EditMode 11/11 PASS and PlayMode 1/1 PASS. No verified Android APK, physical device test or visual QA.
- Read docs/AGENT_HANDOFF.md and docs/verification/*.xml before claiming anything.

## Sources and rights
- Rabbi Amichai Gordin: 2026-10-22 email permits commercial use with credit and link to original sheets. There are 101 catalog records; each derived lesson still needs Torah review.
- Sinai / Rabbi Uri Brilliant: 2026-10-22 email expresses openness to collaboration and credit but asks to negotiate terms for commercial earnings. No blanket commercial reuse license. Link externally until explicit terms are finalized.
- Never publish emails, private addresses, tokens, unapproved diagrams, or unreviewed religious teaching.

## Portal and sync
- Static public snapshot at gemara-game/data/status.json (Unity status) and data/portal.json (tasks/rights), plus gordin-catalog.js.
- Plastic controls Unity sources and local site/; GitHub Pages hosts read-only published portal files.
- Run site/Export-GemaraSnapshot.ps1 after verifying tests. Review exported files, publish to GitHub through authenticated tools; verify deployment.
- Export is NOT live synchronization. Browser does not write to Plastic or Unity.

## Agent steps
1. Read this file and machine data, update Plastic workspace, inspect exact files.
2. Choose an actionable task. Respect existing Unity project and content rights.
3. Make focused changes and run tests. Preserve .meta files and content schema.
4. Record evidence; update verified status only. Export and publish reviewed snapshots.
5. Report exact paths, commits and test results.

Next: visual RTL/Game View capture; Android support and APK; physical test; rabbinic review.
