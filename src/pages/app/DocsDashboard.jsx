import React from 'react';
import { 
  FileText, 
  Search, 
  BookOpen, 
  Shield, 
  Globe, 
  Plus, 
  ChevronRight,
  MoreVertical,
  Clock,
  Layout
} from 'lucide-react';
import StatCard from '../../components/shared/dashboard/StatCard';
import DashboardHeader from '../../components/shared/dashboard/DashboardHeader';

const categories = [
  { title: 'Standard Operating Procedures', count: '42 docs', icon: Shield, color: 'blue' },
  { title: 'Employee Handbook', count: '12 docs', icon: BookOpen, color: 'green' },
  { title: 'Technical Documentation', count: '156 docs', icon: Layout, color: 'purple' },
  { title: 'External Guidelines', count: '08 docs', icon: Globe, color: 'orange' },
];

const recentArticles = [
  { title: 'Remote Work Policy 2025', category: 'SOP', author: 'Admin', time: '2 hours ago' },
  { title: 'System Architecture v4', category: 'Technical', author: 'Eng Lead', time: '5 hours ago' },
  { title: 'Brand Identity Guidelines', category: 'Marketing', author: 'Design Team', time: 'Yesterday' },
];

export default function DocsDashboard() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <DashboardHeader 
        title="Knowledge Base"
        description="The central hub for all company documentation, policies, and standard operating procedures."
        breadcrumbs={[{ label: 'Docs', to: '/app/docs' }]}
        actions={[
          { label: 'New Article', icon: Plus, variant: 'primary', onClick: () => {} }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Articles" 
          value="218" 
          icon={FileText} 
          trend="up" 
          trendValue="4.2"
          color="brand"
        />
        <StatCard 
          title="Recent Updates" 
          value="14" 
          icon={Clock} 
          color="blue"
        />
        <StatCard 
          title="Active Policies" 
          value="36" 
          icon={Shield} 
          color="green"
        />
        <StatCard 
          title="Shared Externally" 
          value="05" 
          icon={Globe} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-light-text mb-6 tracking-tight">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {categories.map((cat, i) => (
              <button 
                key={i}
                className="group p-6 bg-white border border-gray-200 rounded-[32px] text-left hover:border-brand-accent-300 transition-all hover:shadow-xl hover:shadow-brand-accent-500/5"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6 text-gray-400 group-hover:text-brand-accent-600" />
                </div>
                <h4 className="text-lg font-bold text-light-text mb-1">{cat.title}</h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-light-text-secondary uppercase tracking-widest">{cat.count}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-accent-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <div className="bg-brand-accent-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-brand-accent-100">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
             <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Need assistance <br /> writing documentation?</h3>
                <p className="text-brand-accent-50 text-sm max-w-md leading-relaxed mb-8">
                  Use our Unified Assistant to draft new articles, summarize existing ones, or convert raw notes into structured documents.
                </p>
                <button className="px-8 py-3 bg-white text-brand-accent-600 rounded-2xl font-bold text-sm hover:bg-brand-accent-50 transition-colors">
                  Open Unified Assistant
                </button>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-light-text mb-6 tracking-tight">Recently Updated</h2>
            <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden">
              <div className="divide-y divide-gray-100">
                {recentArticles.map((article, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-sm font-bold text-light-text group-hover:text-brand-accent-600 truncate mr-4">{article.title}</h5>
                      <span className="shrink-0 text-[10px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">{article.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <span>By {article.author}</span>
                      <span>{article.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-4 text-xs font-bold text-gray-400 hover:text-brand-accent-600 bg-gray-50/50 transition-colors">
                View All Archives
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[32px] p-8 text-white">
            <h4 className="font-bold mb-4">Doc Approvals</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">You have 3 pending articles awaiting your final approval for publication.</p>
            <div className="space-y-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs font-medium flex-1 px-3 truncate">Approval_Req_{i}.pdf</span>
                    <button className="text-[10px] font-bold text-brand-accent-400">Review</button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}