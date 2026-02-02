import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, ArrowLeft, Clock, CheckCircle, XCircle, DollarSign,
  Calendar, MapPin, User, AlertCircle, Edit, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getClaim, approveClaim, denyClaim } from '../../../api/insurance';

export default function ClaimDetail() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [notes, setNotes] = useState('');

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const data = await getClaim(claimId);
      setClaim(data);
      setApprovalAmount(data.amount_claimed?.toString() || '');
    } catch (err) {
      console.error('Failed to fetch claim:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (claimId) fetchClaim();
  }, [claimId]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveClaim(claimId, {
        amount_approved: parseFloat(approvalAmount),
        adjuster_notes: notes
      });
      setShowApproveModal(false);
      fetchClaim();
    } catch (err) {
      console.error('Failed to approve claim:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    try {
      setActionLoading(true);
      await denyClaim(claimId, {
        denial_reason: denialReason,
        adjuster_notes: notes
      });
      setShowDenyModal(false);
      fetchClaim();
    } catch (err) {
      console.error('Failed to deny claim:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-4xl mx-auto pb-12 text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Claim not found</p>
        <button
          onClick={() => navigate('/insurance/claims')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Claims
        </button>
      </div>
    );
  }

  const statusConfig = {
    submitted: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
    under_review: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    denied: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    paid: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  };

  const config = statusConfig[claim.status] || statusConfig.submitted;
  const StatusIcon = config.icon;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <button
        onClick={() => navigate('/insurance/claims')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Claims
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Claim {claim.claim_number}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${config.bg} ${config.color}`}>
              <StatusIcon className="w-4 h-4 inline mr-1" />
              {claim.status?.replace('_', ' ')}
            </span>
            <span className="text-gray-500 capitalize">{claim.claim_type}</span>
          </div>
        </div>
        {claim.status === 'submitted' || claim.status === 'under_review' ? (
          <div className="flex gap-3">
            <button
              onClick={() => setShowDenyModal(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Deny
            </button>
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          </div>
        ) : null}
      </div>

      {/* Claim Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount Info */}
        <div className="bg-white rounded-xl border border-light-border p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Amount</h3>
          <div className="space-y-4">
            <div>
              <span className="text-gray-500 text-sm">Amount Claimed</span>
              <p className="text-2xl font-bold text-gray-800">${claim.amount_claimed?.toLocaleString()}</p>
            </div>
            {claim.amount_approved && (
              <div>
                <span className="text-gray-500 text-sm">Amount Approved</span>
                <p className="text-2xl font-bold text-green-600">${claim.amount_approved?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Incident Info */}
        <div className="bg-white rounded-xl border border-light-border p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Incident</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Date: {claim.incident_date ? new Date(claim.incident_date).toLocaleDateString() : '-'}</span>
            </div>
            {claim.incident_location && (
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{claim.incident_location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-light-border p-6 md:col-span-2">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Description</h3>
          <p className="text-gray-700">{claim.incident_description || 'No description provided'}</p>
        </div>

        {/* Timeline */}
        {claim.timeline && claim.timeline.length > 0 && (
          <div className="bg-white rounded-xl border border-light-border p-6 md:col-span-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Timeline</h3>
            <div className="space-y-3">
              {claim.timeline.map((event, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                  <span className="font-medium capitalize">{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Denial Reason */}
        {claim.denial_reason && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-6 md:col-span-2">
            <h3 className="text-sm font-bold text-red-700 uppercase mb-2">Denial Reason</h3>
            <p className="text-red-600">{claim.denial_reason}</p>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Approve Claim</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approved Amount</label>
                <input
                  type="number"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Deny Claim</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Denial Reason *</label>
                <textarea
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDenyModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeny}
                disabled={actionLoading || !denialReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Denying...' : 'Deny Claim'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
