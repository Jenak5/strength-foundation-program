import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankState } from '../lib/model.js';

let dir;

test.before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'sfp-'));
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.VERCEL;
  process.env.LOCAL_JSON_STORE = join(dir, 'store.json');
});

test.after(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function api(method, { passcode = 'secret', body } = {}) {
  const { handle } = await import('../api/state.js');
  return handle({
    method,
    headers: passcode == null ? {} : { 'x-passcode': passcode },
    body,
  });
}

test('passcode protects the log and revisions reject stale writes', async () => {
  const previous = process.env.APP_PASSCODE;
  delete process.env.APP_PASSCODE;
  const missing = await api('GET', { passcode: 'secret' });
  process.env.APP_PASSCODE = previous || 'secret';
  assert.equal(missing.status, 503);
  assert.match(missing.json.setup, /APP_PASSCODE/);

  process.env.APP_PASSCODE = 'secret';
  const denied = await api('GET', { passcode: 'nope' });
  assert.equal(denied.status, 401);

  const empty = await api('GET');
  assert.equal(empty.status, 200);
  assert.equal(empty.json.state, null);

  const state = blankState('2026-11-01T00:00:00.000Z');
  state.logs['2026-10-26:H'] = {
    updatedAt: '2026-11-01T00:00:00.000Z',
    done: true,
    miles: '2.5',
    minutes: '40',
    note: 'leaves',
    date: '2026-11-01',
  };
  const saved = await api('PUT', { body: { baseRevision: null, state } });
  assert.equal(saved.status, 200);
  assert.ok(saved.json.revision);

  const again = await api('GET');
  assert.equal(again.json.state.logs['2026-10-26:H'].miles, '2.5');
  assert.equal(again.json.revision, saved.json.revision);

  const stale = await api('PUT', { body: { baseRevision: 'not-the-revision', state } });
  assert.equal(stale.status, 409);
  assert.equal(stale.json.state.logs['2026-10-26:H'].note, 'leaves');
});
