import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * Main layout for feature pages (chat, design, etc.)
 * Provides basic structure - pages can manage their own Header/Sidebar if needed
 */
const MainLayout = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-bg' : 'bg-light-bg'} transition-colors duration-300`}>
      {/* Page Content */}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
