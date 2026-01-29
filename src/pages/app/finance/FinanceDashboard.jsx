import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../../components/shared/dashboard/StatCard';
import DashboardHeader from '../../../components/shared/dashboard/DashboardHeader';

const reportQueue = [
  { id: 1, name: 'Q4_Earnings_Draft.xlsx', type: 'Financial', status: 'In Review', value: '$4.2M', date: '2025-01-28' },
  { id: 2, name: 'Expense_Reimbursement_Jan.pdf', type: 'Operational', status: 'Pending', value: '$12k', date: '2025-01-27' },
  { id: 3, name: 'Annual_Audit_2024.xlsx', type: 'Audit', status: 'Completed', value: '--', date: '2025-01-25' },
];

export default function FinanceDashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <DashboardHeader 
        title="Financial Management"
        description="Monitor financial performance, generate fiscal reports, and automate auditing processes."
        breadcrumbs={[{ label: 'Finance', to: '/app/finance' }]}
        actions={[
          { label: 'Generate Report', icon: TrendingUp, variant: 'primary', onClick: () => {} },
          { label: 'New Audit', icon: Search, variant: 'secondary', onClick: () => {} }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Assets" 
          value="$12.4M" 
          icon={DollarSign} 
          trend="up" 
          trendValue="4.2"
          color="green"
        />
        <StatCard 
          title="Monthly Spend" 
          value="$842k" 
          icon={BarChart3} 
          trend="down" 
          trendValue="1.5"
          color="blue"
        />
        <StatCard 
          title="Reports Generated" 
          value="84" 
          icon={FileText} 
          color="purple"
        />
        <StatCard 
          title="Audit Readiness" 
          value="94%" 
          icon={PieChart} 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Financial Reports Queue</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-light-border rounded-xl hover:bg-light-sidebar">
                  <Download className="w-4 h-4 text-light-text-secondary" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-light-sidebar border-b border-light-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Report Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {reportQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-light-sidebar/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-light-text">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary">{item.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to="#" className="p-2 inline-flex text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-3">Fiscal AI Editor</h3>
            <p className="text-emerald-100 text-sm leading-relaxed mb-6">
              Automate complex spreadsheet calculations, generate executive summaries, and analyze fiscal data with high accuracy.
            </p>
            <Link 
              to="/app/finance/editor" 
              className="w-full py-3 bg-white text-emerald-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
            >
              Open Finance Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}