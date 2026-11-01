import {
  CHART_LIFTS,
  SLOTS,
  blankState,
  checkinPoints,
  clampScore,
  currentStreak,
  defaultProgram,
  earliestWeek,
  emptyExerciseLog,
  encouragement,
  esc,
  findExercise,
  formatPretty,
  formatShort,
  formatWeekRange,
  hikePoints,
  isExerciseDone,
  isSessionDone,
  loadPoints,
  mergeState,
  migrateLegacy,
  mobilityKeys,
  nowIso,
  plannedDate,
  recentWeeks,
  sameContent,
  sanitizeState,
  sessionDoneCount,
  sessionExercises,
  shiftWeek,
  suggestSlot,
  weekKey,
  weekStatus,
  isoDate,
  addDays,
  parseISO,
} from '/lib/model.js';

const LOCAL_KEY = 'sfp-state-v2';
const MIGRATED_FLAG = 'sfp-migrated-local-v1';
const WORDS = ['', 'Rough', 'Low', 'Okay', 'Good', 'Strong'];
const SETUP = 'Cloud sync uses a private Vercel Blob store. In the Vercel project, Storage → Create → Blob, name it jena-training-log, access Private, connect it to strength-foundation-program, then redeploy. Upstash Redis (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) works in place of Blob.';

const today = () => new Date();
const UI = {
  view: 'today',
  week: weekKey(today()),
  slot: suggestSlot(today()),
  mobilityDate: isoDate(today()),
  open: new Set(),
  adding: false,
  editing: null,
  installEvent: null,
};

let state = boot();
let revision = null;
let syncStatus = 'local';
let pushTimer = 0;
let pushing = false;
let pushQueued = false;

function boot() {
  try { localStorage.removeItem('sfp-passcode'); } catch { /* already gone */ }
  let next = null;
  try { next = sanitizeState(JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null')); } catch { next = null; }
  if (!next) next = blankState();
  if (!localStorage.getItem(MIGRATED_FLAG)) {
    const legacy = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || key.startsWith('sfp-')) continue;
      if (key === 'program-v1' || key.startsWith('log:') || key.startsWith('sess-note:') || key.startsWith('prog:')) {
        legacy[key] = localStorage.getItem(key);
      }
    }
    next = Object.keys(legacy).length ? migrateLegacy(next, legacy) : next;
    if (!Object.keys(legacy).length) next.migratedFrom = next.migratedFrom || 'none';
    localStorage.setItem(MIGRATED_FLAG, '1');
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  }
  return next;
}

function saveLocal() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

function isAppTyping() {
  const el = document.activeElement;
  const app = document.getElementById('app');
  return !!el && !!app?.contains(el) && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
}

function hello(date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function syncLabel() {
  if (syncStatus === 'synced') return 'Synced';
  if (syncStatus === 'syncing') return 'Syncing';
  if (syncStatus === 'offline') return 'Saved here';
  return 'On this phone';
}

function updateChip() {
  const chip = document.querySelector('[data-sync]');
  if (!chip) return;
  chip.textContent = syncLabel();
  chip.dataset.state = syncStatus;
}

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { push(); }, 700);
}

function touch(rerender) {
  state.updatedAt = nowIso();
  saveLocal();
  schedulePush();
  if (rerender) render();
  else updateChip();
}

async function pull(options = {}) {
  if (!options.force && isAppTyping()) return;
  syncStatus = 'syncing';
  updateChip();
  try {
    const res = await fetch('/api/state');
    if (res.status === 503) { syncStatus = 'unconfigured'; render(); return; }
    if (!res.ok) { syncStatus = 'offline'; updateChip(); return; }
    const body = await res.json();
    revision = body.revision || null;
    if (!body.state) {
      await push();
      return;
    }
    const merged = mergeState(state, body.state);
    if (!sameContent(merged, body.state)) {
      merged.updatedAt = nowIso();
      state = merged;
      saveLocal();
      await push();
      return;
    }
    state = merged;
    saveLocal();
    syncStatus = 'synced';
    render();
  } catch {
    syncStatus = 'offline';
    updateChip();
  }
}

async function push(attempt = 0) {
  if (pushing) {
    pushQueued = true;
    return;
  }
  pushing = true;
  syncStatus = 'syncing';
  updateChip();
  try {
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ baseRevision: revision, state }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 409 && attempt < 2) {
      pushing = false;
      state = mergeState(state, body.state);
      revision = body.revision || null;
      state.updatedAt = nowIso();
      saveLocal();
      await push(attempt + 1);
      return;
    }
    if (res.status === 503) { syncStatus = 'unconfigured'; render(); return; }
    if (!res.ok) { syncStatus = 'offline'; updateChip(); return; }
    revision = body.revision || revision;
    if (body.state) state = mergeState(state, body.state);
    saveLocal();
    syncStatus = 'synced';
    render();
  } catch {
    syncStatus = 'offline';
    updateChip();
  } finally {
    pushing = false;
    if (pushQueued) {
      pushQueued = false;
      await push();
    }
  }
}

function currentWeek() {
  return weekKey(today());
}

function slotMeta(id) {
  return SLOTS.find((slot) => slot.id === id);
}

function pieceOn(status, id) {
  return !!status[id];
}

function defaultHikeDate(week) {
  const saturday = plannedDate(week, 'H');
  const sunday = isoDate(addDays(parseISO(saturday), 1));
  const now = isoDate(today());
  if (week === currentWeek() && now === sunday) return sunday;
  return saturday;
}

function sessionKey() {
  if (UI.slot === 'M') return `${UI.week}:M:${UI.mobilityDate}`;
  return `${UI.week}:${UI.slot}`;
}

function ensureSession(key, extra = {}) {
  if (!state.logs[key]) {
    const [week, slot, day] = key.split(':');
    const date = extra.date || day || plannedDate(week, slot === 'H' ? 'H' : slot === 'B' ? 'B' : 'A');
    state.logs[key] = {
      updatedAt: nowIso(),
      notes: '',
      exercises: {},
      ...extra,
      date,
    };
  }
  return state.logs[key];
}

function ensureExercise(key, ex) {
  const session = ensureSession(key);
  session.exercises = session.exercises || {};
  if (!session.exercises[ex.id]) session.exercises[ex.id] = emptyExerciseLog(ex);
  const entry = session.exercises[ex.id];
  if (ex.log === 'intervals') {
    entry.intervals = entry.intervals || [];
    while (entry.intervals.length < (ex.intervals || 4)) entry.intervals.push({ done: false, hr: '' });
  } else if (ex.log !== 'flow') {
    entry.sets = entry.sets || [];
    const count = ex.sets || entry.sets.length || 3;
    while (entry.sets.length < count) entry.sets.push({ reps: '', lb: '', sec: '' });
  }
  return entry;
}

function markProgramEdit() {
  state.program.updatedAt = nowIso();
  touch(true);
}

function render() {
  if (isAppTyping()) {
    updateChip();
    return;
  }
  const root = document.getElementById('app');
  const view = UI.view === 'week' ? renderWeek() : UI.view === 'progress' ? renderProgress() : renderToday();
  root.innerHTML = view;
  document.querySelectorAll('#nav button').forEach((button) => {
    button.classList.toggle('on', button.dataset.nav === UI.view);
    button.setAttribute('aria-current', button.dataset.nav === UI.view ? 'page' : 'false');
  });
  updateChip();
}

function weekSwitcher() {
  const current = currentWeek();
  const earliest = earliestWeek(state, today());
  const here = UI.week === current;
  return `
    <div class="weekline">
      <button class="arrow" type="button" data-action="week" data-delta="-1" ${UI.week <= earliest ? 'disabled' : ''} aria-label="Previous week">‹</button>
      <div>
        <strong>${esc(formatWeekRange(UI.week))}</strong>
        ${here ? '<div class="now">This week</div>' : '<button class="text-btn" type="button" data-action="this-week">Jump to this week</button>'}
      </div>
      <button class="arrow" type="button" data-action="week" data-delta="1" ${UI.week >= current ? 'disabled' : ''} aria-label="Next week">›</button>
    </div>`;
}

function slotSwitcher(status) {
  return `<div class="slots">${SLOTS.map((slot) => `
    <button type="button" data-action="slot" data-slot="${slot.id}" class="${UI.slot === slot.id ? 'on' : ''} ${pieceOn(status, slot.id) ? 'met' : ''}">${esc(slot.short)}</button>
  `).join('')}</div>`;
}

function renderToday() {
  const date = today();
  const status = weekStatus(state, UI.week);
  const meta = slotMeta(UI.slot);
  const pieceLine = status.kept
    ? `${status.parts} of 4 pieces in. This week counts.`
    : `${status.parts} of 4 pieces. Any two make the week count.`;
  return `
    <header>
      <div class="top-row">
        <div>
          <p class="eyebrow">For Jena</p>
          <h1>${esc(meta.label)}</h1>
        </div>
        <button class="sync" type="button" data-sync data-action="sync">${esc(syncLabel())}</button>
      </div>
      <p class="encourage">${esc(hello(date))}. ${esc(encouragement(date, status, UI.slot))}</p>
      ${weekSwitcher()}
      ${slotSwitcher(status)}
      <p class="pieces">${esc(pieceLine)}</p>
    </header>
    ${UI.slot === 'H' ? renderHike() : UI.slot === 'M' ? renderMobility() : renderStrength(UI.slot)}
  `;
}

function renderStrength(slot) {
  const day = state.program.days[slot];
  const key = `${UI.week}:${slot}`;
  const log = state.logs[key];
  const count = sessionDoneCount(day, log);
  const when = formatPretty(plannedDate(UI.week, slot));
  const banner = count.total && count.done === count.total
    ? `<div class="banner"><strong>That’s the session.</strong> ${count.total} moves logged. You can leave it here.</div>`
    : '';
  return `
    ${banner}
    <p class="kicker">${esc(when)} · ${esc(day.minutes)} · ${count.done} of ${count.total}</p>
    <p class="cue">${esc(day.blurb)}</p>
    ${day.sections.map((section) => `
      <div class="section-head"><p class="kicker">${esc(section.title)}</p></div>
      ${section.exercises.map((ex) => renderExercise(day, key, ex)).join('')}
    `).join('')}
    ${renderAdd(slot)}
    ${renderNotes(key, `${day.label} notes`)}
  `;
}

function renderMobility() {
  const day = state.program.days.M;
  const days = Array.from({ length: 7 }, (_, i) => isoDate(addDays(parseISO(UI.week), i)));
  if (!days.includes(UI.mobilityDate)) UI.mobilityDate = days.includes(isoDate(today())) ? isoDate(today()) : days[0];
  const key = `${UI.week}:M:${UI.mobilityDate}`;
  const log = state.logs[key];
  const count = sessionDoneCount(day, log);
  const letters = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const doneDays = new Set(mobilityKeys(state, UI.week).filter((item) => isSessionDone(day, state.logs[item])).map((item) => item.slice(-10)));
  const banner = count.total && count.done === count.total
    ? `<div class="banner"><strong>Hips are done for ${esc(formatShort(UI.mobilityDate))}.</strong> ${doneDays.size} this week. Two is the goal.</div>`
    : '';
  return `
    ${banner}
    <p class="kicker">${esc(day.minutes)} · ${doneDays.size} of 2 this week</p>
    <p class="cue">${esc(day.blurb)} Tap the day you did it.</p>
    <div class="days">
      ${days.map((date, i) => `
        <button type="button" data-action="mobility-day" data-date="${date}" class="${date === UI.mobilityDate ? 'on' : ''} ${doneDays.has(date) ? 'met' : ''}">
          ${letters[i]}<small>${date.slice(-2)}</small>
        </button>
      `).join('')}
    </div>
    ${day.sections.map((section) => section.exercises.map((ex) => renderExercise(day, key, ex)).join('')).join('')}
    ${renderAdd('M')}
    ${renderNotes(key, 'How the hips felt')}
  `;
}

function renderHike() {
  const key = `${UI.week}:H`;
  const saturday = plannedDate(UI.week, 'H');
  const sunday = isoDate(addDays(parseISO(saturday), 1));
  const log = state.logs[key] || { miles: '', minutes: '', note: '', done: false, date: defaultHikeDate(UI.week) };
  const picked = log.date === saturday || log.date === sunday ? log.date : defaultHikeDate(UI.week);
  return `
    <div class="card ${log.done ? 'done' : ''}">
      <p class="kicker">Weekend · easy pace</p>
      <h3>Easy hike</h3>
      <p class="cue">You should be able to talk the whole time. Distance and time are enough. Notes if you want them.</p>
      <div class="choice">
        <button type="button" data-action="hike-day" data-date="${saturday}" class="${picked === saturday ? 'on' : ''}">Saturday</button>
        <button type="button" data-action="hike-day" data-date="${sunday}" class="${picked === sunday ? 'on' : ''}">Sunday</button>
      </div>
      <div class="pair">
        <label class="field">Miles
          <input inputmode="decimal" autocomplete="off" data-hike="miles" value="${esc(log.miles || '')}" placeholder="miles">
        </label>
        <label class="field">Minutes
          <input inputmode="numeric" autocomplete="off" data-hike="minutes" value="${esc(log.minutes || '')}" placeholder="minutes">
        </label>
      </div>
      <label class="field" style="margin-top:8px">Notes
        <textarea data-hike="note" placeholder="Trail, weather, how easy it felt.">${esc(log.note || '')}</textarea>
      </label>
      <div class="actions">
        <button class="primary ${log.done ? 'done' : ''}" type="button" data-action="hike-done">${log.done ? 'Hike logged · tap to undo' : 'Log this hike'}</button>
      </div>
    </div>
  `;
}

function renderExercise(day, key, ex) {
  if (UI.editing === ex.id) return renderEditor(ex);
  const entry = state.logs[key]?.exercises?.[ex.id];
  const done = isExerciseDone(ex, entry);
  if (ex.log === 'intervals') return renderIntervals(key, ex, entry, done);
  if (ex.log === 'flow') return renderFlow(key, ex, entry, done);
  const open = UI.open.has(ex.id) || !!(entry && ((entry.sets || []).some((set) => set.reps || set.lb || set.sec) || entry.note));
  return `
    <article class="card ${done ? 'done' : ''}">
      <div class="card-top">
        <div>
          <h3>${esc(ex.name)}</h3>
          <div class="dose">${esc(ex.dose || '')}</div>
          <div class="equip">${esc(ex.equip || '')}</div>
        </div>
        <button class="icon-btn" type="button" data-action="edit" data-ex="${esc(ex.id)}" aria-label="Edit ${esc(ex.name)}">✎</button>
      </div>
      ${ex.cue ? `<p class="cue">${esc(ex.cue)}</p>` : ''}
      <button class="primary ${done ? 'done' : ''}" type="button" data-action="toggle-done" data-ex="${esc(ex.id)}">${done ? 'Done · tap to undo' : 'Mark done'}</button>
      ${open ? `<div style="margin-top:12px">${renderSets(key, ex, entry)}</div>` : `<button class="ghost" type="button" data-action="open-sets" data-ex="${esc(ex.id)}">Log weights</button>`}
    </article>
  `;
}

function renderSets(key, ex, entry) {
  const sets = (entry?.sets || emptyExerciseLog(ex).sets);
  const carry = ex.log === 'carry';
  const repsOnly = ex.log === 'reps';
  return `
    ${sets.map((set, index) => `
      <div class="set ${repsOnly ? 'one' : ''}">
        <span>Set ${index + 1}</span>
        ${carry
          ? `<label class="field">Sec<input inputmode="numeric" autocomplete="off" data-ex="${esc(ex.id)}" data-set-index="${index}" data-set-field="sec" value="${esc(set.sec || '')}"></label>`
          : `<label class="field">Reps<input inputmode="text" autocomplete="off" data-ex="${esc(ex.id)}" data-set-index="${index}" data-set-field="reps" value="${esc(set.reps || '')}"></label>`}
        ${repsOnly ? '' : `<label class="field">lb<input inputmode="decimal" autocomplete="off" data-ex="${esc(ex.id)}" data-set-index="${index}" data-set-field="lb" value="${esc(set.lb || '')}"></label>`}
      </div>
    `).join('')}
    <label class="field">Note
      <textarea data-ex-note="${esc(ex.id)}" placeholder="Optional">${esc(entry?.note || '')}</textarea>
    </label>
  `;
}

function renderIntervals(key, ex, entry, done) {
  const rows = entry?.intervals || emptyExerciseLog(ex).intervals;
  return `
    <article class="card ${done ? 'done' : ''}">
      <p class="kicker">About 25 min plus warm-up</p>
      <h3>${esc(ex.name)}</h3>
      <div class="dose">${esc(ex.dose)}</div>
      <p class="cue">${esc(ex.cue)}</p>
      ${rows.map((row, index) => `
        ${index ? '<div class="rest">3 min easy</div>' : ''}
        <div class="interval">
          <button type="button" data-action="interval" data-ex="${esc(ex.id)}" data-index="${index}" class="${row.done ? 'on' : ''}" aria-pressed="${row.done ? 'true' : 'false'}">
            <strong>Interval ${index + 1}</strong>
            <em>${row.done ? 'Hard effort done' : '4 min hard'}</em>
          </button>
          <label class="field">HR
            <input inputmode="numeric" autocomplete="off" data-hr="${esc(ex.id)}" data-index="${index}" value="${esc(row.hr || '')}" placeholder="bpm">
          </label>
        </div>
      `).join('')}
      <label class="field" style="margin-top:12px">Note
        <textarea data-ex-note="${esc(ex.id)}" placeholder="How the hard minutes felt.">${esc(entry?.note || '')}</textarea>
      </label>
    </article>
  `;
}

function renderFlow(key, ex, entry, done) {
  return `
    <article class="card ${done ? 'done' : ''}">
      <div class="card-top">
        <div>
          <h3>${esc(ex.name)}</h3>
          <div class="dose">${esc(ex.dose || '')}</div>
          <div class="equip">${esc(ex.equip || '')}</div>
        </div>
        <button class="icon-btn" type="button" data-action="edit" data-ex="${esc(ex.id)}" aria-label="Edit ${esc(ex.name)}">✎</button>
      </div>
      ${ex.cue ? `<p class="cue">${esc(ex.cue)}</p>` : ''}
      <button class="primary ${done ? 'done' : ''}" type="button" data-action="toggle-done" data-ex="${esc(ex.id)}">${done ? 'Done · tap to undo' : 'Mark done'}</button>
    </article>
  `;
}

function renderNotes(key, label) {
  const note = state.logs[key]?.notes || '';
  return `
    <label class="field" style="margin:6px 0 18px">${esc(label)}
      <textarea data-session-note="${esc(key)}" placeholder="Optional. Energy, weather, anything that was off.">${esc(note)}</textarea>
    </label>
  `;
}

function renderAdd(slot) {
  if (!UI.adding) return `<button class="ghost" type="button" data-action="add">Add an exercise</button>`;
  return `
    <form class="card" data-add-form="${slot}">
      <p class="kicker">Your exercise</p>
      <div class="stack">
        <label class="field">Name<input name="name" required placeholder="Step-up"></label>
        <label class="field">Equipment<input name="equip" placeholder="Box or bench"></label>
        <label class="field">Dose<input name="dose" placeholder="3 × 8"></label>
        <label class="field">Cue<textarea name="cue" placeholder="Optional form note"></textarea></label>
        <button class="primary" type="submit">Add it</button>
        <button class="ghost" type="button" data-action="cancel-add">Cancel</button>
      </div>
    </form>
  `;
}

function renderEditor(ex) {
  return `
    <form class="card" data-edit-form="${esc(ex.id)}">
      <p class="kicker">Edit exercise</p>
      <div class="stack">
        <label class="field">Name<input name="name" value="${esc(ex.name)}" required></label>
        <label class="field">Equipment<input name="equip" value="${esc(ex.equip || '')}"></label>
        <label class="field">Dose<input name="dose" value="${esc(ex.dose || '')}"></label>
        <label class="field">Cue<textarea name="cue">${esc(ex.cue || '')}</textarea></label>
        <button class="primary" type="submit">Save</button>
        <button class="ghost" type="button" data-action="cancel-edit">Cancel</button>
        <button class="danger" type="button" data-action="delete" data-ex="${esc(ex.id)}">Remove exercise</button>
      </div>
    </form>
  `;
}

function renderWeek() {
  const status = weekStatus(state, UI.week);
  const streak = currentStreak(state, today());
  const items = [
    ['A', 'Strength A', 'Tuesday · about 35 min', status.A],
    ['B', 'Cardio + Strength B', 'Thursday · about 40 min', status.B],
    ['M', 'Hip Flow', `${status.mobilityCount} logged · goal is 2`, status.M],
    ['H', 'Easy hike', 'Weekend', status.H],
  ];
  return `
    <header class="top-row">
      <div>
        <p class="eyebrow">This week’s shape</p>
        <h1>Week</h1>
      </div>
      <button class="sync" type="button" data-sync data-action="sync">${esc(syncLabel())}</button>
    </header>
    ${weekSwitcher()}
    <p class="pieces">${streak ? `${streak} week${streak === 1 ? '' : 's'} in a row.` : 'No streak yet. It starts whenever you do.'} ${status.kept ? 'This week counts.' : 'Two pieces make it count.'}</p>
    <div class="rows">
      ${items.map(([id, label, detail, met]) => `
        <button class="row ${met ? 'met' : ''}" type="button" data-action="open-slot" data-slot="${id}">
          <span><b>${esc(label)}</b><span>${esc(detail)}</span></span>
          <span class="pill">${met ? 'In' : 'Open'}</span>
        </button>
      `).join('')}
    </div>
    ${renderCheckin()}
  `;
}

function renderCheckin() {
  const row = state.checkins[UI.week] || {};
  const scale = (field, label) => {
    const value = clampScore(row[field]);
    return `
      <div class="check">
        <div class="check-top"><b>${label}</b><span class="word">${value ? WORDS[value] : ''}</span></div>
        <div class="scores">
          ${[1, 2, 3, 4, 5].map((n) => `
            <button type="button" data-action="score" data-field="${field}" data-value="${n}" class="${value === n ? 'on' : ''}" aria-label="${label} ${n} ${WORDS[n]}" aria-pressed="${value === n ? 'true' : 'false'}">${n}</button>
          `).join('')}
        </div>
      </div>
    `;
  };
  return `
    <section style="margin-top:22px">
      <p class="eyebrow">Check-in</p>
      <h2>How’s the week?</h2>
      <p class="cue">One tap each. There is no wrong number.</p>
      ${scale('energy', 'Energy')}
      ${scale('sleep', 'Sleep')}
      ${scale('motivation', 'Motivation')}
      <label class="field">A line about the week
        <textarea data-checkin-note placeholder="Optional">${esc(row.note || '')}</textarea>
      </label>
    </section>
  `;
}

function renderProgress() {
  const streak = currentStreak(state, today());
  const weeks = recentWeeks(today(), 8);
  const checks = checkinPoints(state, weeks);
  const hikes = hikePoints(state);
  const lifts = CHART_LIFTS.map((lift) => ({ ...lift, points: loadPoints(state, lift.id) })).filter((lift) => lift.points.length);
  return `
    <header class="top-row">
      <div>
        <p class="eyebrow">Keep going</p>
        <h1>Progress</h1>
      </div>
      <button class="sync" type="button" data-sync data-action="sync">${esc(syncLabel())}</button>
    </header>
    <section class="hero">
      <p class="streak">${streak}</p>
      <p>${streak === 1 ? 'week in a row' : 'weeks in a row'}</p>
      <p class="cue">A week counts with any two: Tuesday strength, Thursday’s session, hip flow twice, and an easy hike. An unfinished week does not erase the ones before it.</p>
    </section>
    <section class="card">
      <p class="kicker">Last 8 weeks</p>
      <div class="legend"><i class="on"></i> done <span class="fine">Tue · Thu · Hips · Hike</span></div>
      ${weeks.map((week) => {
        const status = weekStatus(state, week);
        return `<div class="crow ${week === currentWeek() ? 'now' : ''}"><span>${esc(formatShort(week))}</span><span class="dots">${['A', 'B', 'M', 'H'].map((id) => `<i class="dot ${status[id] ? 'on' : ''}"></i>`).join('')}</span></div>`;
      }).join('')}
    </section>
    <section class="card chart-card">
      <p class="kicker">Energy, sleep, motivation</p>
      ${checks.some((row) => row.energy || row.sleep || row.motivation) ? lineChart(checks) : '<p class="empty">Check in for a week or two and this line will start to mean something.</p>'}
      <div class="legend" style="margin-top:8px"><i class="on" style="background:#9a4e24;border-color:#9a4e24"></i> Energy <i class="on"></i> Sleep <i class="on" style="background:#2f5f86;border-color:#2f5f86"></i> Motivation</div>
    </section>
    <section class="card chart-card">
      <p class="kicker">Hikes</p>
      ${hikes.length ? barChart(hikes) : '<p class="empty">Log a weekend hike and the miles will show up here.</p>'}
    </section>
    <section class="card chart-card">
      <p class="kicker">Loads</p>
      ${lifts.length ? lifts.map((lift) => `<p style="margin:10px 0 4px;font-weight:700">${esc(lift.name)}</p>${barChart(lift.points.map((point) => ({ label: formatShort(point.date), miles: point.lb })), 'lb')}`).join('') : '<p class="empty">Add a weight on goblet squats, RDLs, rows, or pull-downs. The last few sessions chart here.</p>'}
    </section>
    ${renderArchive()}
    ${renderAbout()}
  `;
}

function lineChart(points) {
  const width = 320;
  const height = 150;
  const left = 22;
  const right = 8;
  const top = 10;
  const bottom = 22;
  const innerW = width - left - right;
  const innerH = height - top - bottom;
  const x = (i) => left + (points.length === 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
  const y = (v) => top + ((5 - v) / 4) * innerH;
  const colors = { energy: '#9a4e24', sleep: '#1f4d3a', motivation: '#2f5f86' };
  let grid = '';
  for (let tick = 1; tick <= 5; tick += 1) {
    grid += `<line x1="${left}" y1="${y(tick)}" x2="${width - right}" y2="${y(tick)}" stroke="#eadfcd" stroke-width="1"/>`;
  }
  let paths = '';
  for (const key of ['sleep', 'energy', 'motivation']) {
    let d = '';
    let drawing = false;
    points.forEach((point, index) => {
      if (point[key] == null) { drawing = false; return; }
      d += `${drawing ? 'L' : 'M'}${x(index).toFixed(1)} ${y(point[key]).toFixed(1)} `;
      drawing = true;
    });
    paths += `<path d="${d}" fill="none" stroke="${colors[key]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    points.forEach((point, index) => {
      if (point[key] == null) return;
      paths += `<circle cx="${x(index).toFixed(1)}" cy="${y(point[key]).toFixed(1)}" r="3.2" fill="${colors[key]}"/>`;
    });
  }
  const labels = `<text x="${x(0)}" y="${height - 4}" font-size="11" fill="#8a8174">${esc(formatShort(points[0].week))}</text>
    <text x="${x(points.length - 1)}" y="${height - 4}" font-size="11" fill="#8a8174" text-anchor="end">${esc(formatShort(points[points.length - 1].week))}</text>`;
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Check-in chart">${grid}${paths}${labels}</svg>`;
}

function barChart(rows, unit = 'mi') {
  const max = Math.max(...rows.map((row) => Number(row.miles) || 0), 0.1);
  return `<div>${rows.map((row) => {
    const value = Number(row.miles) || 0;
    const width = Math.max(6, Math.round((value / max) * 100));
    return `<div class="crow"><span>${esc(row.label || formatShort(row.date))}</span><span style="flex:1;height:12px;margin:0 8px;background:#f4efe6;border-radius:999px;overflow:hidden"><span style="display:block;height:100%;width:${width}%;background:#1f4d3a;border-radius:999px"></span></span><span>${esc(String(value))} ${unit}</span></div>`;
  }).join('')}</div>`;
}

function renderArchive() {
  const archive = state.archive;
  const sessions = archive?.sessions || [];
  const progress = archive?.progress || [];
  if (!sessions.length && !progress.length) return '';
  return `
    <details class="archive card">
      <summary>Earlier program · ${sessions.length} session${sessions.length === 1 ? '' : 's'}</summary>
      <p class="cue">Brought over from the 8-week plan on this phone. Matching lifts still feed the load chart when a weight was written down.</p>
      ${sessions.map((session) => `
        <div class="session-old">
          <b>Week ${session.weekNumber} · Day ${esc(session.dayKey)} · ${esc(formatShort(session.date))}</b>
          ${session.notes ? `<p>${esc(session.notes)}</p>` : ''}
          ${(session.exercises || []).map((ex) => {
            const sets = [ex.set1, ex.set2, ex.set3].filter(Boolean).join(' · ');
            return `<p>${ex.completed ? '✓ ' : ''}${esc(ex.name)}${sets ? ` — ${esc(sets)}` : ''}${ex.notes ? ` (${esc(ex.notes)})` : ''}</p>`;
          }).join('')}
        </div>
      `).join('')}
      ${progress.length ? `<div class="session-old"><b>Old weekly notes</b>${progress.map((row) => `<p>${esc(row.name)} · wk ${row.week}: ${esc(row.value)}</p>`).join('')}</div>` : ''}
    </details>
  `;
}

function renderAbout() {
  const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const syncCopy = syncStatus === 'synced'
    ? 'Saved in your private cloud and on this phone. It follows you without a passcode.'
    : syncStatus === 'unconfigured'
      ? SETUP
      : syncStatus === 'offline'
        ? 'Saved on this phone. Sync will try again when you are online.'
        : 'Saved on this phone. Sync starts as soon as the cloud is reachable.';
  return `
    <section class="card">
      <p class="kicker">The week</p>
      <p><b>Tuesday</b> — goblet squat, KB RDL, row, push-up, suitcase carry, dead bug.</p>
      <p style="margin-top:8px"><b>Thursday</b> — Norwegian 4×4, then split squat, hip airplane, pull-down, Pallof press.</p>
      <p style="margin-top:8px"><b>Any 2–3 days</b> — 90/90, Bretzel, couch stretch.</p>
      <p style="margin-top:8px"><b>Weekend</b> — an easy hike.</p>
    </section>
    <section class="card">
      <p class="kicker">On your phones</p>
      <p>${esc(syncCopy)}</p>
      <div class="actions">
        ${UI.installEvent && !installed ? '<button class="primary" type="button" data-action="install">Install on this phone</button>' : '<button class="ghost" type="button" data-action="sync">Sync now</button>'}
      </div>
      <p class="fine" style="margin-top:10px">${installed ? 'This is already on your home screen.' : 'iPhone: Share, then Add to Home Screen. Android: browser menu, then Install app.'}</p>
    </section>
    <section class="card">
      <p class="kicker">Program edits</p>
      <p class="cue">Reset puts the exercises back to this week’s plan. Logs, hikes, and check-ins stay.</p>
      <button class="danger" type="button" data-action="reset">Reset exercises</button>
    </section>
  `;
}

function dayForSlot() {
  return state.program.days[UI.slot];
}

function onInput(event) {
  const target = event.target;
  if (target.dataset.hike) {
    const key = `${UI.week}:H`;
    const log = ensureSession(key, { date: state.logs[key]?.date || defaultHikeDate(UI.week), miles: '', minutes: '', note: '', done: false });
    log[target.dataset.hike] = target.value;
    log.updatedAt = nowIso();
    touch(false);
    return;
  }
  if (target.dataset.sessionNote) {
    const log = ensureSession(target.dataset.sessionNote);
    log.notes = target.value;
    log.updatedAt = nowIso();
    touch(false);
    return;
  }
  if (target.dataset.setField) {
    const day = dayForSlot();
    const found = findExercise(day, target.dataset.ex);
    if (!found) return;
    const entry = ensureExercise(sessionKey(), found.exercise);
    entry.sets[Number(target.dataset.setIndex)][target.dataset.setField] = target.value;
    entry.updatedAt = nowIso();
    touch(false);
    return;
  }
  if (target.dataset.exNote) {
    const day = dayForSlot();
    const found = findExercise(day, target.dataset.exNote);
    if (!found) return;
    const entry = ensureExercise(sessionKey(), found.exercise);
    entry.note = target.value;
    entry.updatedAt = nowIso();
    touch(false);
    return;
  }
  if (target.dataset.hr) {
    const day = state.program.days.B;
    const found = findExercise(day, target.dataset.hr);
    if (!found) return;
    const entry = ensureExercise(`${UI.week}:B`, found.exercise);
    entry.intervals[Number(target.dataset.index)].hr = target.value;
    entry.updatedAt = nowIso();
    touch(false);
    return;
  }
  if (target.dataset.checkinNote !== undefined) {
    const row = state.checkins[UI.week] || { energy: null, sleep: null, motivation: null, note: '' };
    row.note = target.value;
    row.updatedAt = nowIso();
    state.checkins[UI.week] = row;
    touch(false);
  }
}

function onClick(event) {
  const button = event.target.closest('[data-action], [data-nav]');
  if (!button) return;
  const action = button.dataset.action || (button.dataset.nav ? 'nav' : '');
  if (action === 'nav') {
    UI.view = button.dataset.nav;
    UI.adding = false;
    UI.editing = null;
    render();
    window.scrollTo(0, 0);
    return;
  }
  if (action === 'week') {
    const next = shiftWeek(UI.week, Number(button.dataset.delta));
    if (button.dataset.delta === '1' && next > currentWeek()) return;
    if (button.dataset.delta === '-1' && UI.week <= earliestWeek(state, today())) return;
    UI.week = next;
    render();
    return;
  }
  if (action === 'this-week') {
    UI.week = currentWeek();
    UI.slot = suggestSlot(today());
    UI.mobilityDate = isoDate(today());
    render();
    return;
  }
  if (action === 'slot' || action === 'open-slot') {
    UI.slot = button.dataset.slot;
    UI.adding = false;
    UI.editing = null;
    if (action === 'open-slot') UI.view = 'today';
    render();
    if (action === 'open-slot') window.scrollTo(0, 0);
    return;
  }
  if (action === 'mobility-day') {
    UI.mobilityDate = button.dataset.date;
    render();
    return;
  }
  if (action === 'toggle-done') {
    const found = findExercise(dayForSlot(), button.dataset.ex);
    if (!found) return;
    const entry = ensureExercise(sessionKey(), found.exercise);
    entry.done = !isExerciseDone(found.exercise, entry);
    entry.updatedAt = nowIso();
    touch(true);
    return;
  }
  if (action === 'interval') {
    const found = findExercise(state.program.days.B, button.dataset.ex);
    if (!found) return;
    const entry = ensureExercise(`${UI.week}:B`, found.exercise);
    const row = entry.intervals[Number(button.dataset.index)];
    row.done = !row.done;
    entry.done = entry.intervals.every((item) => item.done);
    entry.updatedAt = nowIso();
    touch(true);
    return;
  }
  if (action === 'open-sets') {
    UI.open.add(button.dataset.ex);
    render();
    return;
  }
  if (action === 'hike-day') {
    const key = `${UI.week}:H`;
    const log = ensureSession(key, { miles: '', minutes: '', note: '', done: false });
    log.date = button.dataset.date;
    log.updatedAt = nowIso();
    touch(true);
    return;
  }
  if (action === 'hike-done') {
    const key = `${UI.week}:H`;
    const existing = state.logs[key];
    const log = ensureSession(key, { date: defaultHikeDate(UI.week), miles: '', minutes: '', note: '', done: false });
    log.done = !(existing && existing.done);
    log.updatedAt = nowIso();
    touch(true);
    return;
  }
  if (action === 'add') { UI.adding = true; UI.editing = null; render(); return; }
  if (action === 'cancel-add') { UI.adding = false; render(); return; }
  if (action === 'edit') { UI.editing = button.dataset.ex; UI.adding = false; render(); return; }
  if (action === 'cancel-edit') { UI.editing = null; render(); return; }
  if (action === 'delete') {
    const found = findExercise(dayForSlot(), button.dataset.ex);
    if (!found) return;
    if (!window.confirm(`Remove ${found.exercise.name}? Logs you already saved stay in the history.`)) return;
    found.section.exercises.splice(found.index, 1);
    UI.editing = null;
    markProgramEdit();
    return;
  }
  if (action === 'score') {
    const row = state.checkins[UI.week] || { energy: null, sleep: null, motivation: null, note: '' };
    const value = clampScore(Number(button.dataset.value));
    row[button.dataset.field] = row[button.dataset.field] === value ? null : value;
    row.updatedAt = nowIso();
    state.checkins[UI.week] = row;
    touch(true);
    return;
  }
  if (action === 'sync') { pull({ force: true }); return; }
  if (action === 'install' && UI.installEvent) {
    UI.installEvent.prompt();
    UI.installEvent = null;
    render();
    return;
  }
  if (action === 'reset') {
    if (!window.confirm('Reset exercises to the original week? Your logs, hikes, and check-ins stay.')) return;
    state.program = { updatedAt: nowIso(), days: defaultProgram() };
    UI.editing = null;
    UI.adding = false;
    touch(true);
  }
}

function onSubmit(event) {
  const form = event.target;
  if (form.dataset.addForm) {
    event.preventDefault();
    const field = (name) => form.querySelector(`[name="${name}"]`).value.trim();
    const name = field('name');
    if (!name) return;
    const slot = form.dataset.addForm;
    const day = state.program.days[slot];
    let section = day.sections.find((item) => item.title === 'Yours');
    if (!section) {
      section = { title: 'Yours', exercises: [] };
      day.sections.push(section);
    }
    section.exercises.push({
      id: `custom-${Date.now()}`,
      name,
      equip: field('equip'),
      dose: field('dose') || '3 × 8',
      sets: slot === 'M' ? undefined : 3,
      log: slot === 'M' ? 'flow' : 'load',
      cue: field('cue'),
    });
    UI.adding = false;
    markProgramEdit();
    return;
  }
  if (form.dataset.editForm) {
    event.preventDefault();
    const found = findExercise(dayForSlot(), form.dataset.editForm);
    if (!found) return;
    const field = (name) => form.querySelector(`[name="${name}"]`).value.trim();
    const name = field('name');
    if (!name) return;
    found.exercise.name = name;
    found.exercise.equip = field('equip');
    found.exercise.dose = field('dose');
    found.exercise.cue = field('cue');
    UI.editing = null;
    markProgramEdit();
  }
}

function init() {
  document.getElementById('app').addEventListener('input', onInput);
  document.getElementById('app').addEventListener('click', onClick);
  document.getElementById('nav').addEventListener('click', onClick);
  document.getElementById('app').addEventListener('submit', onSubmit);
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    UI.installEvent = event;
    if (UI.view === 'progress') render();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pull();
  });
  setInterval(() => {
    if (document.visibilityState === 'visible') pull();
  }, 30000);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
  }
  render();
  pull();
}

init();
