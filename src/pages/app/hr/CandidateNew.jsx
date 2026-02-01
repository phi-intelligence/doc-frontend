import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';

/**
 * Create a new candidate. POST /api/hr/candidates (JSON body).
 */
export default function CandidateNew() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    source: 'manual',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/hr/candidates', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Create failed');
      }
      const data = await res.json();
      if (data?.id) {
        navigate(`/app/hr/candidates/${data.id}`);
      } else {
        navigate('/app/hr/candidates');
      }
    } catch (e) {
      setError(e?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/app/hr/candidates" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to candidates
      </Link>
      <h1 className="text-2xl font-bold text-light-text tracking-tight">New candidate</h1>
      <p className="mt-2 text-sm text-light-text-secondary">Add a pre-hire candidate to the pipeline.</p>

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">First name</label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Last name</label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Position</label>
          <input
            type="text"
            value={form.position}
            onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border text-light-text outline-none focus:ring-2 focus:ring-brand-accent-500/20"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary px-5 py-3 rounded-xl inline-flex items-center gap-2 disabled:opacity-50">
            <UserPlus className="w-4 h-4" />
            {submitting ? 'Creating…' : 'Create candidate'}
          </button>
          <Link to="/app/hr/candidates" className="btn-secondary px-5 py-3 rounded-xl">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
