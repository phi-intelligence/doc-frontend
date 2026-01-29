import React from 'react';
import { 
  Scale, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Gavel
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../../components/shared/dashboard/StatCard';
import DashboardHeader from '../../../components/shared/dashboard/DashboardHeader';

const contractQueue = [
  { id: 1, name: 'Vendor_Agreement_V2.pdf', type: 'Contract', status: 'In Review', urgency: 'High', date: '2025-01-28' },
  { id: 2, name: 'Compliance_Update_Jan.docx', type: 'Regulatory', status: 'Pending Approval', urgency: 'Medium', date: '2025-01-27' },
  { id: 3, name: 'NDA_Standard_Template.pdf', type: 'Legal', status: 'Completed', urgency: 'Low', progress: 100, date: '2025-01-25' },
];

export default function LegalDashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <DashboardHeader 
        title="Legal & Compliance"
        description="Monitor contract lifecycles, regulatory compliance, and automate legal document reviews."
        breadcrumbs={[{ label: 'Legal', to: '/app/legal' }]}
        actions={[
          { label: 'New Contract', icon: Gavel, variant: 'primary', onClick: () => {} },
          { label: 'Compliance Check', icon: ShieldCheck, variant: 'secondary', onClick: () => {} }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Active Contracts" 
          value="45" 
          icon={Scale} 
          trend="up" 
          trendValue="8.4"
          color="purple"
        />
        <StatCard 
          title="Risk Alerts" 
          value="03" 
          icon={AlertTriangle} 
          color="orange"
        />
        <StatCard 
          title="Reviews Completed" 
          value="112" 
          icon={FileCheck} 
          trend="up" 
          trendValue="12.1"
          color="green"
        />
        <StatCard 
          title="Pending Expiry" 
          value="07" 
          icon={Clock} 
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Review Queue</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search documents..." 
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
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {contractQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-light-sidebar/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Scale className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-bold text-light-text">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-light-text-secondary">{item.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
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
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-3">Legal AI Assistant</h3>
            <p className="text-purple-100 text-sm leading-relaxed mb-6">
              Automate contract analysis, extract risk factors, and generate compliance documents with legal-grade precision.
            </p>
            <Link 
              to="/app/legal/editor" 
              className="w-full py-3 bg-white text-purple-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
            >
              Open Legal Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
