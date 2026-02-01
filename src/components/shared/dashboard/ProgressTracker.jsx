import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Clock } from 'lucide-react';

/**
 * ProgressTracker - A workflow stage visualization component
 */
const ProgressTracker = ({
  title = 'Progress',
  stages = [],
  currentStage = 0,
  items = [],
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  showCounts = true,
  className = ''
}) => {
  const getStageStatus = (stageIndex) => {
    if (stageIndex < currentStage) return 'completed';
    if (stageIndex === currentStage) return 'current';
    return 'upcoming';
  };

  const getStageCount = (stageName) => {
    if (!items || items.length === 0) return 0;
    return items.filter(item => item.stage === stageName || item.status === stageName).length;
  };

  const statusStyles = {
    completed: {
      circle: 'bg-green-600 border-green-600 text-white',
      line: 'bg-green-600',
      label: 'text-green-600 font-bold'
    },
    current: {
      circle: 'bg-brand-accent-600 border-brand-accent-600 text-white',
      line: 'bg-light-border',
      label: 'text-brand-accent-600 font-bold'
    },
    upcoming: {
      circle: 'bg-white border-light-border text-light-text-secondary',
      line: 'bg-light-border',
      label: 'text-light-text-secondary'
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`bg-white rounded-2xl border border-light-border p-5 ${className}`}>
        <h3 className="text-sm font-bold text-light-text mb-4">{title}</h3>

        <div className="space-y-4">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            const styles = statusStyles[status];
            const count = showCounts ? getStageCount(stage.key || stage.name) : null;
            const Icon = stage.icon || (status === 'completed' ? Check : Circle);

            return (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${styles.circle}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`w-0.5 h-8 ${styles.line}`} />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className={`text-sm ${styles.label}`}>
                    {stage.name}
                    {count !== null && count > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-light-sidebar text-xs">
                        {count}
                      </span>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-xs text-light-text-secondary mt-0.5">
                      {stage.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={`bg-white rounded-2xl border border-light-border p-5 ${className}`}>
      <h3 className="text-sm font-bold text-light-text mb-6">{title}</h3>

      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const status = getStageStatus(index);
          const styles = statusStyles[status];
          const count = showCounts ? getStageCount(stage.key || stage.name) : null;
          const Icon = stage.icon || (status === 'completed' ? Check : Circle);

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${styles.circle}`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                <div className={`mt-2 text-xs text-center ${styles.label}`}>
                  {stage.name}
                </div>

                {count !== null && (
                  <div className="mt-1 text-xs text-light-text-secondary">
                    {count} {count === 1 ? 'item' : 'items'}
                  </div>
                )}
              </div>

              {index < stages.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={`h-1 rounded-full ${statusStyles[getStageStatus(index)].line}`}>
                    {status === 'completed' && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-full bg-green-600 rounded-full"
                      />
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
