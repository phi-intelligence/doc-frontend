import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Eye } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { getFileUrl, getPreviewUrl } from '../../../api/files';

export default function OnboardingDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hr/onboarding/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load onboarding detail');
      }
      const data = await res.json();
      setItem(data);
    } catch (e) {
      setError(e?.message || 'Failed to load onboarding detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <Link to="/app/hr/onboarding" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700">
          <ArrowLeft className="w-4 h-4" />
          Back to queue
        </Link>
        <button
          type="button"
          onClick={fetchDetail}
          className="btn-secondary px-4 py-2 rounded-xl inline-flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      ) : null}

      <div className="mt-6 card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-light-text tracking-tight">
              {item?.candidate_name || item?.email || `Onboarding ${id}`}
            </h1>
            <p className="mt-1 text-sm text-light-text-secondary">
              {item?.position || 'Position'} • Status: <span className="font-bold">{(item?.status || 'unknown').toUpperCase()}</span>
            </p>
          </div>
          <Link to="/demo/hr" className="btn-primary px-4 py-2 rounded-xl">
            Open HR Operations
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="text-sm font-bold text-light-text mb-3">Uploaded Files</div>
            <div className="space-y-2">
              {(item?.files || []).map((f) => (
                <div key={f} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-light-text-secondary truncate">{f}</div>
                  <a
                    href={getFileUrl(f)}
                    className="text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700"
                  >
                    Download
                  </a>
                </div>
              ))}
              {(!item?.files || item.files.length === 0) ? (
                <div className="text-sm text-light-text-secondary">No uploaded files recorded.</div>
              ) : null}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm font-bold text-light-text mb-3">Generated Documents</div>
            <div className="space-y-2">
              {(item?.artifacts || []).map((a) => (
                <div key={a} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-light-text-secondary truncate">{a}</div>
                  <div className="flex items-center gap-3">
                    <a
                      href={getPreviewUrl(a)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </a>
                    <a
                      href={getFileUrl(a)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
              {(!item?.artifacts || item.artifacts.length === 0) ? (
                <div className="text-sm text-light-text-secondary">
                  No generated artifacts yet.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

