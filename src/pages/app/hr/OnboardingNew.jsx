import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Globe } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';

/**
 * New onboarding ingest: upload candidate documents and optional candidate_id.
 * POST /api/hr/onboarding/ingest (FormData: candidate_name, email, position, candidate_id?, files)
 */
export default function OnboardingNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const state = location.state || {};
  const [candidateName, setCandidateName] = useState(state.candidate_name ?? '');
  const [email, setEmail] = useState(state.candidate_email ?? '');
  const [position, setPosition] = useState(state.candidate_position ?? '');
  const [candidateId, setCandidateId] = useState(state.candidate_id ?? '');
  const [files, setFiles] = useState([]);
  const [webResearchEnabled, setWebResearchEnabled] = useState(false);
  const [researchTopics, setResearchTopics] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      if (candidateName.trim()) formData.append('candidate_name', candidateName.trim());
      if (email.trim()) formData.append('email', email.trim());
      if (position.trim()) formData.append('position', position.trim());
      if (candidateId.trim()) formData.append('candidate_id', candidateId.trim());
      formData.append('web_mode_enabled', webResearchEnabled);
      if (webResearchEnabled && researchTopics.trim()) {
        formData.append('research_topics', researchTopics.trim());
      }
      files.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/hr/onboarding/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Ingest failed');
      }
      const data = await res.json();
      if (data?.id) {
        navigate(`/app/hr/onboarding/${data.id}`);
      } else {
        navigate('/app/hr/onboarding');
      }
    } catch (e) {
      setError(e?.message || 'Ingest failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/app/hr/onboarding" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to queue
      </Link>
      <h1 className="text-2xl font-bold text-light-text tracking-tight">New onboarding ingest</h1>
      <p className="mt-2 text-sm text-light-text-secondary">
        Upload candidate documents; Phi Docs will generate offer letter, contract, NDA, and ID card.
      </p>

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Candidate name</label>
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border focus:ring-2 focus:ring-brand-accent-500/20 outline-none text-light-text"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border focus:ring-2 focus:ring-brand-accent-500/20 outline-none text-light-text"
            placeholder="email@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Position</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border focus:ring-2 focus:ring-brand-accent-500/20 outline-none text-light-text"
            placeholder="Job title"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Candidate ID (optional)</label>
          <input
            type="text"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border focus:ring-2 focus:ring-brand-accent-500/20 outline-none text-light-text"
            placeholder="Link to existing candidate record"
          />
        </div>
        {/* Web Research Toggle */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-brand-accent-50 to-transparent border border-brand-accent-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setWebResearchEnabled(!webResearchEnabled)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-bold rounded-lg transition-all ${
                webResearchEnabled
                  ? 'text-white bg-brand-accent-600 shadow-sm'
                  : 'text-light-text-secondary bg-white border border-light-border hover:border-brand-accent-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              LIVE_SURF
            </button>
            <span className="text-sm text-light-text">
              Enable web research for salary benchmarks and industry data
            </span>
          </label>
          {webResearchEnabled && (
            <div className="mt-3">
              <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">
                Research Topics (optional)
              </label>
              <input
                type="text"
                value={researchTopics}
                onChange={(e) => setResearchTopics(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-light-border focus:ring-2 focus:ring-brand-accent-500/20 outline-none text-light-text text-sm"
                placeholder="e.g., salary benchmarks for Software Engineer in London, industry benefits standards"
              />
              <p className="mt-1 text-xs text-light-text-tertiary">
                Leave empty to automatically research based on position
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-light-text-secondary uppercase tracking-widest mb-2">Documents (CV, ID, etc.)</label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            className="w-full px-4 py-3 rounded-xl bg-light-bg border border-light-border file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-brand-accent-100 file:text-brand-accent-700"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm text-light-text-secondary">
                  <span className="truncate">{f.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-red-600 hover:text-red-700 font-medium">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || files.length === 0}
            className="btn-primary px-5 py-3 rounded-xl inline-flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {submitting ? 'Submitting…' : 'Start onboarding'}
          </button>
          <Link to="/app/hr/onboarding" className="btn-secondary px-5 py-3 rounded-xl">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
