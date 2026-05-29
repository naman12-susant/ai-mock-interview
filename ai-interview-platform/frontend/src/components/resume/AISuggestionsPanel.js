import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const AISuggestionsPanel = ({ suggestions = [] }) => {
  if (!suggestions || suggestions.length === 0) return null;

  const priorityConfig = {
    high: { label: 'HIGH', border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-900/10', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    medium: { label: 'MED', border: 'border-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    low: { label: 'LOW', border: 'border-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" /> AI Suggestions
        <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full">{suggestions.length}</span>
      </h2>
      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const cfg = priorityConfig[s.priority] || priorityConfig.low;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-xl border-l-4 ${cfg.border} ${cfg.bg}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${cfg.badge}`}>{cfg.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.category}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.suggestion}</p>
              {s.impact && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium">Impact:</span> {s.impact}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AISuggestionsPanel;
