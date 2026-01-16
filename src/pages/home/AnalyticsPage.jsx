import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Image,
  Video,
  FileText,
  DollarSign,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';

const AnalyticsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Chart data (simplified representation)
  const weeklyData = [
    { day: 'Mon', value: 120 },
    { day: 'Tue', value: 145 },
    { day: 'Wed', value: 132 },
    { day: 'Thu', value: 168 },
    { day: 'Fri', value: 189 },
    { day: 'Sat', value: 156 },
    { day: 'Sun', value: 142 }
  ];

  const monthlyData = [
    { month: 'Jan', value: 3200 },
    { month: 'Feb', value: 3800 },
    { month: 'Mar', value: 4200 },
    { month: 'Apr', value: 4500 },
    { month: 'May', value: 5100 },
    { month: 'Jun', value: 5800 }
  ];

  const topServices = [
    { name: 'Image Generation', count: 3420, percentage: 35, trend: 'up', color: 'from-purple-500 to-pink-500' },
    { name: 'Product Photography', count: 2890, percentage: 29, trend: 'up', color: 'from-blue-500 to-cyan-500' },
    { name: 'Content Generation', count: 2150, percentage: 22, trend: 'up', color: 'from-emerald-500 to-teal-500' },
    { name: 'Video Generation', count: 1340, percentage: 14, trend: 'down', color: 'from-amber-500 to-orange-500' }
  ];

  const metrics = [
    {
      label: 'Total Revenue',
      value: '$124,580',
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      label: 'Total Users',
      value: '8,432',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Avg. Session Time',
      value: '24.5 min',
      change: '+5.2%',
      trend: 'up',
      icon: Clock,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Active Projects',
      value: '1,247',
      change: '+8.7%',
      trend: 'up',
      icon: Activity,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const getMaxValue = (data) => Math.max(...data.map(d => d.value));

  const renderBarChart = (data, maxValue, height = 200) => {
    return (
      <div className="flex items-end justify-between gap-2 h-[200px]">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex items-end justify-center" style={{ height: `${height}px` }}>
                <div
                  className={`w-full rounded-t transition-all hover:opacity-80 ${
                    isDark
                      ? 'bg-gradient-to-t from-brand-accent-600 to-brand-accent-500'
                      : 'bg-gradient-to-t from-brand-accent-500 to-brand-accent-400'
                  }`}
                  style={{ height: `${barHeight}px` }}
                  title={`${item.day || item.month}: ${item.value}`}
                />
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                {item.day || item.month}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-full p-6 sm:p-8 ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className={`w-8 h-8 ${isDark ? 'text-brand-accent-400' : 'text-brand-accent-500'}`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Analytics
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              className={`px-4 py-2 rounded-lg border text-sm ${
                isDark
                  ? 'bg-dark-surface border-dark-border text-dark-text'
                  : 'bg-white border-light-border text-light-text'
              } focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20`}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
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
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                    {metric.value}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                    {metric.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Weekly Activity
              </h2>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-emerald-500' : 'text-emerald-600'
                }`}>
                  +12.5%
                </span>
              </div>
            </div>
            {renderBarChart(weeklyData, getMaxValue(weeklyData))}
          </div>

          {/* Monthly Revenue */}
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                Monthly Revenue
              </h2>
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-emerald-500' : 'text-emerald-600'
                }`}>
                  +18.3%
                </span>
              </div>
            </div>
            {renderBarChart(monthlyData, getMaxValue(monthlyData))}
          </div>
        </div>

        {/* Top Services */}
        <div className={`rounded-xl border p-6 ${
          isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
              Top Services
            </h2>
            <button className={`text-sm font-medium transition-colors ${
              isDark
                ? 'text-brand-accent-400 hover:text-brand-accent-300'
                : 'text-brand-accent-600 hover:text-brand-accent-700'
            }`}>
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {topServices.map((service, index) => {
              const TrendIcon = service.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                        {service.name.includes('Image') && <Image className="w-5 h-5 text-white" />}
                        {service.name.includes('Product') && <Image className="w-5 h-5 text-white" />}
                        {service.name.includes('Content') && <FileText className="w-5 h-5 text-white" />}
                        {service.name.includes('Video') && <Video className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                          {service.name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                          {service.count.toLocaleString()} jobs
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                          {service.percentage}%
                        </p>
                        <div className={`flex items-center gap-1 text-xs ${
                          service.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          <TrendIcon className="w-3 h-3" />
                          {service.trend === 'up' ? '+5.2%' : '-2.1%'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-dark-sidebar' : 'bg-light-bg'
                  }`}>
                    <div
                      className={`h-full bg-gradient-to-r ${service.color} transition-all`}
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  Success Rate
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  98.7%
                </p>
              </div>
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              +0.5% from last month
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center`}>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  Avg. Processing Time
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  2.4 min
                </p>
              </div>
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              -12% faster than last month
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-dark-surface border-dark-border' : 'bg-white border-light-border'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center`}>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-dark-text-secondary' : 'text-light-text-secondary'}`}>
                  Active Users
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                  1,234
                </p>
              </div>
            </div>
            <div className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              +8.3% growth this month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
