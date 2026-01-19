import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import EditorPage from './pages/EditorPage';
import ProductPhotographyPage from './pages/ProductPhotographyPage';
import DesignGenerationPage from './pages/DesignGenerationPage';
import ContentGenerationPage from './pages/ContentGenerationPage';
import VirtualModelPage from './pages/VirtualModelPage';

import './index.css';

/**
 * App - Main application component with routing
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Tools Grid */}
        <Route path="/" element={<LandingPage />} />

        {/* Chatbot Interface - supports ?skill= query param */}
        <Route path="/chat" element={<ChatPage />} />

        {/* Dedicated Editor Interface */}
        <Route path="/editor" element={<EditorPage />} />

        {/* Digital Marketing Tools - Dedicated Pages */}
        <Route path="/product-photography" element={<ProductPhotographyPage />} />
        <Route path="/design-generation" element={<DesignGenerationPage />} />
        <Route path="/content-generation" element={<ContentGenerationPage />} />
        <Route path="/virtual-model" element={<VirtualModelPage />} />

        {/* Connect - Redirect to chat with connect skill */}
        <Route path="/connect" element={<Navigate to="/chat?skill=connect" replace />} />

        {/* Fallback - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
