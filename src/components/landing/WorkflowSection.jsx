import React from 'react';
import { Upload, Cpu, Edit3, CheckCircle } from 'lucide-react';

/**
 * WorkflowSection - Step-by-step "How it works" section
 */
export default function WorkflowSection() {
  const steps = [
    {
      title: 'Data Ingestion',
      description: 'Upload raw files, spreadsheets, or simply prompt the AI with your requirements.',
      icon: Upload,
      color: 'bg-blue-500'
    },
    {
      title: 'AI Processing',
      description: 'Our domain-specific engines analyze data and draft documents with 99% accuracy.',
      icon: Cpu,
      color: 'bg-brand-accent-600'
    },
    {
      title: 'Review & Edit',
      description: 'Use the integrated 3-pane editor to refine details and maintain brand voice.',
      icon: Edit3,
      color: 'bg-purple-600'
    },
    {
      title: 'Final Delivery',
      description: 'Export pixel-perfect DOCX, PDF, or XLSX files ready for immediate corporate use.',
      icon: CheckCircle,
      color: 'bg-green-600'
    }
  ];

  return (
    <section className="py-24 bg-light-sidebar relative overflow-hidden">
      {/* Connector Line */}
      <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-light-border to-transparent -translate-y-1/2 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold text-brand-accent-600 tracking-[0.2em] uppercase mb-4">The Process</h2>
          <h3 className="text-4xl font-bold text-light-text tracking-tight">How Phi Docs Delivers.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-[24px] ${step.color} text-white flex items-center justify-center mb-6 shadow-xl relative z-10`}>
                <step.icon className="w-8 h-8" />
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border-4 border-light-sidebar flex items-center justify-center text-xs font-black text-light-text">
                  {idx + 1}
                </div>
              </div>
              <h4 className="text-xl font-bold text-light-text mb-3">{step.title}</h4>
              <p className="text-sm text-light-text-secondary leading-relaxed max-w-[240px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
