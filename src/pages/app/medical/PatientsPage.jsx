import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, RefreshCw, ChevronRight, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listPatients, searchPatients } from '../../../api/medical';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filters.status) params.status = filters.status;
      
      const data = await listPatients(params);
      setPatients(data.patients || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term) => {
    if (!term || term.length < 2) {
      fetchData();
      return;
    }
    
    try {
      setSearching(true);
      const data = await searchPatients(term);
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Failed to search patients:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Users className="w-7 h-7 text-rose-600" />
            Patients
          </h1>
          <p className="text-gray-500 mt-1">Manage patient records</p>
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
            onClick={() => navigate('/medical/patients/new')}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Patient
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, MRN, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              {searching && (
                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-light-border">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No patients found</p>
          <button
            onClick={() => navigate('/medical/patients/new')}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Register First Patient
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((patient, idx) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              onClick={() => navigate(`/medical/patients/${patient.id}`)}
              className="bg-white rounded-xl border border-light-border p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    MRN: {patient.patient_id}
                    {patient.date_of_birth && ` • ${calculateAge(patient.date_of_birth)} years`}
                    {patient.gender && ` • ${patient.gender}`}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {patient.phone && <p>{patient.phone}</p>}
                  {patient.email && <p className="text-xs">{patient.email}</p>}
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
