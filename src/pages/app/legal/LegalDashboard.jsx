import React, { useEffect, useState } from 'react';
import {
  Scale,
  FileCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Gavel,
  Lock,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  History,
  Users,
  FileSignature
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard, DashboardHeader, DataTable, ApprovalQueue, QuickActions, ProgressTracker } from '../../../components/shared/dashboard';
import TemplateSamplesBlock from '../../../components/dashboard/TemplateSamplesBlock';
import TemplateGalleryHero from '../../../components/dashboard/TemplateGalleryHero';
import '../../../components/dashboard/TemplateSamplesBlock.css';
import { getLegalDashboard, listLegalHolds, listDsar, exportDsar, listPolicies } from '../../../api/legal';
import { listApprovals } from '../../../api/hr';

// Contract types that need legal review
const CONTRACT_RESOURCE_TYPES = ['contract', 'nda', 'employment_agreement', 'offer_letter', 'policy'];

export default function LegalDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [legalHolds, setLegalHolds] = useState([]);
  const [dsarList, setDsarList] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardData, holdsData, dsarData, approvalsData, policiesData] = await Promise.all([
        getLegalDashboard().catch(() => null),
        listLegalHolds().catch(() => ({ items: [] })),
        listDsar().catch(() => ({ items: [] })),
        listApprovals({ status: 'pending' }).catch(() => ({ items: [] })),
        listPolicies({ is_current: true }).catch(() => ({ items: [] }))
      ]);

      setDashboard(dashboardData);
      setLegalHolds(holdsData.items || []);
      setDsarList(dsarData.items || []);
      const contractApprovals = (approvalsData.items || []).filter((a) =>
        CONTRACT_RESOURCE_TYPES.includes(a.resource_type)
      );
      setPendingReviews(contractApprovals);
      setPolicies(policiesData.items || []);
    } catch (err) {
      console.error('Failed to fetch legal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportDsar = async (requestId) => {
    setExportingId(requestId);
    try {
      await exportDsar(requestId);
      const d = await listDsar();
      setDsarList(d.items || []);
    } catch (e) {
      console.error('DSAR export failed:', e);
    } finally {
      setExportingId(null);
    }
  };

  // Quick actions for legal documents
  const quickActions = [
    {
      label: 'New Contract',
      description: 'Draft contract from template',
      icon: FileSignature,
      color: 'purple',
      onClick: () => navigate('/legal/editor?skill=docx&template=contract')
    },
    {
      label: 'NDA',
      description: 'Non-disclosure agreement',
      icon: ShieldCheck,
      color: 'blue',
      onClick: () => navigate('/legal/editor?skill=docx&template=nda')
    },
    {
      label: 'Policy Doc',
      description: 'Create new policy',
      icon: FileText,
      color: 'green',
      onClick: () => navigate('/legal/editor?skill=docx&template=policy')
    },
    {
      label: 'DSAR Report',
      description: 'Generate DSAR export',
      icon: Download,
      color: 'orange',
      onClick: () => navigate('/app/legal/dsar')
    }
  ];

  // Contract review columns for DataTable
  const reviewColumns = [
    {
      key: 'resource_type',
      label: 'Type',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-light-text capitalize">{value?.replace('_', ' ')}</span>
        </div>
      )
    },
    {
      key: 'resource_id',
      label: 'ID',
      render: (value) => <span className="text-sm text-light-text-secondary">{value?.slice(0, 12)}...</span>
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  // DSAR columns for DataTable
  const dsarColumns = [
    {
      key: 'request_number',
      label: 'Request',
      render: (value, row) => <span className="text-sm font-medium text-light-text">{value || row.id?.slice(0, 8)}</span>
    },
    {
      key: 'request_type',
      label: 'Type',
      render: (value) => (
        <span className="text-xs font-bold uppercase text-light-text-secondary">{value || 'access'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          completed: { bg: 'bg-green-100', text: 'text-green-700' },
          processing: { bg: 'bg-blue-100', text: 'text-blue-700' },
          pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
          received: { bg: 'bg-gray-100', text: 'text-gray-700' }
        };
        const config = statusConfig[value] || statusConfig.pending;
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${config.bg} ${config.text}`}>
            {value || '—'}
          </span>
        );
      }
    },
    {
      key: 'due_date',
      label: 'Due',
      render: (value) => value ? new Date(value).toLocaleDateString() : '—'
    }
  ];

  // Calculate policy acknowledgment stats
  const getPolicyAckStats = () => {
    const total = policies.length;
    const withAck = policies.filter(p => p.requires_acknowledgement).length;
    // In a real app, we'd fetch actual acknowledgement counts
    return { total, withAck };
  };

  const policyStats = getPolicyAckStats();

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Template Gallery Hero - First/Hero Section */}
      <TemplateGalleryHero
        module="legal"
        title="Start a new legal document"
        editorPath="/legal/editor"
      />

      <DashboardHeader
        title="Legal & Compliance"
        description="Monitor contract lifecycles, regulatory compliance, and automate legal document reviews."
        breadcrumbs={[{ label: 'Legal', to: '/app/legal' }]}
        actions={[
          { label: 'Refresh', icon: RefreshCw, variant: 'secondary', onClick: fetchData },
          { label: 'Compliance Check', icon: ShieldCheck, variant: 'secondary', onClick: () => navigate('/app/legal/compliance') },
          { label: 'Open Legal Editor', icon: Gavel, variant: 'primary', onClick: () => navigate('/legal/editor') }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Contract Reviews"
          value={loading ? '—' : String(dashboard?.pending_contract_reviews ?? pendingReviews.length)}
          icon={Scale}
          color="purple"
        />
        <StatCard
          title="Active Legal Holds"
          value={loading ? '—' : String(dashboard?.active_legal_holds ?? legalHolds.length)}
          icon={Lock}
          color="orange"
        />
        <StatCard
          title="DSAR Requests"
          value={loading ? '—' : String(dashboard?.dsar_total ?? dsarList.length)}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="DSAR Overdue"
          value={loading ? '—' : String(dashboard?.dsar_overdue ?? 0)}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Pending contract reviews with DataTable */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Pending Contract Reviews</h2>
              <Link
                to="/app/legal/contracts"
                className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable
              columns={reviewColumns}
              data={pendingReviews.slice(0, 5)}
              searchable={false}
              showPagination={false}
              emptyMessage="No pending contract reviews"
              onRowClick={(row) => navigate(`/app/legal/review/${row.id}`)}
              actions={(row) => (
                <Link
                  to={`/app/legal/review/${row.id}`}
                  className="p-2 inline-flex text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  Review <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            />
          </div>

          {/* DSAR requests with DataTable */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-light-text tracking-tight">DSAR Requests</h2>
              <Link
                to="/app/legal/dsar"
                className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable
              columns={dsarColumns}
              data={dsarList.slice(0, 5)}
              searchable={false}
              showPagination={false}
              emptyMessage="No DSAR requests"
              actions={(row) => (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportDsar(row.id);
                  }}
                  disabled={exportingId === row.id}
                  className="p-2 inline-flex items-center gap-1 text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg disabled:opacity-50 text-sm"
                >
                  {exportingId === row.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export
                </button>
              )}
            />
          </div>

          {/* Policy Acknowledgment Tracking */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Policy Acknowledgments</h2>
              <Link
                to="/app/legal/policies"
                className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700"
              >
                Manage Policies
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-sm text-light-text-secondary">Loading...</div>
              ) : policies.length === 0 ? (
                <div className="text-center py-8 text-light-text-secondary">
                  <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active policies requiring acknowledgment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {policies.slice(0, 4).map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-4 bg-light-sidebar/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-light-text">{policy.name}</div>
                          <div className="text-xs text-light-text-secondary">
                            Version {policy.version || '1.0'} • {policy.policy_type || 'General'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {policy.requires_acknowledgement && (
                          <div className="text-right">
                            <div className="text-xs text-light-text-secondary">Acknowledged</div>
                            <div className="text-sm font-bold text-light-text">
                              {policy.acknowledgement_count || 0} / {policy.target_count || '—'}
                            </div>
                          </div>
                        )}
                        <Link
                          to={`/app/legal/policies/${policy.id}`}
                          className="p-2 text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickActions
            title="Quick Actions"
            actions={quickActions}
            columns={2}
          />

          {/* Legal Holds Timeline */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-light-border flex items-center justify-between">
              <h3 className="font-bold text-light-text flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                Active Legal Holds
              </h3>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                {legalHolds.length} active
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-light-text-secondary">Loading...</div>
              ) : legalHolds.length === 0 ? (
                <div className="p-6 text-center text-light-text-secondary">
                  <Lock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active legal holds.</p>
                </div>
              ) : (
                <div className="divide-y divide-light-border">
                  {legalHolds.map((hold, index) => (
                    <motion.div
                      key={hold.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-light-text">
                            {hold.entity_type} • {hold.entity_id?.slice(0, 8)}...
                          </div>
                          {hold.reason && (
                            <div className="text-xs text-light-text-secondary mt-1">{hold.reason}</div>
                          )}
                          {hold.case_reference && (
                            <div className="text-xs text-purple-600 mt-1">
                              Case: {hold.case_reference}
                            </div>
                          )}
                          {hold.created_at && (
                            <div className="text-xs text-light-text-secondary mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Since {new Date(hold.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sample Templates */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm p-6">
            <TemplateSamplesBlock module="legal" limit={5} title="Sample contracts / policies" />
          </div>

          {/* Legal Editor CTA */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl"
          >
            <h3 className="text-xl font-bold mb-3">Legal AI Assistant</h3>
            <p className="text-purple-100 text-sm leading-relaxed mb-6">
              Automate contract analysis, extract risk factors, and generate compliance documents with legal-grade precision.
            </p>
            <Link
              to="/legal/editor?direct=1"
              className="w-full py-3 bg-white text-purple-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
            >
              Open Legal Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
