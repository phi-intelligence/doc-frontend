import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Users, Zap, FileText, ArrowRight } from 'lucide-react';
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

export default function EmployeesDirectory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hr/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to load employees');
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError(e?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const seedEmployees = async () => {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch('/api/hr/employees/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || 'Failed to seed employees');
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError(e?.message || 'Failed to seed employees');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((e) => {
      return (
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.title?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

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

  const empty = !loading && items.length === 0;

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light-text tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-accent-600" />
            Active Employees
          </h1>
          <p className="mt-2 text-sm text-light-text-secondary">
            Select an employee to open the HR workspace with their documents preloaded.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEmployees}
            className="btn-secondary px-4 py-2 rounded-xl inline-flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
          <button
            type="button"
            onClick={seedEmployees}
            className="btn-primary px-4 py-2 rounded-xl inline-flex items-center gap-2"
            disabled={seeding}
            title="Seed demo employees (includes Thresium) with demo documents"
          >
            {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Seed Demo Employees
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium">
          {error}
        </div>
      ) : null}

      <div className="mt-6 card overflow-hidden">
        <div className="px-5 py-3 border-b border-light-border bg-light-bg flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-light-text">Employees</div>
          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, role, department..."
              className="px-3 py-2 bg-white border border-light-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent-500/20 w-64"
            />
            <div className="text-xs font-bold text-light-text-secondary">
              {filtered.length} of {items.length}
            </div>
          </div>
        </div>

        <div className="divide-y divide-light-border">
          {loading ? (
            <div className="p-8 flex items-center justify-center text-light-text-secondary">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : empty ? (
            <div className="p-8 text-center text-light-text-secondary">
              No employees yet. Click “Seed Demo Employees” to create a mock employee directory with demo documents.
            </div>
          ) : (
            filtered.map((emp) => (
              <button
                type="button"
                key={emp.id}
                onClick={() => openEmployeeWorkspace(emp)}
                className="w-full text-left flex items-center justify-between px-5 py-4 hover:bg-light-bg transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-light-text truncate">{emp.name}</div>
                  <div className="text-xs text-light-text-secondary truncate">
                    {emp.title || 'Employee'} • {emp.department || 'Department'} • Docs: {emp.documents?.length || 0}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-brand-accent-600">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold">Open Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

