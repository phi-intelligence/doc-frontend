import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Upload, Cpu, Edit3, CheckCircle, ArrowRight, MousePointer2, FileSearch, Send } from 'lucide-react';

/**
 * WorkflowSection - Step-by-step "How it works" section
 */
export default function WorkflowSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scaleX = useSpring(scrollYProgress, {
    stagger: 100,
    damping: 30,
    restDelta: 0.001
  });

  const steps = [
    {
      title: 'Data Ingestion',
      description: 'Upload raw files, spreadsheets, or simply prompt the AI with your requirements.',
      icon: Upload,
      color: 'bg-blue-500',
      accent: 'text-blue-500',
      subIcon: FileSearch
    },
    {
      title: 'AI Processing',
      description: 'Our domain-specific engines analyze data and draft documents with 99% accuracy.',
      icon: Cpu,
      color: 'bg-brand-accent-600',
      accent: 'text-brand-accent-600',
      subIcon: MousePointer2
    },
    {
      title: 'Review & Edit',
      description: 'Use the integrated 3-pane editor to refine details and maintain brand voice.',
      icon: Edit3,
      color: 'bg-purple-600',
      accent: 'text-purple-600',
      subIcon: Edit3
    },
    {
      title: 'Final Delivery',
      description: 'Export pixel-perfect DOCX, PDF, or XLSX files ready for immediate corporate use.',
      icon: CheckCircle,
      color: 'bg-green-600',
      accent: 'text-green-600',
      subIcon: Send
    }
  ];

  return (
    <section ref={containerRef} className="py-20 bg-light-sidebar relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#427CCB 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-100 border border-brand-accent-200 text-brand-accent-700 text-[10px] font-black tracking-[0.2em] uppercase mb-6"
          >
            Workflow Architecture
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black text-light-text tracking-tighter"
          >
            Precision at Every <br />
            <span className="text-brand-accent-600">Lifecycle Stage.</span>
          </motion.h3>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-light-border/30 rounded-full overflow-hidden">
            <motion.div 
              style={{ scaleX }}
              className="absolute inset-0 bg-brand-accent-600 origin-left"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Step Circle */}
                <div className="relative mb-10">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-24 h-24 rounded-[32px] ${step.color} text-white flex items-center justify-center shadow-2xl relative z-10 group-hover:shadow-${step.accent.split('-')[1]}-500/20 transition-all duration-500`}
                  >
                    <step.icon className="w-10 h-10" />
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-2xl border-4 border-light-sidebar flex items-center justify-center text-sm font-black text-light-text shadow-lg">
                      {idx + 1}
                    </div>
                  </motion.div>
                  
                  {/* Pulse Effect */}
                  <div className={`absolute inset-0 rounded-[32px] ${step.color} opacity-20 blur-xl animate-pulse -z-10`} />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 + 0.4 }}
                >
                  <h4 className="text-2xl font-black text-light-text mb-4 tracking-tight group-hover:text-brand-accent-700 transition-colors">{step.title}</h4>
                  <p className="text-light-text-secondary font-medium leading-relaxed max-w-[280px] mx-auto mb-6">
                    {step.description}
                  </p>
                  
                  {/* Decorative Sub-icon */}
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-light-border shadow-sm ${step.accent} opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-500`}>
                    <step.subIcon className="w-5 h-5" />
                  </div>
                </motion.div>

                {/* Mobile Connector */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden w-px h-16 bg-gradient-to-b from-light-border to-transparent my-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <button className="inline-flex items-center gap-4 px-10 py-5 bg-white border-2 border-brand-accent-600 text-brand-accent-700 rounded-2xl font-black text-lg hover:bg-brand-accent-600 hover:text-white transition-all duration-500 group shadow-xl shadow-brand-accent-100">
            View Technical Documentation
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
