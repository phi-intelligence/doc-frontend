import apiClient from './index';

/**
 * Legal dashboard aggregate: pending_contract_reviews, active_legal_holds, dsar_*, policy_documents_count.
 */
export async function getLegalDashboard() {
  const response = await apiClient.get('/legal/dashboard');
  return response.data;
}

/**
 * List legal holds (read-only).
 */
export async function listLegalHolds(params = {}) {
  const response = await apiClient.get('/legal/legal-holds', { params });
  return response.data;
}

/**
 * List policy documents.
 */
export async function listPolicies(params = {}) {
  const response = await apiClient.get('/legal/policies', { params });
  return response.data;
}

/**
 * Get policy acknowledgement status (signed count + signed list).
 */
export async function getPolicyAcknowledgementStatus(policyId) {
  const response = await apiClient.get(`/legal/policies/${policyId}/acknowledgement-status`);
  return response.data;
}

/**
 * List DSAR requests.
 */
export async function listDsar() {
  const response = await apiClient.get('/legal/dsar');
  return response.data;
}

/**
 * Generate DSAR export (POST); returns export payload or file reference.
 */
export async function exportDsar(requestId) {
  const response = await apiClient.post(`/legal/dsar/${requestId}/export`);
  return response.data;
}
