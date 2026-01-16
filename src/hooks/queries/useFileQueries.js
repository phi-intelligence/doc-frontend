import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  uploadFile as uploadFileAPI,
  uploadFiles as uploadFilesAPI,
  listArtifacts,
  clearArtifacts as clearArtifactsAPI,
  clearUploads as clearUploadsAPI,
  enhanceWithImages as enhanceWithImagesAPI,
} from '../../api/files';
import { showSuccess, showError } from '../../utils/toast';

/**
 * Mutation to upload a single file
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, sessionId }) => uploadFileAPI(file, sessionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'uploaded'] });
      showSuccess(`File "${data.filename || 'uploaded'}" uploaded successfully`);
    },
    onError: (error) => {
      showError(error.response?.data?.detail || 'Failed to upload file');
    },
  });
};

/**
 * Mutation to upload multiple files
 */
export const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, sessionId }) => uploadFilesAPI(files, sessionId),
    onSuccess: (results) => {
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'uploaded'] });

      if (successful.length > 0) {
        showSuccess(`${successful.length} file(s) uploaded successfully`);
      }
      if (failed.length > 0) {
        showError(`${failed.length} file(s) failed to upload`);
      }
    },
    onError: (error) => {
      showError(error.response?.data?.detail || 'Failed to upload files');
    },
  });
};

/**
 * Query to list all artifacts
 */
export const useArtifacts = () => {
  return useQuery({
    queryKey: ['artifacts'],
    queryFn: async () => {
      try {
        const data = await listArtifacts();
        return data.artifacts || data || [];
      } catch (error) {
        console.error('Error fetching artifacts:', error);
        return [];
      }
    },
    staleTime: 0, // Always refetch artifacts
  });
};

/**
 * Mutation to clear all artifacts
 */
export const useClearArtifacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearArtifactsAPI,
    onSuccess: () => {
      queryClient.setQueryData(['artifacts'], []);
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      showSuccess('All artifacts cleared');
    },
    onError: (error) => {
      showError(error.response?.data?.detail || 'Failed to clear artifacts');
    },
  });
};

/**
 * Mutation to clear all uploads
 */
export const useClearUploads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearUploadsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'uploaded'] });
      showSuccess('All uploads cleared');
    },
    onError: (error) => {
      showError(error.response?.data?.detail || 'Failed to clear uploads');
    },
  });
};

/**
 * Mutation to enhance document with images
 */
export const useEnhanceWithImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filename, sessionId, imageStyle }) =>
      enhanceWithImagesAPI(filename, sessionId, imageStyle),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      showSuccess('Document enhanced with images');
    },
    onError: (error) => {
      showError(error.response?.data?.detail || 'Failed to enhance document');
    },
  });
};

