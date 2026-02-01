import apiClient from './index';

/**
 * List employees (org-scoped).
 */
export async function listEmployees() {
  const response = await apiClient.get('/hr/employees');
  return response.data;
}

/**
 * Seed demo employees for the current org. Uses builtin templates as demo docs.
 * If employees already exist, returns them as-is.
 */
export async function seedEmployees() {
  const response = await apiClient.post('/hr/employees/seed');
  return response.data;
}

/**
 * Get employee stats (total, active) for the current org.
 */
export async function getEmployeeStats() {
  const response = await apiClient.get('/hr/employees/stats');
  return response.data;
}

/**
 * HR compliance snapshot: expiring_soon, overdue_ack, missing_docs.
 */
export async function getComplianceSnapshot() {
  const response = await apiClient.get('/hr/compliance/snapshot');
  return response.data;
}

/**
 * List onboarding (candidate_packages).
 */
export async function listOnboarding() {
  const response = await apiClient.get('/hr/onboarding');
  return response.data;
}

/**
 * List approval requests.
 * @param {{ status?: string, resource_type?: string, limit?: number }} params
 */
export async function listApprovals(params = {}) {
  const response = await apiClient.get('/approvals', { params });
  return response.data;
}
