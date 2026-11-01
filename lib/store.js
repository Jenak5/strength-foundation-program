// One JSON document for Jena's training log.
// Blob is preferred (private Vercel Blob). Upstash Redis is the alternate.
// A local file is used only for tests and `npm run dev`, never on Vercel.

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { sanitizeState } from './model.js';

const BLOB_PATH = 'jena/training-log.json';
const REDIS_KEY = 'jena:training:v1';

export function storeKind() {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return 'blob';
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (redisUrl && redisToken) return 'upstash';
  if (!process.env.VERCEL && process.env.LOCAL_JSON_STORE) return 'file';
  return 'none';
}

export function setupMessage() {
  return 'In the Vercel project strength-foundation-program, open Storage → Create → Blob. Name it jena-training-log, set access to Private, and connect it to this project. Redeploy. Upstash Redis from the Marketplace (UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN) works in place of Blob.';
}

export async function readRecord() {
  const kind = storeKind();
  if (kind === 'blob') return readBlob();
  if (kind === 'upstash') return readRedis();
  if (kind === 'file') return readFileStore();
  return { revision: null, state: null };
}

export async function writeRecord(state, baseRevision) {
  const clean = sanitizeState(state);
  if (!clean) {
    const error = new Error('invalid_state');
    error.status = 400;
    throw error;
  }
  const kind = storeKind();
  if (kind === 'blob') return writeBlob(clean, baseRevision);
  if (kind === 'upstash') return writeRedis(clean, baseRevision);
  if (kind === 'file') return writeFileStore(clean, baseRevision);
  const error = new Error('not_configured');
  error.status = 503;
  throw error;
}

async function readBlob() {
  const { get, BlobNotFoundError } = await import('@vercel/blob');
  try {
    const result = await get(BLOB_PATH, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return { revision: null, state: null };
    }
    const text = await new Response(result.stream).text();
    return parseEnvelope(text);
  } catch (error) {
    if (error instanceof BlobNotFoundError || error?.name === 'BlobNotFoundError' || error?.statusCode === 404) {
      return { revision: null, state: null };
    }
    throw error;
  }
}

async function writeBlob(state, baseRevision) {
  const { put } = await import('@vercel/blob');
  const current = await readBlob();
  if ((current.revision || null) !== (baseRevision || null)) {
    return { conflict: true, revision: current.revision, state: current.state };
  }
  // The version lives in the document. Blob ETags are weak validators and
  // do not round-trip through a later conditional write.
  const revision = String(Number(current.revision || 0) + 1);
  await put(BLOB_PATH, JSON.stringify({ revision, state }), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
  return { conflict: false, revision, state };
}

function redisConfig() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  };
}

async function redisCommand(command) {
  const { url, token } = redisConfig();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Upstash request failed (${response.status})`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error);
  return payload.result;
}

async function readRedis() {
  const raw = await redisCommand(['GET', REDIS_KEY]);
  if (!raw) return { revision: null, state: null };
  return parseEnvelope(raw);
}

async function writeRedis(state, baseRevision) {
  const current = await readRedis();
  if ((current.revision || null) !== (baseRevision || null)) {
    return { conflict: true, revision: current.revision, state: current.state };
  }
  const revision = String(Number(current.revision || 0) + 1);
  await redisCommand(['SET', REDIS_KEY, JSON.stringify({ revision, state })]);
  return { conflict: false, revision, state };
}

async function readFileStore() {
  try {
    const raw = await readFile(process.env.LOCAL_JSON_STORE, 'utf8');
    return parseEnvelope(raw);
  } catch (error) {
    if (error?.code === 'ENOENT') return { revision: null, state: null };
    throw error;
  }
}

async function writeFileStore(state, baseRevision) {
  const current = await readFileStore();
  if ((current.revision || null) !== (baseRevision || null)) {
    return { conflict: true, revision: current.revision, state: current.state };
  }
  const revision = String(Number(current.revision || 0) + 1);
  const path = process.env.LOCAL_JSON_STORE;
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify({ revision, state }));
  await rename(tmp, path);
  return { conflict: false, revision, state };
}

function parseEnvelope(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { revision: null, state: null };
  }
  if (parsed && parsed.state) {
    return {
      revision: parsed.revision != null ? String(parsed.revision) : null,
      state: sanitizeState(parsed.state),
    };
  }
  // Older envelope that stored the state itself.
  return { revision: null, state: sanitizeState(parsed) };
}
