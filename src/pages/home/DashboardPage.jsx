import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Image,
  Video,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

/**
 * Dashboard Page - Main overview page with key metrics and recent activity
 */
const DashboardPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Static data
  const stats = [
    {
      label: 'Total Projects',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Active Jobs',
      value: '43',
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Revenue (This Month)',
      value: '$24,580',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Completed Today',
      value: '127',
      change: '+5.1%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'image',
      title: 'Product Photography - Fashion Collection',
      status: 'completed',
      time: '2 minutes ago',
      icon: Image
    },
    {
      id: 2,
      type: 'video',
      title: 'Video Generation - Marketing Campaign',
      status: 'processing',
      time: '15 minutes ago',
      icon: Video
    },
    {
      id: 3,
      type: 'content',
      title: 'Content Generation - Blog Post',
      status: 'completed',
      time: '1 hour ago',
      icon: FileText
    },
    {
      id: 4,
      type: 'ai',
      title: 'AI Image Generation - Product Mockup',
      status: 'completed',
      time: '2 hours ago',
      icon: Sparkles
    },
    {
      id: 5,
      type: 'design',
      title: 'Virtual Model - Apparel Showcase',
      status: 'completed',
      time: '3 hours ago',
      icon: Users
    }
  ];

  const quickStats = [
    { label: 'Images Generated', value: '8,432', icon: Image },
    { label: 'Videos Created', value: '1,234', icon: Video },
    { label: 'Content Pieces', value: '3,567', icon: FileText },
    { label: 'AI Generations', value: '12,890', icon: Sparkles }
  ];

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Dashboard
            </h1>
          </div>
          <div className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`rounded-xl border p-6 transition-all hover:shadow-lg ${
                  isDark
                    ? 'bg-dark-surface border-dark-border hover:border-brand-accent-500/50'
                    : 'bg-white border-light-border hover:border-brand-accent-500'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className={`lg:col-span-2 rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Recent Activity
              </h2>
              <button className={`text-sm font-medium transition-colors ${
                isDark
                  ? 'text-brand-accent-400 hover:text-brand-accent-300'
                  : 'text-brand-accent-600 hover:text-brand-accent-700'
              }`}>
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      isDark
                        ? 'bg-dark-sidebar hover:bg-dark-sidebar/80'
                        : 'bg-light-bg hover:bg-light-surface'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          activity.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}>
                          {activity.status === 'completed' ? 'Completed' : 'Processing'}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Quick Stats
            </h2>
            <div className="space-y-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-dark-sidebar' : 'bg-light-bg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'
                      }`}>
                        {stat.label}
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${
                      isDark ? 'text-dark-text' : 'text-light-text'
                    }`}>
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className={`rounded-xl border p-6 ${
          isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Performance Overview
            </h2>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-emerald-500' : 'text-emerald-600'
              }`}>
                +15.2% from last month
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-dark-sidebar' : 'bg-light-bg'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  Avg. Processing Time
                </span>
                <Clock className={`w-4 h-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                2.4 min
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                -12% faster
              </p>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-dark-sidebar' : 'bg-light-bg'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  Success Rate
                </span>
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                98.7%
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                +0.5% improvement
              </p>
            </div>
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-dark-sidebar' : 'bg-light-bg'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  Active Users
                </span>
                <Users className={`w-4 h-4 ${isDark ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                1,234
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                +8.3% growth
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
