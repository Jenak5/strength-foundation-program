// ============================================================
// STRENGTH FOUNDATION PROGRAM — APP LOGIC
// ============================================================

const PROGRAM_START = new Date(2026, 4, 19); // May 19, 2026 (Tue) — Wk 1 Day A
const PROGRAM_END   = new Date(2026, 6, 11); // Jul 11, 2026 (Sat) — Wk 8 Day C

// ============================================================
// EXERCISE DATA
// reps array indexed by phase block: [Wk1-2, Wk3-4, Wk5-6, Wk7-8]
// ============================================================
const DAYS = {
  A: {
    title: 'Day A',
    sub: 'Lower Body + Core',
    weekday: 2, // Tuesday
    weekdayShort: 'Tue',
    weekdayLong: 'Tuesday',
    duration: '~35 min',
    equipment: 'KB 32lb · Bands · TRX · Stepper · Vest (Wk 5+)',
    injection: false,
    sections: [
      { title: 'WARM-UP', duration: '5 min', exercises: [
        { id: 'A-w1', name: 'Stair Stepper', equip: 'Mini Stair Stepper',
          reps: ['5 min · Easy pace','5 min · Moderate','5 min · Moderate-fast','5 min · Fast pace'],
          cue: 'Just get warm — not a workout yet. Light effort.', noLog: true },
      ]},
      { title: 'LOWER BODY', exercises: [
        { id: 'A-l1', name: 'Goblet Squat', equip: 'KB 32lb',
          reps: ['2×8','3×8','3×10 + light vest','3×12 + vest'],
          cue: 'Hold KB at chest. Feet shoulder-width. Sit back and down. Chest tall — don\'t round forward.' },
        { id: 'A-l2', name: 'KB Romanian Deadlift', equip: 'KB 32lb',
          reps: ['2×8','3×10','3×10 + light vest','3×12 + vest'],
          cue: 'Hinge at hips, soft knee bend. KB tracks down your shins. Feel the hamstring stretch. Drive hips forward to stand.' },
        { id: 'A-l3', name: 'TRX Assisted Squat', equip: 'TRX',
          reps: ['2×10','3×10','3×12','3×15'],
          cue: 'Hold TRX handles for balance assist. Use as little help as possible. Works depth and confidence.' },
        { id: 'A-l4', name: 'Lateral Band Walk', equip: 'Resistance Band',
          reps: ['2×10 ea','2×12 ea','3×12 ea','3×15 ea'],
          cue: 'Band just above knees. Stay in slight squat. Steps small and controlled — don\'t let knees cave.' },
        { id: 'A-l5', name: 'Banded Glute Bridge', equip: 'Resistance Band',
          reps: ['2×12','3×15','3×15 + 3 sec hold','3×20 + 3 sec hold'],
          cue: 'Band above knees. Drive through heels. Squeeze glutes at top. Lower slowly — 3 count down.' },
      ]},
      { title: 'CORE', exercises: [
        { id: 'A-c1', name: 'Plank Hold', equip: 'Bodyweight',
          reps: ['2×20 sec','3×25 sec','3×30 sec','3×40 sec'],
          cue: 'Forearms or hands. Straight line head to heel. Breathe — don\'t hold your breath. Quality over time.' },
        { id: 'A-c2', name: 'Dead Bug', equip: 'Bodyweight',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Low back pressed to floor the entire time. Opposite arm + leg extends slowly. Control the movement.' },
        { id: 'A-c3', name: 'Straight Leg Sit-Up', equip: 'TRX Slam Ball',
          reps: ['2×8','2×10','3×10','3×12'],
          cue: 'Legs flat on floor — no knee bend. Hold ball at chest or extended overhead. Sit all the way up to vertical. Lower with control. Lead with your abs, don\'t yank with arms or kick your legs.' },
      ]},
      { title: 'COOL-DOWN', duration: '3 min', exercises: [
        { id: 'A-d1', name: 'Hip Flexor Stretch', equip: 'Bodyweight',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Kneeling lunge position. Tuck pelvis under. Feel the front of the back hip.', noLog: true },
        { id: 'A-d2', name: 'Hamstring Stretch', equip: 'TRX or floor',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Seated or standing — reach toward toes. Hold, breathe, relax deeper.', noLog: true },
      ]},
    ],
  },

  B: {
    title: 'Day B',
    sub: 'Upper Body + Core',
    weekday: 4, // Thursday
    weekdayShort: 'Thu',
    weekdayLong: 'Thursday',
    duration: '~35 min',
    equipment: 'TRX · Anchor Pulley + Bands · KB 32lb · Jump Rope',
    injection: true,
    notes: 'Stay extra hydrated today.',
    sections: [
      { title: 'WARM-UP', duration: '3 min', exercises: [
        { id: 'B-w1', name: 'Ropeless Jump Rope', equip: 'Ropeless Jump Rope',
          reps: ['3 min · Easy','3 min · Moderate','3 min · Moderate','3 min · Fast intervals'],
          cue: 'Light wrist motion. Get blood moving — not cardio. Stop if dizzy or HR spikes.', noLog: true },
      ]},
      { title: 'UPPER BODY — PULL', exercises: [
        { id: 'B-p1', name: 'TRX Row', equip: 'TRX',
          reps: ['2×8','3×10','3×12','3×15 + vest option'],
          cue: 'Walk feet forward = harder. Body straight. Pull elbows to ribs. Squeeze shoulder blades at top.' },
        { id: 'B-p2', name: 'Anchor Pulley Row', equip: 'Bands + Pulley',
          reps: ['2×10','3×12','3×12 heavier band','3×15 heavier band'],
          cue: 'Hinge slightly at hips. Pull band to belly button. Controlled release — 3 count out.' },
      ]},
      { title: 'UPPER BODY — PUSH', exercises: [
        { id: 'B-u1', name: 'TRX Push-Up', equip: 'TRX',
          reps: ['2×6','2×8','3×8','3×10'],
          cue: 'Hands in TRX handles, feet on floor. More upright = easier. Lower slowly, push strong. Progress angle over time.' },
        { id: 'B-u2', name: 'Anchor Pulley Chest Press', equip: 'Bands + Pulley',
          reps: ['2×10','3×12','3×12 heavier band','3×15 heavier band'],
          cue: 'Anchor at chest height. Press forward and slightly down. Control the return.' },
        { id: 'B-u3', name: 'KB Single Arm Press', equip: 'KB 32lb',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Clean KB to shoulder first. Press straight up — don\'t lean away. Lower slowly. Brace your core throughout.' },
      ]},
      { title: 'CORE', exercises: [
        { id: 'B-c1', name: 'Bird Dog', equip: 'Bodyweight',
          reps: ['2×6 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'On hands and knees. Extend opposite arm + leg. Hold 2 sec. Don\'t let hips rotate. Slow wins.' },
        { id: 'B-c2', name: 'TRX Plank', equip: 'TRX',
          reps: ['2×20 sec','2×25 sec','3×30 sec','3×40 sec'],
          cue: 'Feet in TRX straps, hands on floor. Same as floor plank but more core demand. Breathe.' },
      ]},
      { title: 'COOL-DOWN', duration: '3 min', exercises: [
        { id: 'B-d1', name: 'Chest/Shoulder Stretch', equip: 'Doorway or bands',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Arms at 90° in doorway, lean gently forward. Feel chest open. Breathe.', noLog: true },
        { id: 'B-d2', name: 'Lat Stretch', equip: 'TRX or anchor',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'Hold TRX/anchor, sit back, let upper back open. Feels amazing.', noLog: true },
      ]},
    ],
  },

  C: {
    title: 'Day C',
    sub: 'Full Body + KB Power',
    weekday: 6, // Saturday
    weekdayShort: 'Sat',
    weekdayLong: 'Saturday',
    duration: '~35 min',
    equipment: 'KB 32lb · TRX · Bands · Stepper · Jump Rope · Slam Ball · Vest (Wk 5+)',
    injection: false,
    notes: 'Day after injection.',
    sections: [
      { title: 'WARM-UP', duration: '5 min', exercises: [
        { id: 'C-w1', name: 'Stair Stepper or Jump Rope', equip: 'Stepper / Rope',
          reps: ['5 min · Easy','5 min · Moderate','5 min · Moderate','5 min · Push pace'],
          cue: 'Your choice — whatever feels better that day. Goal is warm, not tired.', noLog: true },
      ]},
      { title: 'POWER + LOWER', exercises: [
        { id: 'C-p1', name: 'KB Swing', equip: 'KB 32lb',
          reps: ['2×8','3×10','3×12 + light vest','3×15 + vest'],
          cue: 'Hinge — NOT a squat. Drive hips forward explosively. KB floats to shoulder height. Control the drop.' },
        { id: 'C-p2', name: 'Med Ball Slam', equip: 'TRX Slam Ball',
          reps: ['2×8','3×10','3×12','3×15'],
          cue: 'Ball overhead, full extension on tiptoes. Engage lats and abs and slam HARD to the floor in front of you. No bounce — pick it up, reset, repeat. Explosive down, controlled up. Breathe out on the slam.' },
        { id: 'C-p3', name: 'KB Sumo Deadlift', equip: 'KB 32lb',
          reps: ['2×8','3×10','3×10 + vest','3×12 + vest'],
          cue: 'Wide stance, toes out. KB between feet. Hinge and grip. Drive floor away. Hips and chest rise together.' },
        { id: 'C-p4', name: 'Banded Squat', equip: 'Resistance Band',
          reps: ['2×10','3×12','3×15','3×15 + vest'],
          cue: 'Band under feet, hold at shoulders. Adds resistance and teaches bracing. Sit tall in the squat.' },
      ]},
      { title: 'UPPER + PULL', exercises: [
        { id: 'C-u1', name: 'TRX Row', equip: 'TRX',
          reps: ['2×10','3×10','3×12','3×15'],
          cue: 'Same as Day B. Tracking progress? Walk feet forward an inch every 2 weeks.' },
        { id: 'C-u2', name: 'Anchor Pulley Pull-Down', equip: 'Bands + Pulley',
          reps: ['2×10','3×12','3×12 heavier band','3×15 heavier band'],
          cue: 'Anchor high. Kneel or stand. Pull elbows down to ribs. Lat focus. Slow release.' },
      ]},
      { title: 'CONDITIONING', exercises: [
        { id: 'C-cond1', name: 'Ropeless Jump Rope Intervals', equip: 'Ropeless Jump Rope',
          reps: ['2 × 30 sec on / 30 off','3 × 30 sec on / 30 off','3 × 45 sec on / 30 off','4 × 45 sec on / 20 off'],
          cue: 'Light on your feet. Consistent rhythm. Stop if HR feels too high — rest and go again.' },
      ]},
      { title: 'CORE', exercises: [
        { id: 'C-c1', name: 'KB Halo', equip: 'KB 32lb',
          reps: ['2×5 ea','2×8 ea','3×8 ea','3×10 ea'],
          cue: 'Hold KB by horns at chest. Circle it around your head slowly. Brace core throughout. Control = strength.' },
        { id: 'C-c2', name: 'Med Ball Russian Twist', equip: 'TRX Slam Ball',
          reps: ['2×10 ea','2×12 ea','3×12 ea','3×15 ea'],
          cue: 'Seated, lean back ~45°, feet hovering if you can hold it. Hold ball at chest. Rotate side to side and tap the floor next to your hip. Move from your core, not your arms. Counts are per side.' },
        { id: 'C-c3', name: 'Side Plank', equip: 'Bodyweight',
          reps: ['2×15 sec ea','2×20 sec ea','3×25 sec ea','3×30 sec ea'],
          cue: 'Forearm on ground. Body straight. Don\'t let hips sag. Breathe. Progress time each week.' },
      ]},
      { title: 'COOL-DOWN', duration: '3 min', exercises: [
        { id: 'C-d1', name: 'Figure-4 Glute Stretch', equip: 'Floor',
          reps: ['30 sec ea','30 sec ea','45 sec ea','45 sec ea'],
          cue: 'On back, cross ankle over opposite knee. Pull thigh toward chest. Deep glute stretch.', noLog: true },
        { id: 'C-d2', name: 'Child\'s Pose', equip: 'Floor',
          reps: ['60 sec','60 sec','60 sec','60 sec'],
          cue: 'Arms extended. Breathe into your back. You earned this.', noLog: true },
      ]},
    ],
  },
};

// Progress tracker — key lifts to log weekly best set
const PROGRESS_GROUPS = [
  { title: 'LOWER BODY', items: [
    { id: 'prog-goblet', name: 'Goblet Squat', goal: '3×12 + vest', metric: 'reps @ 32lb' },
    { id: 'prog-rdl', name: 'KB RDL', goal: '3×12 + vest', metric: 'reps @ 32lb' },
    { id: 'prog-sumo', name: 'KB Sumo Deadlift', goal: '3×12 + vest', metric: 'reps' },
    { id: 'prog-swing', name: 'KB Swing', goal: '3×15 + vest', metric: 'reps' },
  ]},
  { title: 'UPPER BODY', items: [
    { id: 'prog-trxrow', name: 'TRX Row', goal: '3×15 horizontal', metric: 'reps / angle' },
    { id: 'prog-trxpush', name: 'TRX Push-Up', goal: '3×10', metric: 'reps' },
    { id: 'prog-press', name: 'KB Single Arm Press', goal: '3×10 ea side', metric: 'reps ea' },
  ]},
  { title: 'CORE', items: [
    { id: 'prog-plank', name: 'Plank Hold', goal: '3×40 sec', metric: 'seconds' },
    { id: 'prog-sideplank', name: 'Side Plank', goal: '3×30 sec ea', metric: 'seconds each' },
    { id: 'prog-situp', name: 'Straight Leg Sit-Up', goal: '3×12', metric: 'reps' },
  ]},
  { title: 'POWER + CONDITIONING', items: [
    { id: 'prog-slam', name: 'Med Ball Slam', goal: '3×15', metric: 'reps' },
    { id: 'prog-jr', name: 'Jump Rope Intervals', goal: '4×45 sec on / 20 off', metric: 'rounds × time' },
  ]},
];

// ============================================================
// DATE / WEEK LOGIC
// ============================================================
function daysBetween(a, b) {
  const ms = b.setHours(0,0,0,0) - a.setHours(0,0,0,0);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function getCurrentWeek(today = new Date()) {
  const start = new Date(PROGRAM_START);
  const diff = daysBetween(start, new Date(today));
  if (diff < 0) return 0; // pre-program
  const wk = Math.floor(diff / 7) + 1;
  if (wk > 8) return 9; // program complete
  return wk;
}

function getRepBlock(week) {
  // 1-2 → 0, 3-4 → 1, 5-6 → 2, 7-8 → 3
  if (week <= 2) return 0;
  if (week <= 4) return 1;
  if (week <= 6) return 2;
  return 3;
}

function getPhase(week) {
  return week <= 4 ? 1 : 2;
}

function getTodayDayKey(today = new Date()) {
  const wd = today.getDay();
  if (wd === 2) return 'A';
  if (wd === 4) return 'B';
  if (wd === 6) return 'C';
  return null; // rest day
}

function getNextWorkout(today = new Date()) {
  const wd = today.getDay();
  // Next workout day index (0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat)
  const order = [
    { d: 2, key: 'A' },
    { d: 4, key: 'B' },
    { d: 6, key: 'C' },
  ];
  for (const o of order) {
    if (o.d > wd) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + (o.d - wd));
      return { key: o.key, date: dt };
    }
  }
  // wrap to next week Tuesday
  const dt = new Date(today);
  dt.setDate(dt.getDate() + ((2 + 7 - wd) % 7 || 7));
  return { key: 'A', date: dt };
}

function getSessionDate(dayKey, week) {
  // Program week starts on Tuesday with Day A. Wk N Day A = PROGRAM_START + (N-1)*7 days.
  // Within a week: Day A = day 0 (Tue), Day B = day 2 (Thu), Day C = day 4 (Sat)
  const anchor = new Date(PROGRAM_START);
  anchor.setDate(anchor.getDate() + (week - 1) * 7);
  const offset = dayKey === 'A' ? 0 : dayKey === 'B' ? 2 : 4;
  const dt = new Date(anchor);
  dt.setDate(dt.getDate() + offset);
  return dt;
}

function fmtDate(dt) {
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ============================================================
// STORAGE
// ============================================================
const STORAGE = {
  setLog(week, dayKey, exId, data) {
    localStorage.setItem(`log:wk${week}:${dayKey}:${exId}`, JSON.stringify(data));
  },
  getLog(week, dayKey, exId) {
    const v = localStorage.getItem(`log:wk${week}:${dayKey}:${exId}`);
    return v ? JSON.parse(v) : null;
  },
  setProgress(itemId, week, value) {
    localStorage.setItem(`prog:${itemId}:wk${week}`, value);
  },
  getProgress(itemId, week) {
    return localStorage.getItem(`prog:${itemId}:wk${week}`) || '';
  },
  isDone(week, dayKey, exId) {
    const log = this.getLog(week, dayKey, exId);
    return log && log.completed;
  },
};

// ============================================================
// STATE
// ============================================================
const STATE = {
  view: 'workout',
  selectedDay: null, // 'A' | 'B' | 'C'
  selectedWeek: null,
  todayKey: null,
  todayWeek: null,
};

// ============================================================
// RENDER
// ============================================================
function renderTopbar() {
  document.getElementById('weekNum').textContent = STATE.selectedWeek;
  const phase = getPhase(STATE.selectedWeek);
  const pill = document.getElementById('phasePill');
  pill.textContent = `PHASE ${phase}`;
  pill.classList.toggle('phase-2', phase === 2);

  document.querySelectorAll('.day-tab').forEach(tab => {
    const d = tab.dataset.day;
    tab.classList.toggle('active', d === STATE.selectedDay);
    tab.classList.toggle('today', d === STATE.todayKey && STATE.selectedWeek === STATE.todayWeek);
  });
}

function renderWorkout() {
  const v = document.getElementById('view-workout');
  v.innerHTML = '';

  // Pre-program
  if (STATE.selectedWeek === 0) {
    v.innerHTML = `<div class="rest-day"><div class="rest-icon">⌃</div><h1 class="display">Program Starts Soon</h1><p>First session: Tue May 19, 2026 — Day A (Lower Body)</p></div>`;
    return;
  }
  if (STATE.selectedWeek === 9) {
    v.innerHTML = `<div class="rest-day"><div class="rest-icon" style="color: var(--done); border-color: var(--done);">✓</div><h1 class="display">Program Complete</h1><p>8 weeks done. Look back at your Progress tab.</p></div>`;
    return;
  }

  // Rest day (and the user is viewing today, not exploring)
  const isToday = STATE.selectedWeek === STATE.todayWeek && STATE.selectedDay === STATE.todayKey;
  const isRestDay = STATE.todayKey === null;
  // Note: even on rest day, we still render the selected workout day (user can tap a tab)
  // The rest-day view only shows when no day is selected (which shouldn't happen — we always pick a day)

  const day = DAYS[STATE.selectedDay];
  const repIdx = getRepBlock(STATE.selectedWeek);
  const sessionDate = getSessionDate(STATE.selectedDay, STATE.selectedWeek);

  // Header
  const header = document.createElement('div');
  header.className = 'day-header';
  const todayBadge = isToday ? `<span style="color: var(--accent); font-size: 11px; letter-spacing: 0.18em; margin-left: 8px;">· TODAY</span>` : '';
  header.innerHTML = `
    <div class="focus">${day.weekdayLong.toUpperCase()} · ${fmtDate(sessionDate).toUpperCase()}${todayBadge}</div>
    <h1 class="display">${day.title}<span class="sub">${day.sub}</span></h1>
    <div class="session-meta">
      ${day.duration} · ${day.equipment}
      ${day.injection ? '<span class="injection-tag">💉 Injection Day</span>' : ''}
    </div>
    ${day.notes ? `<div class="session-meta" style="margin-top: 6px; font-style: italic;">${day.notes}</div>` : ''}
  `;
  v.appendChild(header);

  // Completion banner if all loggable exercises done
  const loggables = day.sections.flatMap(s => s.exercises.filter(e => !e.noLog));
  const doneCount = loggables.filter(e => STORAGE.isDone(STATE.selectedWeek, STATE.selectedDay, e.id)).length;
  if (loggables.length > 0 && doneCount === loggables.length) {
    const banner = document.createElement('div');
    banner.className = 'complete-banner';
    banner.innerHTML = `<div class="ck">✓</div><div class="txt">Session complete</div><div class="sub2">${loggables.length} exercises logged — nice work.</div>`;
    v.appendChild(banner);
  }

  // Sections
  day.sections.forEach(section => {
    const secEl = document.createElement('section');
    secEl.className = 'section';
    secEl.innerHTML = `<div class="section-head"><div class="title">${section.title}</div>${section.duration ? `<div class="duration">${section.duration}</div>` : ''}</div>`;
    section.exercises.forEach(ex => {
      secEl.appendChild(renderExercise(ex, repIdx));
    });
    v.appendChild(secEl);
  });
}

function renderExercise(ex, repIdx) {
  const done = STORAGE.isDone(STATE.selectedWeek, STATE.selectedDay, ex.id);
  const log = STORAGE.getLog(STATE.selectedWeek, STATE.selectedDay, ex.id) || {};
  const card = document.createElement('div');
  card.className = 'ex' + (done ? ' done' : '');
  card.dataset.exId = ex.id;

  const showLog = !ex.noLog;
  card.innerHTML = `
    <div class="ex-head">
      <div class="ex-main">
        <div class="ex-name">${ex.name}</div>
        <div class="ex-equip">${ex.equip}</div>
      </div>
      <div class="ex-reps"><div class="reps-big">${ex.reps[repIdx]}</div></div>
    </div>
    ${ex.cue ? `<div class="ex-cue">${ex.cue}</div>` : ''}
    ${showLog ? `
      <div class="ex-actions">
        <button class="ex-action expand-btn">${log.set1 || log.set2 || log.set3 || log.notes ? 'Edit Log' : 'Log Sets'}</button>
        <button class="ex-action complete ${done ? 'done' : ''}">${done ? '✓ Done' : 'Mark Done'}</button>
      </div>
      <div class="ex-log">
        <div class="set-row"><label>SET 1</label><input type="text" data-field="set1" inputmode="text" placeholder="reps · weight · notes" value="${log.set1 || ''}"></div>
        <div class="set-row"><label>SET 2</label><input type="text" data-field="set2" inputmode="text" placeholder="reps · weight · notes" value="${log.set2 || ''}"></div>
        <div class="set-row"><label>SET 3</label><input type="text" data-field="set3" inputmode="text" placeholder="reps · weight · notes" value="${log.set3 || ''}"></div>
        <label class="notes-label">NOTES / HOW IT FELT</label>
        <textarea class="notes-input" data-field="notes" placeholder="">${log.notes || ''}</textarea>
      </div>
    ` : ''}
  `;

  if (showLog) {
    const expandBtn = card.querySelector('.expand-btn');
    const completeBtn = card.querySelector('.complete');

    expandBtn.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    completeBtn.addEventListener('click', () => {
      const cur = STORAGE.getLog(STATE.selectedWeek, STATE.selectedDay, ex.id) || {};
      cur.completed = !cur.completed;
      STORAGE.setLog(STATE.selectedWeek, STATE.selectedDay, ex.id, cur);
      renderWorkout();
    });

    card.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        const cur = STORAGE.getLog(STATE.selectedWeek, STATE.selectedDay, ex.id) || {};
        cur[e.target.dataset.field] = e.target.value;
        STORAGE.setLog(STATE.selectedWeek, STATE.selectedDay, ex.id, cur);
      });
    });

    // Auto-expand if any field has data
    if (log.set1 || log.set2 || log.set3 || log.notes) {
      card.classList.add('expanded');
    }
  }

  return card;
}

function renderProgress() {
  const v = document.getElementById('view-progress');
  v.innerHTML = `
    <div class="progress-view">
      <h1 class="display">Progress</h1>
      <div class="sub">Log your best set each week. Watch the numbers climb.</div>
      ${PROGRESS_GROUPS.map(group => `
        <div class="progress-group">
          <div class="progress-group-title">── ${group.title} ──</div>
          ${group.items.map(item => `
            <div class="progress-exercise">
              <div class="pe-name">${item.name}</div>
              <div class="pe-goal">Goal Wk 8: ${item.goal} · ${item.metric}</div>
              <div class="week-grid">
                ${[1,2,3,4].map(wk => `
                  <div class="week-cell ${wk === STATE.todayWeek ? 'current' : ''}">
                    <label>WK ${wk}</label>
                    <input type="text" data-prog="${item.id}" data-wk="${wk}" value="${STORAGE.getProgress(item.id, wk)}" inputmode="text">
                  </div>
                `).join('')}
              </div>
              <div class="week-grid" style="margin-top: 6px;">
                ${[5,6,7,8].map(wk => `
                  <div class="week-cell ${wk === STATE.todayWeek ? 'current' : ''}">
                    <label>WK ${wk}</label>
                    <input type="text" data-prog="${item.id}" data-wk="${wk}" value="${STORAGE.getProgress(item.id, wk)}" inputmode="text">
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
  v.querySelectorAll('input[data-prog]').forEach(input => {
    input.addEventListener('input', (e) => {
      STORAGE.setProgress(e.target.dataset.prog, parseInt(e.target.dataset.wk), e.target.value);
    });
  });
}

function renderInfo() {
  const v = document.getElementById('view-info');
  v.innerHTML = `
    <div class="info-view">
      <h1 class="display">Info</h1>

      <div class="info-block">
        <h2>Equipment</h2>
        <div class="info-item row"><div class="ii-label">Kettlebell</div><div class="ii-body">32 lbs — primary strength tool</div></div>
        <div class="info-item row"><div class="ii-label">TRX</div><div class="ii-body">Suspension trainer — rows, push-ups, squats, core</div></div>
        <div class="info-item row"><div class="ii-label">Anchor + Bands</div><div class="ii-body">Rows, chest press, pull-downs, rotations</div></div>
        <div class="info-item row"><div class="ii-label">Bands</div><div class="ii-body">Glute work, warm-up, assistance</div></div>
        <div class="info-item row"><div class="ii-label">Slam Ball</div><div class="ii-body">TRX slam ball — slams, twists, weighted core work</div></div>
        <div class="info-item row"><div class="ii-label">Weighted Vests</div><div class="ii-body">Progressive overload — added in Weeks 5–8</div></div>
        <div class="info-item row"><div class="ii-label">Stair Stepper</div><div class="ii-body">Mini stepper — warm-up + active rest</div></div>
        <div class="info-item row"><div class="ii-label">Jump Rope</div><div class="ii-body">Ropeless — warm-up + conditioning intervals</div></div>
      </div>

      <div class="info-block">
        <h2>Phase Structure</h2>
        <div class="info-item"><div class="ii-label">Phase 1 — Wk 1–4</div><div class="ii-body">Foundation. Learn movements, build work capacity, no vest. Form over load.</div></div>
        <div class="info-item"><div class="ii-label">Phase 2 — Wk 5–8</div><div class="ii-body">Progressive overload. Add weighted vest, increase reps, increase band resistance.</div></div>
      </div>

      <div class="info-block">
        <h2>Progression Rules</h2>
        <div class="info-item"><div class="ii-label">Rep Goal System</div><div class="ii-body">When you hit the TOP of the rep range for ALL sets → increase difficulty next session.</div></div>
        <div class="info-item"><div class="ii-label">KB Progression</div><div class="ii-body">More reps → more sets → add weighted vest → faster tempo.</div></div>
        <div class="info-item"><div class="ii-label">Band Progression</div><div class="ii-body">Increase band resistance or shorten anchor point for more tension.</div></div>
        <div class="info-item"><div class="ii-label">TRX Progression</div><div class="ii-body">Adjust body angle — more horizontal = harder.</div></div>
        <div class="info-item"><div class="ii-label">If It Feels Easy</div><div class="ii-body">Good. Add 1 rep per set next session. Slow and steady.</div></div>
        <div class="info-item"><div class="ii-label">If You Can't Finish</div><div class="ii-body">Drop reps or sets. This is YOUR program, not a test.</div></div>
      </div>

      <div class="info-block">
        <h2>Synergy with Protocol</h2>
        <div class="info-item"><div class="ii-label">Retatrutide</div><div class="ii-body">Reduces appetite — ensure adequate protein (100g+/day) around workouts.</div></div>
        <div class="info-item"><div class="ii-label">KLOW Blend</div><div class="ii-body">BPC-157 + TB-500 accelerate recovery — train with confidence.</div></div>
        <div class="info-item"><div class="ii-label">MOTS-c</div><div class="ii-body">Amplifies training adaptations — expect energy improvement by Week 5–6.</div></div>
        <div class="info-item"><div class="ii-label">Daily Walking</div><div class="ii-body">Non-negotiable on rest days (Mon/Wed/Fri/Sun) — 20–30 min minimum.</div></div>
      </div>

      <div class="info-block">
        <h2>Data</h2>
        <div class="info-item"><div class="ii-body">All logged sets and progress are stored on this device only. They'll persist as long as you don't clear your browser data. Add this page to your home screen to use it like an app.</div></div>
      </div>
    </div>
  `;
}

function setView(view) {
  STATE.view = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  // Topbar only shows on workout view
  document.querySelector('.topbar').style.display = view === 'workout' ? 'block' : 'none';
  if (view === 'progress') renderProgress();
  if (view === 'info') renderInfo();
  window.scrollTo(0, 0);
}

function selectDay(dayKey) {
  STATE.selectedDay = dayKey;
  renderTopbar();
  renderWorkout();
}

// ============================================================
// INIT
// ============================================================
function init() {
  const now = new Date();
  STATE.todayWeek = getCurrentWeek(now);
  STATE.todayKey = getTodayDayKey(now);

  // Determine default selected week + day
  if (STATE.todayWeek === 0) {
    STATE.selectedWeek = 1;
    STATE.selectedDay = 'B';
  } else if (STATE.todayWeek === 9) {
    STATE.selectedWeek = 8;
    STATE.selectedDay = 'A';
  } else {
    STATE.selectedWeek = STATE.todayWeek;
    if (STATE.todayKey) {
      STATE.selectedDay = STATE.todayKey;
    } else {
      // Rest day — show next workout
      const next = getNextWorkout(now);
      STATE.selectedDay = next.key;
      // If the next workout is in a new week, advance
      const nextWeek = getCurrentWeek(next.date);
      if (nextWeek > STATE.todayWeek && nextWeek <= 8) STATE.selectedWeek = nextWeek;
    }
  }

  // Event listeners
  document.getElementById('dayTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.day-tab');
    if (tab) selectDay(tab.dataset.day);
  });
  document.getElementById('bottomNav').addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-tab');
    if (tab) setView(tab.dataset.view);
  });

  renderTopbar();
  renderWorkout();
}

document.addEventListener('DOMContentLoaded', init);
