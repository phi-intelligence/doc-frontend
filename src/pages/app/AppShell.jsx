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
  Search, 
  Bell, 
  ChevronDown, 
  Settings,
  Plus,
  Command
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const nav = [
  { to: '/app/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/app/chat', label: 'Document Chat', icon: MessageSquare },
  { to: '/app/hr', label: 'HR Workspace', icon: Users },
  { to: '/app/finance', label: 'Finance Hub', icon: BarChart3 },
  { to: '/app/legal', label: 'Legal & Compliance', icon: Scale },
  { to: '/app/docs', label: 'Knowledge Base', icon: FileText }
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans selection:bg-brand-accent-100 selection:text-brand-accent-900">
      {/* Professional Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-white hidden lg:flex flex-col sticky top-0 h-screen z-40">
        {/* Workspace Branding */}
        <div className="h-20 px-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-accent-100 shrink-0">
             <img src="/logophi_brown.png" alt="Phi" className="w-7 h-7 object-contain brightness-0 invert" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-gray-900 tracking-tighter leading-none text-lg uppercase">PHI <span className="text-brand-accent-600">DOCS</span></div>
            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1 truncate">
              {user?.org_name || 'Enterprise Cloud'}
            </div>
          </div>
        </div>

        {/* Global Action */}
        <div className="px-4 mb-6">
          <button 
            onClick={() => navigate('/chat')}
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
                  <div className="text-sm font-bold text-gray-900 truncate">{user?.email || 'Admin'}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</div>
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
        {/* Modern Header */}
        <header className="h-20 px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-8 flex-1">
             {/* Mobile Logo Placeholder */}
             <img src="/logophi_brown.png" alt="Phi" className="w-8 h-8 lg:hidden" />

             {/* Search Bar */}
             <div className="max-w-md w-full relative hidden sm:block">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search documents, files, or tasks..."
                  className="w-full pl-11 pr-14 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:ring-4 focus:ring-brand-accent-500/5 focus:border-brand-accent-200 transition-all rounded-2xl text-sm font-medium outline-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-gray-200 rounded-md bg-white text-[10px] font-bold text-gray-400 flex items-center gap-1">
                  <Command className="w-3 h-3" /> K
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <button className="p-2.5 text-gray-400 hover:text-brand-accent-600 hover:bg-brand-accent-50 rounded-xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-accent-600 rounded-full border-2 border-white" />
             </button>
             <div className="w-[1px] h-8 bg-gray-100 mx-2" />
             <Link
                to="/"
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-brand-accent-600 hover:bg-brand-accent-50 border border-gray-200 rounded-xl transition-all"
              >
                Public Tools
              </Link>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}