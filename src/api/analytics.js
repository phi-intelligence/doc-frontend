import apiClient from './index';

/**
 * Get dashboard data for a module: counts and recent activity.
 * @param {string} module - hr | finance | legal | marketing
 * @param {{ days?: number, limit?: number }} params - optional
 */
export async function getDashboard(module, params = {}) {
  const { days = 30, limit = 20 } = params;
  const response = await apiClient.get('/analytics/dashboard', {
    params: { module, days, limit },
  });
  return response.data;
}
