import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * DashboardHeader - A header component with breadcrumbs and actions
 */
const DashboardHeader = ({ title, description, breadcrumbs = [], actions = [] }) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-light-text-secondary mb-4">
        <Link to="/app/dashboard" className="hover:text-brand-accent-600 transition-colors flex items-center gap-1">
          <Home className="w-3 h-3" />
          Dashboard
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <Link 
              to={crumb.to} 
              className={`hover:text-brand-accent-600 transition-colors ${
                index === breadcrumbs.length - 1 ? 'text-brand-accent-600' : ''
              }`}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-light-text tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 text-light-text-secondary max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2 ${
                  action.variant === 'primary'
                    ? 'bg-brand-accent-600 text-white hover:bg-brand-accent-700 shadow-md shadow-brand-accent-100'
                    : 'bg-white text-light-text border border-light-border hover:bg-light-sidebar'
                }`}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
