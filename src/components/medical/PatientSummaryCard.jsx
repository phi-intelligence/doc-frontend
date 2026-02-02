import React from 'react';
import { User, Calendar, Phone, Mail, AlertTriangle, Pill, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PatientSummaryCard = ({ patient, onClick }) => {
  const navigate = useNavigate();

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

  const handleClick = () => {
    if (onClick) {
      onClick(patient);
    } else if (patient.id) {
      navigate(`/medical/patients/${patient.id}`);
    }
  };

  const age = calculateAge(patient.date_of_birth);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      className="bg-white rounded-xl border border-light-border p-5 cursor-pointer hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
          <User className="w-6 h-6 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">{patient.full_name || `${patient.first_name} ${patient.last_name}`}</h3>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            MRN: {patient.patient_id} {age && `• ${age} years`} {patient.gender && `• ${patient.gender}`}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      {(patient.phone || patient.email) && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
          {patient.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {patient.phone}
            </span>
          )}
          {patient.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {patient.email}
            </span>
          )}
        </div>
      )}

      {/* Allergies Alert */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">Allergies:</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {patient.allergies.slice(0, 3).map((allergy, idx) => (
              <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                {allergy}
              </span>
            ))}
            {patient.allergies.length > 3 && (
              <span className="text-xs text-red-600">+{patient.allergies.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {(patient.active_prescriptions || patient.recent_visits || patient.pending_labs) && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {patient.active_prescriptions !== undefined && (
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <Pill className="w-4 h-4 mx-auto text-purple-600" />
              <span className="text-xs font-bold text-purple-700 block mt-1">
                {patient.active_prescriptions}
              </span>
              <span className="text-[10px] text-purple-600">Active Rx</span>
            </div>
          )}
          {patient.recent_visits !== undefined && (
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 mx-auto text-blue-600" />
              <span className="text-xs font-bold text-blue-700 block mt-1">
                {patient.recent_visits}
              </span>
              <span className="text-[10px] text-blue-600">Visits</span>
            </div>
          )}
          {patient.pending_labs !== undefined && (
            <div className="text-center p-2 bg-amber-50 rounded-lg">
              <FileText className="w-4 h-4 mx-auto text-amber-600" />
              <span className="text-xs font-bold text-amber-700 block mt-1">
                {patient.pending_labs}
              </span>
              <span className="text-[10px] text-amber-600">Pending Labs</span>
            </div>
          )}
        </div>
      )}

      {/* Status Badge */}
      <div className="mt-4 flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
          patient.status === 'active' ? 'bg-green-100 text-green-700' :
          patient.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
          'bg-red-100 text-red-700'
        }`}>
          {patient.status}
        </span>
        {patient.primary_provider && (
          <span className="text-xs text-gray-500">
            Provider: {patient.primary_provider}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default PatientSummaryCard;
