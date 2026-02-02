import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, RefreshCw, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listAppointments, listProviders } from '../../../api/medical';

export default function ScheduleView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProvider, setSelectedProvider] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const params = {
        date_from: dateStr,
        date_to: dateStr,
        limit: 100
      };
      
      const [appointmentsData, providersData] = await Promise.all([
        listAppointments(params),
        listProviders({ status: 'active' })
      ]);
      setAppointments(appointmentsData.appointments || []);
      setProviders(providersData.providers || []);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const navigateDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const filteredAppointments = selectedProvider
    ? appointments.filter(a => a.provider_id === selectedProvider)
    : appointments;

  const getAppointmentsForHour = (hour) => {
    return filteredAppointments.filter(a => {
      if (!a.appointment_datetime) return false;
      const apptHour = new Date(a.appointment_datetime).getHours();
      return apptHour === hour;
    });
  };

  const statusColors = {
    scheduled: 'bg-gray-100 border-gray-300',
    confirmed: 'bg-blue-100 border-blue-300',
    checked_in: 'bg-amber-100 border-amber-300',
    in_progress: 'bg-purple-100 border-purple-300',
    completed: 'bg-green-100 border-green-300',
    cancelled: 'bg-red-100 border-red-300 opacity-50',
    no_show: 'bg-red-100 border-red-300 opacity-50',
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-600" />
            Schedule View
          </h1>
          <p className="text-gray-500 mt-1">Daily appointment schedule</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/medical/appointments/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl border border-light-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Go to Today
            </button>
          </div>
          <button
            onClick={() => navigateDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Filter */}
        {providers.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedProvider('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                !selectedProvider ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Providers
            </button>
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedProvider === provider.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-light-border overflow-hidden">
          {hours.map(hour => {
            const hourAppointments = getAppointmentsForHour(hour);
            return (
              <div key={hour} className="flex border-b border-gray-100 last:border-b-0">
                <div className="w-20 p-3 bg-gray-50 border-r border-gray-100 text-sm font-medium text-gray-600">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>
                <div className="flex-1 p-2 min-h-[80px]">
                  {hourAppointments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {hourAppointments.map(appt => (
                        <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => navigate(`/medical/appointments/${appt.id}`)}
                          className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all ${statusColors[appt.status] || statusColors.scheduled}`}
                          style={{ minWidth: '200px' }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">{appt.patient_name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {appt.appointment_type?.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {appt.duration_minutes} min
                            {appt.provider_name && (
                              <>
                                <span>•</span>
                                <span>{appt.provider_name}</span>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300 text-sm">
                      No appointments
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
