import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const ATSChecker = ({ atsAnalysis }) => {
  if (!atsAnalysis) return null;
  const score = atsAnalysis.score || 0;
  const color = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
  const barColor = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-purple-500" /> ATS Optimization
      </h2>

      {/* ATS Score Bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">ATS Score</span>
          <span className={`text-sm font-bold ${color}`}>{score}/100</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
            transition={{ duration: 1.2 }} className={`h-3 rounded-full ${barColor}`} />
        </div>
      </div>

      <div className="space-y-4">
        {/* Keywords Present */}
        {atsAnalysis.keywords?.present?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">✅ Keywords Found</p>
            <div className="flex flex-wrap gap-1.5">
              {atsAnalysis.keywords.present.map((k, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-lg font-medium">{k}</span>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Missing */}
        {atsAnalysis.keywords?.missing?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">❌ Missing Keywords</p>
            <div className="flex flex-wrap gap-1.5">
              {atsAnalysis.keywords.missing.map((k, i) => (
                <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg font-medium">{k}</span>
              ))}
            </div>
          </div>
        )}

        {/* Formatting Issues */}
        {atsAnalysis.formatting?.issues?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">⚠️ Formatting Issues</p>
            <ul className="space-y-1">
              {atsAnalysis.formatting.issues.map((issue, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                  <span className="text-orange-500 mt-0.5">•</span> {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Verb Suggestions */}
        {atsAnalysis.actionVerbs?.suggestions?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">💪 Stronger Action Verbs</p>
            <div className="flex flex-wrap gap-1.5">
              {atsAnalysis.actionVerbs.suggestions.map((v, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-lg font-medium">{v}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ATSChecker;
