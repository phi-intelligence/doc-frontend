import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, ChevronRight, User, FileText } from 'lucide-react';

/**
 * ApprovalQueue - A reusable component for displaying approval requests
 */
const ApprovalQueue = ({
  title = 'Pending Approvals',
  items = [],
  onApprove,
  onReject,
  onView,
  emptyMessage = 'No pending approvals',
  showActions = true,
  maxItems = 5
}) => {
  const displayItems = items.slice(0, maxItems);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResourceIcon = (resourceType) => {
    switch (resourceType) {
      case 'offer_letter':
      case 'contract':
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-light-border p-6">
        <h3 className="text-sm font-bold text-light-text mb-4">{title}</h3>
        <div className="text-center py-8 text-light-text-secondary text-sm">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-light-border overflow-hidden">
      <div className="p-4 border-b border-light-border flex items-center justify-between">
        <h3 className="text-sm font-bold text-light-text">{title}</h3>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600">
          {items.length} pending
        </span>
      </div>

      <div className="divide-y divide-light-border">
        {displayItems.map((item, index) => {
          const ResourceIcon = getResourceIcon(item.resource_type);

          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-light-sidebar/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-accent-50 border border-brand-accent-100 flex items-center justify-center flex-shrink-0">
                  <ResourceIcon className="w-4 h-4 text-brand-accent-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-light-text truncate">
                      {item.title || item.resource_type}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {item.requester && (
                    <div className="flex items-center gap-1 text-xs text-light-text-secondary mb-1">
                      <User className="w-3 h-3" />
                      <span>Requested by {item.requester}</span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-light-text-secondary truncate">
                      {item.description}
                    </p>
                  )}

                  {item.created_at && (
                    <div className="text-xs text-light-text-secondary mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {showActions && item.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove?.(item)}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onReject?.(item)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {onView && (
                  <button
                    onClick={() => onView(item)}
                    className="p-2 rounded-lg hover:bg-light-sidebar transition-colors text-light-text-secondary"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {items.length > maxItems && (
        <div className="p-3 border-t border-light-border text-center">
          <button className="text-xs font-bold text-brand-accent-600 hover:text-brand-accent-700 transition-colors">
            View all {items.length} requests
          </button>
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;
