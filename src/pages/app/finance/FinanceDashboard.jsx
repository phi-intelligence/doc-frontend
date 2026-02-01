import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Briefcase,
  Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard, DashboardHeader, DataTable, ApprovalQueue, QuickActions } from '../../../components/shared/dashboard';
import TemplateSamplesBlock from '../../../components/dashboard/TemplateSamplesBlock';
import TemplateGalleryHero from '../../../components/dashboard/TemplateGalleryHero';
import '../../../components/dashboard/TemplateSamplesBlock.css';
import { getFinanceDashboard, listReports, listBudgetApprovals, updateBudgetApproval } from '../../../api/finance';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [reports, setReports] = useState([]);
  const [budgetApprovals, setBudgetApprovals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [dashboard, reportsData, approvalsData] = await Promise.all([
        getFinanceDashboard(),
        listReports(),
        listBudgetApprovals({ status: 'pending' })
      ]);
      setDashboardData(dashboard);
      setReports(reportsData.items || []);
      setBudgetApprovals(approvalsData.items || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
      setError('Failed to load finance dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (approval) => {
    try {
      await updateBudgetApproval(approval.id, { status: 'approved' });
      fetchData();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (approval) => {
    try {
      await updateBudgetApproval(approval.id, { status: 'rejected' });
      fetchData();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const quickActions = [
    {
      label: 'Generate Report',
      description: 'Create financial report',
      icon: TrendingUp,
      color: 'green',
      onClick: () => navigate('/finance/editor?skill=xlsx')
    },
    {
      label: 'Upload Dataset',
      description: 'Ingest data for analysis',
      icon: Upload,
      color: 'blue',
      onClick: () => navigate('/finance/editor')
    },
    {
      label: 'Comp Analysis',
      description: 'Analyze compensation',
      icon: Users,
      color: 'purple',
      onClick: () => navigate('/finance/editor?template=compensation-analysis')
    },
    {
      label: 'Budget Report',
      description: 'Department budgets',
      icon: Briefcase,
      color: 'orange',
      onClick: () => navigate('/finance/editor?template=budget-report')
    }
  ];

  const reportColumns = [
    {
      key: 'title',
      label: 'Report Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-bold text-light-text">{value || 'Untitled Report'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
          pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
          processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: RefreshCw },
          error: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle }
        };
        const config = statusConfig[value] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${config.bg} ${config.text}`}>
            <Icon className="w-3 h-3" />
            {value}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <DashboardHeader
          title="Financial Management"
          description="Loading dashboard data..."
          breadcrumbs={[{ label: 'Finance', to: '/app/finance' }]}
        />
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-accent-600" />
        </div>
      </div>
    );
  }

  const stats = dashboardData?.reports_stats || { total: 0, completed: 0, in_progress: 0 };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Template Gallery Hero - First/Hero Section */}
      <TemplateGalleryHero
        module="finance"
        title="Start a new financial document"
        editorPath="/finance/editor"
      />

      <DashboardHeader
        title="Financial Management"
        description="Monitor financial performance, generate fiscal reports, and manage compensation approvals."
        breadcrumbs={[{ label: 'Finance', to: '/app/finance' }]}
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: fetchData
          },
          {
            label: 'Generate Report',
            icon: TrendingUp,
            variant: 'primary',
            onClick: () => navigate('/finance/editor?skill=xlsx')
          }
        ]}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Pending Approvals"
          value={dashboardData?.pending_budget_approvals || 0}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Reports Generated"
          value={stats.completed}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={RefreshCw}
          color="blue"
        />
        <StatCard
          title="Comp Bands Active"
          value={dashboardData?.compensation_bands_count || 0}
          icon={DollarSign}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Reports Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Financial Reports</h2>
              <Link
                to="/app/finance/reports"
                className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable
              columns={reportColumns}
              data={reports.slice(0, 5)}
              searchable={false}
              showPagination={false}
              emptyMessage="No reports yet. Generate your first report!"
              onRowClick={(row) => navigate(`/app/finance/reports/${row.id}`)}
              actions={(row) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/finance/reports/${row.id}`);
                  }}
                  className="p-2 text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            />
          </div>

          {/* Budget Approvals */}
          <ApprovalQueue
            title="Pending Compensation Approvals"
            items={budgetApprovals.map(a => ({
              id: a.id,
              title: `${a.approval_type.replace('_', ' ')} - ${a.currency} ${a.proposed_salary?.toLocaleString() || 'N/A'}`,
              resource_type: a.approval_type,
              status: a.status,
              description: `${a.entity_type} ${a.entity_id}`,
              created_at: a.created_at
            }))}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={(item) => navigate(`/app/finance/approvals/${item.id}`)}
            emptyMessage="No pending compensation approvals"
          />
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickActions
            title="Quick Actions"
            actions={quickActions}
            columns={2}
          />

          {/* Sample Templates */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm p-6">
            <TemplateSamplesBlock module="finance" limit={5} title="Sample reports" />
          </div>

          {/* Finance Editor CTA */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-brand-accent-500 to-brand-accent-700 rounded-3xl p-8 text-white shadow-xl"
          >
            <h3 className="text-xl font-bold mb-3">Fiscal AI Editor</h3>
            <p className="text-brand-accent-100 text-sm leading-relaxed mb-6">
              Automate complex spreadsheet calculations, generate executive summaries, and analyze fiscal data with high accuracy.
            </p>
            <Link
              to="/finance/editor?direct=1"
              className="w-full py-3 bg-white text-brand-accent-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-accent-50 transition-colors"
            >
              Open Finance Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
