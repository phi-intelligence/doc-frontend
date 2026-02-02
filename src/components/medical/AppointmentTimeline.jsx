import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AppointmentTimeline = ({ appointments, onAppointmentClick }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-light-border p-6">
        <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-600" />
          Today's Schedule
        </h3>
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No appointments scheduled</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    scheduled: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
    confirmed: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    checked_in: { icon: User, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    in_progress: { icon: Loader2, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    no_show: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  };

  return (
    <div className="bg-white rounded-xl border border-light-border p-6">
      <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-rose-600" />
        Today's Schedule
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        <div className="space-y-4">
          {appointments.map((appt, idx) => {
            const config = statusConfig[appt.status] || statusConfig.scheduled;
            const Icon = config.icon;
            
            return (
              <motion.div
                key={appt.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onAppointmentClick?.(appt)}
                className={`relative flex gap-4 ${onAppointmentClick ? 'cursor-pointer' : ''}`}
              >
                {/* Timeline dot */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${config.bg} border-2 ${config.border}`}>
                  <Icon className={`w-5 h-5 ${config.color} ${appt.status === 'in_progress' ? 'animate-spin' : ''}`} />
                </div>
                
                {/* Content */}
                <div className={`flex-1 pb-4 ${onAppointmentClick ? 'hover:bg-gray-50 rounded-lg p-2 -m-2' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">{appt.time}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
                      {appt.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{appt.patient_name}</p>
                  <p className="text-xs text-gray-500">
                    {appt.type?.replace('_', ' ')} • {appt.duration} min • {appt.provider_name}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTimeline;
