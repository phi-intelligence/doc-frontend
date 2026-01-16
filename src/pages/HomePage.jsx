import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/home/Sidebar';
import { useTheme } from '../context/ThemeContext';

/**
 * Home Page - Main dashboard with sidebar navigation
 */
const HomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`flex h-screen w-full ${isDark ? 'bg-dark-bg' : 'bg-light-bg'} overflow-hidden`}>
      {/* Sidebar */}
      <Sidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* Main Content Area - Width adjusts automatically with flex */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

