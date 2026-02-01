/**
 * Company Registration API client
 */
import apiClient from './index';

/**
 * Start company registration by scraping website
 * @param {string} websiteUrl - Company website URL to scrape
 * @returns {Promise<{session_id: string, org_id: string}>}
 */
export async function startRegistration(websiteUrl) {
  const response = await apiClient.post('/company/register/start', {
    website_url: websiteUrl
  });
  return response.data;
}

/**
 * Get registration status and profile preview
 * @param {string} orgId - Organization ID
 * @returns {Promise<{org_id: string, status: string, profile: object, scraped_pages: number, error: string|null}>}
 */
export async function getRegistrationStatus(orgId) {
  const response = await apiClient.get(`/company/register/status/${orgId}`);
  return response.data;
}

/**
 * Finalize registration with module selection
 * @param {string} orgId - Organization ID
 * @param {string[]} enabledModules - Array of enabled module IDs
 * @param {string} [orgName] - Optional organization name override
 * @param {string} [userEmail] - Optional user email (if not logged in)
 * @param {string} [userPassword] - Optional user password (if not logged in)
 * @returns {Promise<{success: boolean, org_id: string, token: string, user: object, redirect_url: string}>}
 */
export async function finalizeRegistration(orgId, enabledModules, orgName = null, userEmail = null, userPassword = null) {
  const response = await apiClient.post('/company/register/finalize', {
    org_id: orgId,
    enabled_modules: enabledModules,
    org_name: orgName,
    user_email: userEmail,
    user_password: userPassword
  });
  return response.data;
}

/**
 * Get available modules for selection
 * @returns {Promise<{modules: Array<{id: string, name: string, description: string, icon: string, color: string, features: string[]}>}>}
 */
export async function getAvailableModules() {
  const response = await apiClient.get('/company/modules');
  return response.data;
}

/**
 * Register company with manually entered profile data
 * @param {object} profileData - Company profile data
 * @param {string} profileData.name - Company name (required)
 * @param {string} [profileData.description] - Company description
 * @param {string} [profileData.tagline] - Company tagline
 * @param {string} [profileData.website] - Company website URL
 * @param {string} [profileData.logo_base64] - Base64 encoded logo image
 * @param {object} [profileData.contact_info] - Contact info {emails: [], phones: [], addresses: []}
 * @param {object} [profileData.social_links] - Social links {linkedin: url, twitter: url, ...}
 * @param {string} [profileData.industry] - Industry/sector
 * @returns {Promise<{org_id: string, profile: object}>}
 */
export async function registerManual(profileData) {
  const response = await apiClient.post('/company/register/manual', profileData);
  return response.data;
}
