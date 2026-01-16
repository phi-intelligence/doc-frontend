import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import QueryProvider from './providers/QueryProvider';

// Import layouts
import DefaultLayout from './layouts/DefaultLayout';
import MainLayout from './layouts/MainLayout';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';
import ProductPhotographyPage from './pages/ProductPhotographyPage';
import DesignGenerationPage from './pages/DesignGenerationPage';
import VirtualModelPageStandalone from './pages/VirtualModelPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/home/DashboardPage';
import BusinessProfilePage from './pages/home/BusinessProfilePage';
import AnalyticsPage from './pages/home/AnalyticsPage';
import SettingsPage from './pages/home/SettingsPage';
import DesignStudioPage from './pages/home/DesignStudioPage';
import AIGenerationPage from './pages/home/AIGenerationPage';
import ImageGenerationPage from './pages/home/ImageGenerationPage';
import QuoteGenerationPage from './pages/home/QuoteGenerationPage';
import ContentGenerationPage from './pages/home/ContentGenerationPage';
import TextImageGenerationPage from './pages/home/TextImageGenerationPage';
import ProductDesignPage from './pages/home/ProductDesignPage';
import FlatLayPage from './pages/home/FlatLayPage';
import ProductStagingPage from './pages/home/ProductStagingPage';
import GhostMannequinPage from './pages/home/GhostMannequinPage';
import VirtualTryOnPage from './pages/home/VirtualTryOnPage';
import VirtualModelPage from './pages/home/VirtualModelPage';
import AgentPage from './pages/home/AgentPage';
import PublishPage from './pages/home/PublishPage';
import CalendarPage from './pages/home/CalendarPage';
import PhotoEditorPage from './pages/home/PhotoEditorPage';
import VideoEditorPage from './pages/home/VideoEditorPage';

import './index.css';

/**
 * App - Main application component with routing
 */
const App = () => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Default Layout Routes (Landing, Auth) */}
            <Route element={<DefaultLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Main Layout Routes (Features) */}
            <Route element={<MainLayout />}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/agent" element={<AgentPage />} />
              <Route path="/product-photography" element={<ProductPhotographyPage />} />
              <Route path="/design-generation" element={<DesignGenerationPage />} />
              <Route path="/virtual-model" element={<VirtualModelPageStandalone />} />
            </Route>

            {/* Home Layout Routes (Dashboard with Sidebar) */}
            <Route path="/home" element={<HomePage />}>
              <Route index element={<DashboardPage />} />
              <Route path="dashboard" element={<Navigate to="/home" replace />} />
              <Route path="business-profile" element={<BusinessProfilePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="design-studio" element={<DesignStudioPage />} />
              <Route path="ai-generation" element={<AIGenerationPage />} />
              <Route path="image-generation" element={<ImageGenerationPage />} />
              <Route path="quote-generation" element={<QuoteGenerationPage />} />
              <Route path="content-generation" element={<ContentGenerationPage />} />
              <Route path="text-image-generation" element={<TextImageGenerationPage />} />
              <Route path="product-design" element={<ProductDesignPage />} />
              <Route path="flat-lay" element={<FlatLayPage />} />
              <Route path="product-staging" element={<ProductStagingPage />} />
              <Route path="ghost-mannequin" element={<GhostMannequinPage />} />
              <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
              <Route path="virtual-model" element={<VirtualModelPage />} />
              <Route path="publish" element={<PublishPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="photo-editor" element={<PhotoEditorPage />} />
              <Route path="video-editor" element={<VideoEditorPage />} />
            </Route>

            {/* Connect - Redirect to chat with connect skill */}
            <Route path="/connect" element={<Navigate to="/chat?skill=connect" replace />} />

            {/* Fallback - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  );
};

export default App;
