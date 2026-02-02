import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, RefreshCw, ChevronRight, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listClaims, getClaimStats } from '../../../api/insurance';

export default function ClaimsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    claim_type: searchParams.get('type') || '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filters.status) params.status = filters.status;
      if (filters.claim_type) params.claim_type = filters.claim_type;
      
      const [claimsData, statsData] = await Promise.all([
        listClaims(params),
        getClaimStats()
      ]);
      setClaims(claimsData.claims || []);
      setTotal(claimsData.total || 0);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const filteredClaims = claims.filter(c => 
    !searchTerm || 
    c.claim_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const claimTypes = ['accident', 'theft', 'damage', 'medical', 'death'];
  const statusOptions = ['submitted', 'under_review', 'approved', 'denied', 'paid', 'closed'];

  const statusIcons = {
    submitted: Clock,
    under_review: Search,
    approved: CheckCircle,
    denied: XCircle,
    paid: DollarSign,
    closed: CheckCircle,
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600" />
            Claims
          </h1>
          <p className="text-gray-500 mt-1">Process and manage insurance claims</p>
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
            onClick={() => navigate('/insurance/editor?type=claim')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Claim
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statusOptions.slice(0, 5).map(status => {
            const count = stats.by_status?.[status] || 0;
            const Icon = statusIcons[status] || Clock;
            return (
              <div
                key={status}
                onClick={() => setFilters({ ...filters, status })}
                className="bg-white rounded-xl border border-light-border p-4 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 uppercase">{status.replace('_', ' ')}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
              </div>
            );
          })}
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
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
          <select
            value={filters.claim_type}
            onChange={(e) => setFilters({ ...filters, claim_type: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {claimTypes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-light-border">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No claims found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClaims.map((claim, idx) => {
            const StatusIcon = statusIcons[claim.status] || Clock;
            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => navigate(`/insurance/claims/${claim.id}`)}
                className="bg-white rounded-xl border border-light-border p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <StatusIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{claim.claim_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        claim.status === 'approved' || claim.status === 'paid' ? 'bg-green-100 text-green-700' :
                        claim.status === 'denied' ? 'bg-red-100 text-red-700' :
                        claim.status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {claim.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 capitalize">{claim.claim_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">${claim.amount_claimed?.toLocaleString()}</p>
                    {claim.amount_approved && (
                      <p className="text-xs text-green-600">Approved: ${claim.amount_approved?.toLocaleString()}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
