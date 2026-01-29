/**
 * Shared workspace utilities (ChatPage + UnifiedSectionEditor).
 * Keep this file UI-free to prevent feature drift across workspaces.
 */

export function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = String(text || '').match(urlRegex);
  return matches || [];
}

export function isValidUrl(url) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeWorkspaceFile(file, getFileUrl, getPreviewUrl) {
  if (!file?.filename) return null;
  const type = file.type || file.filename.split('.').pop().toUpperCase();
  return {
    ...file,
    type,
    url: file.url?.startsWith('/api') ? file.url : getFileUrl(file.filename),
    previewUrl: file.previewUrl?.startsWith('/api') ? file.previewUrl : (file.previewUrl || getPreviewUrl(file.filename))
  };
}

export function uniqueByFilename(files) {
  const seen = new Set();
  const out = [];
  for (const f of files || []) {
    if (!f?.filename) continue;
    if (seen.has(f.filename)) continue;
    seen.add(f.filename);
    out.push(f);
  }
  return out;
}

