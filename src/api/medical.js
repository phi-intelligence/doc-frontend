import apiClient from './index';

// =============================================================================
// Dashboard
// =============================================================================

/**
 * Get medical dashboard aggregate data.
 */
export async function getMedicalDashboard() {
  const response = await apiClient.get('/medical/dashboard');
  return response.data;
}

// =============================================================================
// Patients
// =============================================================================

/**
 * List patients.
 * @param {{ status?: string, limit?: number, offset?: number }} params
 */
export async function listPatients(params = {}) {
  const response = await apiClient.get('/medical/patients', { params });
  return response.data;
}

/**
 * Search patients.
 * @param {string} query - Search term (name, MRN, phone, email)
 * @param {number} limit
 */
export async function searchPatients(query, limit = 20) {
  const response = await apiClient.get('/medical/patients/search', {
    params: { q: query, limit }
  });
  return response.data;
}

/**
 * Get a single patient by ID.
 * @param {string} patientId
 */
export async function getPatient(patientId) {
  const response = await apiClient.get(`/medical/patients/${patientId}`);
  return response.data;
}

/**
 * Get patient history (records, prescriptions, labs, appointments).
 * @param {string} patientId
 */
export async function getPatientHistory(patientId) {
  const response = await apiClient.get(`/medical/patients/${patientId}/history`);
  return response.data;
}

/**
 * Create a new patient.
 * @param {object} data
 */
export async function createPatient(data) {
  const response = await apiClient.post('/medical/patients', data);
  return response.data;
}

/**
 * Update a patient.
 * @param {string} patientId
 * @param {object} data
 */
export async function updatePatient(patientId, data) {
  const response = await apiClient.patch(`/medical/patients/${patientId}`, data);
  return response.data;
}

// =============================================================================
// Appointments
// =============================================================================

/**
 * List appointments.
 * @param {{ status?: string, appointment_type?: string, date_from?: string, date_to?: string, limit?: number, offset?: number }} params
 */
export async function listAppointments(params = {}) {
  const response = await apiClient.get('/medical/appointments', { params });
  return response.data;
}

/**
 * Get today's appointments.
 */
export async function getTodaysAppointments() {
  const response = await apiClient.get('/medical/appointments/today');
  return response.data;
}

/**
 * Get appointments for a provider.
 * @param {string} providerId
 * @param {{ date_from?: string, date_to?: string }} params
 */
export async function getProviderAppointments(providerId, params = {}) {
  const response = await apiClient.get(`/medical/appointments/provider/${providerId}`, { params });
  return response.data;
}

/**
 * Get a single appointment by ID.
 * @param {string} appointmentId
 */
export async function getAppointment(appointmentId) {
  const response = await apiClient.get(`/medical/appointments/${appointmentId}`);
  return response.data;
}

/**
 * Create a new appointment.
 * @param {object} data
 */
export async function createAppointment(data) {
  const response = await apiClient.post('/medical/appointments', data);
  return response.data;
}

/**
 * Update an appointment.
 * @param {string} appointmentId
 * @param {object} data
 */
export async function updateAppointment(appointmentId, data) {
  const response = await apiClient.patch(`/medical/appointments/${appointmentId}`, data);
  return response.data;
}

/**
 * Check in for an appointment.
 * @param {string} appointmentId
 */
export async function checkInAppointment(appointmentId) {
  const response = await apiClient.post(`/medical/appointments/${appointmentId}/check-in`);
  return response.data;
}

/**
 * Complete an appointment.
 * @param {string} appointmentId
 * @param {string} notes
 */
export async function completeAppointment(appointmentId, notes = null) {
  const response = await apiClient.post(`/medical/appointments/${appointmentId}/complete`, {}, {
    params: notes ? { notes } : {}
  });
  return response.data;
}

// =============================================================================
// Medical Records
// =============================================================================

/**
 * List medical records.
 * @param {{ record_type?: string, patient_id?: string, is_signed?: boolean, limit?: number, offset?: number }} params
 */
export async function listRecords(params = {}) {
  const response = await apiClient.get('/medical/records', { params });
  return response.data;
}

/**
 * Get records for a patient.
 * @param {string} patientId
 * @param {{ record_type?: string, limit?: number }} params
 */
export async function getPatientRecords(patientId, params = {}) {
  const response = await apiClient.get(`/medical/records/patient/${patientId}`, { params });
  return response.data;
}

/**
 * Get a single record by ID.
 * @param {string} recordId
 */
export async function getRecord(recordId) {
  const response = await apiClient.get(`/medical/records/${recordId}`);
  return response.data;
}

/**
 * Create a new medical record.
 * @param {object} data
 */
export async function createRecord(data) {
  const response = await apiClient.post('/medical/records', data);
  return response.data;
}

/**
 * Update a medical record.
 * @param {string} recordId
 * @param {object} data
 */
export async function updateRecord(recordId, data) {
  const response = await apiClient.patch(`/medical/records/${recordId}`, data);
  return response.data;
}

/**
 * Sign a medical record.
 * @param {string} recordId
 */
export async function signRecord(recordId) {
  const response = await apiClient.post(`/medical/records/${recordId}/sign`);
  return response.data;
}

// =============================================================================
// Prescriptions
// =============================================================================

/**
 * List prescriptions.
 * @param {{ status?: string, patient_id?: string, limit?: number, offset?: number }} params
 */
export async function listPrescriptions(params = {}) {
  const response = await apiClient.get('/medical/prescriptions', { params });
  return response.data;
}

/**
 * Get prescriptions for a patient.
 * @param {string} patientId
 * @param {{ status?: string }} params
 */
export async function getPatientPrescriptions(patientId, params = {}) {
  const response = await apiClient.get(`/medical/prescriptions/patient/${patientId}`, { params });
  return response.data;
}

/**
 * Get a single prescription by ID.
 * @param {string} prescriptionId
 */
export async function getPrescription(prescriptionId) {
  const response = await apiClient.get(`/medical/prescriptions/${prescriptionId}`);
  return response.data;
}

/**
 * Create a new prescription.
 * @param {object} data
 */
export async function createPrescription(data) {
  const response = await apiClient.post('/medical/prescriptions', data);
  return response.data;
}

/**
 * Update a prescription.
 * @param {string} prescriptionId
 * @param {object} data
 */
export async function updatePrescription(prescriptionId, data) {
  const response = await apiClient.patch(`/medical/prescriptions/${prescriptionId}`, data);
  return response.data;
}

/**
 * Refill a prescription.
 * @param {string} prescriptionId
 */
export async function refillPrescription(prescriptionId) {
  const response = await apiClient.post(`/medical/prescriptions/${prescriptionId}/refill`);
  return response.data;
}

// =============================================================================
// Referrals
// =============================================================================

/**
 * List referrals.
 * @param {{ status?: string, urgency?: string, patient_id?: string, limit?: number, offset?: number }} params
 */
export async function listReferrals(params = {}) {
  const response = await apiClient.get('/medical/referrals', { params });
  return response.data;
}

/**
 * Get pending referrals.
 */
export async function getPendingReferrals() {
  const response = await apiClient.get('/medical/referrals/pending');
  return response.data;
}

/**
 * Get a single referral by ID.
 * @param {string} referralId
 */
export async function getReferral(referralId) {
  const response = await apiClient.get(`/medical/referrals/${referralId}`);
  return response.data;
}

/**
 * Create a new referral.
 * @param {object} data
 */
export async function createReferral(data) {
  const response = await apiClient.post('/medical/referrals', data);
  return response.data;
}

/**
 * Update a referral.
 * @param {string} referralId
 * @param {object} data
 */
export async function updateReferral(referralId, data) {
  const response = await apiClient.patch(`/medical/referrals/${referralId}`, data);
  return response.data;
}

// =============================================================================
// Lab Results
// =============================================================================

/**
 * List lab results.
 * @param {{ status?: string, patient_id?: string, test_type?: string, limit?: number, offset?: number }} params
 */
export async function listLabResults(params = {}) {
  const response = await apiClient.get('/medical/labs', { params });
  return response.data;
}

/**
 * Get abnormal lab results.
 */
export async function getAbnormalLabResults() {
  const response = await apiClient.get('/medical/labs/abnormal');
  return response.data;
}

/**
 * Get a single lab result by ID.
 * @param {string} labId
 */
export async function getLabResult(labId) {
  const response = await apiClient.get(`/medical/labs/${labId}`);
  return response.data;
}

/**
 * Create a new lab result.
 * @param {object} data
 */
export async function createLabResult(data) {
  const response = await apiClient.post('/medical/labs', data);
  return response.data;
}

/**
 * Update a lab result.
 * @param {string} labId
 * @param {object} data
 */
export async function updateLabResult(labId, data) {
  const response = await apiClient.patch(`/medical/labs/${labId}`, data);
  return response.data;
}

/**
 * Review a lab result.
 * @param {string} labId
 * @param {string} notes
 */
export async function reviewLabResult(labId, notes = null) {
  const response = await apiClient.post(`/medical/labs/${labId}/review`, {}, {
    params: notes ? { notes } : {}
  });
  return response.data;
}

// =============================================================================
// Providers
// =============================================================================

/**
 * List providers.
 * @param {{ status?: string, specialty?: string, department?: string, limit?: number, offset?: number }} params
 */
export async function listProviders(params = {}) {
  const response = await apiClient.get('/medical/providers', { params });
  return response.data;
}

/**
 * Get a single provider by ID.
 * @param {string} providerId
 */
export async function getProvider(providerId) {
  const response = await apiClient.get(`/medical/providers/${providerId}`);
  return response.data;
}

/**
 * Get provider schedule.
 * @param {string} providerId
 * @param {{ date_from?: string, date_to?: string }} params
 */
export async function getProviderSchedule(providerId, params = {}) {
  const response = await apiClient.get(`/medical/providers/${providerId}/schedule`, { params });
  return response.data;
}

/**
 * Create a new provider.
 * @param {object} data
 */
export async function createProvider(data) {
  const response = await apiClient.post('/medical/providers', data);
  return response.data;
}

/**
 * Update a provider.
 * @param {string} providerId
 * @param {object} data
 */
export async function updateProvider(providerId, data) {
  const response = await apiClient.patch(`/medical/providers/${providerId}`, data);
  return response.data;
}

// =============================================================================
// Analytics
// =============================================================================

/**
 * Get patient volume analytics.
 * @param {number} periodMonths
 */
export async function getPatientVolume(periodMonths = 12) {
  const response = await apiClient.get('/medical/analytics/patient-volume', {
    params: { period_months: periodMonths }
  });
  return response.data;
}

/**
 * Get appointment statistics.
 * @param {number} periodMonths
 */
export async function getAppointmentStats(periodMonths = 12) {
  const response = await apiClient.get('/medical/analytics/appointment-stats', {
    params: { period_months: periodMonths }
  });
  return response.data;
}

/**
 * Get provider utilization.
 * @param {number} periodDays
 */
export async function getProviderUtilization(periodDays = 30) {
  const response = await apiClient.get('/medical/analytics/provider-utilization', {
    params: { period_days: periodDays }
  });
  return response.data;
}
