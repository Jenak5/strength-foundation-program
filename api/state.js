import { readRecord, setupMessage, storeKind, writeRecord } from '../lib/store.js';

const MAX_BYTES = 1_500_000;

export async function handle({ method, body }) {
  if (method === 'OPTIONS') return { status: 204, json: {} };

  if (storeKind() === 'none') {
    return {
      status: 503,
      json: { ok: false, error: 'not_configured', missing: 'store', setup: setupMessage() },
    };
  }

  if (method === 'GET') {
    const record = await readRecord();
    return { status: 200, json: { ok: true, store: storeKind(), revision: record.revision, state: record.state } };
  }

  if (method === 'PUT') {
    if (!body || typeof body !== 'object' || !body.state) {
      return { status: 400, json: { ok: false, error: 'invalid_body' } };
    }
    const saved = await writeRecord(body.state, body.baseRevision || null);
    if (saved.conflict) {
      return {
        status: 409,
        json: { ok: false, error: 'conflict', store: storeKind(), revision: saved.revision, state: saved.state },
      };
    }
    return { status: 200, json: { ok: true, store: storeKind(), revision: saved.revision, state: saved.state } };
  }

  return { status: 405, json: { ok: false, error: 'method_not_allowed' } };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        const error = new Error('too_large');
        error.status = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        const error = new Error('bad_json');
        error.status = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, json) {
  if (typeof res.status === 'function') {
    res.status(status).json(json);
    return;
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(json));
}

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const body = method === 'PUT' || method === 'POST' ? await readBody(req) : undefined;
    const result = await handle({ method: method === 'POST' ? 'PUT' : method, headers: req.headers || {}, body });
    send(res, result.status, result.json);
  } catch (error) {
    const status = error.status || 500;
    const payload = { ok: false, error: status === 500 ? 'server_error' : error.message };
    if (status === 500) console.error(error);
    send(res, status, payload);
  }
}
