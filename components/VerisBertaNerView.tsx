import React, { useMemo, useState } from 'react';
import LoadingSpinner from './shared/LoadingSpinner';
import { runNerAnalysis, NERCategory, NEREntity, NERResponse } from '../services/nerService';

const CATEGORY_TITLES: Record<NERCategory, string> = {
  ACTOR: 'Actor',
  ASSET: 'Asset',
  ACTION: 'Action',
  ATTRIBUTE: 'Attribute',
  OTHER: 'Other',
};

type ReviewState = 'accepted' | 'edited' | 'ignored' | 'unreviewed';

const EntityRow: React.FC<{ entity: NEREntity }> = ({ entity }) => {
  const [reviewState, setReviewState] = useState<ReviewState>('unreviewed');
  const [editedText, setEditedText] = useState(entity.text);

  return (
    <li className="rounded-lg border border-dark-border bg-gray-900/50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-white">{editedText}</p>
          <p className="text-sm text-dark-text-secondary">
            {entity.category}
            {typeof entity.confidence === 'number' ? ` • ${(entity.confidence * 100).toFixed(1)}%` : ''}
            {typeof entity.start === 'number' && typeof entity.end === 'number'
              ? ` • span ${entity.start}-${entity.end}`
              : ''}
          </p>
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReviewState('accepted')}
            className="rounded-md border border-green-600/40 px-2 py-1 text-xs text-green-300 hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setReviewState('edited')}
            className="rounded-md border border-yellow-600/40 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setReviewState('ignored')}
            className="rounded-md border border-red-600/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Ignore
          </button>
        </div>
      </div>

      {reviewState === 'edited' && (
        <div className="mt-2">
          <label className="sr-only" htmlFor={`edit-${entity.start ?? 'na'}-${entity.end ?? 'na'}`}>
            Edit extracted entity text
          </label>
          <input
            id={`edit-${entity.start ?? 'na'}-${entity.end ?? 'na'}`}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full rounded-md border border-dark-border bg-gray-950 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      )}

      <p className="mt-2 text-xs text-dark-text-secondary">Review: {reviewState}</p>
    </li>
  );
};

const GroupPanel: React.FC<{ category: NERCategory; entities: NEREntity[] }> = ({ category, entities }) => {
  return (
    <section className="rounded-xl border border-dark-border bg-dark-card p-4" aria-label={`${CATEGORY_TITLES[category]} entities`}>
      <h3 className="mb-3 text-lg font-semibold text-white">{CATEGORY_TITLES[category]}</h3>
      {entities.length === 0 ? (
        <p className="text-sm text-dark-text-secondary">No entities detected.</p>
      ) : (
        <ul className="space-y-3">
          {entities.map((entity, index) => (
            <EntityRow key={`${category}-${entity.start ?? index}-${entity.text}-${index}`} entity={entity} />
          ))}
        </ul>
      )}
    </section>
  );
};

const VerisBertaNerView: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<NERResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasInput = useMemo(() => text.trim().length > 0, [text]);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await runNerAnalysis(text);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'NER analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl px-4 pb-24 md:pb-8">
      <div className="rounded-xl border border-dark-border bg-dark-card p-5">
        <h2 className="text-xl font-bold text-white">SOC Incident Narrative Enrichment</h2>
        <p className="mt-1 text-sm text-dark-text-secondary">Assistive output; analyst review required.</p>

        <div className="mt-4">
          <label htmlFor="incident-text" className="mb-2 block text-sm font-medium text-white">
            Incident narrative
          </label>
          <textarea
            id="incident-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste incident narrative, breach report, alert, or VERIS/VCDB-style description..."
            className="min-h-[180px] w-full rounded-lg border border-dark-border bg-gray-950 p-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="mt-2 text-xs text-dark-text-secondary">{text.length} chars (max 12,000 processed)</p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasInput || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-gray-900 hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {loading ? <LoadingSpinner size={18} /> : null}
            {loading ? 'Running NER Analysis...' : 'Run NER Analysis'}
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-red-700 bg-red-900/40 p-3 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && result?.entities.length === 0 && (
          <div className="mt-4 rounded-lg border border-dark-border bg-gray-900/50 p-3 text-dark-text-secondary">
            No entities detected. Try a longer or more specific incident narrative.
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-dark-border bg-gray-900/40 p-3 text-sm text-dark-text-secondary">
              <p>
                Model: <span className="text-white">{result.model.name}</span> ({result.model.revision})
              </p>
              <p>
                Request ID: <span className="text-white">{result.telemetry.requestId}</span> • Latency:{' '}
                <span className="text-white">{result.telemetry.latencyMs}ms</span>
              </p>
              {result.limits.truncated ? (
                <p className="text-yellow-300">
                  Input exceeded 12,000 characters and was truncated for API safety. Model token-window chunking is not applied yet.
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <GroupPanel category="ACTOR" entities={result.grouped.ACTOR} />
              <GroupPanel category="ASSET" entities={result.grouped.ASSET} />
              <GroupPanel category="ACTION" entities={result.grouped.ACTION} />
              <GroupPanel category="ATTRIBUTE" entities={result.grouped.ATTRIBUTE} />
              <GroupPanel category="OTHER" entities={result.grouped.OTHER} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerisBertaNerView;
