import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, ArrowLeft, Calendar, Phone, Mail, MapPin, AlertTriangle,
  FileText, Pill, TestTube, Stethoscope, Edit, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getPatient, getPatientHistory } from '../../../api/medical';

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [patientData, historyData] = await Promise.all([
        getPatient(patientId),
        getPatientHistory(patientId)
      ]);
      setPatient(patientData);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to fetch patient:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchData();
  }, [patientId]);

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto pb-12 text-center py-12">
        <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Patient not found</p>
        <button
          onClick={() => navigate('/medical/patients')}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <button
        onClick={() => navigate('/medical/patients')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </button>

      {/* Patient Header */}
      <div className="bg-white rounded-xl border border-light-border p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
            <User className="w-10 h-10 text-rose-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {patient.first_name} {patient.last_name}
                </h1>
                <p className="text-gray-500 mt-1">
                  MRN: {patient.patient_id}
                  {age && ` • ${age} years old`}
                  {patient.gender && ` • ${patient.gender}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {patient.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              {patient.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {patient.email}
                </span>
              )}
              {patient.date_of_birth && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/medical/patients/${patientId}/edit`)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Allergies Alert */}
      {patient.allergies && patient.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">Allergies</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {patient.allergies.map((allergy, idx) => (
              <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical Records */}
        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-600" />
              Recent Records
            </h3>
            <button
              onClick={() => navigate(`/medical/records?patient=${patientId}`)}
              className="text-sm text-rose-600 hover:underline"
            >
              View All
            </button>
          </div>
          {history?.records?.length > 0 ? (
            <div className="space-y-3">
              {history.records.slice(0, 5).map((record, idx) => (
                <div
                  key={record.id || idx}
                  onClick={() => navigate(`/medical/records/${record.id}`)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 capitalize">{record.type?.replace('_', ' ')}</span>
                    <span className={`text-xs ${record.is_signed ? 'text-green-600' : 'text-amber-600'}`}>
                      {record.is_signed ? 'Signed' : 'Unsigned'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{record.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No records</p>
          )}
        </div>

        {/* Prescriptions */}
        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              Active Prescriptions
            </h3>
            <button
              onClick={() => navigate(`/medical/prescriptions?patient=${patientId}`)}
              className="text-sm text-purple-600 hover:underline"
            >
              View All
            </button>
          </div>
          {history?.prescriptions?.length > 0 ? (
            <div className="space-y-3">
              {history.prescriptions.slice(0, 5).map((rx, idx) => (
                <div
                  key={rx.id || idx}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-800">{rx.medication}</span>
                  <p className="text-xs text-gray-500 mt-1">{rx.dosage} - {rx.frequency}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No active prescriptions</p>
          )}
        </div>

        {/* Lab Results */}
        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-amber-600" />
              Recent Labs
            </h3>
            <button
              onClick={() => navigate(`/medical/labs?patient=${patientId}`)}
              className="text-sm text-amber-600 hover:underline"
            >
              View All
            </button>
          </div>
          {history?.labs?.length > 0 ? (
            <div className="space-y-3">
              {history.labs.slice(0, 5).map((lab, idx) => (
                <div
                  key={lab.id || idx}
                  onClick={() => navigate(`/medical/labs/${lab.id}`)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{lab.test_type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      lab.status === 'abnormal' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lab.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{lab.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No lab results</p>
          )}
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-xl border border-light-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Recent Appointments
            </h3>
            <button
              onClick={() => navigate(`/medical/appointments?patient=${patientId}`)}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          {history?.appointments?.length > 0 ? (
            <div className="space-y-3">
              {history.appointments.slice(0, 5).map((appt, idx) => (
                <div
                  key={appt.id || idx}
                  onClick={() => navigate(`/medical/appointments/${appt.id}`)}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 capitalize">{appt.type?.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      appt.status === 'completed' ? 'bg-green-100 text-green-600' :
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {appt.datetime ? new Date(appt.datetime).toLocaleString() : '-'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No appointments</p>
          )}
        </div>
      </div>
    </div>
  );
}
