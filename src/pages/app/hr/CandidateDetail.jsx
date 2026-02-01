import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import DashboardHeader from '../../../components/shared/dashboard/DashboardHeader';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState({});

  const fetchCandidate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hr/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load candidate');
      }
      const data = await res.json();
      setCandidate(data);
      setEdit({
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        position: data.position ?? '',
        status: data.status ?? '',
        notes: data.notes ?? ''
      });
    } catch (e) {
      setError(e?.message || 'Failed to load candidate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/hr/candidates/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(edit)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Update failed');
      }
      const data = await res.json();
      setCandidate(data);
    } catch (e) {
      setError(e?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const displayName = candidate
    ? [candidate.first_name, candidate.last_name].filter(Boolean).join(' ') || 'Unnamed'
    : '—';

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <DashboardHeader
        title={displayName}
        description="Candidate profile"
        breadcrumbs={[
          { label: 'HR', to: '/app/hr' },
          { label: 'Candidates', to: '/app/hr/candidates' },
          { label: displayName, to: `/app/hr/candidates/${id}` }
        ]}
        actions={[]}
      />

      <div className="mt-4 flex items-center gap-4">
        <Link to="/app/hr/candidates" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700">
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>
        <Link
          to="/app/hr/onboarding/new"
          state={{ candidate_id: id, candidate_name: displayName, candidate_email: candidate?.email, candidate_position: candidate?.position }}
          className="text-sm font-semibold text-light-text-secondary hover:text-brand-accent-600"
        >
          Start onboarding for this candidate
        </Link>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 p-8 flex justify-center text-light-text-secondary">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
      ) : candidate ? (
        <div className="mt-6 card p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">First name</label>
                <input
                  type="text"
                  value={edit.first_name ?? ''}
                  onChange={(e) => setEdit((p) => ({ ...p, first_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Last name</label>
                <input
                  type="text"
                  value={edit.last_name ?? ''}
                  onChange={(e) => setEdit((p) => ({ ...p, last_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={edit.email ?? ''}
                onChange={(e) => setEdit((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Phone</label>
              <input
                type="text"
                value={edit.phone ?? ''}
                onChange={(e) => setEdit((p) => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Position</label>
              <input
                type="text"
                value={edit.position ?? ''}
                onChange={(e) => setEdit((p) => ({ ...p, position: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Status</label>
              <select
                value={edit.status ?? 'applied'}
                onChange={(e) => setEdit((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
              >
                <option value="applied">Applied</option>
                <option value="offer_sent">Offer sent</option>
                <option value="signed">Signed</option>
                <option value="onboarding">Onboarding</option>
                <option value="hired">Hired</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Notes</label>
              <textarea
                value={edit.notes ?? ''}
                onChange={(e) => setEdit((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-3 rounded-xl inline-flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" onClick={fetchCandidate} disabled={loading} className="btn-secondary px-5 py-3 rounded-xl inline-flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
