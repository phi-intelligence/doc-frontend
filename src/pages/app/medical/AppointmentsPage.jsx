import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, RefreshCw, ChevronRight, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listAppointments, getTodaysAppointments } from '../../../api/medical';

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    date_from: searchParams.get('date') || new Date().toISOString().split('T')[0],
    date_to: searchParams.get('date') || '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (filters.status) params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      
      const [appointmentsData, todayData] = await Promise.all([
        listAppointments(params),
        getTodaysAppointments()
      ]);
      setAppointments(appointmentsData.appointments || []);
      setTotal(appointmentsData.total || 0);
      setTodayStats(todayData);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const statusOptions = ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];
  const typeOptions = ['consultation', 'follow_up', 'procedure', 'screening', 'vaccination'];

  const statusIcons = {
    scheduled: Clock,
    confirmed: CheckCircle,
    checked_in: User,
    in_progress: Clock,
    completed: CheckCircle,
    cancelled: XCircle,
    no_show: XCircle,
  };

  const statusColors = {
    scheduled: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    checked_in: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Appointments
          </h1>
          <p className="text-gray-500 mt-1">Manage patient appointments</p>
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
            onClick={() => navigate('/medical/appointments/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      {todayStats && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-800">Today's Schedule</h3>
              <p className="text-blue-600 text-sm mt-1">
                {todayStats.appointments?.length || 0} appointments
              </p>
            </div>
            <button
              onClick={() => setFilters({ ...filters, date_from: new Date().toISOString().split('T')[0], date_to: new Date().toISOString().split('T')[0] })}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              View Today
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-light-border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
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
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-light-border">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No appointments found</p>
          <button
            onClick={() => navigate('/medical/appointments/new')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt, idx) => {
            const StatusIcon = statusIcons[appt.status] || Clock;
            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => navigate(`/medical/appointments/${appt.id}`)}
                className="bg-white rounded-xl border border-light-border p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <p className="text-lg font-bold text-gray-800">
                      {appt.appointment_datetime ? new Date(appt.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appt.appointment_datetime ? new Date(appt.appointment_datetime).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{appt.patient_name}</span>
                      {appt.patient_mrn && (
                        <span className="text-xs text-gray-400">MRN: {appt.patient_mrn}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">
                      {appt.appointment_type?.replace('_', ' ')} • {appt.duration_minutes} min • {appt.provider_name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${statusColors[appt.status] || statusColors.scheduled}`}>
                    <StatusIcon className="w-3 h-3" />
                    {appt.status?.replace('_', ' ')}
                  </span>
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
