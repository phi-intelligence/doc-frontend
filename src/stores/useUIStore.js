import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * UI Store - Manages UI-only state (no server data)
 * Persists sidebar state to localStorage
 */
const useUIStore = create(
  persist(
    (set) => ({
      // Sidebar state
      sidebarCollapsed: false,
      rightSidebarCollapsed: true,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setRightSidebarCollapsed: (collapsed) => set({ rightSidebarCollapsed: collapsed }),

      // Active artifact selection (UI state)
      activeArtifact: null,
      setActiveArtifact: (artifact) => set({ activeArtifact: artifact }),

      // Preview state
      currentPage: 1,
      setCurrentPage: (page) => set({ currentPage: page }),
      totalPages: null,
      setTotalPages: (pages) => set({ totalPages: pages }),
      documentPreviewLoading: false,
      setDocumentPreviewLoading: (loading) => set({ documentPreviewLoading: loading }),
      videoLoadError: false,
      setVideoLoadError: (error) => set({ videoLoadError: error }),

      // Web mode toggle
      webModeEnabled: false,
      toggleWebMode: () => set((state) => ({ webModeEnabled: !state.webModeEnabled })),
      setWebModeEnabled: (enabled) => set({ webModeEnabled: enabled }),

      // Artifact content (cached for preview)
      artifactContent: null,
      setArtifactContent: (content) => set({ artifactContent: content }),
      previewLoading: false,
      setPreviewLoading: (loading) => set({ previewLoading: loading }),
    }),
    {
      name: 'docflies-ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rightSidebarCollapsed: state.rightSidebarCollapsed,
      }),
    }
  )
);

export default useUIStore;

