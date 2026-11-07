// Execute the click path headless with Playwright: report, screenshots and video.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createResolver, UsageError, collectTargets, formatTarget, formatAction, formatExpect } from './scenario.mjs';

const require = createRequire(import.meta.url);
const SECRET_PARAMS = /([?&](?:sid|otp|token|access_token|code)=)[^&\s"']+/gi;
const redact = (text) => String(text).replace(SECRET_PARAMS, '$1***');
const norm = (text) => String(text).replace(/\s+/g, ' ').trim();
const truncate = (text, max = 160) => (text.length > max ? `${text.slice(0, max)}…` : text);

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    throw new UsageError('Playwright is not installed. Run: npm i -D playwright && npx playwright install chromium');
  }
}

function shortError(err) {
  const lines = String(err?.message ?? err)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const waiting = lines.find((l) => l.startsWith('- waiting for'));
  return truncate(redact([lines[0], waiting].filter(Boolean).join(' | ')), 400);
}

export function resolveForRun(s, { dryRun }) {
  if (!s.runner) throw new UsageError('This scenario has no runner section.');
  const { resolveDeep, missingEnv } = createResolver(s, { envMode: dryRun ? 'document' : 'runtime' });
  const runner = resolveDeep(s.runner);
  const only = s.runner.scenes?.length ? new Set(s.runner.scenes) : null;
  const scenes = resolveDeep(s.scenes.filter((sc) => !only || only.has(sc.id)));
  if (!dryRun && missingEnv.size) {
    throw new UsageError(`Set these environment variables before the run: ${[...missingEnv].sort().join(', ')}`);
  }
  return { runner, scenes };
}

export function dryRunPlan(s) {
  const { runner, scenes } = resolveForRun(s, { dryRun: true });
  const lines = [`Dry run: ${s.meta.title}`, `Base URL: ${runner.baseUrl} · login: ${runner.auth.type} · browser: ${runner.browser}`];
  for (const scene of scenes) {
    lines.push('', `[${scene.id}] ${scene.title}`);
    for (const step of scene.steps) {
      const expects = (step.expect ?? []).map(formatExpect).join('; ');
      lines.push(`  ${step.id}: ${formatAction(step.action)} ${step.action?.target ? `→ ${formatTarget(step.action.target)}` : ''}`.trimEnd());
      if (expects) lines.push(`      expect ${expects}`);
    }
  }
  return lines.join('\n');
}

function sfFrontdoorUrl(targetOrg, startPath) {
  const args = ['org', 'open', '--target-org', targetOrg, '--url-only', '--json'];
  if (startPath) args.push('--path', startPath);
  return new Promise((resolve, reject) => {
    const child = spawn('sf', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) =>
      reject(e.code === 'ENOENT' ? new UsageError('sf CLI not found. Install it, or use runner.auth type "url" or "storageState".') : e),
    );
    child.on('close', (code) => {
      try {
        const json = JSON.parse(out);
        if (code === 0 && json.result?.url) resolve(json.result.url);
        else reject(new Error(`sf org open failed: ${json.message ?? `exit code ${code}`}`));
      } catch {
        reject(new Error(`sf org open failed (exit code ${code}): ${err.trim().split('\n')[0] ?? ''}`));
      }
    });
  });
}

function locateIn(scope, t) {
  const container = t.within ? locateIn(scope, t.within) : scope;
  const exact = t.exact === true;
  let loc;
  if (t.role) loc = container.getByRole(t.role, t.name !== undefined ? { name: t.name, exact } : {});
  else if (t.label) loc = container.getByLabel(t.label, { exact });
  else if (t.text) loc = container.getByText(t.text, { exact });
  else if (t.placeholder) loc = container.getByPlaceholder(t.placeholder, { exact });
  else if (t.testId) loc = container.getByTestId(t.testId);
  else loc = container.locator(t.css);
  return t.nth !== undefined ? loc.nth(t.nth) : loc;
}

const locate = (page, t) => locateIn(t.frame ? page.frameLocator(t.frame) : page, t);

async function perform(page, a, runner) {
  const timeout = a.timeoutMs ?? runner.timeouts.actionMs;
  switch (a.type) {
    case 'navigate':
      await page.goto(a.url, { waitUntil: a.waitUntil ?? 'load', timeout: a.timeoutMs ?? runner.timeouts.navigationMs });
      return;
    case 'click':
      await locate(page, a.target).click({ timeout });
      return;
    case 'hover':
      await locate(page, a.target).hover({ timeout });
      return;
    case 'check':
      await locate(page, a.target).check({ timeout });
      return;
    case 'uncheck':
      await locate(page, a.target).uncheck({ timeout });
      return;
    case 'fill':
      await locate(page, a.target).fill(a.value, { timeout });
      return;
    case 'select':
      await locate(page, a.target).selectOption(a.by === 'value' ? { value: a.value } : { label: a.value }, { timeout });
      return;
    case 'press':
      if (a.target) await locate(page, a.target).press(a.key, { timeout });
      else await page.keyboard.press(a.key);
      return;
    case 'wait':
      await page.waitForTimeout(a.ms);
      return;
    case 'waitFor':
      await locate(page, a.target).waitFor({ state: a.state ?? 'visible', timeout });
      return;
    default:
      throw new Error(`Unsupported action type: ${a.type}`);
  }
}

async function poll(read, e, timeout, what) {
  const deadline = Date.now() + timeout;
  const want = norm(e.equals ?? e.contains);
  let last;
  let lastError;
  for (;;) {
    try {
      last = norm(await read());
      lastError = undefined;
      if (e.equals !== undefined ? last === want : last.includes(want)) return;
    } catch (err) {
      lastError = err;
    }
    if (Date.now() >= deadline) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  if (lastError && last === undefined) throw lastError;
  throw new Error(`Expected ${what} to ${e.equals !== undefined ? 'equal' : 'contain'} "${want}", got "${truncate(last ?? '')}"`);
}

async function verify(page, e, runner) {
  const timeout = e.timeoutMs ?? runner.timeouts.expectMs;
  switch (e.type) {
    case 'visible':
      await locate(page, e.target).waitFor({ state: 'visible', timeout });
      return;
    case 'hidden':
      await locate(page, e.target).waitFor({ state: 'hidden', timeout });
      return;
    case 'text':
      await poll(() => locate(page, e.target).innerText({ timeout: Math.min(timeout, 2000) }), e, timeout, `text of ${formatTarget(e.target)}`);
      return;
    case 'url':
      await poll(async () => page.url(), e, timeout, 'the URL');
      return;
    default:
      await poll(() => page.title(), e, timeout, 'the page title');
  }
}

function reportMarkdown(summary) {
  const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;
  const L = [
    `# Headless run: ${summary.title}`,
    '',
    `**Result:** ${summary.result.toUpperCase()} · passed ${summary.passed} · failed ${summary.failed} · skipped ${summary.skipped} · ${seconds(summary.durationMs)}`,
    '',
    `Browser: ${summary.browser}${summary.headless ? ' (headless)' : ''} · viewport ${summary.viewport}`,
  ];
  if (summary.video) L.push('', `Video: [${summary.video}](${summary.video})`);
  L.push('', '| Scene | Step | Status | Time | Detail |', '|---|---|---|---|---|');
  for (const r of summary.steps) {
    const detail = r.error ?? (r.screenshot ? `[screenshot](${r.screenshot})` : '');
    const cell = (v) => String(v ?? '').replace(/\|/g, '\\|');
    L.push(`| ${cell(r.sceneId)} | ${cell(`${r.stepId}: ${r.title}`)} | ${r.status} | ${seconds(r.durationMs)} | ${cell(detail)} |`);
  }
  if (summary.confirmedLocators.length) {
    L.push('', '## Locators confirmed by this run', '', 'These were marked unverified and resolved in this run. Set `"verified": true` on them in the scenario.', '');
    for (const loc of summary.confirmedLocators) L.push(`- \`${loc}\``);
  }
  return `${L.join('\n')}\n`;
}

export async function runScenario(s, { outDir, headed = false }) {
  const { runner, scenes } = resolveForRun(s, { dryRun: false });
  const pw = loadPlaywright();
  const shotsDir = path.join(outDir, 'screenshots');
  const videoDir = path.join(outDir, 'video');
  await rm(shotsDir, { recursive: true, force: true });
  await rm(videoDir, { recursive: true, force: true });
  await mkdir(shotsDir, { recursive: true });

  const launch = { headless: headed ? false : runner.headless, slowMo: runner.slowMoMs };
  if (runner.executablePath) launch.executablePath = runner.executablePath;
  const started = Date.now();
  const browser = await pw[runner.browser].launch(launch);
  const results = [];
  const confirmed = new Set();
  let video;
  try {
    const contextOptions = {
      viewport: runner.viewport,
      locale: runner.locale,
      timezoneId: runner.timezoneId,
      ignoreHTTPSErrors: runner.ignoreHTTPSErrors,
    };
    if (runner.auth.type === 'storageState') contextOptions.storageState = runner.auth.path;
    if (runner.video.enabled) {
      await mkdir(videoDir, { recursive: true });
      contextOptions.recordVideo = { dir: videoDir, size: { width: runner.video.width, height: runner.video.height } };
    }
    const context = await browser.newContext(contextOptions);
    context.setDefaultTimeout(runner.timeouts.actionMs);
    context.setDefaultNavigationTimeout(runner.timeouts.navigationMs);
    const page = await context.newPage();
    const videoName = `${s.meta.id}.webm`;
    const videoSaved = runner.video.enabled ? page.video().saveAs(path.join(videoDir, videoName)) : null;
    videoSaved?.catch(() => {});

    let failed = false;
    try {
      if (runner.auth.type === 'url') await page.goto(runner.auth.url, { waitUntil: 'load' });
      if (runner.auth.type === 'sfCli') await page.goto(await sfFrontdoorUrl(runner.auth.targetOrg, runner.auth.path), { waitUntil: 'load' });
    } catch (err) {
      if (err instanceof UsageError) throw err;
      failed = true;
      results.push({ sceneId: '(login)', stepId: 'login', title: `Log in (${runner.auth.type})`, status: 'failed', durationMs: 0, error: shortError(err) });
    }

    for (const scene of scenes) {
      for (const step of scene.steps) {
        const base = { sceneId: scene.id, stepId: step.id, title: step.title };
        if (failed && runner.stopOnFailure) {
          results.push({ ...base, status: 'skipped', durationMs: 0 });
          continue;
        }
        const t0 = Date.now();
        let status = 'passed';
        let error;
        try {
          if (step.action) await perform(page, step.action, runner);
          for (const e of step.expect ?? []) await verify(page, e, runner);
          if (step.dwellMs) await page.waitForTimeout(step.dwellMs);
        } catch (err) {
          status = 'failed';
          error = shortError(err);
          failed = true;
        }
        const wantShot =
          runner.screenshots === 'everyStep' ||
          (status === 'failed' && runner.screenshots !== 'off') ||
          (step.screenshot === true && runner.screenshots === 'flagged');
        let screenshot;
        if (wantShot) {
          screenshot = path.posix.join('screenshots', `${step.id}.png`);
          try {
            await page.screenshot({ path: path.join(outDir, screenshot) });
          } catch {
            screenshot = undefined;
          }
        }
        if (status === 'passed') {
          for (const t of collectTargets(step)) if (t.verified === false) confirmed.add(formatTarget({ ...t, verified: true }));
        }
        results.push({ ...base, status, durationMs: Date.now() - t0, error, screenshot });
      }
    }
    await context.close();
    if (videoSaved) {
      await videoSaved;
      await page.video().delete().catch(() => {});
      video = path.posix.join('video', videoName);
    }
  } finally {
    await browser.close();
  }

  const count = (status) => results.filter((r) => r.status === status).length;
  const summary = {
    scenario: s.meta.id,
    title: s.meta.title,
    result: count('failed') ? 'failed' : 'passed',
    passed: count('passed'),
    failed: count('failed'),
    skipped: count('skipped'),
    durationMs: Date.now() - started,
    browser: runner.browser,
    headless: launch.headless,
    viewport: `${runner.viewport.width}x${runner.viewport.height}`,
    video,
    steps: results,
    confirmedLocators: [...confirmed].sort(),
  };
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(outDir, 'report.md'), reportMarkdown(summary));
  return summary;
}
