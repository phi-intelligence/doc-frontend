import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Code, CheckCircle2, Sparkles, Wand2, ArrowRight } from 'lucide-react';

export default function EditorShowcase() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-50 border border-brand-accent-100 text-brand-accent-700 text-[10px] font-black tracking-[0.2em] uppercase mb-6"
          >
            <Code className="w-3 h-3" />
            The Universal Editor
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-black text-light-text tracking-tighter"
          >
            One Interface. <br />
            <span className="text-brand-accent-600">Infinite Control.</span>
          </motion.h3>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Editor Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative bg-[#1A1A1B] rounded-[48px] p-2 md:p-4 shadow-[0_60px_100px_-20px_rgba(26,26,27,0.3)] border border-[#2A2A2B] overflow-hidden"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2B]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-status-error" />
                <div className="w-3 h-3 rounded-full bg-status-warning" />
                <div className="w-3 h-3 rounded-full bg-status-success" />
              </div>
              <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 tracking-widest uppercase">
                <FileText className="w-3 h-3" />
                Employment_Agreement_v2.docx
              </div>
              <div className="w-12" />
            </div>

            {/* 3-Pane Layout */}
            <div className="grid grid-cols-12 gap-2 h-[400px] md:h-[600px]">
              {/* Chat Pane */}
              <div className="col-span-3 bg-white/5 border-r border-white/5 p-4 flex flex-col">
                <div className="flex items-center gap-2 text-white/60 mb-6 font-black text-[10px] uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4 text-brand-accent-400" />
                  AI Architect
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white/10 rounded-2xl text-[10px] text-white/80 font-medium">
                    Analyze the IP clause for compliance with local regulations.
                  </div>
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 bg-brand-accent-600/20 border border-brand-accent-500/30 rounded-2xl text-[10px] text-brand-accent-200 font-medium"
                  >
                    Processing IP clause... Found 2 potential risk factors in Section 4.2.
                  </motion.div>
                </div>
                <div className="mt-auto p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 font-bold">Type command...</span>
                  <Wand2 className="w-3 h-3 text-brand-accent-400" />
                </div>
              </div>

              {/* Editor Pane */}
              <div className="col-span-6 bg-white/5 p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                   <Sparkles className="w-5 h-5 text-brand-accent-400 opacity-40 animate-pulse" />
                </div>
                <div className="max-w-md mx-auto space-y-4">
                  <div className="h-6 w-3/4 bg-white/20 rounded-lg" />
                  <div className="h-4 w-full bg-white/10 rounded-lg" />
                  <div className="h-4 w-full bg-white/10 rounded-lg" />
                  <div className="h-4 w-5/6 bg-white/10 rounded-lg" />
                  <div className="h-40 w-full bg-brand-accent-600/10 border border-brand-accent-600/30 rounded-2xl flex items-center justify-center p-6 text-center">
                    <p className="text-[10px] font-black text-brand-accent-200 uppercase tracking-[0.2em] leading-relaxed">
                      AI is drafting Section 4: <br /> Intellectual Property Rights
                    </p>
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded-lg" />
                  <div className="h-4 w-2/3 bg-white/10 rounded-lg" />
                </div>
              </div>

              {/* Artifacts/Tools Pane */}
              <div className="col-span-3 bg-white/5 border-l border-white/5 p-4">
                <div className="flex items-center gap-2 text-white/60 mb-6 font-black text-[10px] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  Validation
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Formatting', status: 'Passed', color: 'text-status-success' },
                    { label: 'Legal Review', status: 'Required', color: 'text-status-warning' },
                    { label: 'Metadata', status: 'Ready', color: 'text-brand-accent-400' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{item.label}</span>
                      <span className={`text-[9px] font-black uppercase ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 p-4 bg-gradient-to-br from-brand-accent-600 to-brand-accent-800 rounded-3xl shadow-xl">
                   <div className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Export Quality</div>
                   <div className="text-2xl font-black text-white mb-2">A+</div>
                   <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "95%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-white" 
                      />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating labels */}
          <div className="absolute -top-12 -right-12 hidden lg:block">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="bg-white p-4 rounded-3xl shadow-2xl border border-light-border flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-accent-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-accent-600" />
              </div>
              <div>
                <div className="text-xs font-black text-light-text uppercase">Auto-Drafting</div>
                <div className="text-[10px] text-light-text-secondary font-bold">Active in HR Module</div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-24 text-center max-w-2xl mx-auto">
          <p className="text-xl text-light-text-secondary font-medium leading-relaxed mb-12">
            The power of advanced LLMs, combined with domain-specific rule sets, all managed through a familiar, distraction-free environment.
          </p>
          <button className="inline-flex items-center gap-4 text-brand-accent-600 font-black uppercase tracking-[0.2em] text-sm group">
            Experience the Workspace
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
