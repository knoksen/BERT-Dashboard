import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.NER_API_PORT || 8787);
const HF_API_TOKEN = process.env.HF_API_TOKEN?.trim() || '';
const HF_NER_MODEL = process.env.HF_NER_MODEL?.trim() || '';
const MODEL_REVISION = process.env.MODEL_REVISION?.trim() || '';
const REQUEST_TIMEOUT_MS = Number(process.env.NER_API_TIMEOUT_MS || 8000);
const MAX_CHARS = 12000;
const CATEGORY_LABELS = ['ACTOR', 'ASSET', 'ACTION', 'ATTRIBUTE', 'OTHER'];

const GROUPED_EMPTY = {
  ACTOR: [],
  ASSET: [],
  ACTION: [],
  ATTRIBUTE: [],
  OTHER: [],
};

const json = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
};

const safeLog = (requestId, message, meta = {}) => {
  const scrubbed = { ...meta };
  delete scrubbed.text;
  delete scrubbed.input;
  delete scrubbed.raw;
  console.log(`[ner][${requestId}] ${message}`, scrubbed);
};

const splitBioPrefix = (rawLabel) => {
  const label = String(rawLabel || '').toUpperCase().trim();
  const matched = label.match(/^([BIES])[-_](.+)$/);
  if (!matched) {
    return { bio: null, base: label };
  }
  return { bio: matched[1], base: matched[2] || '' };
};

const normalizeCategory = (rawLabel) => {
  const { base } = splitBioPrefix(rawLabel);
  if (!base || base === 'O') {
    return 'OTHER';
  }

  const aliases = new Map([
    ['THREAT_ACTOR', 'ACTOR'],
    ['ATTACKER', 'ACTOR'],
    ['INFRASTRUCTURE', 'ASSET'],
    ['SYSTEM', 'ASSET'],
    ['ACCOUNT', 'ASSET'],
    ['TARGET', 'ASSET'],
    ['HOST', 'ASSET'],
    ['TTP', 'ACTION'],
    ['TECHNIQUE', 'ACTION'],
    ['TACTIC', 'ACTION'],
    ['VULNERABILITY', 'ATTRIBUTE'],
    ['MALWARE', 'ATTRIBUTE'],
    ['IOC', 'ATTRIBUTE'],
    ['INDICATOR', 'ATTRIBUTE'],
  ]);

  if (CATEGORY_LABELS.includes(base)) {
    return base;
  }

  if (aliases.has(base)) {
    return aliases.get(base);
  }

  if (base.includes('ACTOR')) return 'ACTOR';
  if (base.includes('ASSET')) return 'ASSET';
  if (base.includes('ACTION')) return 'ACTION';
  if (base.includes('ATTRIBUTE')) return 'ATTRIBUTE';

  return 'OTHER';
};

const maybeMapVeris = (text, category) => {
  const t = String(text || '').toLowerCase();
  if (category === 'ACTION' && t.includes('phish')) {
    return { action: { social: { variety: 'phishing' } } };
  }
  if (category === 'ACTION' && t.includes('ransom')) {
    return { action: { malware: { variety: 'ransomware' } } };
  }
  return {};
};

const decodeTokenText = (token) => {
  const raw = String(token ?? '');
  const normalized = raw.replace(/Ġ/g, ' ').replace(/▁/g, ' ');
  if (normalized.startsWith('##')) return normalized.slice(2);
  return normalized;
};

const extractTokenRows = (hfPayload) => {
  if (Array.isArray(hfPayload)) {
    if (hfPayload.length > 0 && Array.isArray(hfPayload[0])) {
      return hfPayload.flat();
    }
    return hfPayload;
  }
  return [];
};

const toToken = (row) => {
  const rawLabel = row.entity ?? row.entity_group ?? row.label ?? '';
  const { bio } = splitBioPrefix(rawLabel);
  const tokenText = row.word ?? row.text ?? '';
  const text = decodeTokenText(tokenText);
  return {
    rawLabel: String(rawLabel || 'UNKNOWN'),
    bio,
    category: normalizeCategory(rawLabel),
    text,
    start: Number.isFinite(row.start) ? row.start : null,
    end: Number.isFinite(row.end) ? row.end : null,
    confidence: typeof row.score === 'number' ? row.score : null,
  };
};

const isSubwordJoin = (text) => {
  if (!text) return false;
  return !/^\s/.test(text);
};

const mergeTokensToEntities = (tokens) => {
  const entities = [];
  let current = null;

  const flush = () => {
    if (!current || !current.text.trim()) return;
    entities.push({
      category: current.category,
      text: current.text.trim(),
      start: current.start,
      end: current.end,
      confidence: current.confidenceTotal / current.confidenceCount,
      source: 'model',
      originalLabel: current.originalLabel,
      normalized: {
        veris: maybeMapVeris(current.text, current.category),
      },
    });
    current = null;
  };

  for (const token of tokens) {
    if (!token.text || token.category === 'OTHER') {
      flush();
      continue;
    }

    const canContinue =
      current &&
      current.category === token.category &&
      token.bio !== 'B' &&
      typeof current.end === 'number' &&
      typeof token.start === 'number' &&
      token.start <= current.end + 1;

    if (!canContinue) {
      flush();
      current = {
        category: token.category,
        text: token.text,
        start: token.start,
        end: token.end,
        confidenceTotal: token.confidence ?? 0,
        confidenceCount: token.confidence == null ? 0 : 1,
        originalLabel: token.rawLabel,
      };
      continue;
    }

    current.text += isSubwordJoin(token.text) ? token.text : ` ${token.text.trimStart()}`;
    if (typeof token.end === 'number') {
      current.end = token.end;
    }
    if (typeof token.confidence === 'number') {
      current.confidenceTotal += token.confidence;
      current.confidenceCount += 1;
    }
  }

  flush();
  return entities.map((entity) => ({
    ...entity,
    confidence: Number.isFinite(entity.confidence) ? entity.confidence : null,
  }));
};

const groupEntities = (entities) =>
  entities.reduce(
    (acc, entity) => {
      acc[entity.category].push(entity);
      return acc;
    },
    { ...GROUPED_EMPTY },
  );

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });

const parseUpstreamBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { nonJsonBody: true };
  }
};

const callHuggingFace = async (text) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const endpoint = `https://api-inference.huggingface.co/models/${encodeURIComponent(HF_NER_MODEL)}${MODEL_REVISION ? `?revision=${encodeURIComponent(MODEL_REVISION)}` : ''}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true,
          use_cache: true,
        },
      }),
      signal: controller.signal,
    });

    const payload = await parseUpstreamBody(response);
    return { response, payload };
  } finally {
    clearTimeout(timeout);
  }
};

const safeError = (res, status, error) => json(res, status, { success: false, error });

export const __testables = {
  splitBioPrefix,
  normalizeCategory,
  decodeTokenText,
  extractTokenRows,
  toToken,
  mergeTokensToEntities,
  groupEntities,
  parseUpstreamBody,
};

export const createNerHandler = ({
  env = process.env,
  fetchImpl = fetch,
  now = () => Date.now(),
  uuid = () => randomUUID(),
  logger = safeLog,
} = {}) => {
  const port = Number(env.NER_API_PORT || 8787);
  const hfApiToken = env.HF_API_TOKEN?.trim() || '';
  const hfNerModel = env.HF_NER_MODEL?.trim() || '';
  const modelRevision = env.MODEL_REVISION?.trim() || '';
  const requestTimeoutMs = Number(env.NER_API_TIMEOUT_MS || 8000);
  const maxChars = MAX_CHARS;

  const callHuggingFaceLocal = async (text) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
    const endpoint = `https://api-inference.huggingface.co/models/${encodeURIComponent(hfNerModel)}${modelRevision ? `?revision=${encodeURIComponent(modelRevision)}` : ''}`;

    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          options: {
            wait_for_model: true,
            use_cache: true,
          },
        }),
        signal: controller.signal,
      });

      const payload = await parseUpstreamBody(response);
      return { response, payload };
    } finally {
      clearTimeout(timeout);
    }
  };

  const handler = async (req, res) => {
    const start = now();
    const requestId = uuid();

    if (req.method !== 'POST' || req.url !== '/api/ner') {
      return safeError(res, 404, 'Not Found');
    }

    try {
      if (!hfApiToken) {
        logger(requestId, 'missing_token');
        return safeError(res, 500, 'Server misconfiguration: HF_API_TOKEN is missing.');
      }
      if (!hfNerModel) {
        logger(requestId, 'missing_model');
        return safeError(
          res,
          500,
          'Server misconfiguration: HF_NER_MODEL is missing. Configure a fine-tuned token-classification model.',
        );
      }

      const raw = await readBody(req);
      let parsed;
      try {
        parsed = raw ? JSON.parse(raw) : {};
      } catch {
        return safeError(res, 400, 'Invalid JSON body.');
      }
      if (!parsed || typeof parsed !== 'object') {
        return safeError(res, 400, 'Malformed request body.');
      }

      const textInput = typeof parsed.text === 'string' ? parsed.text : '';
      if (!textInput.trim()) {
        return safeError(res, 400, 'Input text is required.');
      }

      const truncated = textInput.length > maxChars;
      const text = truncated ? textInput.slice(0, maxChars) : textInput;

      const { response, payload } = await callHuggingFaceLocal(text);

      if (response.status === 429) {
        logger(requestId, 'hf_rate_limited', { status: 429 });
        return safeError(res, 503, 'Hugging Face rate limit reached. Please retry shortly.');
      }

      if (response.status === 503) {
        logger(requestId, 'hf_model_loading', { status: 503 });
        return safeError(res, 503, 'Model is loading or unavailable. Please retry shortly.');
      }

      if (!response.ok) {
        logger(requestId, 'hf_upstream_error', { status: response.status });
        return safeError(res, 502, 'Upstream model error from Hugging Face.');
      }

      const rows = extractTokenRows(payload);
      if (!Array.isArray(rows)) {
        logger(requestId, 'hf_malformed_payload', { status: response.status });
        return safeError(res, 502, 'Malformed response from upstream model provider.');
      }

      const tokens = rows.map(toToken);
      const entities = mergeTokensToEntities(tokens);
      const grouped = groupEntities(entities);
      const latencyMs = now() - start;

      logger(requestId, 'success', {
        model: hfNerModel,
        revision: modelRevision || 'default',
        inputChars: text.length,
        latencyMs,
        entityCount: entities.length,
      });

      return json(res, 200, {
        success: true,
        model: {
          name: hfNerModel,
          revision: modelRevision || 'default',
          labels: CATEGORY_LABELS,
        },
        limits: {
          maxChars,
          truncated,
        },
        entities,
        grouped,
        warnings: ['Assistive output; analyst review required.'],
        telemetry: {
          latencyMs,
          emptyExtraction: entities.length === 0,
          inputChars: text.length,
          requestId,
        },
      });
    } catch (error) {
      const latencyMs = now() - start;
      const timeout = error?.name === 'AbortError';
      logger(requestId, 'internal_error', {
        errorType: timeout ? 'timeout' : error?.name || 'unknown',
        latencyMs,
        model: hfNerModel || 'unset',
        revision: modelRevision || 'default',
      });
      return safeError(res, timeout ? 504 : 500, timeout ? 'Inference timed out. Please retry.' : 'Internal server error.');
    }
  };

  return { handler, port };
};

const { handler: defaultHandler, port: defaultPort } = createNerHandler();

const server = createServer(async (req, res) => {
  return defaultHandler(req, res);
});

server.listen(defaultPort, '127.0.0.1', () => {
  console.log(`[ner] server listening on http://127.0.0.1:${defaultPort}`);
});
