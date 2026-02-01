import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  FileText,
  Briefcase,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  AlertCircle,
  ClipboardList,
  FileSignature,
  IdCard,
  ScrollText,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatCard, DashboardHeader, ProgressTracker, AlertBanner, QuickActions, ApprovalQueue } from '../../../components/shared/dashboard';
import TemplateSamplesBlock from '../../../components/dashboard/TemplateSamplesBlock';
import TemplateGalleryHero from '../../../components/dashboard/TemplateGalleryHero';
import '../../../components/dashboard/TemplateSamplesBlock.css';
import { useAuth } from '../../../auth/AuthContext';
import { getFileUrl, getPreviewUrl } from '../../../api/files';
import { getDashboard } from '../../../api/analytics';
import { getComplianceSnapshot, listOnboarding, listApprovals, listEmployees, seedEmployees, getEmployeeStats } from '../../../api/hr';

function normalizeFile(filename) {
  const type = filename?.split('.').pop()?.toUpperCase() || 'DOCX';
  return {
    filename,
    type,
    url: getFileUrl(filename),
    previewUrl: getPreviewUrl(filename),
    isOutput: false,
    uploadedAt: new Date().toISOString()
  };
}

// Onboarding stages for pipeline visualization
const ONBOARDING_STAGES = [
  { name: 'Applied', key: 'applied', description: 'Initial application received' },
  { name: 'Screening', key: 'screening', description: 'Background & document check' },
  { name: 'Interview', key: 'interview', description: 'Interview in progress' },
  { name: 'Offer', key: 'offer', description: 'Offer extended' },
  { name: 'Onboarding', key: 'onboarding', description: 'Completing onboarding tasks' },
  { name: 'Active', key: 'active', description: 'Fully onboarded' }
];

export default function HRDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);
  const [employeeStats, setEmployeeStats] = useState({ total: 0, active: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [onboarding, setOnboarding] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [complianceAlerts, setComplianceAlerts] = useState([]);

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      const [listData, statsData] = await Promise.all([
        listEmployees().catch((e) => { throw e; }),
        getEmployeeStats().catch(() => ({ total: 0, active: 0 }))
      ]);
      setEmployees(listData.items || []);
      setEmployeeStats({
        total: statsData.total ?? (listData.items || []).length,
        active: statsData.active ?? (listData.items || []).length
      });
    } catch (e) {
      setEmployeesError(e?.message || 'Failed to load employees');
      setEmployees([]);
      setEmployeeStats({ total: 0, active: 0 });
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleLoadDemoEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      await seedEmployees();
      await fetchEmployees();
    } catch (e) {
      setEmployeesError(e?.message || 'Failed to load demo employees');
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDashboardLoading(true);
    Promise.all([
      getDashboard('hr').then((d) => !cancelled && setAnalytics(d)).catch(() => {}),
      getComplianceSnapshot().then((d) => {
        if (!cancelled && d) {
          setSnapshot(d);
          // Build compliance alerts from snapshot
          const alerts = [];
          if (d.expiring_soon > 0) {
            alerts.push({
              id: 'expiring',
              type: 'warning',
              title: 'Documents Expiring Soon',
              message: `${d.expiring_soon} document(s) will expire within the next 30 days.`,
              count: d.expiring_soon,
              action: { label: 'View Details' }
            });
          }
          if (d.missing_documents > 0) {
            alerts.push({
              id: 'missing',
              type: 'error',
              title: 'Missing Required Documents',
              message: `${d.missing_documents} employee(s) have missing required documents.`,
              count: d.missing_documents,
              action: { label: 'View Details' }
            });
          }
          if (d.overdue_training > 0) {
            alerts.push({
              id: 'training',
              type: 'warning',
              title: 'Overdue Training',
              message: `${d.overdue_training} employee(s) have overdue training certifications.`,
              count: d.overdue_training,
              action: { label: 'View Details' }
            });
          }
          setComplianceAlerts(alerts);
        }
      }).catch(() => {}),
      listOnboarding().then((d) => !cancelled && setOnboarding(d.items || [])).catch(() => {}),
      listApprovals({ status: 'pending' }).then((d) => !cancelled && setApprovals(d.items || [])).catch(() => {}),
    ]).finally(() => !cancelled && setDashboardLoading(false));
    return () => { cancelled = true; };
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      return (
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery]);

  const openEmployeeWorkspace = (employee) => {
    const docs = (employee?.documents || []).map(normalizeFile);
    navigate('/hr/editor?direct=1', {
      state: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          title: employee.title,
          department: employee.department
        },
        initialFiles: docs
      }
    });
  };

  // Quick document generation actions
  const quickActions = [
    {
      label: 'Offer Letter',
      description: 'Generate offer letter pack',
      icon: FileSignature,
      color: 'blue',
      onClick: () => navigate('/hr/editor?skill=docx&template=offer-letter')
    },
    {
      label: 'Contract',
      description: 'Employment contract',
      icon: ScrollText,
      color: 'green',
      onClick: () => navigate('/hr/editor?skill=docx&template=employment-contract')
    },
    {
      label: 'NDA',
      description: 'Non-disclosure agreement',
      icon: ShieldCheck,
      color: 'purple',
      onClick: () => navigate('/hr/editor?skill=docx&template=nda')
    },
    {
      label: 'ID Card',
      description: 'Generate employee ID',
      icon: IdCard,
      color: 'orange',
      onClick: () => navigate('/hr/editor?skill=docx&template=id-card')
    }
  ];

  // Calculate current onboarding stage for pipeline
  const getOnboardingStageIndex = () => {
    if (onboarding.length === 0) return 0;
    // Find the most advanced stage among active onboarding cases
    const activeCase = onboarding.find(o => o.status !== 'completed');
    if (!activeCase) return ONBOARDING_STAGES.length - 1;
    const stageIndex = ONBOARDING_STAGES.findIndex(s => s.key === activeCase.stage);
    return stageIndex >= 0 ? stageIndex : 0;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Template Gallery Hero - First/Hero Section */}
      <TemplateGalleryHero
        module="hr"
        title="Start a new HR document"
        editorPath="/hr/editor"
      />

      <DashboardHeader
        title="Human Resources"
        description="Manage employee onboarding, maintain personnel records, and automate document generation workflows."
        breadcrumbs={[{ label: 'HR', to: '/app/hr' }]}
        actions={[
          { label: 'Refresh', icon: RefreshCw, variant: 'secondary', onClick: () => { fetchEmployees(); } },
          { label: 'Add candidate', icon: UserPlus, variant: 'secondary', onClick: () => navigate('/app/hr/candidates/new') },
          { label: 'Start onboarding', icon: ClipboardList, variant: 'secondary', onClick: () => navigate('/app/hr/onboarding/new') },
          { label: 'Open HR Editor', icon: Zap, variant: 'primary', onClick: () => navigate('/hr/editor') }
        ]}
      />

      {/* Compliance Alerts */}
      {complianceAlerts.length > 0 && (
        <div className="mb-8">
          <AlertBanner
            alerts={complianceAlerts}
            onDismiss={(alert) => setComplianceAlerts(prev => prev.filter(a => a.id !== alert.id))}
            onAction={(alert) => navigate('/app/hr/compliance')}
          />
        </div>
      )}

      {/* HR Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Employees"
          value={employeesLoading ? '—' : String(employeeStats.active || employees.length)}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Onboarding"
          value={dashboardLoading ? '—' : String(analytics?.counts?.onboarding ?? onboarding.length)}
          icon={UserPlus}
          color="orange"
        />
        <StatCard
          title="Expiring Soon"
          value={dashboardLoading ? '—' : String(snapshot?.expiring_soon ?? '—')}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Pending Approvals"
          value={dashboardLoading ? '—' : String(approvals.length)}
          icon={ClipboardList}
          color="purple"
        />
      </div>

      {/* Onboarding Pipeline */}
      <div className="mb-8">
        <ProgressTracker
          title="Onboarding Pipeline"
          stages={ONBOARDING_STAGES}
          currentStage={getOnboardingStageIndex()}
          items={onboarding}
          orientation="horizontal"
          showCounts={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Section: Active Employees */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Active Employees</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employees..."
                    className="pl-9 pr-4 py-2 bg-light-bg border border-light-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20 w-64"
                  />
                </div>
                <button className="p-2 border border-light-border rounded-xl hover:bg-light-sidebar">
                  <Filter className="w-4 h-4 text-light-text-secondary" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-light-sidebar border-b border-light-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Docs</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {employeesLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-sm text-light-text-secondary">
                        Loading employees…
                      </td>
                    </tr>
                  ) : employeesError ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-sm text-red-700 bg-red-50/40">
                        {employeesError}
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <p className="text-sm text-light-text-secondary mb-3">
                          No employees yet. Load demo data to see the Active Employees list.
                        </p>
                        <button
                          type="button"
                          onClick={handleLoadDemoEmployees}
                          disabled={employeesLoading}
                          className="px-4 py-2 bg-brand-accent-600 text-white rounded-xl hover:bg-brand-accent-700 disabled:opacity-50 text-sm font-medium"
                        >
                          {employeesLoading ? 'Loading…' : 'Load demo employees'}
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.slice(0, 8).map((emp) => (
                      <tr key={emp.id} className="hover:bg-light-sidebar/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                              {String(emp.name || 'E').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-light-text truncate">{emp.name}</div>
                              <div className="text-xs text-light-text-secondary truncate">{emp.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary">{emp.title || '—'}</td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary">{emp.department || '—'}</td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary">{emp.documents?.length || 0}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openEmployeeWorkspace(emp)}
                            className="p-2 inline-flex text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg"
                            title="Open HR workspace with employee documents"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-light-sidebar/50 border-t border-light-border flex justify-center">
              <Link to="/app/hr/employees" className="text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1">
                View Employee Directory <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pending HR Approvals with actions */}
          <ApprovalQueue
            title="Pending HR Approvals"
            items={approvals.map(a => ({
              id: a.id,
              title: `${a.resource_type} Request`,
              resource_type: a.resource_type,
              status: a.status,
              description: a.resource_id ? `ID: ${a.resource_id.slice(0, 8)}...` : '',
              created_at: a.created_at
            }))}
            onApprove={(item) => console.log('Approve', item)}
            onReject={(item) => console.log('Reject', item)}
            onView={(item) => navigate(`/app/hr/approvals/${item.id}`)}
            emptyMessage="No pending HR approvals"
            maxItems={5}
          />
        </div>

        {/* Side Column: Quick Actions, compliance, timeline */}
        <div className="space-y-8">
          {/* Quick Document Generation */}
          <QuickActions
            title="Quick Generate"
            actions={quickActions}
            columns={2}
          />

          {/* Document timeline (recent activity) */}
          {analytics?.recent_activity?.length > 0 && (
            <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
              <h3 className="p-4 border-b border-light-border font-bold text-light-text">Recent Activity</h3>
              <ul className="divide-y divide-light-border max-h-48 overflow-y-auto">
                {analytics.recent_activity.slice(0, 8).map((evt) => (
                  <li key={evt.id} className="p-3 text-sm text-light-text-secondary">
                    <span className="font-medium text-light-text">{evt.action}</span>
                    {evt.entity_type && <span className="ml-1">· {evt.entity_type}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* HR Editor Promo */}
          <div className="bg-gradient-to-br from-brand-accent-600 to-brand-accent-800 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-3">AI Document Editor</h3>
            <p className="text-brand-accent-100 text-sm leading-relaxed mb-6">
              Use our specialized HR editor to draft contracts, generate offer letters, and process employee photos automatically.
            </p>
            <Link
              to="/hr/editor?direct=1"
              className="w-full py-3 bg-white text-brand-accent-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-accent-50 transition-colors"
            >
              Open HR Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Sample documents (builtin templates for HR) */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm p-6">
            <TemplateSamplesBlock module="hr" limit={5} title="Sample documents" />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-light-text mb-4 tracking-tight">Resource Center</h3>
            <div className="space-y-3">
              {[
                { label: 'Employment Templates', icon: FileText, to: '/app/hr/templates' },
                { label: 'Policy Handbook', icon: Briefcase, to: '/app/hr/policies' },
                { label: 'Compliance Checklist', icon: ShieldCheck, to: '/app/hr/compliance' },
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.to}
                  className="w-full p-4 bg-white border border-light-border rounded-2xl flex items-center justify-between group hover:border-brand-accent-300 transition-all"
                >
                  <div className="flex items-center gap-3 text-light-text font-semibold text-sm">
                    <link.icon className="w-4 h-4 text-light-text-secondary" />
                    {link.label}
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-text-secondary group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
