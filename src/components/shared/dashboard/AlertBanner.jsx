import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X, ChevronRight } from 'lucide-react';

/**
 * AlertBanner - A component for displaying compliance alerts and warnings
 */
const AlertBanner = ({
  alerts = [],
  onDismiss,
  onAction,
  dismissible = true,
  maxAlerts = 3,
  className = ''
}) => {
  const displayAlerts = alerts.slice(0, maxAlerts);

  const getAlertConfig = (type) => {
    switch (type) {
      case 'error':
      case 'critical':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          textColor: 'text-amber-800'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800'
        };
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {displayAlerts.map((alert, index) => {
          const config = getAlertConfig(alert.type);
          const Icon = config.icon;

          return (
            <motion.div
              key={alert.id || index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 relative`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${config.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-bold ${config.textColor}`}>
                      {alert.title}
                    </h4>
                    {alert.count && alert.count > 1 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                        {alert.count} items
                      </span>
                    )}
                  </div>

                  <p className={`text-sm ${config.textColor} opacity-80`}>
                    {alert.message}
                  </p>

                  {alert.items && alert.items.length > 0 && (
                    <ul className={`mt-2 space-y-1 text-sm ${config.textColor} opacity-80`}>
                      {alert.items.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-current" />
                          {item}
                        </li>
                      ))}
                      {alert.items.length > 3 && (
                        <li className="text-xs opacity-70">
                          +{alert.items.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}

                  {alert.action && (
                    <button
                      onClick={() => onAction?.(alert)}
                      className={`mt-3 inline-flex items-center gap-1 text-sm font-bold ${config.textColor} hover:opacity-80 transition-opacity`}
                    >
                      {alert.action.label}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {dismissible && onDismiss && (
                  <button
                    onClick={() => onDismiss(alert)}
                    className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${config.textColor}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {alerts.length > maxAlerts && (
        <div className="text-center">
          <button className="text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700 transition-colors">
            View all {alerts.length} alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertBanner;
