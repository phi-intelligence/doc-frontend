/**
 * Artifact utility functions for file type categorization and handling
 */

export const FILE_CATEGORIES = {
  markdown: ['md'],
  code: ['js', 'jsx', 'ts', 'tsx', 'py', 'json', 'html', 'css', 'txt'],
  pdf: ['pdf'],
  office: ['docx', 'doc', 'pptx', 'ppt'],
  spreadsheet: ['xlsx', 'xls'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
  mermaid: ['mermaid']
};

/**
 * Get file category from file extension
 * @param {string} fileType - File type/extension (e.g., 'md', 'pdf', 'docx')
 * @returns {string|null} Category name or null if not found
 */
export const getFileCategory = (fileType) => {
  if (!fileType) return null;
  const ext = fileType.toLowerCase();
  
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return null;
};

/**
 * Check if file type supports code view (Preview/Code tabs)
 * @param {string} fileType - File type/extension
 * @returns {boolean} True if file supports code view
 */
export const hasCodeView = (fileType) => {
  const category = getFileCategory(fileType);
  return ['markdown', 'code', 'mermaid'].includes(category);
};

/**
 * Check if file type is text-based (can fetch raw content)
 * @param {string} fileType - File type/extension
 * @returns {boolean} True if file is text-based
 */
export const isTextBased = (fileType) => {
  const category = getFileCategory(fileType);
  return ['markdown', 'code', 'mermaid'].includes(category);
};

/**
 * Get language name for syntax highlighting
 * @param {string} fileType - File type/extension
 * @returns {string} Language name for prism
 */
export const getLanguageFromType = (fileType) => {
  if (!fileType) return 'text';
  const ext = fileType.toLowerCase();
  
  const languageMap = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'md': 'markdown',
    'txt': 'text',
    'mermaid': 'mermaid'
  };
  
  return languageMap[ext] || 'text';
};

