/**
 * Templates API client.
 * GET /api/templates/samples?module=hr&limit=5 for dashboard sample blocks.
 */

const getBaseUrl = () => import.meta.env.VITE_API_URL || '';
const getAuthHeader = () => {
  try {
    const token = typeof localStorage !== 'undefined' && localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

/**
 * Fetch template samples for a module (hr, finance, legal, marketing).
 * @param {string} module - Module key: hr, finance, legal, marketing
 * @param {number} [limit=5] - Max number of templates to return
 * @returns {Promise<{ templates: Array<{ id, name, file_type, thumbnail_url, preview_description }> }>}
 */
export async function getTemplateSamples(module, limit = 5) {
  const params = new URLSearchParams({ module, limit: String(limit) });
  const res = await fetch(`${getBaseUrl()}/api/templates/samples?${params}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Templates samples failed: ${res.status}`);
  return res.json();
}

/**
 * List templates with optional filters (section, limit).
 * @param {Object} opts - { section?, limit?, file_type?, tags? }
 */
export async function listTemplates(opts = {}) {
  const params = new URLSearchParams();
  if (opts.section) params.set('section', opts.section);
  if (opts.limit != null) params.set('limit', String(opts.limit));
  if (opts.file_type) params.set('file_type', opts.file_type);
  if (opts.tags) params.set('tags', opts.tags);
  const qs = params.toString();
  const url = `${getBaseUrl()}/api/templates${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error(`List templates failed: ${res.status}`);
  return res.json();
}

/**
 * Use a template - copies template to workspace and returns the filename.
 * @param {string} templateId - Template ID
 * @param {string} [fileType] - File type (docx, xlsx, pptx) for extension
 * @param {string} [outputFilename] - Optional output filename (auto-generated if not provided)
 * @returns {Promise<{ status, message, file }>}
 */
export async function useTemplate(templateId, fileType = null, outputFilename = null) {
  // Generate filename if not provided
  if (!outputFilename) {
    const timestamp = Date.now();
    const ext = fileType ? `.${fileType.toLowerCase()}` : '';
    outputFilename = `template_${templateId}_${timestamp}${ext}`;
  }
  
  const params = new URLSearchParams({ output_filename: outputFilename });
  const res = await fetch(`${getBaseUrl()}/api/templates/${templateId}/use?${params}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Use template failed: ${res.status}`);
  return res.json();
}

/**
 * Get template details by ID.
 * @param {string} templateId - Template ID
 * @returns {Promise<{ id, name, description, file_type, ... }>}
 */
export async function getTemplate(templateId) {
  const res = await fetch(`${getBaseUrl()}/api/templates/${templateId}`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Get template failed: ${res.status}`);
  return res.json();
}
