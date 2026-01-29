import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Scale, 
  BarChart3, 
  TrendingUp, 
  FileCheck, 
  Zap, 
  ShieldCheck, 
  Search,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * DepartmentFeatures - Highlights specialized capabilities for each department
 */
export default function DepartmentFeatures() {
  const departments = [
    {
      title: 'Human Resources',
      icon: Users,
      color: 'blue',
      capabilities: ['Onboarding Packages', 'Employee Contracts', 'ID Card Generation', 'Performance Reviews'],
      description: 'Streamline the entire employee lifecycle from hire to retire with automated document workflows.',
      link: '/demo/hr'
    },
    {
      title: 'Legal & Compliance',
      icon: Scale,
      color: 'purple',
      capabilities: ['Contract Risk Analysis', 'NDAs & IP Agreements', 'Compliance Audits', 'Regulatory Filings'],
      description: 'Ensure every document meets enterprise legal standards with AI-powered risk assessment.',
      link: '/app/dashboard'
    },
    {
      title: 'Financial Management',
      icon: BarChart3,
      color: 'green',
      capabilities: ['Q4 Fiscal Reports', 'Expense Auditing', 'Budget Analysis', 'Balance Sheet Templates'],
      description: 'Automate complex financial data extraction and generate high-fidelity XLSX reports instantly.',
      link: '/demo/finance'
    },
    {
      title: 'Sales & Operations',
      icon: TrendingUp,
      color: 'orange',
      capabilities: ['Sales Proposals', 'Client Pitch Decks', 'Standard Ops (SOP)', 'Vendor Agreements'],
      description: 'Equip your sales team with high-impact documents generated from raw data or verbal prompts.',
      link: '/app/dashboard'
    }
  ];

  const colorConfig = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', accent: 'bg-blue-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', accent: 'bg-purple-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', accent: 'bg-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', accent: 'bg-orange-600' },
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-brand-accent-600 tracking-[0.2em] uppercase mb-4">Enterprise Modules</h2>
          <h3 className="text-4xl lg:text-5xl font-bold text-light-text tracking-tight mb-6">
            A Specialized AI Engine <br /> for Every Department.
          </h3>
          <p className="text-lg text-light-text-secondary leading-relaxed">
            Phi Docs isn't just a chatbot. It's a suite of domain-aware agents designed to handle the specific complexities of your department's documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departments.map((dept, idx) => {
            const colors = colorConfig[dept.color];
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -8 }}
                className="group p-1 bg-gradient-to-br from-light-border to-white rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <div className="bg-white rounded-[38px] p-8 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.border} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <dept.icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-light-text-secondary/30 tracking-widest uppercase">Module {idx + 1}</span>
                      <div className={`mt-2 h-1.5 w-12 rounded-full ${colors.accent}`} />
                    </div>
                  </div>

                  <h4 className="text-2xl font-bold text-light-text mb-4 tracking-tight">{dept.title}</h4>
                  <p className="text-light-text-secondary text-sm leading-relaxed mb-8">
                    {dept.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    {dept.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-light-text group-hover:translate-x-1 transition-transform">
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.accent}`} />
                        {cap}
                      </div>
                    ))}
                  </div>

                  <Link 
                    to={dept.link}
                    className={`mt-auto inline-flex items-center gap-2 font-bold text-sm ${colors.text} group-hover:gap-3 transition-all`}
                  >
                    Explore {dept.title}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
