import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Plus,
  Search,
  Filter,
  BarChart3,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard, DashboardHeader, DataTable, QuickActions } from '../../../components/shared/dashboard';
import TemplateGalleryHero from '../../../components/dashboard/TemplateGalleryHero';
import { getInsuranceDashboard, listClaims, getUnderwritingQueue } from '../../../api/insurance';

// Claims Pipeline Component
const ClaimsPipeline = ({ claimsByStatus }) => {
  const stages = [
    { key: 'submitted', label: 'Submitted', color: 'bg-blue-500' },
    { key: 'under_review', label: 'Under Review', color: 'bg-amber-500' },
    { key: 'approved', label: 'Approved', color: 'bg-green-500' },
    { key: 'denied', label: 'Denied', color: 'bg-red-500' },
    { key: 'paid', label: 'Paid', color: 'bg-emerald-600' },
  ];

  const total = Object.values(claimsByStatus || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white rounded-xl border border-light-border p-6">
      <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cyan-600" />
        Claims Pipeline
      </h3>
      <div className="space-y-3">
        {stages.map(stage => {
          const count = claimsByStatus?.[stage.key] || 0;
          const percent = (count / total) * 100;
          return (
            <div key={stage.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{stage.label}</span>
                <span className="font-bold text-gray-800">{count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${stage.color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Expiring Policies Alert
const ExpiringPoliciesAlert = ({ policies }) => {
  if (!policies || policies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-800">Policies Expiring Soon</h4>
          <p className="text-xs text-amber-600 mt-1">
            {policies.length} {policies.length === 1 ? 'policy' : 'policies'} expiring in the next 30 days
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {policies.slice(0, 3).map(p => (
              <span key={p.id} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                {p.policy_number} - {p.holder_name}
              </span>
            ))}
            {policies.length > 3 && (
              <span className="text-xs text-amber-600">+{policies.length - 3} more</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function InsuranceDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [underwritingQueue, setUnderwritingQueue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [dashboard, claimsData, queueData] = await Promise.all([
        getInsuranceDashboard(),
        listClaims({ limit: 10 }),
        getUnderwritingQueue()
      ]);
      setDashboardData(dashboard);
      setRecentClaims(claimsData.claims || []);
      setUnderwritingQueue(queueData.queue || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch insurance data:', err);
      setError('Failed to load insurance dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const quickActions = [
    {
      label: 'New Policy',
      description: 'Create insurance policy',
      icon: Plus,
      color: 'cyan',
      onClick: () => navigate('/insurance/editor?type=policy')
    },
    {
      label: 'File Claim',
      description: 'Submit new claim',
      icon: FileText,
      color: 'blue',
      onClick: () => navigate('/insurance/editor?type=claim')
    },
    {
      label: 'Underwriting',
      description: 'New underwriting request',
      icon: Search,
      color: 'purple',
      onClick: () => navigate('/insurance/editor?type=underwriting')
    },
    {
      label: 'Generate Report',
      description: 'Analytics report',
      icon: BarChart3,
      color: 'green',
      onClick: () => navigate('/insurance/editor?type=report')
    }
  ];

  const claimsColumns = [
    {
      key: 'claim_number',
      label: 'Claim #',
      render: (value) => (
        <span className="font-mono text-sm font-bold text-cyan-700">{value}</span>
      )
    },
    {
      key: 'claim_type',
      label: 'Type',
      render: (value) => (
        <span className="capitalize text-sm">{value?.replace('_', ' ')}</span>
      )
    },
    {
      key: 'amount_claimed',
      label: 'Amount',
      render: (value) => (
        <span className="font-bold text-gray-800">
          ${value?.toLocaleString() || '0'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          submitted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
          under_review: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Search },
          approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
          denied: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
          paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: DollarSign },
        };
        const config = statusConfig[value] || statusConfig.submitted;
        const Icon = config.icon;
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${config.bg} ${config.text}`}>
            <Icon className="w-3 h-3" />
            {value?.replace('_', ' ')}
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

  const underwritingColumns = [
    {
      key: 'case_number',
      label: 'Case #',
      render: (value) => (
        <span className="font-mono text-sm font-bold text-purple-700">{value}</span>
      )
    },
    {
      key: 'applicant_name',
      label: 'Applicant',
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'policy_type',
      label: 'Type',
      render: (value) => (
        <span className="capitalize text-sm">{value}</span>
      )
    },
    {
      key: 'risk_score',
      label: 'Risk Score',
      render: (value) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const color = value <= 40 ? 'text-green-600' : value <= 70 ? 'text-amber-600' : 'text-red-600';
        return <span className={`font-bold ${color}`}>{value}</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors = {
          pending: 'bg-gray-100 text-gray-700',
          in_review: 'bg-blue-100 text-blue-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colors[value] || colors.pending}`}>
            {value?.replace('_', ' ')}
          </span>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Template Gallery Hero */}
      <TemplateGalleryHero
        module="insurance"
        title="Insurance Templates"
        subtitle="Policy documents, claim forms, and underwriting reports"
      />

      {/* Dashboard Header */}
      <DashboardHeader
        title="Insurance Management"
        subtitle="Policy, claims, and underwriting overview"
        icon={Shield}
        iconColor="text-cyan-600"
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: fetchData,
            loading: refreshing
          },
          {
            label: 'New Policy',
            icon: Plus,
            onClick: () => navigate('/insurance/editor?type=policy'),
            primary: true
          }
        ]}
      />

      {/* Expiring Policies Alert */}
      <ExpiringPoliciesAlert policies={dashboardData?.expiring_policies} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Policies"
          value={dashboardData?.active_policies || 0}
          icon={Shield}
          color="cyan"
        />
        <StatCard
          label="Open Claims"
          value={dashboardData?.open_claims || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Pending Underwriting"
          value={dashboardData?.pending_underwriting || 0}
          icon={Search}
          color="purple"
        />
        <StatCard
          label="Renewals (30 days)"
          value={dashboardData?.upcoming_renewals_30d || 0}
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Claims */}
          <DataTable
            title="Recent Claims"
            icon={FileText}
            iconColor="text-blue-600"
            columns={claimsColumns}
            data={recentClaims}
            emptyMessage="No claims found"
            onRowClick={(row) => navigate(`/insurance/claims/${row.id}`)}
          />

          {/* Underwriting Queue */}
          <DataTable
            title="Underwriting Queue"
            icon={Search}
            iconColor="text-purple-600"
            columns={underwritingColumns}
            data={underwritingQueue}
            emptyMessage="No pending underwriting cases"
            onRowClick={(row) => navigate(`/insurance/underwriting/${row.id}`)}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Claims Pipeline */}
          <ClaimsPipeline claimsByStatus={dashboardData?.claims_by_status} />

          {/* Policy Templates */}
          <div className="bg-white rounded-xl border border-light-border p-6">
            <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-600" />
              Policy Templates
            </h3>
            <div className="space-y-2">
              {['Life Insurance Policy', 'Health Insurance Policy', 'Auto Insurance Policy', 'Property Insurance Policy'].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/insurance/editor?template=${template.toLowerCase().replace(/ /g, '-')}`)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-cyan-500" />
                  {template}
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
