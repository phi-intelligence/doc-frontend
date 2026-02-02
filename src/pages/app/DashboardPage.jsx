import React from 'react';
import { 
  Users, 
  BarChart3, 
  Scale, 
  FileText, 
  FilePlus, 
  Search, 
  Bell,
  Clock,
  TrendingUp,
  FileCheck,
  Shield,
  HeartPulse
} from 'lucide-react';
import StatCard from '../../components/shared/dashboard/StatCard';
import SectionCard from '../../components/shared/dashboard/SectionCard';
import DashboardHeader from '../../components/shared/dashboard/DashboardHeader';

const sections = [
  { 
    to: '/app/hr', 
    title: 'Human Resources', 
    description: 'Streamline onboarding, employee records, and HR document automation.', 
    icon: Users,
    color: 'blue',
    stats: [
      { label: 'Pending', value: '12' },
      { label: 'Total Docs', value: '1.2k' }
    ]
  },
  { 
    to: '/app/finance', 
    title: 'Financial Management', 
    description: 'Generate reports, audit trails, and manage fiscal documentation with AI.', 
    icon: BarChart3,
    color: 'green',
    stats: [
      { label: 'Reports', value: '84' },
      { label: 'Audits', value: '08' }
    ]
  },
  { 
    to: '/app/legal', 
    title: 'Legal & Compliance', 
    description: 'Manage contracts, compliance checks, and regulatory filings securely.', 
    icon: Scale,
    color: 'purple',
    stats: [
      { label: 'Active', value: '45' },
      { label: 'Expires', value: '03' }
    ]
  },
  { 
    to: '/app/insurance', 
    title: 'Insurance', 
    description: 'Manage policies, claims, underwriting, and renewals with AI.', 
    icon: Shield,
    color: 'cyan',
    stats: [
      { label: 'Policies', value: '0' },
      { label: 'Claims', value: '0' }
    ]
  },
  { 
    to: '/app/medical', 
    title: 'Medical', 
    description: 'Patient records, appointments, prescriptions, and lab results.', 
    icon: HeartPulse,
    color: 'rose',
    stats: [
      { label: 'Patients', value: '0' },
      { label: 'Appts', value: '0' }
    ]
  },
  { 
    to: '/app/docs', 
    title: 'Knowledge Base', 
    description: 'General workspace for standard operating procedures and internal wikis.', 
    icon: FileText,
    color: 'orange',
    stats: [
      { label: 'Articles', value: '256' },
      { label: 'Recent', value: '14' }
    ]
  }
];

const recentActivity = [
  { id: 1, type: 'create', doc: 'Q4_Financial_Report.xlsx', user: 'Admin', time: '2 hours ago', status: 'completed' },
  { id: 2, type: 'edit', doc: 'Employee_Contract_JohnDoe.docx', user: 'Sarah HR', time: '5 hours ago', status: 'pending' },
  { id: 3, type: 'verify', doc: 'Privacy_Policy_Update_2025.pdf', user: 'Legal Bot', time: 'Yesterday', status: 'verified' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <DashboardHeader 
        title="Welcome back, Admin"
        description="Monitor your organization's document workflows and department activities from a central hub."
        actions={[
          { label: 'New Document', icon: FilePlus, variant: 'primary', onClick: () => {} },
          { label: 'Search All', icon: Search, variant: 'secondary', onClick: () => {} }
        ]}
      />

      {/* Global Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Documents" 
          value="2,842" 
          icon={FileText} 
          trend="up" 
          trendValue="12.5"
          color="brand"
        />
        <StatCard 
          title="Pending Reviews" 
          value="34" 
          icon={Clock} 
          trend="down" 
          trendValue="4.2"
          color="orange"
        />
        <StatCard 
          title="Processed this Month" 
          value="186" 
          icon={FileCheck} 
          trend="up" 
          trendValue="24.8"
          color="green"
        />
        <StatCard 
          title="System Efficiency" 
          value="98.2%" 
          icon={TrendingUp} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Workspaces Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-light-text tracking-tight">Department Workspaces</h2>
            <button className="text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
              <SectionCard key={section.to} {...section} />
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity & Notifications */}
        <div className="space-y-8">
          {/* Notifications/Alerts */}
          <div className="bg-brand-accent-600 rounded-3xl p-6 text-white shadow-lg shadow-brand-accent-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">System Alerts</h3>
            </div>
            <p className="text-brand-accent-50 text-sm leading-relaxed mb-4">
              3 legal contracts are expiring within the next 30 days. Please review compliance status.
            </p>
            <button className="w-full py-2 bg-white text-brand-accent-600 rounded-xl text-sm font-bold hover:bg-brand-accent-50 transition-colors">
              Review Now
            </button>
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="text-xl font-bold text-light-text tracking-tight mb-6">Recent Activity</h2>
            <div className="bg-white rounded-3xl border border-light-border p-6 shadow-sm divide-y divide-light-border/50">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' : 
                      activity.status === 'pending' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-light-text truncate">{activity.doc}</div>
                      <div className="text-xs text-light-text-secondary mt-1">
                        {activity.user} • {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full mt-6 pt-4 border-t border-light-border/50 text-sm font-semibold text-light-text-secondary hover:text-brand-accent-600 transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}