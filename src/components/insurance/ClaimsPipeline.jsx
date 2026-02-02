import React from 'react';
import { TrendingUp, Clock, Search, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const ClaimsPipeline = ({ claimsByStatus, onStageClick }) => {
  const stages = [
    { key: 'submitted', label: 'Submitted', icon: Clock, color: 'bg-blue-500' },
    { key: 'under_review', label: 'Under Review', icon: Search, color: 'bg-amber-500' },
    { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'bg-green-500' },
    { key: 'denied', label: 'Denied', icon: XCircle, color: 'bg-red-500' },
    { key: 'paid', label: 'Paid', icon: DollarSign, color: 'bg-emerald-600' },
  ];

  const total = Object.values(claimsByStatus || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="bg-white rounded-xl border border-light-border p-6">
      <h3 className="text-sm font-bold text-light-text mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cyan-600" />
        Claims Pipeline
      </h3>
      <div className="space-y-4">
        {stages.map((stage, idx) => {
          const count = claimsByStatus?.[stage.key] || 0;
          const percent = (count / total) * 100;
          const Icon = stage.icon;
          
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onStageClick?.(stage.key)}
              className={`space-y-2 ${onStageClick ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${stage.color.replace('bg-', 'text-')}`} />
                  <span className="text-sm text-gray-700">{stage.label}</span>
                </div>
                <span className="font-bold text-gray-800">{count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`h-full ${stage.color} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total Claims</span>
          <span className="font-bold text-gray-800">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default ClaimsPipeline;
