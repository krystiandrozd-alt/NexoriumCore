// Deterministic quality score (0-100) for a scenario that already passed validation.
import { MUTATING_ACTIONS, collectTargets } from './scenario.mjs';

const TBD = /^\s*(TBD|TODO)\b/i;
const filled = (v) => typeof v === 'string' && v.trim() !== '' && !TBD.test(v);
const share = (items, ok) => (items.length ? items.filter(ok).length / items.length : 1);
const missing = (items, ok) => items.filter((item) => !ok(item)).length;

export function lintScenario(s) {
  const q = s.quality;
  const findings = [];
  let total = 0;
  const award = (category, max, ratio, message) => {
    const points = Math.round(max * ratio * 10) / 10;
    total += points;
    if (points < max) findings.push({ category, points, max, message });
  };

  // Situation: 25 points (Great Demo! Situation Slide)
  const sit = s.situation;
  award('situation', 5, filled(sit.criticalBusinessIssue) ? 1 : 0, 'Critical business issue is missing or still TBD.');
  award('situation', 5, sit.problems.some(filled) ? 1 : 0, 'Add at least one confirmed problem.');
  award('situation', 5, sit.specificCapabilities.some(filled) ? 1 : 0, 'List the specific capabilities the demo proves.');
  award('situation', 5, filled(sit.delta.statement) ? 1 : 0, 'The delta statement is missing or still TBD.');
  const metrics = sit.delta.metrics ?? [];
  const unconfirmed = missing(metrics, (m) => filled(m.before) && filled(m.after));
  award(
    'situation',
    5,
    !metrics.length ? 0 : unconfirmed === metrics.length ? 0.4 : 1,
    metrics.length
      ? `${unconfirmed} of ${metrics.length} delta metric(s) are still TBD: confirm baseline and target with the customer.`
      : 'Add at least one delta metric with before and after values.',
  );

  // Storyline: 15 points
  const st = s.storyline;
  award('storyline', 5, filled(st.lastThingFirst.description) ? 1 : 0, 'Describe the result you show first (do the last thing first).');
  const takeaways = st.keyTakeaways.filter(filled).length;
  award(
    'storyline',
    5,
    takeaways >= 1 && takeaways <= 3 ? 1 : takeaways > 3 ? 0.6 : 0,
    takeaways > 3 ? 'More than three key takeaways: keep the three that matter most.' : 'Add one to three key takeaways.',
  );
  award('storyline', 5, (st.closing.nextSteps ?? []).some(filled) ? 1 : 0, 'Add at least one concrete next step to the closing.');

  // Scenes: 35 points (Tell-Show-Tell, one takeaway per scene)
  const scenes = s.scenes;
  const told = (sc) => filled(sc.tell) && filled(sc.valueStatement);
  award('scenes', 10, share(scenes, told), `${missing(scenes, told)} scene(s) lack an opening tell or a closing value statement.`);
  const wow = (sc) => filled(sc.wowMoment);
  award('scenes', 5, share(scenes, wow), `${missing(scenes, wow)} scene(s) have no wow moment.`);
  const asks = (sc) => (sc.discoveryQuestions ?? []).some(filled);
  award('scenes', 5, share(scenes, asks), `${missing(scenes, asks)} scene(s) have no discovery question.`);
  const short = (sc) => sc.steps.length <= q.maxStepsPerScene;
  award('scenes', 10, share(scenes, short), `${missing(scenes, short)} scene(s) have more than ${q.maxStepsPerScene} steps: split them.`);
  const quick = (sc) => sc.durationMinutes <= q.maxSceneMinutes;
  award('scenes', 5, share(scenes, quick), `${missing(scenes, quick)} scene(s) run longer than ${q.maxSceneMinutes} min.`);

  // Timing: 5 points
  const minutes = scenes.reduce((sum, sc) => sum + sc.durationMinutes, 0);
  award('timing', 5, minutes <= s.meta.durationMinutes ? 1 : 0, `Scenes take ${minutes} min, but the slot is ${s.meta.durationMinutes} min.`);

  // Technical readiness: 20 points
  const steps = scenes.flatMap((sc) => sc.steps);
  const interactive = steps.filter((step) => step.action && MUTATING_ACTIONS.has(step.action.type));
  const hasPlanB = (step) => filled(step.fallback);
  award('technical', 8, share(interactive, hasPlanB), `${missing(interactive, hasPlanB)} interactive step(s) have no plan B (fallback).`);
  const proven = (sc) => sc.steps.some((step) => (step.expect ?? []).length > 0);
  award('technical', 6, share(scenes, proven), `${missing(scenes, proven)} scene(s) have no expectation, so a headless run cannot prove them.`);
  award('technical', 3, s.runner?.baseUrl ? 1 : 0, 'Add a runner section so the click path can be smoke-tested headless.');
  const targets = steps.flatMap(collectTargets);
  const unverified = targets.filter((t) => t.verified === false).length;
  award(
    'technical',
    3,
    targets.length ? 1 - unverified / targets.length : 1,
    `${unverified} of ${targets.length} locator(s) are unverified: run the headless smoke test against the demo org, then set "verified": true.`,
  );

  const score = Math.round(total);
  let band = score >= q.readyScore ? 'demo-ready' : score >= q.reviewScore ? 'needs-review' : 'blocked';
  const gates = [];
  if (band === 'demo-ready' && unverified > 0) {
    band = 'needs-review';
    gates.push('Capped at needs-review while any locator is unverified.');
  }
  return {
    score,
    band,
    findings,
    gates,
    totals: { scenes: scenes.length, steps: steps.length, minutes, locators: targets.length, unverifiedLocators: unverified },
  };
}
