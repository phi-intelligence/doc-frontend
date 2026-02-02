import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, Filter, RefreshCw, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listPolicies, getPolicyStats } from '../../../api/insurance';

export default function PoliciesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    policy_type: searchParams.get('type') || '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filters.status) params.status = filters.status;
      if (filters.policy_type) params.policy_type = filters.policy_type;
      
      const [policiesData, statsData] = await Promise.all([
        listPolicies(params),
        getPolicyStats()
      ]);
      setPolicies(policiesData.policies || []);
      setTotal(policiesData.total || 0);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const filteredPolicies = policies.filter(p => 
    !searchTerm || 
    p.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.holder_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const policyTypes = ['life', 'health', 'auto', 'property', 'liability'];
  const statusOptions = ['active', 'draft', 'expired', 'cancelled', 'suspended'];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyan-600" />
            Policies
          </h1>
          <p className="text-gray-500 mt-1">Manage insurance policies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/insurance/editor?type=policy')}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(stats.by_status || {}).slice(0, 4).map(([status, count]) => (
            <div key={status} className="bg-white rounded-xl border border-light-border p-4">
              <span className="text-xs text-gray-500 uppercase">{status}</span>
              <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={filters.policy_type}
            onChange={(e) => setFilters({ ...filters, policy_type: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Types</option>
            {policyTypes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Policies List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-light-border">
          <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No policies found</p>
          <button
            onClick={() => navigate('/insurance/editor?type=policy')}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Create First Policy
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPolicies.map((policy, idx) => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => navigate(`/insurance/policies/${policy.id}`)}
              className="bg-white rounded-xl border border-light-border p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <Shield className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{policy.policy_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      policy.status === 'active' ? 'bg-green-100 text-green-700' :
                      policy.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{policy.holder_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">${policy.premium?.toLocaleString()}/yr</p>
                  <p className="text-xs text-gray-500 capitalize">{policy.policy_type}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
