// PR probe: intentionally no behavior change; this commit exists to exercise the Film QA workflow.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const PREVIEW_URL = process.env.PREVIEW_URL || 'https://streamdragon.github.io/STARWARS_DELTA_STORYBOARDS/cutscene-preview.html';
const OUT = process.env.QA_OUT || 'artifacts/cutscene-film-qa';
const MOVIE_BUTTON = process.env.MOVIE_BUTTON || 'GOLDEN 40S';
const EXPECTED_DURATION = Number(process.env.EXPECTED_DURATION || 40);
const BUILD_SHA = process.env.GITHUB_SHA || Date.now().toString();
const FRAME_TIMES = (process.env.FRAME_TIMES || '0,2,4.2,8.2,13.2,18.2,24.2,29.2,35.2,39.0')
  .split(',').map(Number).filter(Number.isFinite).sort((a,b)=>a-b);

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(path.join(OUT, 'frames'), { recursive: true });
await fs.mkdir(path.join(OUT, 'full-page'), { recursive: true });
await fs.mkdir(path.join(OUT, 'video'), { recursive: true });

const report = {
  url: PREVIEW_URL,
  movieButton: MOVIE_BUTTON,
  expectedDurationSeconds: EXPECTED_DURATION,
  buildSha: BUILD_SHA,
  startedAt: new Date().toISOString(),
  consoleErrors: [],
  pageErrors: [],
  networkFailures: [],
  screenshots: [],
  playbackSamples: [],
  checks: {},
  summary: 'RUNNING'
};

function parseClock(text='') {
  const m = String(text).match(/([0-9]+(?:\.[0-9]+)?)\s*\/\s*([0-9]+(?:\.[0-9]+)?)s?/i);
  return m ? { elapsed: Number(m[1]), total: Number(m[2]) } : null;
}

async function waitForSiteReady(page) {
  let lastError = null;
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      const u = new URL(PREVIEW_URL);
      u.searchParams.set('qa', `${BUILD_SHA}-${attempt}-${Date.now()}`);
      await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('#stage').waitFor({ state: 'visible', timeout: 15000 });
      await page.getByRole('button', { name: MOVIE_BUTTON, exact: true }).waitFor({ state: 'visible', timeout: 15000 });
      const status = (await page.locator('#status').textContent().catch(()=>'')) || '';
      if (/CURRENT/i.test(status) && !/Loading CURRENT/i.test(status)) return;
      lastError = new Error(`Site loaded but CURRENT not ready: ${status}`);
    } catch (err) {
      lastError = err;
    }
    await page.waitForTimeout(15000);
  }
  throw lastError || new Error('Site did not become ready');
}

async function stageMeaningfulPixels(page) {
  return await page.locator('#stage').evaluate((el) => {
    const canvases = [...el.querySelectorAll('canvas')];
    const placeholders = [...el.querySelectorAll('.ph')].filter(x => getComputedStyle(x).display !== 'none');
    const visibleCanvases = canvases.filter(c => {
      const r = c.getBoundingClientRect(), s = getComputedStyle(c);
      return r.width > 8 && r.height > 8 && s.display !== 'none' && Number(s.opacity || 1) > 0.05;
    });
    let sampledNonDark = 0;
    for (const c of visibleCanvases) {
      try {
        const ctx = c.getContext('2d');
        if (!ctx || c.width < 1 || c.height < 1) continue;
        const sx = Math.max(1, Math.floor(c.width / 12));
        const sy = Math.max(1, Math.floor(c.height / 12));
        for (let y = 0; y < c.height; y += sy) for (let x = 0; x < c.width; x += sx) {
          const p = ctx.getImageData(Math.min(x,c.width-1), Math.min(y,c.height-1), 1, 1).data;
          if (p[3] > 20 && (p[0] + p[1] + p[2]) > 45) sampledNonDark++;
        }
      } catch {}
    }
    return {
      canvasCount: canvases.length,
      visibleCanvasCount: visibleCanvases.length,
      placeholderCount: placeholders.length,
      sampledNonDark
    };
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  recordVideo: { dir: path.join(OUT, 'video'), size: { width: 1600, height: 1000 } }
});
const page = await context.newPage();

page.on('console', msg => {
  if (msg.type() === 'error') report.consoleErrors.push(msg.text());
});
page.on('pageerror', err => report.pageErrors.push(String(err?.stack || err)));
page.on('requestfailed', req => {
  const url = req.url();
  if (!/google-analytics|doubleclick|utm_/i.test(url)) report.networkFailures.push({ url, error: req.failure()?.errorText || 'requestfailed' });
});

try {
  await waitForSiteReady(page);

  await page.getByRole('button', { name: MOVIE_BUTTON, exact: true }).click();
  await page.waitForFunction((needle) => document.querySelector('#drop')?.textContent?.includes(needle), 'GOLDEN', { timeout: 30000 });
  await page.waitForFunction(() => {
    const t = document.querySelector('#time')?.textContent || '';
    return /\/\s*40(?:\.0)?s/i.test(t);
  }, null, { timeout: 30000 });
  await page.waitForTimeout(1200);

  const loaded = (await page.locator('#drop').textContent()) || '';
  report.loadedBanner = loaded;
  report.checks.movieLoaded = /GOLDEN/i.test(loaded);
  report.checks.noUnknownHandle = !/UNKNOWN_HANDLE/i.test((await page.locator('#diag').textContent()) || '');
  report.checks.noRedDiagnosticsAtStart = !/UNKNOWN_HANDLE|No shots found|appendChild|STALLED/i.test((await page.locator('#diag').textContent()) || '');

  const firstMetrics = await stageMeaningfulPixels(page);
  report.initialStageMetrics = firstMetrics;
  await page.locator('#stage').screenshot({ path: path.join(OUT, 'frames', 'frame-00.0s.png') });
  await page.screenshot({ path: path.join(OUT, 'full-page', 'full-00.0s.png'), fullPage: true });
  report.screenshots.push({ time: 0, stage: 'frames/frame-00.0s.png', full: 'full-page/full-00.0s.png', metrics: firstMetrics });

  await page.getByRole('button', { name: 'PLAY', exact: true }).click();
  await page.waitForTimeout(1100);
  const health = ((await page.locator('.playHealth').textContent().catch(()=>'')) || '').trim();
  report.playHealthAfterOneSecond = health;
  report.checks.playHealthOk = /PLAYBACK OK/i.test(health);

  let previousTarget = 0;
  for (const target of FRAME_TIMES.filter(t => t > 0 && t < EXPECTED_DURATION + 0.2)) {
    const waitMs = Math.max(0, (target - previousTarget) * 1000);
    await page.waitForTimeout(waitMs);
    previousTarget = target;

    const clockText = (await page.locator('#time').textContent()) || '';
    const clock = parseClock(clockText);
    const metrics = await stageMeaningfulPixels(page);
    const label = target.toFixed(1).padStart(4,'0');
    const stageFile = `frames/frame-${label}s.png`;
    const fullFile = `full-page/full-${label}s.png`;
    await page.locator('#stage').screenshot({ path: path.join(OUT, stageFile) });
    await page.screenshot({ path: path.join(OUT, fullFile), fullPage: true });
    report.screenshots.push({ time: target, stage: stageFile, full: fullFile, clock, metrics });
    report.playbackSamples.push({ target, clockText, clock, metrics });
  }

  const endClockText = (await page.locator('#time').textContent()) || '';
  const endClock = parseClock(endClockText);
  report.endClock = endClock;
  report.checks.clockAdvanced = !!endClock && endClock.elapsed >= 35;
  report.checks.timelineHasEightBeats = await page.locator('#timeline .shot').count() === 8;
  report.checks.framesHaveVisualContent = report.screenshots.filter(s => s.time > 0).every(s => (s.metrics?.sampledNonDark || 0) > 0 || (s.metrics?.visibleCanvasCount || 0) > 0);
  report.checks.noPageErrors = report.pageErrors.length === 0;
  report.checks.noConsoleErrors = report.consoleErrors.length === 0;

  const critical = ['movieLoaded','playHealthOk','clockAdvanced','timelineHasEightBeats','framesHaveVisualContent','noPageErrors'];
  const failed = critical.filter(k => !report.checks[k]);
  report.summary = failed.length ? `FAIL: ${failed.join(', ')}` : 'PASS';
} catch (err) {
  report.summary = 'ERROR';
  report.fatalError = String(err?.stack || err);
} finally {
  report.finishedAt = new Date().toISOString();
  await fs.writeFile(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  const md = [
    '# Cutscene Film QA',
    '',
    `**Result:** ${report.summary}`,
    `**URL:** ${report.url}`,
    `**Movie:** ${report.movieButton}`,
    '',
    '## Checks',
    ...Object.entries(report.checks).map(([k,v]) => `- ${v ? 'PASS' : 'FAIL'}: ${k}`),
    '',
    `Console errors: ${report.consoleErrors.length}`,
    `Page errors: ${report.pageErrors.length}`,
    `Network failures: ${report.networkFailures.length}`,
    '',
    'See `frames/`, `full-page/`, `video/`, and `report.json` in the artifact.'
  ].join('\n');
  await fs.writeFile(path.join(OUT, 'REPORT.md'), md);
  await page.close().catch(()=>{});
  await context.close().catch(()=>{});
  await browser.close().catch(()=>{});
}

if (report.summary !== 'PASS') process.exitCode = 1;
