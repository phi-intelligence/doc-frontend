import apiClient from './index';

/**
 * List all available backend skills.
 * @returns {Promise<{skills:Array<{name:string,description:string,path:string}>,total:number}>}
 */
export async function listSkills() {
  const response = await apiClient.get('/skills');
  return response.data;
}

