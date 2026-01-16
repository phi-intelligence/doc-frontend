import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRAGStatus,
  indexDocument,
  queryDocuments,
  removeDocument,
} from '../../api/rag';
import { showSuccess, showError } from '../../utils/toast';

/**
 * Query for RAG service status
 */
export const useRAGStatus = (sessionId) => {
  return useQuery({
    queryKey: ['rag', 'status', sessionId],
    queryFn: () => getRAGStatus(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Mutation to index a document for RAG
 */
export const useIndexDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filename, sessionId }) => indexDocument(filename, sessionId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'status', variables.sessionId] });
      showSuccess(`Document "${variables.filename}" indexed successfully`);
    },
    onError: (error, variables) => {
      showError(
        error.response?.data?.detail ||
          `Failed to index document "${variables.filename}"`
      );
    },
  });
};

/**
 * Query to search documents using RAG
 */
export const useQueryDocuments = (query, sessionId, topK = 5) => {
  return useQuery({
    queryKey: ['rag', 'query', sessionId, query, topK],
    queryFn: () => queryDocuments(query, sessionId, topK),
    enabled: !!query && !!sessionId && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Mutation to remove a document from RAG index
 */
export const useRemoveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filename, sessionId }) => removeDocument(filename, sessionId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rag', 'status', variables.sessionId] });
      showSuccess(`Document "${variables.filename}" removed from index`);
    },
    onError: (error, variables) => {
      showError(
        error.response?.data?.detail ||
          `Failed to remove document "${variables.filename}"`
      );
    },
  });
};

