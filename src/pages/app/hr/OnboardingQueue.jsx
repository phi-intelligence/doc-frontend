import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';

function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    error: 'bg-red-100 text-red-800 border-red-200'
  };
  const cls = map[status] || 'bg-light-bg text-light-text-secondary border-light-border';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}>
      {String(status || 'unknown').toUpperCase()}
    </span>
  );
}

export default function OnboardingQueue() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hr/onboarding', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load onboarding queue');
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError(e?.message || 'Failed to load onboarding queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empty = useMemo(() => !loading && items.length === 0, [loading, items.length]);

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light-text tracking-tight">Onboarding Queue</h1>
          <p className="mt-2 text-sm text-light-text-secondary">
            Upload candidate documents; Phi Docs will generate offer letter, contract, NDA, and ID card automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchQueue}
            className="btn-secondary px-4 py-2 rounded-xl inline-flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
          <Link
            to="/app/hr/onboarding/new"
            className="btn-primary px-4 py-2 rounded-xl inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            New Ingest
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      ) : null}

      <div className="mt-6 card overflow-hidden">
        <div className="px-5 py-3 border-b border-light-border bg-light-bg flex items-center justify-between">
          <div className="text-sm font-bold text-light-text">Candidates</div>
          <div className="text-xs font-bold text-light-text-secondary">{items.length} records</div>
        </div>

        <div className="divide-y divide-light-border">
          {loading ? (
            <div className="p-8 flex items-center justify-center text-light-text-secondary">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : empty ? (
            <div className="p-8 text-center text-light-text-secondary">
              No onboarding records yet. Click “New Ingest” to upload candidate documents.
            </div>
          ) : (
            items.map((it) => (
              <Link
                key={it.id}
                to={`/app/hr/onboarding/${it.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-light-bg transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-light-text truncate">
                    {it.candidate_name || it.email || `Candidate ${it.id}`}
                  </div>
                  <div className="text-xs text-light-text-secondary truncate">
                    {it.position || 'Position'} • Uploaded files: {it.files?.length || 0}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={it.status} />
                  <ArrowRight className="w-4 h-4 text-light-text-secondary" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

