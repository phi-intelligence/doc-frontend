import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare,
  Users, 
  BarChart3, 
  Scale, 
  FileText, 
  LogOut, 
  ChevronDown, 
  Settings,
  Plus,
  Megaphone,
  Edit3,
  Sparkles,
  Home,
  Shield,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import ModuleRouteGuard from '../../auth/ModuleRouteGuard';
import { motion, AnimatePresence } from 'framer-motion';

const FULL_NAV = [
  { to: '/app/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/app/chat', label: 'Document Chat', icon: MessageSquare },
  { to: '/app/hr', label: 'HR Workspace', icon: Users },
  { to: '/app/finance', label: 'Finance Hub', icon: BarChart3 },
  { to: '/app/legal', label: 'Legal & Compliance', icon: Scale },
  { to: '/app/marketing', label: 'Marketing', icon: Megaphone },
  { to: '/app/insurance', label: 'Insurance', icon: Shield },
  { to: '/app/medical', label: 'Medical', icon: HeartPulse },
  { to: '/app/docs', label: 'Knowledge Base', icon: FileText },
  { to: '/general', label: 'General', icon: Sparkles }
];

const MODULE_NAV_MAP = {
  hr: { to: '/app/hr', label: 'HR Workspace', icon: Users },
  finance: { to: '/app/finance', label: 'Finance Hub', icon: BarChart3 },
  legal: { to: '/app/legal', label: 'Legal & Compliance', icon: Scale },
  marketing: { to: '/app/marketing', label: 'Marketing', icon: Megaphone },
  insurance: { to: '/app/insurance', label: 'Insurance', icon: Shield },
  medical: { to: '/app/medical', label: 'Medical', icon: HeartPulse }
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const nav = React.useMemo(() => {
    const isAdmin = user?.role === 'admin';
    const module = user?.module;
    if (isAdmin || !module) {
      return FULL_NAV;
    }
    const moduleItem = MODULE_NAV_MAP[module];
    return [
      // Dashboard first
      ...(moduleItem ? [moduleItem] : []),
      // Document Editor - links directly to workspace (skip welcome)
      { to: `/${module}/editor?direct=1`, label: 'Document Editor', icon: Edit3 },
      // General - full ChatPage experience for all users
      { to: '/general', label: 'General', icon: Sparkles }
    ];
  }, [user?.role, user?.module]);

  return (
    <div className="min-h-screen bg-light-surface flex font-sans selection:bg-brand-accent-100 selection:text-brand-accent-900">
      {/* Professional Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-white hidden lg:flex flex-col sticky top-0 h-screen z-40">
        {/* Workspace Branding */}
        <div className="h-20 px-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent-100 shrink-0 overflow-hidden">
             <img src="/genX.png" alt="GendocX" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-gray-900 tracking-tighter leading-none text-lg uppercase">GENDOC<span className="text-brand-accent-600">X</span></div>
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1 truncate">
              {user?.org_name || 'Enterprise Cloud'}
            </div>
          </div>
        </div>

        {/* Global Action */}
        <div className="px-4 mb-6">
          <button 
            onClick={() => {
              // For module users, go directly to their editor workspace; for admins, go to chat
              const module = user?.module;
              if (module && ['hr', 'finance', 'legal', 'marketing', 'insurance', 'medical'].includes(module)) {
                navigate(`/${module}/editor?direct=1`);
              } else {
                navigate('/app/chat');
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            New Document
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Workspaces</span>
          </div>
          {nav.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                  active
                    ? 'bg-brand-accent-600 text-white shadow-lg shadow-brand-accent-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.label}
                </div>
                {active && (
                   <motion.div layoutId="active-nav" className="w-1.5 h-1.5 rounded-full bg-white/50" />
                )}
              </Link>
            );
          })}

          <div className="px-3 mt-8 mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Settings</span>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all">
            <Settings className="w-5 h-5 text-gray-400" />
            System Config
          </button>
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <Home className="w-5 h-5 text-gray-400" />
            Public Tools
          </Link>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-gray-100">
           <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-accent-100 flex items-center justify-center font-bold text-brand-accent-700">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {user?.display_name || user?.module_name || user?.email || 'Admin'}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {user?.module ? (user.module_name || `${user.module} user`) : (user?.role === 'admin' ? 'Administrator' : 'User')}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-gray-200 shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Content Scroll Area (module users only see their module + Document Chat) */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <ModuleRouteGuard>
            <Outlet />
          </ModuleRouteGuard>
        </div>
      </main>
    </div>
  );
}