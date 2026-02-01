import apiClient from './index';

/**
 * Get aggregated finance dashboard data
 */
export async function getFinanceDashboard() {
  const response = await apiClient.get('/finance/dashboard');
  return response.data;
}

/**
 * List finance reports
 */
export async function listReports(params = {}) {
  const response = await apiClient.get('/finance/reports', { params });
  return response.data;
}

/**
 * Get report statistics
 */
export async function getReportStats() {
  const response = await apiClient.get('/finance/reports/stats');
  return response.data;
}

/**
 * Get single report by ID
 */
export async function getReport(reportId) {
  const response = await apiClient.get(`/finance/reports/${reportId}`);
  return response.data;
}

/**
 * Ingest files for report generation
 */
export async function ingestReport(files, title) {
  const formData = new FormData();
  if (title) {
    formData.append('title', title);
  }
  files.forEach(file => {
    formData.append('files', file);
  });
  const response = await apiClient.post('/finance/reports/ingest', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}

/**
 * List budget approvals
 */
export async function listBudgetApprovals(params = {}) {
  const response = await apiClient.get('/finance/budget-approvals', { params });
  return response.data;
}

/**
 * Get single budget approval
 */
export async function getBudgetApproval(approvalId) {
  const response = await apiClient.get(`/finance/budget-approvals/${approvalId}`);
  return response.data;
}

/**
 * Create budget approval
 */
export async function createBudgetApproval(data) {
  const response = await apiClient.post('/finance/budget-approvals', data);
  return response.data;
}

/**
 * Update budget approval (approve/reject)
 */
export async function updateBudgetApproval(approvalId, data) {
  const response = await apiClient.patch(`/finance/budget-approvals/${approvalId}`, data);
  return response.data;
}

/**
 * List compensation bands
 */
export async function listCompensationBands(params = {}) {
  const response = await apiClient.get('/finance/compensation', { params });
  return response.data;
}

/**
 * Get single compensation band
 */
export async function getCompensationBand(bandId) {
  const response = await apiClient.get(`/finance/compensation/${bandId}`);
  return response.data;
}

/**
 * List payroll batches
 */
export async function listPayrollBatches(params = {}) {
  const response = await apiClient.get('/finance/payroll', { params });
  return response.data;
}

/**
 * Export payroll batch
 */
export async function exportPayrollBatch(batchId, format = 'csv') {
  const response = await apiClient.post(`/finance/payroll/${batchId}/export`, { format });
  return response.data;
}
