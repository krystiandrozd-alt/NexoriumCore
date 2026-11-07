// Load, validate, default and resolve demo scenario files.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

export const SKILL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SCHEMA_PATH = path.join(SKILL_ROOT, 'assets', 'demo-scenario.schema.json');
export const LAYERS = ['exec', 'presenter', 'technical'];
export const MUTATING_ACTIONS = new Set(['click', 'fill', 'select', 'check', 'uncheck', 'press']);

const PLACEHOLDER = /\{\{\s*([A-Za-z]+)\.([A-Za-z0-9_.-]+)\s*\}\}/g;
const NAMESPACES = new Set(['vars', 'env', 'meta', 'runner']);

export class UsageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UsageError';
    this.exitCode = 2;
  }
}

export async function loadScenario(file) {
  const abs = path.resolve(file);
  if (!existsSync(abs)) throw new UsageError(`Scenario file not found: ${file}`);
  let scenario;
  try {
    scenario = JSON.parse(await readFile(abs, 'utf8'));
  } catch (err) {
    throw new UsageError(`Scenario is not valid JSON (${file}): ${err.message}`);
  }
  return { scenario, file: abs, dir: path.dirname(abs) };
}

let validatorPromise;
function getValidator() {
  validatorPromise ??= (async () => {
    const schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf8'));
    // strictRequired is off because if/then branches list properties defined on the parent schema.
    const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, strictRequired: false, allowUnionTypes: true });
    return ajv.compile(schema);
  })();
  return validatorPromise;
}

// Ajv reports schemaPath relative to the $ref target, so the instance path identifies the oneOf.
const ONE_OF_MESSAGES = [
  [/\/(target|within)$/, 'must use exactly one locator strategy: role, label, text, placeholder, testId or css'],
  [/\/auth$/, 'must be {type:"none"}, {type:"url",url}, {type:"sfCli",targetOrg[,path]} or {type:"storageState",path}'],
  [/\/expect\/\d+$/, 'needs exactly one of "contains" or "equals"'],
];

function formatSchemaErrors(errors) {
  const lines = [];
  const seen = new Set();
  for (const e of errors) {
    if (e.keyword === 'if') continue; // the failing "then" keyword is reported on its own
    if (/\/oneOf\/\d+\//.test(e.schemaPath)) continue; // branch details of a oneOf, summarised below
    let message = e.message;
    if (e.keyword === 'oneOf') {
      message = ONE_OF_MESSAGES.find(([pattern]) => pattern.test(e.instancePath))?.[1] ?? message;
    } else if (e.keyword === 'additionalProperties') {
      message = `has unknown property "${e.params.additionalProperty}" (prefix custom fields with x-)`;
    } else if (e.keyword === 'enum') {
      message = `must be one of: ${e.params.allowedValues.join(', ')}`;
    }
    const line = `${e.instancePath || '/'} ${message}`;
    if (!seen.has(line)) {
      seen.add(line);
      lines.push(line);
    }
  }
  return lines;
}

export function getPath(obj, dotted) {
  return dotted.split('.').reduce((node, key) => (node == null ? undefined : node[key]), obj);
}

function walkStrings(value, visit, where = '') {
  if (typeof value === 'string') visit(value, where || '/');
  else if (Array.isArray(value)) value.forEach((item, i) => walkStrings(item, visit, `${where}/${i}`));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key !== '$schema') walkStrings(item, visit, `${where}/${key}`);
    }
  }
}

// Deterministic checks the schema cannot express: references, uniqueness, placeholders, org safety.
function crossCheck(s, dir) {
  const errors = [];
  const warnings = [];
  const duplicates = (entries, what) => {
    const seen = new Set();
    for (const [id, where] of entries) {
      if (seen.has(id)) errors.push(`${where} duplicate ${what} id "${id}"`);
      seen.add(id);
    }
  };
  duplicates(s.personas.map((p, i) => [p.id, `/personas/${i}/id`]), 'persona');
  duplicates(s.scenes.map((sc, i) => [sc.id, `/scenes/${i}/id`]), 'scene');
  duplicates(s.scenes.flatMap((sc, i) => sc.steps.map((st, j) => [st.id, `/scenes/${i}/steps/${j}/id`])), 'step');

  const personaIds = new Set(s.personas.map((p) => p.id));
  s.scenes.forEach((sc, i) => {
    if (!personaIds.has(sc.personaId)) errors.push(`/scenes/${i}/personaId "${sc.personaId}" does not match any persona`);
  });
  const sceneIds = new Set(s.scenes.map((sc) => sc.id));
  const lastThing = s.storyline.lastThingFirst.sceneId;
  if (lastThing && !sceneIds.has(lastThing)) {
    errors.push(`/storyline/lastThingFirst/sceneId "${lastThing}" does not match any scene`);
  }
  (s.runner?.scenes ?? []).forEach((id, i) => {
    if (!sceneIds.has(id)) errors.push(`/runner/scenes/${i} "${id}" does not match any scene`);
  });

  const defined = new Set();
  (s.records ?? []).forEach((record, i) => {
    if (defined.has(record.ref)) errors.push(`/records/${i}/ref duplicate ref "${record.ref}"`);
    for (const [field, value] of Object.entries(record.fields)) {
      if (typeof value === 'string' && value.startsWith('@') && !defined.has(value.slice(1))) {
        errors.push(`/records/${i}/fields/${field} references "${value}", which is not defined before this record`);
      }
    }
    defined.add(record.ref);
  });

  const variables = s.variables ?? {};
  walkStrings(s, (str, where) => {
    for (const match of str.matchAll(PLACEHOLDER)) {
      const [token, ns, dotted] = match;
      if (!NAMESPACES.has(ns)) errors.push(`${where} unknown placeholder ${token} (use vars, env, meta or runner)`);
      else if (ns === 'vars' && !Object.hasOwn(variables, dotted)) errors.push(`${where} ${token} is not defined in variables`);
      else if (ns === 'meta' && getPath(s.meta, dotted) === undefined) errors.push(`${where} ${token} does not exist in meta`);
      else if (ns === 'runner' && getPath(s.runner, dotted) === undefined) errors.push(`${where} ${token} does not exist in runner`);
      else if (ns === 'env' && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(dotted)) errors.push(`${where} ${token} is not a valid environment variable name`);
    }
  });

  for (const layer of LAYERS) {
    const template = s.output?.layers?.[layer]?.template;
    if (template && !existsSync(path.resolve(dir, template))) {
      errors.push(`/output/layers/${layer}/template file not found: ${template}`);
    }
  }

  if (s.orgPrep && !s.orgPrep.allowedOrgs.includes(s.orgPrep.targetOrg)) {
    errors.push(`/orgPrep/targetOrg "${s.orgPrep.targetOrg}" must be listed in orgPrep.allowedOrgs`);
  }
  if (s.runner?.auth?.type === 'sfCli') {
    const org = s.runner.auth.targetOrg;
    if (s.orgPrep && !s.orgPrep.allowedOrgs.includes(org)) {
      errors.push(`/runner/auth/targetOrg "${org}" must be listed in orgPrep.allowedOrgs`);
    } else if (!s.orgPrep) {
      warnings.push(`/runner/auth/targetOrg "${org}" is not checked against an allow-list: add orgPrep.allowedOrgs`);
    }
  }
  for (const [i, persona] of s.personas.entries()) {
    const username = persona.org?.username;
    if (username?.includes('{{') && !/^\{\{\s*env\.[A-Za-z_][A-Za-z0-9_]*\s*\}\}$/.test(username)) {
      errors.push(`/personas/${i}/org/username must be a literal or a single {{env.NAME}} placeholder`);
    }
  }
  if (!s.orgPrep && s.personas.some((p) => p.org?.permissionSets?.length)) {
    warnings.push('/personas define permission sets, but there is no orgPrep section to assign them');
  }
  return { errors, warnings };
}

export async function validateScenario(loaded) {
  const validate = await getValidator();
  if (validate(loaded.scenario)) return crossCheck(loaded.scenario, loaded.dir);
  const errors = formatSchemaErrors(validate.errors);
  try {
    // Best effort: report reference problems in the same pass when the shape allows it.
    const cross = crossCheck(loaded.scenario, loaded.dir);
    return { errors: [...errors, ...cross.errors], warnings: cross.warnings };
  } catch {
    return { errors, warnings: [] };
  }
}

// Defaults live here and in the schema's "default" annotations; keep both in sync.
export function withDefaults(s) {
  const runner = s.runner
    ? {
        browser: 'chromium',
        headless: true,
        viewport: { width: 1440, height: 900 },
        locale: 'en-US',
        ignoreHTTPSErrors: false,
        slowMoMs: 0,
        screenshots: 'flagged',
        stopOnFailure: true,
        ...s.runner,
        auth: s.runner.auth ?? { type: 'none' },
        timeouts: { actionMs: 15000, navigationMs: 60000, expectMs: 15000, ...(s.runner.timeouts ?? {}) },
        video: { enabled: false, width: 1280, height: 720, ...(s.runner.video ?? {}) },
      }
    : undefined;
  const layerDefaults = {
    exec: { enabled: true, fileName: '01-exec-storyline.md' },
    presenter: { enabled: true, fileName: '02-presenter-script.md' },
    technical: { enabled: true, fileName: '03-technical-runbook.md' },
  };
  const layers = Object.fromEntries(
    LAYERS.map((layer) => [layer, { ...layerDefaults[layer], ...(s.output?.layers?.[layer] ?? {}) }]),
  );
  return {
    ...s,
    variables: s.variables ?? {},
    records: s.records ?? [],
    checklist: s.checklist ?? [],
    runner,
    orgPrep: s.orgPrep ? { importRecords: true, verify: [], manualSteps: [], ...s.orgPrep } : undefined,
    output: {
      dir: `out/${s.meta.id}`,
      orgPrepDir: 'org-prep',
      runDir: 'run',
      ...(s.output ?? {}),
      layers,
      labels: s.output?.labels ?? {},
    },
    quality: { maxStepsPerScene: 7, maxSceneMinutes: 10, readyScore: 85, reviewScore: 60, ...(s.quality ?? {}) },
  };
}

// envMode "document": never print environment values, show ‹env:NAME› instead.
// envMode "runtime": substitute process.env values and collect the missing ones.
export function createResolver(s, { envMode }) {
  const missingEnv = new Set();
  const stack = new Set();
  const lookup = (token, ns, dotted) => {
    if (ns === 'env') {
      if (envMode === 'document') return `‹env:${dotted}›`;
      const value = process.env[dotted];
      if (value === undefined || value === '') {
        missingEnv.add(dotted);
        return token;
      }
      return value;
    }
    const root = ns === 'vars' ? s.variables : ns === 'meta' ? s.meta : ns === 'runner' ? s.runner : undefined;
    const raw = ns === 'vars' ? root?.[dotted] : getPath(root, dotted);
    if (raw === undefined || raw === null || typeof raw === 'object') return token;
    if (typeof raw !== 'string') return String(raw);
    const key = `${ns}.${dotted}`;
    if (stack.has(key)) throw new UsageError(`Placeholder {{${key}}} refers to itself`);
    stack.add(key);
    try {
      return resolveString(raw);
    } finally {
      stack.delete(key);
    }
  };
  const resolveString = (str) => str.replace(PLACEHOLDER, (token, ns, dotted) => lookup(token, ns, dotted));
  const resolveDeep = (value) => {
    if (typeof value === 'string') return resolveString(value);
    if (Array.isArray(value)) return value.map(resolveDeep);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveDeep(v)]));
    }
    return value;
  };
  return { resolveString, resolveDeep, missingEnv };
}

export function requiredEnv(s) {
  const names = new Set();
  walkStrings(s, (str) => {
    for (const [, ns, dotted] of str.matchAll(PLACEHOLDER)) if (ns === 'env') names.add(dotted);
  });
  return [...names].sort();
}

export function formatTarget(t) {
  if (!t) return '—';
  const parts = [];
  if (t.frame) parts.push(`frame "${t.frame}" >`);
  if (t.within) parts.push(`${formatTarget(t.within)} >`);
  if (t.role) parts.push(t.name !== undefined ? `role=${t.role} name="${t.name}"` : `role=${t.role}`);
  else if (t.label) parts.push(`label="${t.label}"`);
  else if (t.text) parts.push(`text="${t.text}"`);
  else if (t.placeholder) parts.push(`placeholder="${t.placeholder}"`);
  else if (t.testId) parts.push(`testId="${t.testId}"`);
  else if (t.css) parts.push(`css=${t.css}`);
  if (t.exact) parts.push('exact');
  if (t.nth !== undefined) parts.push(`nth=${t.nth}`);
  if (t.verified === false) parts.push('(unverified)');
  return parts.join(' ');
}

export function formatAction(a) {
  if (!a) return '—';
  switch (a.type) {
    case 'navigate':
      return `navigate ${a.url}`;
    case 'fill':
      return `fill "${a.value}"`;
    case 'select':
      return `select ${a.by === 'value' ? 'value' : 'option'} "${a.value}"`;
    case 'press':
      return `press ${a.key}`;
    case 'wait':
      return `wait ${a.ms} ms`;
    case 'waitFor':
      return `wait until ${a.state ?? 'visible'}`;
    default:
      return a.type;
  }
}

export function formatExpect(e) {
  const op = e.equals !== undefined ? `equals "${e.equals}"` : `contains "${e.contains}"`;
  switch (e.type) {
    case 'visible':
      return `visible: ${formatTarget(e.target)}`;
    case 'hidden':
      return `hidden: ${formatTarget(e.target)}`;
    case 'text':
      return `text of ${formatTarget(e.target)} ${op}`;
    case 'url':
      return `URL ${op}`;
    default:
      return `title ${op}`;
  }
}

export function collectTargets(step) {
  const found = [];
  const add = (t) => {
    if (!t) return;
    found.push(t);
    add(t.within);
  };
  add(step.action?.target);
  for (const e of step.expect ?? []) add(e.target);
  return found;
}
