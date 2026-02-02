import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ALLOWED_MODULES = ['hr', 'finance', 'legal', 'marketing', 'insurance', 'medical'];

/**
 * For module users (user.module in hr|finance|legal|marketing|insurance|medical), allow only:
 * - /app (index)
 * - /app/chat
 * - /app/{user.module} and /app/{user.module}/*
 * Any other path redirects to /app/{user.module}.
 * Admin or users without module see all routes (no redirect).
 */
export default function ModuleRouteGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname || '';

  const isAdmin = user?.role === 'admin';
  const module = user?.module;

  if (isAdmin || !module || !ALLOWED_MODULES.includes(module)) {
    return children;
  }

  const base = '/app';
  const chatPath = '/app/chat';
  const modulePrefix = `${base}/${module}`;

  const isAppIndex = pathname === base || pathname === base + '/';
  const isChat = pathname === chatPath || pathname.startsWith(chatPath + '/');
  const isOwnModule = pathname === modulePrefix || pathname.startsWith(modulePrefix + '/');

  if (isAppIndex || isChat || isOwnModule) {
    return children;
  }

  return <Navigate to={modulePrefix} replace />;
}
