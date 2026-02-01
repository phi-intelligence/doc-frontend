import React, { useEffect, useState, useCallback } from 'react';
import {
  Megaphone,
  FileText,
  TrendingUp,
  ExternalLink,
  Calendar,
  Clock,
  ChevronRight,
  Zap,
  RefreshCw,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Mail,
  BookOpen,
  Image,
  PenTool,
  BarChart3,
  Palette,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard, DashboardHeader, DataTable, ApprovalQueue, QuickActions } from '../../../components/shared/dashboard';
import TemplateSamplesBlock from '../../../components/dashboard/TemplateSamplesBlock';
import TemplateGalleryHero from '../../../components/dashboard/TemplateGalleryHero';
import TrendingPostsSection from '../../../components/marketing/TrendingPostsSection';
import GeneratedFromTrendingSection from '../../../components/marketing/GeneratedFromTrendingSection';
import '../../../components/dashboard/TemplateSamplesBlock.css';
import { getMarketingDashboard, listContent, listCampaigns } from '../../../api/marketing';
import { listApprovals } from '../../../api/hr';

// Channel configuration with icons and colors
const CHANNEL_CONFIG = {
  instagram: { label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500', textColor: 'text-white' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', textColor: 'text-white' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'bg-blue-500', textColor: 'text-white' },
  twitter: { label: 'Twitter', icon: Twitter, color: 'bg-sky-400', textColor: 'text-white' },
  email: { label: 'Email', icon: Mail, color: 'bg-gray-600', textColor: 'text-white' },
  blog: { label: 'Blog', icon: BookOpen, color: 'bg-green-600', textColor: 'text-white' }
};

export default function MarketingDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [scheduledContent, setScheduledContent] = useState([]);
  const [draftContent, setDraftContent] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const [dashboardData, scheduledData, draftData, campaignsData, approvalsData] = await Promise.all([
        getMarketingDashboard().catch(() => null),
        listContent({ start_date: today, end_date: nextWeek, limit: 50 }).catch(() => ({ items: [] })),
        listContent({ status: 'draft', limit: 20 }).catch(() => ({ items: [] })),
        listCampaigns({ limit: 50 }).catch(() => ({ items: [] })),
        listApprovals({ status: 'pending' }).catch(() => ({ items: [] }))
      ]);

      setDashboard(dashboardData);
      setScheduledContent(scheduledData.items || []);
      setDraftContent(draftData.items || []);
      setCampaigns(campaignsData.items || []);
      const marketingApprovals = (approvalsData.items || []).filter((a) =>
        ['campaign', 'brand_template', 'asset_pack', 'content'].includes(a.resource_type)
      );
      setApprovals(marketingApprovals);
    } catch (err) {
      console.error('Failed to fetch marketing data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick actions for marketing
  const quickActions = [
    {
      label: 'Campaign Brief',
      description: 'Create new campaign',
      icon: Megaphone,
      color: 'red',
      onClick: () => navigate('/marketing/editor?skill=docx&template=campaign-brief')
    },
    {
      label: 'Social Posts',
      description: 'Generate content',
      icon: PenTool,
      color: 'purple',
      onClick: () => navigate('/marketing/editor?skill=docx&template=social-posts')
    },
    {
      label: 'Pitch Deck',
      description: 'Create presentation',
      icon: Image,
      color: 'blue',
      onClick: () => navigate('/marketing/editor?skill=pptx&template=pitch-deck')
    },
    {
      label: 'Analytics Report',
      description: 'Performance data',
      icon: BarChart3,
      color: 'green',
      onClick: () => navigate('/marketing/editor?skill=xlsx&template=marketing-analytics')
    }
  ];

  // Calendar items combining campaigns and scheduled content
  const campaignsWithDates = dashboard?.campaigns_with_dates || campaigns;
  const calendarItems = [
    ...campaignsWithDates.map((c) => ({
      type: 'campaign',
      id: c.id,
      title: c.name,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status
    })),
    ...scheduledContent.map((c) => ({
      type: 'content',
      id: c.id,
      title: c.title,
      start_date: c.scheduled_date,
      end_date: null,
      status: c.status,
      channel: c.channel,
      time: c.scheduled_time
    })),
  ].filter((i) => i.start_date).sort((a, b) => (a.start_date || '').localeCompare(b.start_date || ''));

  // Columns for scheduled content table
  const scheduledColumns = [
    {
      key: 'channel',
      label: 'Channel',
      render: (value) => {
        const config = CHANNEL_CONFIG[value] || { label: value, icon: FileText, color: 'bg-gray-400', textColor: 'text-white' };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${config.color} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${config.textColor}`} />
            </div>
            <span className="text-sm font-medium text-light-text">{config.label}</span>
          </div>
        );
      }
    },
    {
      key: 'title',
      label: 'Title',
      render: (value) => <span className="text-sm text-light-text">{value || '—'}</span>
    },
    {
      key: 'scheduled_date',
      label: 'Date / Time',
      render: (value, row) => (
        <span className="text-sm text-light-text-secondary">
          {value || '—'} {row.scheduled_time || ''}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
          published: { bg: 'bg-green-100', text: 'text-green-700' },
          draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
          pending: { bg: 'bg-amber-100', text: 'text-amber-700' }
        };
        const config = statusConfig[value] || statusConfig.draft;
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${config.bg} ${config.text}`}>
            {value || '—'}
          </span>
        );
      }
    }
  ];

  // Get channel icon component
  const getChannelIcon = (channel) => {
    const config = CHANNEL_CONFIG[channel];
    return config ? config.icon : FileText;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Template Gallery Hero - First/Hero Section */}
      <TemplateGalleryHero
        module="marketing"
        title="Start a new marketing document"
        editorPath="/marketing/editor"
      />

      <DashboardHeader
        title="Marketing"
        description="Campaign briefs, content calendar, and brand assets."
        breadcrumbs={[{ label: 'Marketing', to: '/app/marketing' }]}
        actions={[
          { label: 'Refresh', icon: RefreshCw, variant: 'secondary', onClick: fetchData },
          { label: 'Calendar', icon: Calendar, variant: 'secondary', onClick: () => setShowCalendarModal(true) },
          { label: 'New Campaign', icon: Megaphone, variant: 'primary', onClick: () => navigate('/app/marketing/campaigns/new') }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Scheduled (7 days)"
          value={loading ? '—' : String(dashboard?.scheduled_next_7_days ?? scheduledContent.length)}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Draft Content"
          value={loading ? '—' : String(dashboard?.draft_count ?? draftContent.length)}
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Active Campaigns"
          value={loading ? '—' : String(campaigns.filter(c => c.status === 'active').length || campaigns.length)}
          icon={Megaphone}
          color="red"
        />
        <StatCard
          title="Pending Approvals"
          value={loading ? '—' : String(dashboard?.pending_approvals ?? approvals.length)}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Channel Overview - Platform icons */}
      <div className="mb-8 bg-white rounded-2xl border border-light-border p-5">
        <h3 className="text-sm font-bold text-light-text mb-4">Content by Channel</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CHANNEL_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = scheduledContent.filter(c => c.channel === key).length;
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-light-sidebar rounded-xl"
              >
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                </div>
                <div>
                  <div className="text-xs font-medium text-light-text">{config.label}</div>
                  <div className="text-sm font-bold text-light-text">{count} scheduled</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trending Posts Section - Social Media Trends */}
      <div className="mb-8">
        <TrendingPostsSection
          onGeneratePost={(post) => {
            // Navigate to editor with the trending post context
            const prompt = `Create an engaging social media post inspired by this trending topic:

Title: ${post.title}

Key Points: ${post.content?.slice(0, 500) || 'N/A'}

Source: ${post.source}

Please create a professional, engaging post suitable for our brand's voice. Include relevant hashtags and a call to action.`;
            
            navigate('/app/marketing/editor', {
              state: {
                initialPrompt: prompt,
                context: {
                  trendingPost: post,
                  source: 'trending_posts'
                }
              }
            });
          }}
        />
      </div>

      {/* Generated from Trending Section - AI Auto-Generated Posts */}
      <div className="mb-8">
        <GeneratedFromTrendingSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming scheduled posts with DataTable */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Upcoming Scheduled Posts</h2>
              <Link
                to="/app/marketing/content"
                className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable
              columns={scheduledColumns}
              data={scheduledContent.slice(0, 8)}
              searchable={false}
              showPagination={false}
              emptyMessage="No scheduled posts in the next 7 days"
              onRowClick={(row) => navigate(`/app/marketing/content/${row.id}`)}
              actions={(row) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/marketing/content/${row.id}`);
                  }}
                  className="p-2 text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            />
          </div>

          {/* Draft content */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Draft Content</h2>
              <Link
                to="/app/marketing/content?status=draft"
                className="text-sm font-bold text-brand-accent-600 hover:text-brand-accent-700"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-light-border">
              {loading ? (
                <div className="px-6 py-6 text-sm text-light-text-secondary">Loading...</div>
              ) : draftContent.length === 0 ? (
                <div className="px-6 py-8 text-center text-light-text-secondary">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No draft content</p>
                </div>
              ) : (
                draftContent.slice(0, 6).map((item) => {
                  const config = CHANNEL_CONFIG[item.channel] || { label: item.channel, icon: FileText, color: 'bg-gray-400', textColor: 'text-white' };
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="px-6 py-4 flex items-center justify-between cursor-pointer"
                      onClick={() => navigate('/marketing/editor')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${config.textColor}`} />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-light-text">{item.title || 'Untitled'}</span>
                          <span className="ml-2 text-xs text-light-text-secondary">{config.label}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-light-text-secondary" />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Brand Compliance Status */}
          {approvals.length > 0 && (
            <ApprovalQueue
              title="Pending Brand & Content Approvals"
              items={approvals.map(a => ({
                id: a.id,
                title: `${a.resource_type.replace('_', ' ')} Review`,
                resource_type: a.resource_type,
                status: a.status,
                description: a.resource_id ? `ID: ${a.resource_id.slice(0, 8)}...` : '',
                created_at: a.created_at
              }))}
              onApprove={(item) => console.log('Approve', item)}
              onReject={(item) => console.log('Reject', item)}
              onView={(item) => navigate(`/app/marketing/approvals/${item.id}`)}
              emptyMessage="No pending approvals"
              maxItems={5}
            />
          )}
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickActions
            title="Quick Create"
            actions={quickActions}
            columns={2}
          />

          {/* Calendar / timeline */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-light-border flex items-center justify-between">
              <h3 className="font-bold text-light-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-accent-600" />
                Content Calendar
              </h3>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700"
              >
                Full View
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-light-text-secondary">Loading...</div>
              ) : calendarItems.length === 0 ? (
                <div className="p-6 text-center text-light-text-secondary">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No items scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-light-border">
                  {calendarItems.slice(0, 12).map((item, index) => {
                    const config = item.channel ? CHANNEL_CONFIG[item.channel] : null;
                    const Icon = config ? config.icon : (item.type === 'campaign' ? Megaphone : FileText);
                    return (
                      <motion.div
                        key={`${item.type}-${item.id}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            config ? config.color : (item.type === 'campaign' ? 'bg-rose-500' : 'bg-gray-400')
                          }`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-light-text truncate">{item.title || '—'}</div>
                            <div className="text-xs text-light-text-secondary mt-1 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {item.start_date}
                              {item.time && ` ${item.time}`}
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.type === 'campaign' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sample Templates */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm p-6">
            <TemplateSamplesBlock module="marketing" limit={5} title="Sample assets / Templates" />
          </div>

          {/* Marketing Editor CTA */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-8 text-white shadow-xl"
          >
            <h3 className="text-xl font-bold mb-3">Marketing AI</h3>
            <p className="text-rose-100 text-sm leading-relaxed mb-6">
              Generate campaign briefs, creative packs, and brand-compliant documents from the editor.
            </p>
            <Link
              to="/marketing/editor?direct=1"
              className="w-full py-3 bg-white text-rose-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
            >
              Open Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Calendar Modal (placeholder - would be a full modal component in production) */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCalendarModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text">Content Calendar</h2>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 hover:bg-light-sidebar rounded-lg"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-light-text-secondary py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dateStr = date.toISOString().slice(0, 10);
                  const dayItems = calendarItems.filter(item => item.start_date === dateStr);
                  const isToday = dateStr === new Date().toISOString().slice(0, 10);

                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-2 rounded-xl border ${
                        isToday ? 'border-brand-accent-300 bg-brand-accent-50' : 'border-light-border'
                      }`}
                    >
                      <div className={`text-xs font-bold mb-1 ${isToday ? 'text-brand-accent-600' : 'text-light-text-secondary'}`}>
                        {date.getDate()}
                      </div>
                      {dayItems.slice(0, 2).map((item, idx) => {
                        const config = item.channel ? CHANNEL_CONFIG[item.channel] : null;
                        return (
                          <div
                            key={idx}
                            className={`text-[10px] px-1 py-0.5 rounded mb-1 truncate ${
                              config ? config.color : 'bg-rose-500'
                            } text-white`}
                          >
                            {item.title}
                          </div>
                        );
                      })}
                      {dayItems.length > 2 && (
                        <div className="text-[10px] text-light-text-secondary">+{dayItems.length - 2} more</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
