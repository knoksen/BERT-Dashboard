import { describe, expect, it, vi } from 'vitest';
import { createNerHandler, __testables } from '../server/nerServer';

const buildReq = (body: unknown) => {
  const listeners: Record<string, ((arg?: any) => void)[]> = {};
  const req = {
    method: 'POST',
    url: '/api/ner',
    on(event: string, cb: (arg?: any) => void) {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    },
  } as any;

  queueMicrotask(() => {
    const payload = JSON.stringify(body);
    (listeners.data || []).forEach((cb) => cb(payload));
    (listeners.end || []).forEach((cb) => cb());
  });

  return req;
};

const buildRes = () => {
  let statusCode = 0;
  let raw = '';
  return {
    res: {
      writeHead(code: number) {
        statusCode = code;
      },
      end(chunk: string) {
        raw = chunk;
      },
    } as any,
    get statusCode() {
      return statusCode;
    },
    json<T = any>() {
      return JSON.parse(raw) as T;
    },
  };
};

describe('nerServer backend endpoint scenarios', () => {
  it('missing HF_API_TOKEN returns safe config error', async () => {
    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: '', HF_NER_MODEL: 'org/model' } as any,
      fetchImpl: vi.fn() as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'hello' }), out.res);

    expect(out.statusCode).toBe(500);
    expect(out.json().error).toMatch(/HF_API_TOKEN is missing/i);
  });

  it('missing HF_NER_MODEL returns safe config error', async () => {
    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: 'token', HF_NER_MODEL: '' } as any,
      fetchImpl: vi.fn() as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'hello' }), out.res);

    expect(out.statusCode).toBe(500);
    expect(out.json().error).toMatch(/HF_NER_MODEL is missing/i);
  });

  it('timeout returns 504 safe error', async () => {
    const fetchImpl = vi.fn(async () => {
      const err: any = new Error('aborted');
      err.name = 'AbortError';
      throw err;
    });

    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: 'token', HF_NER_MODEL: 'org/model', NER_API_TIMEOUT_MS: '1' } as any,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'hello' }), out.res);

    expect(out.statusCode).toBe(504);
    expect(out.json().error).toMatch(/timed out/i);
  });

  it('429 upstream returns safe rate-limit error', async () => {
    const fetchImpl = vi.fn(async () => ({
      status: 429,
      ok: false,
      text: async () => '{"error":"rate"}',
    }));

    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: 'token', HF_NER_MODEL: 'org/model' } as any,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'hello' }), out.res);

    expect(out.statusCode).toBe(503);
    expect(out.json().error).toMatch(/rate limit/i);
  });

  it('503 upstream returns safe model-loading error', async () => {
    const fetchImpl = vi.fn(async () => ({
      status: 503,
      ok: false,
      text: async () => '{"error":"loading"}',
    }));

    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: 'token', HF_NER_MODEL: 'org/model' } as any,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'hello' }), out.res);

    expect(out.statusCode).toBe(503);
    expect(out.json().error).toMatch(/loading or unavailable/i);
  });

  it('malformed/non-JSON upstream response returns safe upstream error', async () => {
    const fetchImpl = vi.fn(async () => ({
      status: 200,
      ok: false,
      text: async () => 'not-json',
    }));

    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: 'token', HF_NER_MODEL: 'org/model' } as any,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'hello' }), out.res);

    expect(out.statusCode).toBe(502);
    expect(out.json().error).toMatch(/Upstream model error/i);
  });

  it('grouped response shape includes ACTOR/ASSET/ACTION/ATTRIBUTE/OTHER', async () => {
    const fetchImpl = vi.fn(async () => ({
      status: 200,
      ok: true,
      text: async () => JSON.stringify([{ entity: 'B-ACTOR', word: 'LockBit', start: 0, end: 7, score: 0.9 }]),
    }));

    const { handler } = createNerHandler({
      env: { HF_API_TOKEN: 'token', HF_NER_MODEL: 'org/model' } as any,
      fetchImpl: fetchImpl as unknown as typeof fetch,
      logger: vi.fn(),
    });

    const out = buildRes();
    await handler(buildReq({ text: 'incident text' }), out.res);

    expect(out.statusCode).toBe(200);
    const body = out.json();
    expect(body.grouped).toHaveProperty('ACTOR');
    expect(body.grouped).toHaveProperty('ASSET');
    expect(body.grouped).toHaveProperty('ACTION');
    expect(body.grouped).toHaveProperty('ATTRIBUTE');
    expect(body.grouped).toHaveProperty('OTHER');
  });
});

describe('nerServer normalization and merge behavior', () => {
  it('normalizes BIO + aliases and unknown -> OTHER', () => {
    expect(__testables.normalizeCategory('B-ACTOR')).toBe('ACTOR');
    expect(__testables.normalizeCategory('I-THREAT_ACTOR')).toBe('ACTOR');
    expect(__testables.normalizeCategory('TECHNIQUE')).toBe('ACTION');
    expect(__testables.normalizeCategory('SOMETHING_NEW')).toBe('OTHER');
  });

  it('merges BIO/subword tokens into clean combined spans', () => {
    const tokens = [
      { entity: 'B-ACTOR', word: 'Lock', start: 0, end: 4, score: 0.9 },
      { entity: 'I-ACTOR', word: '##Bit', start: 4, end: 7, score: 0.8 },
      { entity: 'B-ACTION', word: ' deployed', start: 8, end: 16, score: 0.7 },
      { entity: 'I-ACTION', word: ' ransomware', start: 17, end: 27, score: 0.7 },
    ].map(__testables.toToken);

    const entities = __testables.mergeTokensToEntities(tokens);
    expect(entities.length).toBe(2);
    expect(entities[0].category).toBe('ACTOR');
    expect(entities[0].text).toBe('LockBit');
    expect(entities[0].start).toBe(0);
    expect(entities[0].end).toBe(7);
    expect(entities[1].category).toBe('ACTION');
    expect(entities[1].text).toContain('deployed');
    expect(entities[1].text).toContain('ransomware');
  });
});
