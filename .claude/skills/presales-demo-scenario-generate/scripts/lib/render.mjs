// Render the three audience layers (exec, presenter, technical) from one scenario.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import { SKILL_ROOT, LAYERS, createResolver, requiredEnv, formatTarget, formatAction, formatExpect } from './scenario.mjs';
import { labelsFor, builtInChecklist, authText } from './labels.mjs';

const inLayer = (step, layer) => (step.layers ?? ['presenter', 'technical']).includes(layer);

// Template context. Documents never contain environment values: {{env.X}} renders as ‹env:X›.
export function buildContext(s) {
  const { resolveDeep } = createResolver(s, { envMode: 'document' });
  const r = resolveDeep(s);
  const labels = labelsFor(r.meta.language, r.output.labels);
  const personaById = new Map(r.personas.map((p) => [p.id, p]));
  let minute = 0;
  const scenes = r.scenes.map((scene, i) => {
    const startMinute = minute;
    minute += scene.durationMinutes;
    const presenterSteps = scene.steps.filter((st) => inLayer(st, 'presenter')).map((st, j) => ({ ...st, number: j + 1 }));
    const technicalSteps = scene.steps
      .filter((st) => inLayer(st, 'technical'))
      .map((st, j) => ({
        ...st,
        number: j + 1,
        actionText: formatAction(st.action),
        targetText: formatTarget(st.action?.target),
        expectText: (st.expect ?? []).map(formatExpect).join('; ') || '—',
        fallbackText: st.fallback ?? '—',
      }));
    return {
      ...scene,
      number: i + 1,
      persona: personaById.get(scene.personaId),
      startMinute,
      endMinute: minute,
      presenterSteps,
      technicalSteps,
    };
  });
  return {
    scenario: r,
    meta: r.meta,
    situation: r.situation,
    storyline: r.storyline,
    personas: r.personas,
    scenes,
    variables: Object.entries(r.variables).map(([name, value]) => ({ name, value: String(value) })),
    records: r.records.map((rec) => ({
      ...rec,
      fieldsText: Object.entries(rec.fields)
        .map(([field, value]) => `${field}: ${value}`)
        .join(', '),
    })),
    runner: r.runner,
    orgPrep: r.orgPrep,
    labels,
    requiredEnv: requiredEnv(s),
    authText: authText(labels, r.runner?.auth),
    checklistItems: [...builtInChecklist(labels, r), ...r.checklist],
    totals: { scenes: scenes.length, minutes: minute, steps: r.scenes.reduce((n, sc) => n + sc.steps.length, 0) },
  };
}

function makeHandlebars() {
  const hb = Handlebars.create();
  hb.registerHelper('inc', (n) => Number(n) + 1);
  hb.registerHelper('join', (list, sep) => (Array.isArray(list) ? list.join(typeof sep === 'string' ? sep : ', ') : ''));
  hb.registerHelper('cell', (value) =>
    value === undefined || value === null || value === '' ? '—' : String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>'),
  );
  hb.registerHelper('eq', (a, b) => a === b);
  return hb;
}

const tidyMarkdown = (md) => `${md.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()}\n`;

export async function renderLayers(loaded, s, { outDir, only }) {
  const context = buildContext(s);
  const hb = makeHandlebars();
  await mkdir(outDir, { recursive: true });
  const written = [];
  for (const layer of LAYERS) {
    const cfg = s.output.layers[layer];
    if (!cfg.enabled || (only && !only.includes(layer))) continue;
    const templatePath = cfg.template
      ? path.resolve(loaded.dir, cfg.template)
      : path.join(SKILL_ROOT, 'assets', 'templates', `${layer}.md.hbs`);
    const template = hb.compile(await readFile(templatePath, 'utf8'), { noEscape: true });
    const file = path.join(outDir, cfg.fileName);
    await writeFile(file, tidyMarkdown(template(context)));
    written.push(file);
  }
  return written;
}
