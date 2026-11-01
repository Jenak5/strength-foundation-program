import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blankState,
  checkinPoints,
  currentStreak,
  earliestWeek,
  emptyExerciseLog,
  isSessionDone,
  loadPoints,
  mergeState,
  migrateLegacy,
  plannedDate,
  sameContent,
  sanitizeState,
  sessionExercises,
  suggestSlot,
  weekKey,
  weekStatus,
} from '../lib/model.js';

const TODAY = new Date(2026, 10, 1, 15, 0, 0); // Sunday Nov 1, 2026

test('weeks start Monday and Sunday suggests the hike', () => {
  assert.equal(weekKey(TODAY), '2026-10-26');
  assert.equal(suggestSlot(TODAY), 'H');
  assert.equal(suggestSlot(new Date(2026, 10, 3)), 'A');
  assert.equal(suggestSlot(new Date(2026, 10, 5)), 'B');
  assert.equal(suggestSlot(new Date(2026, 10, 4)), 'M');
  assert.equal(plannedDate('2026-10-26', 'A'), '2026-10-27');
  assert.equal(plannedDate('2026-10-26', 'B'), '2026-10-29');
  assert.equal(plannedDate('2026-10-26', 'H'), '2026-10-31');
});

function finish(state, key, day) {
  const exercises = {};
  for (const ex of sessionExercises(day)) {
    const entry = emptyExerciseLog(ex, '2026-10-01T00:00:00.000Z');
    entry.done = true;
    exercises[ex.id] = entry;
  }
  state.logs[key] = { updatedAt: '2026-10-01T00:00:00.000Z', date: key.slice(0, 10), notes: '', exercises };
}

test('a week counts with two pieces, and an open week does not break the streak', () => {
  const state = blankState('2026-10-01T00:00:00.000Z');
  const previous = '2026-10-19';
  finish(state, `${previous}:A`, state.program.days.A);
  state.logs[`${previous}:H`] = { updatedAt: '2026-10-25T00:00:00.000Z', done: true, miles: '3', minutes: '50', date: '2026-10-25' };
  assert.equal(weekStatus(state, previous).kept, true);
  assert.equal(weekStatus(state, '2026-10-26').kept, false);
  assert.equal(currentStreak(state, TODAY), 1);

  const older = '2026-10-12';
  finish(state, `${older}:B`, state.program.days.B);
  state.logs[`${older}:M:2026-10-13`] = finishMobility(state, '2026-10-13');
  state.logs[`${older}:M:2026-10-14`] = finishMobility(state, '2026-10-14');
  assert.equal(weekStatus(state, older).M, true);
  assert.equal(currentStreak(state, TODAY), 2);
});

function finishMobility(state, date) {
  const exercises = {};
  for (const ex of sessionExercises(state.program.days.M)) {
    exercises[ex.id] = { done: true, note: '', updatedAt: '2026-10-13T00:00:00.000Z' };
  }
  return { updatedAt: '2026-10-13T00:00:00.000Z', date, notes: '', exercises };
}

test('one hip flow does not by itself complete the mobility piece', () => {
  const state = blankState();
  state.logs['2026-10-26:M:2026-11-01'] = finishMobility(state, '2026-11-01');
  assert.equal(weekStatus(state, '2026-10-26').mobilityCount, 1);
  assert.equal(weekStatus(state, '2026-10-26').M, false);
});

test('merge keeps both phones and lets the newer program win', () => {
  const local = blankState('2026-11-01T00:00:00.000Z');
  local.logs['2026-10-26:A'] = { updatedAt: '2026-11-01T01:00:00.000Z', notes: 'phone', exercises: {} };
  const remote = blankState('2026-11-01T02:00:00.000Z');
  remote.checkins['2026-10-26'] = { updatedAt: '2026-11-01T02:00:00.000Z', energy: 4, sleep: 3, motivation: 2, note: '' };
  remote.program.days.A.sections[0].exercises[0].dose = '4 × 6';
  remote.program.updatedAt = '2026-11-01T03:00:00.000Z';
  const merged = mergeState(local, remote);
  assert.equal(merged.logs['2026-10-26:A'].notes, 'phone');
  assert.equal(merged.checkins['2026-10-26'].energy, 4);
  assert.equal(merged.program.days.A.sections[0].exercises[0].dose, '4 × 6');
  assert.equal(sameContent(merged, remote), false);
});

test('newer log for the same session wins', () => {
  const older = blankState('2026-11-01T00:00:00.000Z');
  older.logs['2026-10-26:H'] = { updatedAt: '2026-11-01T01:00:00.000Z', miles: '2', done: true };
  const newer = blankState('2026-11-01T00:00:00.000Z');
  newer.logs['2026-10-26:H'] = { updatedAt: '2026-11-01T05:00:00.000Z', miles: '4.5', done: true };
  const merged = mergeState(older, newer);
  assert.equal(merged.logs['2026-10-26:H'].miles, '4.5');
});

test('legacy localStorage moves matching lifts forward and keeps the rest', () => {
  const map = {
    'log:wk1:A:A-l1': JSON.stringify({ set1: '8', set2: '8 @ 32lb', completed: true, notes: 'solid' }),
    'log:wk1:A:A-l5': JSON.stringify({ set1: '12', completed: true }),
    'sess-note:wk1:A': 'felt good',
    'prog:prog-goblet:wk1': '8',
    'program-v1': JSON.stringify({
      A: { sections: [{ title: 'LOWER', exercises: [
        { id: 'A-l1', name: 'Goblet Squat' },
        { id: 'custom-9', name: 'Step-up', equip: 'Box', reps: ['2×8', '3×10'], cue: 'Drive up' },
      ] }] },
    }),
  };
  const state = migrateLegacy(blankState('2026-01-01T00:00:00.000Z'), map);
  assert.equal(state.migratedFrom, 'local-v1');
  assert.equal(state.carried['A-goblet'].length, 1);
  assert.equal(state.carried['A-goblet'][0].date, '2026-05-19');
  assert.equal(state.carried['A-goblet'][0].done, true);
  assert.equal(state.archive.sessions.length, 1);
  assert.equal(state.archive.sessions[0].notes, 'felt good');
  assert.equal(state.archive.sessions[0].exercises.some((ex) => ex.id === 'A-l5'), true);
  assert.equal(state.archive.progress[0].name, 'Goblet Squat');
  const yours = state.program.days.A.sections.find((s) => s.title === 'Yours');
  assert.equal(yours.exercises[0].name, 'Step-up');
  assert.equal(yours.exercises[0].dose, '3×10');
  assert.equal(isSessionDone(state.program.days.A, state.logs['2026-05-18:A']), false);
  const points = loadPoints(state, 'A-goblet');
  assert.equal(points.length, 1);
  assert.equal(points[0].lb, 32);
  assert.equal(points[0].date, '2026-05-19');
});

test('check-in points ignore values outside 1 to 5', () => {
  const state = blankState();
  state.checkins['2026-10-26'] = { energy: 4, sleep: 9, motivation: 1 };
  const [point] = checkinPoints(state, ['2026-10-26']);
  assert.deepEqual(point, { week: '2026-10-26', energy: 4, sleep: null, motivation: 1 });
});

test('sanitize rejects the old document shape', () => {
  assert.equal(sanitizeState({ version: 1, logs: {} }), null);
});

test('earliest week reaches migrated sessions', () => {
  const state = migrateLegacy(blankState(), {
    'log:wk2:B:B-p2': JSON.stringify({ set1: '10', completed: false }),
  });
  assert.equal(state.carried['A-row'][0].date, '2026-05-28');
  assert.equal(earliestWeek(state, TODAY), '2026-05-25');
});
