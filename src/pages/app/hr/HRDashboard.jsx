import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  FileText, 
  Briefcase, 
  Search, 
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatCard from '../../../components/shared/dashboard/StatCard';
import DashboardHeader from '../../../components/shared/dashboard/DashboardHeader';
import { useAuth } from '../../../auth/AuthContext';
import { getFileUrl, getPreviewUrl } from '../../../api/files';

function normalizeFile(filename) {
  const type = filename?.split('.').pop()?.toUpperCase() || 'DOCX';
  return {
    filename,
    type,
    url: getFileUrl(filename),
    previewUrl: getPreviewUrl(filename),
    isOutput: false,
    uploadedAt: new Date().toISOString()
  };
}

export default function HRDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);
  const [employeeStats, setEmployeeStats] = useState({ total: 0, active: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        fetch('/api/hr/employees', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/hr/employees/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!listRes.ok) {
        const data = await listRes.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load employees');
      }
      const listData = await listRes.json();
      setEmployees(listData.items || []);

      if (statsRes.ok) {
        const statsData = await statsRes.json().catch(() => ({}));
        setEmployeeStats({
          total: statsData.total || 0,
          active: statsData.active || 0
        });
      } else {
        setEmployeeStats({
          total: (listData.items || []).length,
          active: (listData.items || []).length
        });
      }
    } catch (e) {
      setEmployeesError(e?.message || 'Failed to load employees');
      setEmployees([]);
      setEmployeeStats({ total: 0, active: 0 });
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      return (
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery]);

  const openEmployeeWorkspace = (employee) => {
    const docs = (employee?.documents || []).map(normalizeFile);
    navigate('/app/hr/editor', {
      state: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          title: employee.title,
          department: employee.department
        },
        initialFiles: docs
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <DashboardHeader 
        title="Human Resources"
        description="Manage employee onboarding, maintain personnel records, and automate document generation workflows."
        breadcrumbs={[{ label: 'HR', to: '/app/hr' }]}
        actions={[
          { label: 'Employees', icon: Users, variant: 'primary', onClick: () => navigate('/app/hr/employees') },
          { label: 'Open HR Editor', icon: Zap, variant: 'secondary', onClick: () => navigate('/app/hr/editor') }
        ]}
      />

      {/* HR Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Active Employees" 
          value={employeesLoading ? '—' : String(employeeStats.active || employees.length)} 
          icon={Users} 
          color="blue"
        />
        <StatCard 
          title="Pending Onboarding" 
          value="12" 
          icon={UserPlus} 
          color="orange"
        />
        <StatCard 
          title="Docs Generated" 
          value="438" 
          icon={FileText} 
          color="green"
        />
        <StatCard 
          title="Compliance Score" 
          value="100%" 
          icon={ShieldCheck} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Section: Active Employees */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-light-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-light-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-light-text tracking-tight">Active Employees</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employees..." 
                    className="pl-9 pr-4 py-2 bg-light-bg border border-light-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20 w-64"
                  />
                </div>
                <button className="p-2 border border-light-border rounded-xl hover:bg-light-sidebar">
                  <Filter className="w-4 h-4 text-light-text-secondary" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-light-sidebar border-b border-light-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider">Docs</th>
                    <th className="px-6 py-4 text-xs font-bold text-light-text-secondary uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {employeesLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-sm text-light-text-secondary">
                        Loading employees…
                      </td>
                    </tr>
                  ) : employeesError ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-sm text-red-700 bg-red-50/40">
                        {employeesError}
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-sm text-light-text-secondary">
                        No employees found. Go to the employee directory to seed demo employees.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.slice(0, 8).map((emp) => (
                      <tr key={emp.id} className="hover:bg-light-sidebar/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                              {String(emp.name || 'E').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-light-text truncate">{emp.name}</div>
                              <div className="text-xs text-light-text-secondary truncate">{emp.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary">{emp.title || '—'}</td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary">{emp.department || '—'}</td>
                        <td className="px-6 py-4 text-sm text-light-text-secondary">{emp.documents?.length || 0}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openEmployeeWorkspace(emp)}
                            className="p-2 inline-flex text-brand-accent-600 hover:bg-brand-accent-50 rounded-lg"
                            title="Open HR workspace with employee documents"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-light-sidebar/50 border-t border-light-border flex justify-center">
              <Link to="/app/hr/employees" className="text-sm font-semibold text-brand-accent-600 hover:text-brand-accent-700 flex items-center gap-1">
                View Employee Directory <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Side Column: Tools & Docs */}
        <div className="space-y-8">
          {/* HR Editor Promo */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-3">AI Document Editor</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Use our specialized HR editor to draft contracts, generate offer letters, and process employee photos automatically.
            </p>
            <Link 
              to="/app/hr/editor" 
              className="w-full py-3 bg-white text-blue-600 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            >
              Open HR Editor
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Employee Directory Promo */}
          <div className="bg-white rounded-3xl border border-light-border shadow-sm p-6">
            <h3 className="text-lg font-bold text-light-text mb-2 tracking-tight">Employee Directory</h3>
            <p className="text-sm text-light-text-secondary leading-relaxed mb-4">
              Seed demo employees (including Thresium) and open the HR workspace with employee documents preloaded.
            </p>
            <Link
              to="/app/hr/employees"
              className="w-full py-3 bg-brand-accent-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-accent-700 transition-colors"
            >
              Open Directory
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-light-text mb-4 tracking-tight">Resource Center</h3>
            <div className="space-y-3">
              {[
                { label: 'Employment Templates', icon: FileText },
                { label: 'Policy Handbook', icon: Briefcase },
                { label: 'Compliance Checklist', icon: ShieldCheck },
              ].map((link, i) => (
                <button 
                  key={i}
                  className="w-full p-4 bg-white border border-light-border rounded-2xl flex items-center justify-between group hover:border-brand-accent-300 transition-all"
                >
                  <div className="flex items-center gap-3 text-light-text font-semibold text-sm">
                    <link.icon className="w-4 h-4 text-light-text-secondary" />
                    {link.label}
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-text-secondary group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}