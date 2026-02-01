import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import DashboardHeader from '../../../components/shared/dashboard/DashboardHeader';

export default function CandidatesList() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '50');
      const res = await fetch(`/api/hr/candidates?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load candidates');
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e?.message || 'Failed to load candidates');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <DashboardHeader
        title="Candidates"
        description="Pre-hire candidates and recruitment pipeline."
        breadcrumbs={[{ label: 'HR', to: '/app/hr' }, { label: 'Candidates', to: '/app/hr/candidates' }]}
        actions={[
          { label: 'Add candidate', icon: UserPlus, variant: 'primary', onClick: () => navigate('/app/hr/candidates/new') }
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <form onSubmit={onSearchSubmit} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-light-bg border border-light-border text-sm outline-none focus:ring-2 focus:ring-brand-accent-500/20"
            />
          </div>
          <button type="submit" className="btn-secondary px-4 py-2 rounded-xl">
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-xl bg-light-bg border border-light-border text-sm"
        >
          <option value="">All statuses</option>
          <option value="applied">Applied</option>
          <option value="offer_sent">Offer sent</option>
          <option value="signed">Signed</option>
          <option value="onboarding">Onboarding</option>
          <option value="hired">Hired</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
        <button type="button" onClick={fetchCandidates} disabled={loading} className="btn-secondary px-4 py-2 rounded-xl inline-flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="mt-6 card overflow-hidden">
        <div className="px-5 py-3 border-b border-light-border bg-light-bg flex items-center justify-between">
          <div className="text-sm font-bold text-light-text">Candidates</div>
          <div className="text-xs font-bold text-light-text-secondary">{total} total</div>
        </div>
        <div className="divide-y divide-light-border">
          {loading ? (
            <div className="p-8 flex justify-center text-light-text-secondary">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-light-text-secondary">
              No candidates found. Add a candidate or adjust filters.
            </div>
          ) : (
            items.map((c) => (
              <Link
                key={c.id}
                to={`/app/hr/candidates/${c.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-light-bg transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-light-text truncate">
                    {[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'}
                  </div>
                  <div className="text-xs text-light-text-secondary truncate">
                    {c.email || '—'} • {c.position || '—'} • {String(c.status || 'applied').toUpperCase()}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-light-text-secondary shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
