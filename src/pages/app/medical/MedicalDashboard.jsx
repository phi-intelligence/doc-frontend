import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  Stethoscope,
  Pill,
  ClipboardList,
  TestTube,
  UserPlus,
  CalendarPlus,
  ChevronRight,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatCard, DashboardHeader, DataTable, QuickActions } from '../../../components/shared/dashboard';
import TemplateGalleryHero from '../../../components/dashboard/TemplateGalleryHero';
import { getMedicalDashboard, getTodaysAppointments, getAbnormalLabResults } from '../../../api/medical';

// Today's Schedule Timeline
const TodaysSchedule = ({ appointments }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-light-border p-6">
        <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-600" />
          Today's Schedule
        </h3>
        <div className="text-center py-6 text-gray-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No appointments scheduled for today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-light-border p-6">
      <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-rose-600" />
        Today's Schedule
      </h3>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {appointments.map((appt, idx) => (
          <motion.div
            key={appt.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              appt.status === 'completed' ? 'bg-green-50 border-green-200' :
              appt.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
              appt.status === 'checked_in' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-center min-w-[50px]">
              <span className="text-sm font-bold text-gray-800">{appt.time}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{appt.patient_name}</p>
              <p className="text-xs text-gray-500">{appt.type?.replace('_', ' ')} - {appt.provider_name}</p>
            </div>
            <div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                appt.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                appt.status === 'checked_in' ? 'bg-amber-100 text-amber-700' :
                appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {appt.status?.replace('_', ' ')}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Abnormal Labs Alert
const AbnormalLabsAlert = ({ labs }) => {
  if (!labs || labs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800">Abnormal Lab Results</h4>
          <p className="text-xs text-red-600 mt-1">
            {labs.length} lab {labs.length === 1 ? 'result requires' : 'results require'} review
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {labs.slice(0, 3).map(lab => (
              <span key={lab.id} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                {lab.test_type} - {lab.patient_name}
              </span>
            ))}
            {labs.length > 3 && (
              <span className="text-xs text-red-600">+{labs.length - 3} more</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Unsigned Records Banner
const UnsignedRecordsBanner = ({ count }) => {
  const navigate = useNavigate();
  if (!count || count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-600" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Unsigned Records</h4>
            <p className="text-xs text-amber-600">
              {count} medical {count === 1 ? 'record needs' : 'records need'} your signature
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/medical/records?filter=unsigned')}
          className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 transition-colors"
        >
          Review Now
        </button>
      </div>
    </motion.div>
  );
};

export default function MedicalDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [abnormalLabs, setAbnormalLabs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [dashboard, labsData] = await Promise.all([
        getMedicalDashboard(),
        getAbnormalLabResults()
      ]);
      setDashboardData(dashboard);
      setAbnormalLabs(labsData.lab_results || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch medical data:', err);
      setError('Failed to load medical dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const quickActions = [
    {
      label: 'New Patient',
      description: 'Register patient',
      icon: UserPlus,
      color: 'rose',
      onClick: () => navigate('/medical/patients/new')
    },
    {
      label: 'Schedule',
      description: 'Book appointment',
      icon: CalendarPlus,
      color: 'blue',
      onClick: () => navigate('/medical/appointments/new')
    },
    {
      label: 'Create Record',
      description: 'Medical note',
      icon: ClipboardList,
      color: 'green',
      onClick: () => navigate('/medical/editor?type=record')
    },
    {
      label: 'Prescription',
      description: 'Write prescription',
      icon: Pill,
      color: 'purple',
      onClick: () => navigate('/medical/editor?type=prescription')
    }
  ];

  const scheduleColumns = [
    {
      key: 'time',
      label: 'Time',
      render: (value) => (
        <span className="font-bold text-gray-800">{value}</span>
      )
    },
    {
      key: 'patient_name',
      label: 'Patient',
      render: (value, row) => (
        <div>
          <span className="text-sm font-medium text-gray-800">{value}</span>
          {row.patient_mrn && (
            <span className="ml-2 text-xs text-gray-400">MRN: {row.patient_mrn}</span>
          )}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => (
        <span className="capitalize text-sm">{value?.replace('_', ' ')}</span>
      )
    },
    {
      key: 'provider_name',
      label: 'Provider',
      render: (value) => <span className="text-sm">{value}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusConfig = {
          scheduled: { bg: 'bg-gray-100', text: 'text-gray-700' },
          confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
          checked_in: { bg: 'bg-amber-100', text: 'text-amber-700' },
          in_progress: { bg: 'bg-purple-100', text: 'text-purple-700' },
          completed: { bg: 'bg-green-100', text: 'text-green-700' },
          cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
          no_show: { bg: 'bg-red-100', text: 'text-red-700' },
        };
        const config = statusConfig[value] || statusConfig.scheduled;
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${config.bg} ${config.text}`}>
            {value?.replace('_', ' ')}
          </span>
        );
      }
    }
  ];

  const labsColumns = [
    {
      key: 'test_type',
      label: 'Test',
      render: (value) => (
        <span className="text-sm font-medium text-gray-800">{value}</span>
      )
    },
    {
      key: 'patient_name',
      label: 'Patient',
      render: (value, row) => (
        <div>
          <span className="text-sm">{value}</span>
          {row.patient_mrn && (
            <span className="ml-2 text-xs text-gray-400">{row.patient_mrn}</span>
          )}
        </div>
      )
    },
    {
      key: 'test_date',
      label: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          value === 'abnormal' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {value}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Template Gallery Hero */}
      <TemplateGalleryHero
        module="medical"
        title="Medical Templates"
        subtitle="Clinical notes, prescriptions, and patient documents"
      />

      {/* Dashboard Header */}
      <DashboardHeader
        title="Medical Practice"
        subtitle="Patient care and clinical operations"
        icon={HeartPulse}
        iconColor="text-rose-600"
        actions={[
          {
            label: 'Refresh',
            icon: RefreshCw,
            onClick: fetchData,
            loading: refreshing
          },
          {
            label: 'New Patient',
            icon: UserPlus,
            onClick: () => navigate('/medical/patients/new'),
            primary: true
          }
        ]}
      />

      {/* Alerts */}
      <UnsignedRecordsBanner count={dashboardData?.unsigned_records} />
      <AbnormalLabsAlert labs={abnormalLabs} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Patients"
          value={dashboardData?.active_patients || 0}
          icon={Users}
          color="rose"
        />
        <StatCard
          label="Today's Appointments"
          value={dashboardData?.todays_appointments || 0}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Pending Lab Reviews"
          value={dashboardData?.pending_lab_reviews || 0}
          icon={TestTube}
          color="amber"
        />
        <StatCard
          label="Open Referrals"
          value={dashboardData?.open_referrals || 0}
          icon={ClipboardList}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <DataTable
            title="Today's Appointments"
            icon={Calendar}
            iconColor="text-blue-600"
            columns={scheduleColumns}
            data={dashboardData?.todays_schedule || []}
            emptyMessage="No appointments scheduled for today"
            onRowClick={(row) => navigate(`/medical/appointments/${row.id}`)}
          />

          {/* Pending Lab Results */}
          {abnormalLabs.length > 0 && (
            <DataTable
              title="Abnormal Lab Results"
              icon={TestTube}
              iconColor="text-red-600"
              columns={labsColumns}
              data={abnormalLabs}
              emptyMessage="No abnormal results"
              onRowClick={(row) => navigate(`/medical/labs/${row.id}`)}
            />
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions actions={quickActions} />

          {/* Today's Schedule Timeline */}
          <TodaysSchedule appointments={dashboardData?.todays_schedule} />

          {/* Document Templates */}
          <div className="bg-white rounded-xl border border-light-border p-6">
            <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600" />
              Medical Documents
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Consultation Note', icon: Stethoscope },
                { name: 'Progress Note', icon: ClipboardList },
                { name: 'Prescription', icon: Pill },
                { name: 'Referral Letter', icon: FileText },
                { name: 'Lab Order', icon: TestTube }
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/medical/editor?template=${template.name.toLowerCase().replace(/ /g, '-')}`)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <template.icon className="w-4 h-4 text-rose-500" />
                  {template.name}
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
