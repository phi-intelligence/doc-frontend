import apiClient from './index';

// =============================================================================
// Dashboard
// =============================================================================

/**
 * Get insurance dashboard aggregate data.
 */
export async function getInsuranceDashboard() {
  const response = await apiClient.get('/insurance/dashboard');
  return response.data;
}

// =============================================================================
// Policies
// =============================================================================

/**
 * List insurance policies.
 * @param {{ status?: string, policy_type?: string, limit?: number, offset?: number }} params
 */
export async function listPolicies(params = {}) {
  const response = await apiClient.get('/insurance/policies', { params });
  return response.data;
}

/**
 * Get a single policy by ID.
 * @param {string} policyId
 */
export async function getPolicy(policyId) {
  const response = await apiClient.get(`/insurance/policies/${policyId}`);
  return response.data;
}

/**
 * Create a new policy.
 * @param {object} data
 */
export async function createPolicy(data) {
  const response = await apiClient.post('/insurance/policies', data);
  return response.data;
}

/**
 * Update a policy.
 * @param {string} policyId
 * @param {object} data
 */
export async function updatePolicy(policyId, data) {
  const response = await apiClient.patch(`/insurance/policies/${policyId}`, data);
  return response.data;
}

/**
 * Get policy statistics.
 */
export async function getPolicyStats() {
  const response = await apiClient.get('/insurance/policies/stats');
  return response.data;
}

/**
 * Get expiring policies.
 * @param {number} days - Days ahead to check (default 30)
 */
export async function getExpiringPolicies(days = 30) {
  const response = await apiClient.get('/insurance/policies/expiring', { params: { days } });
  return response.data;
}

// =============================================================================
// Claims
// =============================================================================

/**
 * List insurance claims.
 * @param {{ status?: string, claim_type?: string, policy_id?: string, limit?: number, offset?: number }} params
 */
export async function listClaims(params = {}) {
  const response = await apiClient.get('/insurance/claims', { params });
  return response.data;
}

/**
 * Get a single claim by ID.
 * @param {string} claimId
 */
export async function getClaim(claimId) {
  const response = await apiClient.get(`/insurance/claims/${claimId}`);
  return response.data;
}

/**
 * Create a new claim.
 * @param {object} data
 */
export async function createClaim(data) {
  const response = await apiClient.post('/insurance/claims', data);
  return response.data;
}

/**
 * Update a claim.
 * @param {string} claimId
 * @param {object} data
 */
export async function updateClaim(claimId, data) {
  const response = await apiClient.patch(`/insurance/claims/${claimId}`, data);
  return response.data;
}

/**
 * Approve a claim.
 * @param {string} claimId
 * @param {{ amount_approved?: number, adjuster_notes?: string }} data
 */
export async function approveClaim(claimId, data) {
  const response = await apiClient.post(`/insurance/claims/${claimId}/approve`, data);
  return response.data;
}

/**
 * Deny a claim.
 * @param {string} claimId
 * @param {{ denial_reason: string, adjuster_notes?: string }} data
 */
export async function denyClaim(claimId, data) {
  const response = await apiClient.post(`/insurance/claims/${claimId}/deny`, data);
  return response.data;
}

/**
 * Get claim statistics.
 */
export async function getClaimStats() {
  const response = await apiClient.get('/insurance/claims/stats');
  return response.data;
}

// =============================================================================
// Underwriting
// =============================================================================

/**
 * List underwriting cases.
 * @param {{ status?: string, policy_type?: string, limit?: number, offset?: number }} params
 */
export async function listUnderwritingCases(params = {}) {
  const response = await apiClient.get('/insurance/underwriting', { params });
  return response.data;
}

/**
 * Get underwriting queue.
 */
export async function getUnderwritingQueue() {
  const response = await apiClient.get('/insurance/underwriting/queue');
  return response.data;
}

/**
 * Get a single underwriting case by ID.
 * @param {string} caseId
 */
export async function getUnderwritingCase(caseId) {
  const response = await apiClient.get(`/insurance/underwriting/${caseId}`);
  return response.data;
}

/**
 * Create a new underwriting case.
 * @param {object} data
 */
export async function createUnderwritingCase(data) {
  const response = await apiClient.post('/insurance/underwriting', data);
  return response.data;
}

/**
 * Make underwriting decision.
 * @param {string} caseId
 * @param {{ decision: string, risk_score?: number, conditions?: string, notes?: string }} data
 */
export async function makeUnderwritingDecision(caseId, data) {
  const response = await apiClient.post(`/insurance/underwriting/${caseId}/decision`, data);
  return response.data;
}

// =============================================================================
// Renewals
// =============================================================================

/**
 * List renewals.
 * @param {{ status?: string, limit?: number, offset?: number }} params
 */
export async function listRenewals(params = {}) {
  const response = await apiClient.get('/insurance/renewals', { params });
  return response.data;
}

/**
 * Get upcoming renewals.
 * @param {number} days - Days ahead to check (default 30)
 */
export async function getUpcomingRenewals(days = 30) {
  const response = await apiClient.get('/insurance/renewals/upcoming', { params: { days } });
  return response.data;
}

/**
 * Send renewal reminder.
 * @param {string} renewalId
 * @param {string} reminderType - '30d' or '7d'
 */
export async function sendRenewalReminder(renewalId, reminderType) {
  const response = await apiClient.post(
    `/insurance/renewals/${renewalId}/send-reminder`,
    {},
    { params: { reminder_type: reminderType } }
  );
  return response.data;
}

/**
 * Process renewal.
 * @param {string} renewalId
 * @param {string} action - 'accept' or 'decline'
 * @param {object} data
 */
export async function processRenewal(renewalId, action, data = {}) {
  const response = await apiClient.post(
    `/insurance/renewals/${renewalId}/process`,
    data,
    { params: { action } }
  );
  return response.data;
}

// =============================================================================
// Agents
// =============================================================================

/**
 * List agents.
 * @param {{ status?: string, limit?: number, offset?: number }} params
 */
export async function listAgents(params = {}) {
  const response = await apiClient.get('/insurance/agents', { params });
  return response.data;
}

/**
 * Get a single agent by ID.
 * @param {string} agentId
 */
export async function getAgent(agentId) {
  const response = await apiClient.get(`/insurance/agents/${agentId}`);
  return response.data;
}

/**
 * Get agent performance metrics.
 * @param {string} agentId
 */
export async function getAgentPerformance(agentId) {
  const response = await apiClient.get(`/insurance/agents/${agentId}/performance`);
  return response.data;
}

/**
 * Create a new agent.
 * @param {object} data
 */
export async function createAgent(data) {
  const response = await apiClient.post('/insurance/agents', data);
  return response.data;
}

/**
 * Update an agent.
 * @param {string} agentId
 * @param {object} data
 */
export async function updateAgent(agentId, data) {
  const response = await apiClient.patch(`/insurance/agents/${agentId}`, data);
  return response.data;
}

// =============================================================================
// Analytics
// =============================================================================

/**
 * Get claims ratio analytics.
 * @param {number} periodMonths
 */
export async function getClaimsRatio(periodMonths = 12) {
  const response = await apiClient.get('/insurance/analytics/claims-ratio', {
    params: { period_months: periodMonths }
  });
  return response.data;
}

/**
 * Get premium revenue analytics.
 * @param {number} periodMonths
 */
export async function getPremiumRevenue(periodMonths = 12) {
  const response = await apiClient.get('/insurance/analytics/premium-revenue', {
    params: { period_months: periodMonths }
  });
  return response.data;
}

/**
 * Get risk distribution analytics.
 */
export async function getRiskDistribution() {
  const response = await apiClient.get('/insurance/analytics/risk-distribution');
  return response.data;
}
