export type NERCategory = 'ACTOR' | 'ASSET' | 'ACTION' | 'ATTRIBUTE' | 'OTHER';

export interface NEREntity {
  category: NERCategory;
  text: string;
  start: number | null;
  end: number | null;
  confidence: number | null;
  source: 'model';
  originalLabel?: string;
  normalized?: {
    veris?: Record<string, unknown>;
  };
}

export interface NERResponse {
  success: boolean;
  model: {
    name: string;
    revision: string;
    labels: NERCategory[];
  };
  limits: {
    maxChars: number;
    truncated: boolean;
  };
  entities: NEREntity[];
  grouped: Record<NERCategory, NEREntity[]>;
  warnings: string[];
  telemetry: {
    latencyMs: number;
    emptyExtraction: boolean;
    inputChars: number;
    requestId: string;
  };
}

export const runNerAnalysis = async (text: string): Promise<NERResponse> => {
  const response = await fetch('/api/ner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      options: {
        language: 'en',
        returnSpans: true,
      },
    }),
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // noop
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload && typeof (payload as { error: unknown }).error === 'string'
        ? (payload as { error: string }).error
        : `NER request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid NER response payload.');
  }

  return payload as NERResponse;
};
