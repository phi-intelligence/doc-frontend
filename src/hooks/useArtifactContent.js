import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/index';
import useUIStore from '../stores/useUIStore';
import { isTextBased } from '../utils/artifactUtils';

/**
 * Hook to fetch artifact content for text-based files
 * Uses TanStack Query for caching and loading states
 */
export const useArtifactContent = (activeArtifact) => {
  const { setArtifactContent, setPreviewLoading } = useUIStore();

  const ext = activeArtifact?.type?.toLowerCase();
  const isTextBasedFile = isTextBased(ext);

  const { data, isLoading } = useQuery({
    queryKey: ['artifactContent', activeArtifact?.url],
    queryFn: async () => {
      if (!activeArtifact?.url) return null;
      try {
        const res = await apiClient.get(activeArtifact.url);
        return typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2);
      } catch (error) {
        console.error('Failed to fetch artifact content:', error);
        return null;
      }
    },
    enabled: !!activeArtifact && isTextBasedFile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    retryDelay: 500,
  });

  useEffect(() => {
    if (activeArtifact) {
      if (isTextBasedFile) {
        setPreviewLoading(isLoading);
        setArtifactContent(data || null);
      } else {
        setArtifactContent(null);
        setPreviewLoading(false);
      }
    } else {
      setArtifactContent(null);
      setPreviewLoading(false);
    }
  }, [activeArtifact, data, isLoading, isTextBasedFile, setArtifactContent, setPreviewLoading]);

  return { content: data, isLoading };
};

