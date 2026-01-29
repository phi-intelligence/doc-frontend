import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowRight } from 'lucide-react';

export default function LegalDashboard() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-light-text tracking-tight">Legal Dashboard</h1>
      <p className="mt-2 text-sm text-light-text-secondary">
        Legal document workflows (MVP placeholder). Next: contract templates, NDA tracking, approvals.
      </p>

      <div className="mt-8 card p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-accent-50 flex items-center justify-center border border-brand-accent-100">
            <Scale className="w-5 h-5 text-brand-accent-600" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-light-text">Go to Tools</div>
            <div className="text-sm text-light-text-secondary">Use the public chat tools for legal drafts today</div>
          </div>
        </div>
        <Link to="/chat?skill=docx" state={{ forceNew: true }} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-accent-600">
          Draft a DOCX <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

