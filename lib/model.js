// Training log model. Pure functions shared by the browser and the API.
// Weeks start on Monday so Tuesday strength, Thursday intervals, and the
// weekend hike land in the same week.

export const LEGACY_START = '2026-05-19'; // Old program, week 1 day A (Tuesday).
const LEGACY_STAMP = '2026-07-12T12:00:00.000Z';

export const SLOTS = [
  { id: 'A', short: 'Tue', label: 'Strength A', when: 'Tuesday', minutes: '~35 min' },
  { id: 'B', short: 'Thu', label: 'Cardio + Strength B', when: 'Thursday', minutes: '~40 min' },
  { id: 'M', short: 'Hips', label: 'Hip Flow', when: 'Any 2–3 days', minutes: '10–15 min' },
  { id: 'H', short: 'Hike', label: 'Easy hike', when: 'Weekend', minutes: 'Easy pace' },
];

export const CHART_LIFTS = [
  { id: 'A-goblet', name: 'Goblet squat' },
  { id: 'A-rdl', name: 'KB RDL' },
  { id: 'A-row', name: 'Row' },
  { id: 'B-pulldown', name: 'Pull-down' },
];

const PROG_NAMES = {
  'prog-goblet': 'Goblet Squat',
  'prog-rdl': 'KB RDL',
  'prog-bss': 'Bulgarian Split Squat',
  'prog-sl-rdl': 'Single Leg KB RDL',
  'prog-lat-lunge': 'Lateral Lunge',
  'prog-sumo': 'KB Sumo Deadlift',
  'prog-swing': 'KB Swing',
  'prog-trxrow': 'TRX Row',
  'prog-trxpush': 'TRX Push-Up',
  'prog-ancore-row': 'ANCORE Row',
  'prog-ancore-pull': 'ANCORE Pull-Down',
  'prog-face-pull': 'Face Pull',
  'prog-sa-pulldown': 'Straight Arm Pull-Down',
  'prog-plank': 'Plank Hold',
  'prog-sideplank': 'Side Plank',
  'prog-situp': 'Straight Leg Sit-Up',
  'prog-pallof': 'Pallof Press',
  'prog-chop': 'Half-Kneeling ANCORE Chop',
  'prog-suitcase': 'Suitcase Carry',
  'prog-slam': 'Med Ball Slam',
  'prog-jr': 'Jump Rope Intervals',
};

// Same movement, new id. Everything else from the old program stays in the archive.
const MOVE = {
  'A-l1': 'A-goblet',
  'A-l2': 'A-rdl',
  'B-p2': 'A-row',
  'C-c5': 'A-carry',
  'A-c2': 'A-deadbug',
  'C-mp2': 'B-airplane',
  'C-u2': 'B-pulldown',
  'C-c4': 'B-pallof',
  'M-h1': 'M-9090',
  'M-t4': 'M-bretzel',
  'M-h4': 'M-couch',
};

export const DEFAULT_PROGRAM = {
  A: {
    id: 'A',
    label: 'Strength A',
    when: 'Tuesday',
    minutes: '~35 min',
    blurb: 'Six moves. A few easy squats are the warm-up. Rest as long as you need between sets.',
    sections: [
      {
        title: 'Strength',
        exercises: [
          {
            id: 'A-goblet',
            name: 'Goblet Squat',
            equip: 'Kettlebell',
            dose: '3 × 8',
            sets: 3,
            log: 'load',
            cue: 'Bell at your chest. Sit between your hips and stand tall.',
          },
          {
            id: 'A-rdl',
            name: 'KB Romanian Deadlift',
            equip: 'Kettlebell',
            dose: '3 × 8',
            sets: 3,
            log: 'load',
            cue: 'Soft knees, hips back, bell close to your legs. Squeeze to stand.',
          },
          {
            id: 'A-row',
            name: 'Row',
            equip: 'ANCORE or anchor pulley',
            dose: '3 × 8',
            sets: 3,
            log: 'load',
            cue: 'Handle to your belly, elbow back. Lower it for a slow three-count.',
          },
          {
            id: 'A-pushup',
            name: 'Push-up',
            equip: 'Floor, bench, or wall',
            dose: '3 × 6–10',
            sets: 3,
            log: 'reps',
            cue: 'Use the height that lets every rep stay clean. Body in one line.',
          },
          {
            id: 'A-carry',
            name: 'Suitcase Carry',
            equip: 'Kettlebell',
            dose: '3 × 30 sec each side',
            sets: 3,
            log: 'carry',
            cue: 'One bell at your side. Stay tall. If you lean, it is too heavy.',
          },
          {
            id: 'A-deadbug',
            name: 'Dead Bug',
            equip: 'Mat',
            dose: '3 × 6 each side',
            sets: 3,
            log: 'reps',
            cue: 'Low back stays heavy on the floor. Shorten the reach if it peels up.',
          },
        ],
      },
    ],
  },
  B: {
    id: 'B',
    label: 'Cardio + Strength B',
    when: 'Thursday',
    minutes: '~40 min',
    blurb: 'Intervals first, then a short strength block. If time runs out, one good set of each still counts.',
    sections: [
      {
        title: 'Norwegian 4×4',
        exercises: [
          {
            id: 'B-4x4',
            name: 'Norwegian 4×4',
            equip: 'Walk, hike grade, bike, or rower',
            dose: '4 × 4 min hard, 3 min easy',
            log: 'intervals',
            intervals: 4,
            cue: 'Warm up easy for 5–10 minutes. Hard is about 85–95% of max heart rate: a few words, not a conversation. A rough age-based window is 140–156 bpm. The 3 minutes between should feel truly easy. Stop if you feel dizzy, have chest pain, or feel unwell.',
          },
        ],
      },
      {
        title: 'Strength',
        exercises: [
          {
            id: 'B-split',
            name: 'Split Squat',
            equip: 'Bodyweight or kettlebell',
            dose: '2 × 6 each side',
            sets: 2,
            log: 'load',
            cue: 'Rear foot back, front heel heavy. Shorten the range if the knee complains.',
          },
          {
            id: 'B-airplane',
            name: 'Hip Airplane',
            equip: 'Wall for balance',
            dose: '2 × 5 each side',
            sets: 2,
            log: 'reps',
            cue: 'Stand on one leg, hinge, and open then close the pelvis. Slow. A wall is fine.',
          },
          {
            id: 'B-pulldown',
            name: 'Pull-down',
            equip: 'ANCORE or anchor pulley',
            dose: '2 × 8',
            sets: 2,
            log: 'load',
            cue: 'Pull the bar or handle toward your chest. Elbows down, shoulders quiet.',
          },
          {
            id: 'B-pallof',
            name: 'Pallof Press',
            equip: 'ANCORE or band',
            dose: '2 × 8 each side',
            sets: 2,
            log: 'load',
            cue: 'Press straight out and do not let the cable twist you. Breathe.',
          },
        ],
      },
    ],
  },
  M: {
    id: 'M',
    label: 'Hip Flow',
    when: 'Any 2–3 days',
    minutes: '10–15 min',
    blurb: 'Slow and easy. Two days makes the week. Three is plenty.',
    sections: [
      {
        title: 'Hips',
        exercises: [
          {
            id: 'M-9090',
            name: '90/90',
            equip: 'Mat',
            dose: '8 slow switches',
            log: 'flow',
            cue: 'Sit tall and switch sides. Hands can help today.',
          },
          {
            id: 'M-bretzel',
            name: 'Bretzel',
            equip: 'Mat',
            dose: '45–60 sec each side',
            log: 'flow',
            cue: 'Top knee toward the chest, top shoulder open. Breathe. Do not force the foot.',
          },
          {
            id: 'M-couch',
            name: 'Couch Stretch',
            equip: 'Couch or wall, pad for the knee',
            dose: '45–60 sec each side',
            log: 'flow',
            cue: 'Half-kneeling, back foot up. Tuck the pelvis. Keep the low back from arching.',
          },
        ],
      },
    ],
  },
};

export function esc(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export const CHICAGO = 'America/Chicago';
export const WEEK_BACK = 16;
export const WEEK_AHEAD = 8;

export function nowIso() {
  return new Date().toISOString();
}

// Calendar "today" is Chicago time, even if the phone is set to UTC.
// Sunday evening in Chicago must stay Sunday, not roll into Monday.
export function chicagoNow(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: CHICAGO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });
  const parts = {};
  for (const part of fmt.formatToParts(now)) parts[part.type] = part.value;
  let hour = Number(parts.hour);
  if (!Number.isFinite(hour) || hour === 24) hour = 0;
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  // Built from Chicago's year/month/day so weekday math matches that calendar date.
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return { date, hour, iso: isoDate(date), weekday: parts.weekday };
}

export function isoDate(date) {
  const dt = new Date(date);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISO(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function weekKey(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - mondayOffset);
  return isoDate(d);
}

export function shiftWeek(week, delta) {
  return isoDate(addDays(parseISO(week), delta * 7));
}

export function plannedDate(week, slot) {
  const offset = slot === 'A' ? 1 : slot === 'B' ? 3 : slot === 'H' ? 5 : 0;
  return isoDate(addDays(parseISO(week), offset));
}

export function suggestSlot(date) {
  const day = date.getDay();
  if (day === 2) return 'A';
  if (day === 4) return 'B';
  if (day === 6 || day === 0) return 'H';
  return 'M';
}

export function formatWeekRange(week) {
  const start = parseISO(week);
  const end = addDays(start, 6);
  const left = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const right = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${left} – ${right}`;
}

export function formatPretty(iso) {
  return parseISO(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });
}

export function formatShort(iso) {
  return parseISO(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function defaultProgram() {
  return structuredClone(DEFAULT_PROGRAM);
}

export function blankState(at = nowIso()) {
  return {
    version: 2,
    updatedAt: at,
    program: { updatedAt: '', days: defaultProgram() },
    logs: {},
    checkins: {},
    carried: {},
    archive: null,
    migratedFrom: null,
  };
}

function isObj(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function sanitizeState(input) {
  if (!isObj(input) || input.version !== 2) return null;
  const fresh = blankState(typeof input.updatedAt === 'string' ? input.updatedAt : nowIso());
  const days = isObj(input.program?.days) ? input.program.days : {};
  for (const slot of ['A', 'B', 'M']) {
    const day = days[slot];
    if (day && Array.isArray(day.sections) && day.sections.every((s) => s && Array.isArray(s.exercises))) {
      fresh.program.days[slot] = day;
    }
  }
  fresh.program.updatedAt = typeof input.program?.updatedAt === 'string' ? input.program.updatedAt : '';
  fresh.logs = isObj(input.logs) ? input.logs : {};
  fresh.checkins = isObj(input.checkins) ? input.checkins : {};
  fresh.carried = isObj(input.carried) ? input.carried : {};
  fresh.archive = isObj(input.archive) ? input.archive : null;
  fresh.migratedFrom = typeof input.migratedFrom === 'string' ? input.migratedFrom : null;
  return fresh;
}

export function sessionExercises(day) {
  return (day?.sections || []).flatMap((s) => s.exercises || []);
}

export function findExercise(day, exId) {
  for (const section of day?.sections || []) {
    const idx = (section.exercises || []).findIndex((e) => e.id === exId);
    if (idx !== -1) return { section, exercise: section.exercises[idx], index: idx };
  }
  return null;
}

export function isExerciseDone(ex, entry) {
  if (!entry) return false;
  if (entry.done) return true;
  if (ex?.log === 'intervals') {
    const n = ex.intervals || 4;
    const rows = entry.intervals || [];
    return rows.length >= n && rows.slice(0, n).every((r) => r && r.done);
  }
  return false;
}

export function isSessionDone(day, log) {
  const exercises = sessionExercises(day);
  if (!exercises.length || !log) return false;
  return exercises.every((ex) => isExerciseDone(ex, log.exercises?.[ex.id]));
}

export function mobilityKeys(state, week) {
  const prefix = `${week}:M:`;
  return Object.keys(state?.logs || {}).filter((k) => k.startsWith(prefix)).sort();
}

export function weekStatus(state, week) {
  const days = state?.program?.days || {};
  const A = isSessionDone(days.A, state?.logs?.[`${week}:A`]);
  const B = isSessionDone(days.B, state?.logs?.[`${week}:B`]);
  const mobilityCount = mobilityKeys(state, week).filter((k) => isSessionDone(days.M, state.logs[k])).length;
  const M = mobilityCount >= 2;
  const hike = state?.logs?.[`${week}:H`];
  const H = !!(hike && hike.done);
  const parts = [A, B, M, H].filter(Boolean).length;
  return { A, B, M, H, mobilityCount, parts, kept: parts >= 2 };
}

export function currentStreak(state, today = new Date()) {
  let week = weekKey(today);
  if (!weekStatus(state, week).kept) week = shiftWeek(week, -1);
  let n = 0;
  while (n < 104 && weekStatus(state, week).kept) {
    n += 1;
    week = shiftWeek(week, -1);
  }
  return n;
}

export function recentWeeks(today = new Date(), count = 8) {
  const weeks = [];
  let week = weekKey(today);
  for (let i = 0; i < count; i += 1) {
    weeks.push(week);
    week = shiftWeek(week, -1);
  }
  return weeks.reverse();
}

export function encouragement(date, status, slot) {
  if (status?.parts >= 4) return 'All four pieces are in. That is a complete week.';
  if (status?.kept) return 'This week already counts. Anything else is a bonus.';
  const bySlot = {
    A: 'Six moves. Mark them done. The weights can wait.',
    B: 'Intervals first. The strength after is short on purpose.',
    M: 'Slow and easy. Two days of this makes the week.',
    H: 'Easy pace today. A short loop still counts.',
  };
  if (bySlot[slot]) return bySlot[slot];
  const lines = [
    'Low motivation is a fine day for the short version.',
    'You already know how to train. Today is just the decision to start.',
    'Showing up on a quiet week is the whole point.',
  ];
  return lines[Math.floor(date.getTime() / 86400000) % lines.length];
}

export function emptyExerciseLog(ex, at = nowIso()) {
  if (ex.log === 'intervals') {
    const n = ex.intervals || 4;
    return {
      done: false,
      intervals: Array.from({ length: n }, () => ({ done: false, hr: '' })),
      note: '',
      updatedAt: at,
    };
  }
  if (ex.log === 'flow') return { done: false, note: '', updatedAt: at };
  const n = ex.sets || 3;
  return {
    done: false,
    sets: Array.from({ length: n }, () => ({ reps: '', lb: '', sec: '' })),
    note: '',
    updatedAt: at,
  };
}

function maxIso(a, b) {
  const as = a || '';
  const bs = b || '';
  return as >= bs ? as : bs;
}

function newerRecord(a, b) {
  if (!a) return b;
  if (!b) return a;
  return (a.updatedAt || '') >= (b.updatedAt || '') ? a : b;
}

function mergeMaps(a = {}, b = {}) {
  const out = {};
  for (const key of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    out[key] = newerRecord(a?.[key], b?.[key]);
  }
  return out;
}

function mergeCarried(a = {}, b = {}) {
  const out = {};
  for (const id of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    const byDate = new Map();
    for (const item of [...(a?.[id] || []), ...(b?.[id] || [])]) {
      if (!item || !item.date) continue;
      const prev = byDate.get(item.date);
      if (!prev || (item.updatedAt || '') >= (prev.updatedAt || '')) byDate.set(item.date, item);
    }
    out[id] = [...byDate.values()].sort((x, y) => String(x.date).localeCompare(String(y.date)));
  }
  return out;
}

function mergeArchive(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  const sessions = new Map();
  for (const session of [...(a.sessions || []), ...(b.sessions || [])]) {
    if (!session) continue;
    sessions.set(`${session.week}:${session.dayKey}`, session);
  }
  const progress = new Map();
  for (const row of [...(a.progress || []), ...(b.progress || [])]) {
    if (!row) continue;
    progress.set(`${row.id}:${row.week}`, row);
  }
  const custom = new Map();
  for (const ex of [...(a.customExercises || []), ...(b.customExercises || [])]) {
    if (ex?.id) custom.set(ex.id, ex);
  }
  return {
    updatedAt: maxIso(a.updatedAt, b.updatedAt),
    sessions: [...sessions.values()].sort((x, y) => String(x.date).localeCompare(String(y.date)) || String(x.dayKey).localeCompare(String(y.dayKey))),
    progress: [...progress.values()].sort((x, y) => x.week - y.week || String(x.name).localeCompare(String(y.name))),
    customExercises: [...custom.values()],
  };
}

function customExercisesIn(program) {
  const found = [];
  for (const slot of ['A', 'B', 'M']) {
    for (const section of program?.days?.[slot]?.sections || []) {
      for (const exercise of section.exercises || []) {
        if (exercise?.id && String(exercise.id).startsWith('custom-')) found.push({ slot, exercise });
      }
    }
  }
  return found;
}

// The newer program wins for edits, but exercises she added on either phone stay.
function mergePrograms(a, b) {
  const winner = newerRecord(a, b);
  const other = winner === a ? b : a;
  if (!winner) return other || null;
  if (!other) return winner;
  const days = structuredClone(winner.days || {});
  for (const { slot, exercise } of customExercisesIn(other)) {
    const day = days[slot];
    if (!day) continue;
    const already = (day.sections || []).some((section) => (section.exercises || []).some((item) => item.id === exercise.id));
    if (already) continue;
    let yours = (day.sections || []).find((section) => section.title === 'Yours');
    if (!yours) {
      yours = { title: 'Yours', exercises: [] };
      day.sections = day.sections || [];
      day.sections.push(yours);
    }
    yours.exercises.push(structuredClone(exercise));
  }
  return { ...winner, days };
}

export function sameContent(a, b) {
  if (!a || !b) return false;
  const pick = (s) => JSON.stringify({
    program: s.program,
    logs: s.logs,
    checkins: s.checkins,
    carried: s.carried,
    archive: s.archive,
  });
  return pick(a) === pick(b);
}

export function mergeState(local, remote) {
  const a = local ? sanitizeState(local) : null;
  const b = remote ? sanitizeState(remote) : null;
  if (!a) return b;
  if (!b) return a;
  return sanitizeState({
    version: 2,
    updatedAt: maxIso(a.updatedAt, b.updatedAt),
    program: mergePrograms(a.program, b.program),
    logs: mergeMaps(a.logs, b.logs),
    checkins: mergeMaps(a.checkins, b.checkins),
    carried: mergeCarried(a.carried, b.carried),
    archive: mergeArchive(a.archive, b.archive),
    migratedFrom: a.migratedFrom || b.migratedFrom || null,
  });
}

function legacyWeekMonday(weekNumber) {
  const tuesday = addDays(parseISO(LEGACY_START), (weekNumber - 1) * 7);
  return weekKey(tuesday);
}

function legacySessionDate(weekNumber, dayKey) {
  const tuesday = addDays(parseISO(LEGACY_START), (weekNumber - 1) * 7);
  const offset = dayKey === 'A' ? 0 : dayKey === 'B' ? 2 : dayKey === 'C' ? 4 : 1;
  return isoDate(addDays(tuesday, offset));
}

function parseMaybe(value) {
  if (typeof value !== 'string') return null;
  try { return JSON.parse(value); } catch { return null; }
}

function namesFromProgram(program) {
  const names = new Map();
  if (!program || typeof program !== 'object') return names;
  for (const day of Object.values(program)) {
    for (const section of day?.sections || []) {
      for (const ex of section?.exercises || []) {
        if (ex?.id) names.set(ex.id, ex.name || ex.id);
      }
    }
  }
  return names;
}

function customExercises(program) {
  const found = [];
  if (!program || typeof program !== 'object') return found;
  for (const [dayKey, day] of Object.entries(program)) {
    for (const section of day?.sections || []) {
      for (const ex of section?.exercises || []) {
        if (ex?.id && String(ex.id).startsWith('custom-')) found.push({ ...ex, dayKey });
      }
    }
  }
  return found;
}

function doseOf(ex) {
  if (Array.isArray(ex.reps)) {
    const filled = ex.reps.map((r) => String(r || '').trim()).filter(Boolean);
    return filled[filled.length - 1] || '3 × 8';
  }
  return ex.dose || '3 × 8';
}

function appendCustoms(days, customs) {
  for (const ex of customs) {
    const slot = ex.dayKey === 'M' ? 'M' : ex.dayKey === 'B' || ex.dayKey === 'C' ? 'B' : 'A';
    const day = days[slot];
    if (!day) continue;
    let section = day.sections.find((s) => s.title === 'Yours');
    if (!section) {
      section = { title: 'Yours', exercises: [] };
      day.sections.push(section);
    }
    if (section.exercises.some((e) => e.id === ex.id)) continue;
    section.exercises.push({
      id: ex.id,
      name: ex.name || 'Exercise',
      equip: ex.equip || '',
      dose: doseOf(ex),
      sets: 3,
      log: slot === 'M' ? 'flow' : 'load',
      cue: ex.cue || '',
      carriedOver: true,
    });
  }
}

function legacySets(raw) {
  return ['set1', 'set2', 'set3']
    .map((key) => raw?.[key])
    .filter((v) => v != null && String(v).trim() !== '')
    .map((reps) => ({ reps: String(reps), lb: '', sec: '' }));
}

function preferCarried(list, item) {
  const idx = list.findIndex((row) => row.date === item.date);
  if (idx === -1) {
    list.push(item);
    return;
  }
  const prev = list[idx];
  const prevScore = (prev.sets || []).length + (prev.done ? 1 : 0);
  const nextScore = (item.sets || []).length + (item.done ? 1 : 0);
  if (nextScore >= prevScore) list[idx] = item;
}

export function migrateLegacy(state, entries) {
  const base = sanitizeState(state) || blankState();
  const map = entries || {};
  const keys = Object.keys(map);
  if (!keys.length) {
    base.migratedFrom = base.migratedFrom || 'none';
    return base;
  }

  const storedProgram = parseMaybe(map['program-v1']);
  const names = namesFromProgram(storedProgram);
  const sessions = new Map();
  const carried = {};
  const progress = [];

  const bucket = (weekNumber, dayKey) => {
    const id = `${weekNumber}:${dayKey}`;
    if (!sessions.has(id)) {
      sessions.set(id, {
        weekNumber,
        week: legacyWeekMonday(weekNumber),
        dayKey,
        date: legacySessionDate(weekNumber, dayKey),
        notes: '',
        exercises: [],
      });
    }
    return sessions.get(id);
  };

  for (const [key, value] of Object.entries(map)) {
    const log = key.match(/^log:wk(\d+):([ABCM]):(.+)$/);
    if (log) {
      const weekNumber = Number(log[1]);
      const dayKey = log[2];
      const exId = log[3];
      const raw = parseMaybe(value) || {};
      const session = bucket(weekNumber, dayKey);
      session.exercises.push({
        id: exId,
        name: names.get(exId) || exId,
        set1: raw.set1 || '',
        set2: raw.set2 || '',
        set3: raw.set3 || '',
        notes: raw.notes || '',
        completed: !!raw.completed,
      });
      const dest = MOVE[exId];
      if (dest) {
        if (!carried[dest]) carried[dest] = [];
        preferCarried(carried[dest], {
          date: legacySessionDate(weekNumber, dayKey),
          sets: legacySets(raw),
          done: !!raw.completed,
          note: raw.notes || '',
          updatedAt: LEGACY_STAMP,
        });
      }
      continue;
    }

    const note = key.match(/^sess-note:wk(\d+):([ABCM])$/);
    if (note) {
      bucket(Number(note[1]), note[2]).notes = String(value || '');
      continue;
    }

    const prog = key.match(/^prog:([^:]+):wk(\d+)$/);
    if (prog && String(value || '').trim()) {
      progress.push({
        id: prog[1],
        name: PROG_NAMES[prog[1]] || prog[1],
        week: Number(prog[2]),
        value: String(value),
      });
    }
  }

  const customs = customExercises(storedProgram);
  const days = structuredClone(base.program.days);
  appendCustoms(days, customs);

  const hasArchive = sessions.size || progress.length || customs.length;
  const archive = hasArchive ? {
    updatedAt: LEGACY_STAMP,
    sessions: [...sessions.values()].sort((a, b) => a.weekNumber - b.weekNumber || a.dayKey.localeCompare(b.dayKey)),
    progress: progress.sort((a, b) => a.week - b.week || a.name.localeCompare(b.name)),
    customExercises: customs.map((ex) => ({
      id: ex.id,
      name: ex.name || 'Exercise',
      dayKey: ex.dayKey,
      equip: ex.equip || '',
      cue: ex.cue || '',
      dose: doseOf(ex),
    })),
  } : base.archive;

  return sanitizeState({
    ...base,
    updatedAt: nowIso(),
    program: {
      updatedAt: customs.length ? nowIso() : base.program.updatedAt,
      days,
    },
    carried: mergeCarried(base.carried, carried),
    archive: mergeArchive(base.archive, archive),
    migratedFrom: 'local-v1',
  });
}

function maxLb(sets) {
  const nums = [];
  for (const set of sets || []) {
    const direct = Number(set?.lb);
    if (Number.isFinite(direct) && direct > 0) nums.push(direct);
    const written = String(set?.reps || '').match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs)\b/i);
    if (written) nums.push(Number(written[1]));
  }
  return nums.length ? Math.max(...nums) : null;
}

export function loadPoints(state, exerciseId) {
  const points = [];
  for (const item of state?.carried?.[exerciseId] || []) {
    const lb = maxLb(item.sets);
    if (!lb) continue;
    points.push({ date: item.date, lb, source: 'carried' });
  }
  for (const [key, log] of Object.entries(state?.logs || {})) {
    const entry = log?.exercises?.[exerciseId];
    const lb = maxLb(entry?.sets);
    if (!lb) continue;
    points.push({ date: log.date || key.slice(0, 10), lb, source: 'log' });
  }
  return points.sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-8);
}

export function hikePoints(state) {
  return Object.entries(state?.logs || {})
    .filter(([key]) => key.endsWith(':H'))
    .map(([key, log]) => ({
      week: key.slice(0, 10),
      date: log.date || key.slice(0, 10),
      miles: Number(log.miles),
      minutes: Number(log.minutes),
      done: !!log.done,
    }))
    .filter((row) => Number.isFinite(row.miles) && row.miles > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8);
}

export function checkinPoints(state, weeks) {
  return weeks.map((week) => {
    const row = state?.checkins?.[week] || {};
    const num = (v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? v : null);
    return {
      week,
      energy: num(row.energy),
      sleep: num(row.sleep),
      motivation: num(row.motivation),
    };
  });
}

export function clampScore(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 5) return null;
  return n;
}

export function earliestWeek(state, today = new Date()) {
  let min = weekKey(today);
  const keys = [
    ...Object.keys(state?.logs || {}),
    ...Object.keys(state?.checkins || {}),
  ];
  for (const key of keys) {
    const week = key.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(week) && week < min) min = week;
  }
  for (const session of state?.archive?.sessions || []) {
    if (session?.week && session.week < min) min = session.week;
  }
  return min;
}

export function weekBounds(state, today = new Date()) {
  const current = weekKey(today);
  const dataEarliest = earliestWeek(state, today);
  const windowEarliest = shiftWeek(current, -WEEK_BACK);
  const earliest = dataEarliest < windowEarliest ? dataEarliest : windowEarliest;
  return {
    current,
    earliest,
    latest: shiftWeek(current, WEEK_AHEAD),
  };
}

export function shiftWithinBounds(week, delta, bounds) {
  const next = shiftWeek(week, delta);
  if (next < bounds.earliest || next > bounds.latest) return week;
  return next;
}

export function sessionDoneCount(day, log) {
  const exercises = sessionExercises(day);
  const done = exercises.filter((ex) => isExerciseDone(ex, log?.exercises?.[ex.id])).length;
  return { done, total: exercises.length };
}
