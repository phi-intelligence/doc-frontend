import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BarChart3, Scale, ChevronRight } from 'lucide-react';

import ChatWorkspaceHero from '../../components/landing/ChatWorkspaceHero';
import { toolCategories, CategorySection } from '../../components/landing/ToolsGrid';

import heroVideo from '../../assets/hero.mp4';

/**
 * ChatWorkspacePage - Document Chat hub for logged-in users.
 * Hero + DOCX/PPTX/XLSX (and related) tool cards + links to department editors.
 */
export default function ChatWorkspacePage() {
  const unifiedCategory = toolCategories.find((c) => c.id === 'unified');
  const documentsCategory = toolCategories.find((c) => c.id === 'documents');
  const digitalCategory = toolCategories.find((c) => c.id === 'digital-marketing');
  const connectCategory = toolCategories.find((c) => c.id === 'connect');

  const departmentLinks = [
    { to: '/app/hr/editor', label: 'HR Editor', icon: Users, description: 'HR documents and contracts' },
    { to: '/app/finance/editor', label: 'Finance Editor', icon: BarChart3, description: 'Reports and spreadsheets' },
    { to: '/app/legal/editor', label: 'Legal Editor', icon: Scale, description: 'Legal and compliance docs' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Hero */}
      <div className="mb-16">
        <ChatWorkspaceHero videoSrc={heroVideo} />
      </div>

      {/* Unified AI Assistant (featured) */}
      {unifiedCategory && (
        <div className="mb-16">
          <CategorySection category={unifiedCategory} />
        </div>
      )}

      {/* Documents: DOCX, XLSX, PPTX, PDF, etc. */}
      {documentsCategory && (
        <div className="mb-16">
          <CategorySection category={documentsCategory} />
        </div>
      )}

      {/* Department shortcuts */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-brand-accent-50 to-brand-accent-100/50">
            <Users className="w-8 h-8 text-brand-accent-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-light-text">Jump to workspace editors</h2>
            <p className="text-sm text-light-text-secondary">
              Open department-specific editors with AI assistant
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {departmentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group block h-full p-5 bg-white border border-light-border rounded-xl hover:shadow-lg hover:border-brand-accent-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-brand-accent-50 group-hover:bg-brand-accent-100 transition-colors">
                    <Icon className="w-6 h-6 text-brand-accent-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-light-text mb-1 group-hover:text-brand-accent-700 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-sm text-light-text-secondary mb-3">{item.description}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-accent-600 group-hover:gap-2 transition-all">
                      Open
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* Digital Marketing (Image gen, Frontend) */}
      {digitalCategory && (
        <div className="mb-16">
          <CategorySection category={digitalCategory} />
        </div>
      )}

      {/* Connect */}
      {connectCategory && (
        <div>
          <CategorySection category={connectCategory} />
        </div>
      )}
    </div>
  );
}
