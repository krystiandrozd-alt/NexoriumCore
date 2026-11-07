// Built-in labels for the rendered documents. Every key can be overridden in output.labels.
const EN = {
  customer: 'Customer',
  product: 'Product',
  duration: 'Duration',
  audience: 'Audience',
  minutes: 'min',
  situation: 'Customer situation',
  jobTitle: 'Role',
  industry: 'Industry',
  criticalBusinessIssue: 'Critical business issue',
  criticalDate: 'Critical date',
  problems: 'Problems today',
  capabilities: 'What we will show',
  delta: 'Value of change',
  metric: 'Metric',
  before: 'Before',
  after: 'After',
  whatYouWillSee: 'Where we will end',
  agenda: 'Agenda',
  scene: 'Scene',
  persona: 'Persona',
  time: 'Time',
  value: 'Value',
  keyTakeaways: 'Key takeaways',
  nextSteps: 'Next steps',
  presenterScript: 'Presenter script',
  opening: 'Opening',
  objective: 'Objective',
  tell: 'Set the scene',
  wowMoment: 'Wow moment',
  valueStatement: 'Land the value',
  discoveryQuestions: 'Discovery questions',
  objections: 'Objections and answers',
  closing: 'Closing',
  assumptions: 'Not yet confirmed with the customer',
  technicalRunbook: 'Technical runbook',
  environment: 'Environment',
  baseUrl: 'Base URL',
  auth: 'Login',
  browser: 'Browser',
  targetOrg: 'Target org',
  allowedOrgs: 'allowed',
  requiredEnv: 'Environment variables',
  demoData: 'Demo data',
  variable: 'Variable',
  fields: 'Fields',
  user: 'User',
  permissionSets: 'Permission sets',
  preDemoChecklist: 'Pre-demo checklist',
  step: 'Step',
  action: 'Action',
  target: 'Element',
  expected: 'Expected result',
  fallback: 'Plan B',
  checkOrgPrep: 'Prepare the org: run org-prep/prepare-org.sh against {org} and confirm that every verification passes.',
  checkSmokeTest: 'Run the headless smoke test (node scripts/demo.mjs run <scenario>) and fix every failed step.',
  checkRecording: 'Keep the latest headless recording ready as plan B.',
  checkBrowser: 'Use a clean browser profile; close other tabs, chats and notifications.',
  authNone: 'none (public page)',
  authUrl: 'pre-authenticated URL',
  authSfCli: 'sf org open --url-only --target-org {org}',
  authStorageState: 'saved browser session: {path}',
};

const PL = {
  ...EN,
  customer: 'Klient',
  product: 'Produkt',
  duration: 'Czas',
  audience: 'Odbiorcy',
  situation: 'Sytuacja klienta',
  jobTitle: 'Rola',
  industry: 'Branża',
  criticalBusinessIssue: 'Kluczowy problem biznesowy',
  criticalDate: 'Termin krytyczny',
  problems: 'Problemy dziś',
  capabilities: 'Co pokażemy',
  delta: 'Wartość zmiany',
  metric: 'Miara',
  before: 'Przed',
  after: 'Po',
  whatYouWillSee: 'Gdzie skończymy',
  scene: 'Scena',
  time: 'Czas',
  value: 'Wartość',
  keyTakeaways: 'Najważniejsze wnioski',
  nextSteps: 'Następne kroki',
  presenterScript: 'Skrypt prezentera',
  opening: 'Otwarcie',
  objective: 'Cel',
  tell: 'Wprowadzenie',
  wowMoment: 'Moment „wow”',
  valueStatement: 'Wartość dla klienta',
  discoveryQuestions: 'Pytania discovery',
  objections: 'Obiekcje i odpowiedzi',
  closing: 'Zamknięcie',
  assumptions: 'Jeszcze niepotwierdzone przez klienta',
  technicalRunbook: 'Runbook techniczny',
  environment: 'Środowisko',
  baseUrl: 'Bazowy URL',
  auth: 'Logowanie',
  browser: 'Przeglądarka',
  targetOrg: 'Docelowy org',
  allowedOrgs: 'dozwolone',
  requiredEnv: 'Zmienne środowiskowe',
  demoData: 'Dane demo',
  variable: 'Zmienna',
  fields: 'Pola',
  user: 'Użytkownik',
  preDemoChecklist: 'Checklista przed demo',
  step: 'Krok',
  action: 'Akcja',
  expected: 'Oczekiwany wynik',
  checkOrgPrep: 'Przygotuj org: uruchom org-prep/prepare-org.sh na {org} i sprawdź, czy wszystkie weryfikacje przechodzą.',
  checkSmokeTest: 'Uruchom test headless (node scripts/demo.mjs run <scenariusz>) i popraw każdy nieudany krok.',
  checkRecording: 'Miej pod ręką ostatnie nagranie z testu headless jako plan B.',
  checkBrowser: 'Użyj czystego profilu przeglądarki; zamknij inne karty, czaty i powiadomienia.',
  authNone: 'brak (strona publiczna)',
  authUrl: 'URL z aktywną sesją',
  authStorageState: 'zapisana sesja przeglądarki: {path}',
};

const SETS = { en: EN, pl: PL };

export function labelsFor(language, overrides = {}) {
  const lang = String(language ?? 'en').slice(0, 2).toLowerCase();
  return { ...(SETS[lang] ?? EN), ...overrides };
}

export function builtInChecklist(labels, s) {
  const items = [];
  if (s.orgPrep) items.push(labels.checkOrgPrep.replace('{org}', s.orgPrep.targetOrg));
  if (s.runner) items.push(labels.checkSmokeTest);
  if (s.runner?.video?.enabled) items.push(labels.checkRecording);
  items.push(labels.checkBrowser);
  return items;
}

export function authText(labels, auth) {
  switch (auth?.type) {
    case 'url':
      return labels.authUrl;
    case 'sfCli':
      return labels.authSfCli.replace('{org}', auth.targetOrg);
    case 'storageState':
      return labels.authStorageState.replace('{path}', auth.path);
    default:
      return labels.authNone;
  }
}
