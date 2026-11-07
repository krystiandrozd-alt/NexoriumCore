#!/usr/bin/env node
// presales-demo-scenario-generate CLI: validate, render, org-prep, run, all, selftest.
import path from 'node:path';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { loadScenario, validateScenario, withDefaults, createResolver, UsageError, SKILL_ROOT, LAYERS } from './lib/scenario.mjs';
import { lintScenario } from './lib/lint.mjs';
import { renderLayers } from './lib/render.mjs';
import { generateOrgPrep } from './lib/orgprep.mjs';
import { runScenario, dryRunPlan } from './lib/runner.mjs';

const HELP = `presales-demo-scenario-generate: demo scenarios from one JSON file

Usage: node demo.mjs <command> [scenario.json] [options]

Commands
  validate <file>   Check the schema and references, then print the quality score
  render <file>     Write the exec, presenter and technical layers (Markdown)
  org-prep <file>   Write sObject tree files, prepare-org.sh and CHECKLIST.md
  run <file>        Run the click path headless with Playwright (report, screenshots, video)
  all <file>        validate + render + org-prep, and run as well with --run
  selftest          Serve the bundled Quote Desk app and run its scenario end to end

Options
  --out <dir>       Output directory (default: output.dir from the scenario, else out/<meta.id>)
  --layers <list>   render: only these layers, comma-separated: exec,presenter,technical
  --dry-run         run: print the resolved click path without starting a browser
  --headed          run: show the browser window
  --json            validate: machine-readable output
  --run             all: also run the headless smoke test

Exit codes: 0 ok · 1 validation errors, blocked score or failed steps · 2 usage or configuration error`;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const opts = { files: [] };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    const value = (name) => {
      if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
      i += 1;
      if (rest[i] === undefined) throw new UsageError(`${name} needs a value`);
      return rest[i];
    };
    if (arg === '--json') opts.json = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--headed') opts.headed = true;
    else if (arg === '--run') opts.run = true;
    else if (arg === '--out' || arg.startsWith('--out=')) opts.out = value('--out');
    else if (arg === '--layers' || arg.startsWith('--layers=')) {
      opts.layers = value('--layers').split(',').map((l) => l.trim());
      const unknown = opts.layers.filter((l) => !LAYERS.includes(l));
      if (unknown.length) throw new UsageError(`Unknown layer(s): ${unknown.join(', ')}. Use ${LAYERS.join(', ')}.`);
    } else if (arg.startsWith('--')) throw new UsageError(`Unknown option: ${arg}`);
    else opts.files.push(arg);
  }
  return { command, opts };
}

function scenarioFile(opts) {
  if (opts.files.length !== 1) throw new UsageError('Pass exactly one scenario file.');
  return opts.files[0];
}

async function prepare(file) {
  const loaded = await loadScenario(file);
  const { errors, warnings } = await validateScenario(loaded);
  return { loaded, errors, warnings, s: errors.length ? null : withDefaults(loaded.scenario) };
}

function baseOutDir(s, opts) {
  if (opts.out) return path.resolve(opts.out);
  const { resolveString } = createResolver(s, { envMode: 'document' });
  return path.resolve(resolveString(s.output.dir));
}

function printValidation(file, { errors, warnings }, lint) {
  console.log(`Scenario: ${path.relative(process.cwd(), file) || file}`);
  if (errors.length) {
    console.log(`Schema and references: ${errors.length} error(s)`);
    for (const e of errors) console.log(`  - ${e}`);
  } else console.log('Schema and references: valid');
  for (const w of warnings) console.log(`  warning: ${w}`);
  if (!lint) return;
  console.log(`Quality score: ${lint.score}/100 · ${lint.band}`);
  for (const f of lint.findings) console.log(`  - [${f.category}] ${f.points}/${f.max} · ${f.message}`);
  for (const g of lint.gates) console.log(`  gate: ${g}`);
}

async function cmdValidate(opts) {
  const file = scenarioFile(opts);
  const state = await prepare(file);
  const lint = state.s ? lintScenario(state.s) : null;
  if (opts.json) {
    console.log(JSON.stringify({ file, valid: !state.errors.length, errors: state.errors, warnings: state.warnings, lint }, null, 2));
  } else printValidation(state.loaded.file, state, lint);
  return state.errors.length || lint.band === 'blocked' ? 1 : 0;
}

async function requireValid(file) {
  const state = await prepare(file);
  if (state.errors.length) {
    printValidation(state.loaded.file, state, null);
    return null;
  }
  for (const w of state.warnings) console.log(`warning: ${w}`);
  return state;
}

async function cmdRender(opts) {
  const state = await requireValid(scenarioFile(opts));
  if (!state) return 1;
  const written = await renderLayers(state.loaded, state.s, { outDir: baseOutDir(state.s, opts), only: opts.layers });
  for (const f of written) console.log(`wrote ${path.relative(process.cwd(), f)}`);
  return 0;
}

async function cmdOrgPrep(opts) {
  const state = await requireValid(scenarioFile(opts));
  if (!state) return 1;
  const written = await generateOrgPrep(state.s, path.join(baseOutDir(state.s, opts), state.s.output.orgPrepDir));
  for (const f of written) console.log(`wrote ${path.relative(process.cwd(), f)}`);
  return 0;
}

function printRun(summary, outDir) {
  console.log(`Headless run: ${summary.result.toUpperCase()} · passed ${summary.passed} · failed ${summary.failed} · skipped ${summary.skipped}`);
  for (const r of summary.steps.filter((x) => x.status === 'failed')) console.log(`  FAIL ${r.sceneId}/${r.stepId}: ${r.error}`);
  console.log(`report: ${path.relative(process.cwd(), path.join(outDir, 'report.md'))}`);
  if (summary.video) console.log(`video:  ${path.relative(process.cwd(), path.join(outDir, summary.video))}`);
}

async function cmdRun(opts, state) {
  state ??= await requireValid(scenarioFile(opts));
  if (!state) return 1;
  if (opts.dryRun) {
    console.log(dryRunPlan(state.s));
    return 0;
  }
  const outDir = path.join(baseOutDir(state.s, opts), state.s.output.runDir);
  const summary = await runScenario(state.s, { outDir, headed: opts.headed });
  printRun(summary, outDir);
  return summary.result === 'passed' ? 0 : 1;
}

async function cmdAll(opts) {
  const file = scenarioFile(opts);
  const state = await prepare(file);
  const lint = state.s ? lintScenario(state.s) : null;
  printValidation(state.loaded.file, state, lint);
  if (!state.s) return 1;
  let code = lint.band === 'blocked' ? 1 : 0;
  const base = baseOutDir(state.s, opts);
  for (const f of await renderLayers(state.loaded, state.s, { outDir: base })) console.log(`wrote ${path.relative(process.cwd(), f)}`);
  if (state.s.orgPrep) {
    for (const f of await generateOrgPrep(state.s, path.join(base, state.s.output.orgPrepDir))) {
      console.log(`wrote ${path.relative(process.cwd(), f)}`);
    }
  }
  if (opts.run) code = Math.max(code, await cmdRun(opts, state));
  return code;
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function serveStatic(root) {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath}`);
    if (!file.startsWith(`${path.resolve(root)}${path.sep}`)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': CONTENT_TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function cmdSelftest(opts) {
  const example = path.join(SKILL_ROOT, 'assets', 'examples', 'local-selftest');
  const server = await serveStatic(path.join(example, 'app'));
  process.env.SELFTEST_BASE_URL = `http://127.0.0.1:${server.address().port}`;
  try {
    const state = await requireValid(path.join(example, 'scenario.json'));
    if (!state) return 1;
    const lint = lintScenario(state.s);
    console.log(`Quality score: ${lint.score}/100 · ${lint.band}`);
    return await cmdRun(opts, state);
  } finally {
    server.close();
  }
}

async function main() {
  const { command, opts } = parseArgs(process.argv.slice(2));
  switch (command) {
    case 'validate':
      return cmdValidate(opts);
    case 'render':
      return cmdRender(opts);
    case 'org-prep':
      return cmdOrgPrep(opts);
    case 'run':
      return cmdRun(opts);
    case 'all':
      return cmdAll(opts);
    case 'selftest':
      return cmdSelftest(opts);
    case 'help':
    case '--help':
    case '-h':
      console.log(HELP);
      return 0;
    case undefined:
      console.log(HELP);
      return 2;
    default:
      throw new UsageError(`Unknown command: ${command}. Run with --help.`);
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    if (err instanceof UsageError) console.error(`Error: ${err.message}`);
    else console.error(err?.stack ?? err);
    process.exitCode = 2;
  });
