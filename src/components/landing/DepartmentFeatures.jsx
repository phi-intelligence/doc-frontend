import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Scale, 
  BarChart3, 
  TrendingUp, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * DepartmentFeatures - Highlights specialized capabilities for each department
 */
export default function DepartmentFeatures() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const departments = [
    {
      title: 'Human Resources',
      icon: Users,
      color: 'blue',
      capabilities: ['Onboarding Packages', 'Employee Contracts', 'ID Card Generation', 'Performance Reviews'],
      description: 'Streamline the entire employee lifecycle from hire to retire with automated document workflows.',
      link: '/app/hr',
      stat: '90% Faster Onboarding'
    },
    {
      title: 'Legal & Compliance',
      icon: Scale,
      color: 'purple',
      capabilities: ['Contract Risk Analysis', 'NDAs & IP Agreements', 'Compliance Audits', 'Regulatory Filings'],
      description: 'Ensure every document meets enterprise legal standards with AI-powered risk assessment.',
      link: '/app/legal',
      stat: 'Zero Compliance Gaps'
    },
    {
      title: 'Financial Management',
      icon: BarChart3,
      color: 'green',
      capabilities: ['Q4 Fiscal Reports', 'Expense Auditing', 'Budget Analysis', 'Balance Sheet Templates'],
      description: 'Automate complex financial data extraction and generate high-fidelity XLSX reports instantly.',
      link: '/app/finance',
      stat: '99% Extraction Accuracy'
    },
    {
      title: 'Marketing & Sales',
      icon: TrendingUp,
      color: 'orange',
      capabilities: ['Sales Proposals', 'Client Pitch Decks', 'Standard Ops (SOP)', 'Vendor Agreements'],
      description: 'Equip your sales team with high-impact documents generated from raw data or verbal prompts.',
      link: '/app/marketing',
      stat: '3x Proposal Output'
    }
  ];

  const colorConfig = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      border: 'border-blue-100', 
      accent: 'bg-blue-600',
      gradient: 'from-blue-500/10 to-transparent'
    },
    purple: { 
      bg: 'bg-purple-50', 
      text: 'text-purple-600', 
      border: 'border-purple-100', 
      accent: 'bg-purple-600',
      gradient: 'from-purple-500/10 to-transparent'
    },
    green: { 
      bg: 'bg-green-50', 
      text: 'text-green-600', 
      border: 'border-green-100', 
      accent: 'bg-green-600',
      gradient: 'from-green-500/10 to-transparent'
    },
    orange: { 
      bg: 'bg-orange-50', 
      text: 'text-orange-600', 
      border: 'border-orange-100', 
      accent: 'bg-orange-600',
      gradient: 'from-orange-500/10 to-transparent'
    },
  };

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-light-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-light-border to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-50 border border-brand-accent-100 text-brand-accent-700 text-[10px] font-black tracking-[0.2em] uppercase mb-6"
            >
              <Layers className="w-3 h-3" />
              Specialized Modules
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black text-light-text tracking-tighter leading-none mb-8"
            >
              Enterprise-Grade <br />
              <span className="text-brand-accent-600">Domain Intelligence.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-light-text-secondary font-medium leading-relaxed"
            >
              GendocX isn't a general chatbot. It's a suite of domain-aware agents engineered to handle the specific complexities of corporate documentation.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hidden md:flex flex-col items-end gap-2"
          >
            <div className="text-sm font-black text-light-text uppercase tracking-widest">Active Engines</div>
            <div className="flex gap-1">
              {departments.map((_, i) => (
                <div key={i} className="w-8 h-1.5 rounded-full bg-brand-accent-200" />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {departments.map((dept, idx) => {
            const colors = colorConfig[dept.color];
            const isHovered = hoveredIndex === idx;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative bg-white border border-light-border group-hover:border-brand-accent-200 rounded-[48px] p-10 h-full flex flex-col transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-brand-accent-100/50 overflow-hidden">
                  {/* Hover Effect Light */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${colors.accent} opacity-0 group-hover:opacity-5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity duration-500`} />
                  
                  <div className="flex items-start justify-between mb-10">
                    <div className={`w-20 h-20 rounded-3xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-black/5`}>
                      <dept.icon className={`w-10 h-10 ${colors.text}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-light-text-secondary/40 tracking-[0.2em] uppercase mb-1">Module ID: 0{idx + 1}</div>
                      <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-[10px] font-black tracking-wider uppercase inline-block`}>
                        {dept.stat}
                      </div>
                    </div>
                  </div>

                  <h4 className="text-3xl font-black text-light-text mb-6 tracking-tight group-hover:text-brand-accent-700 transition-colors">{dept.title}</h4>
                  <p className="text-light-text-secondary font-medium leading-relaxed mb-10">
                    {dept.description}
                  </p>

                  <div className="space-y-4 mb-12">
                    {dept.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-light-text translate-x-0 group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                        <div className={`w-2 h-2 rounded-full ${colors.accent} shadow-lg shadow-${dept.color}-500/50`} />
                        {cap}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 border-t border-light-border flex items-center justify-between">
                    <Link 
                      to={dept.link}
                      className={`inline-flex items-center gap-3 font-black text-sm uppercase tracking-widest ${colors.text} group/link`}
                    >
                      Initialize Workflow
                      <ArrowRight className="w-5 h-5 group-hover/link:translate-x-2 transition-transform" />
                    </Link>
                    <div className="flex gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Sparkles className={`w-4 h-4 ${colors.text}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
