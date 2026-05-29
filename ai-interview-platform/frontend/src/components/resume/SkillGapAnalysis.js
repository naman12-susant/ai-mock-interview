import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SkillGapAnalysis = ({ gapAnalysis }) => {
  if (!gapAnalysis) return null;
  const { presentSkills = [], missingSkills = [], strengths = [], weaknesses = [] } = gapAnalysis;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-500" /> Skill Gap Analysis
      </h2>

      {/* Present Skills */}
      {presentSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Skills You Have ({presentSkills.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {presentSkills.map((s, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3 h-3" /> {s.skill}
                {s.proficiency && <span className="opacity-60 ml-1">· {s.proficiency}</span>}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <XCircle className="w-4 h-4" /> Missing Skills ({missingSkills.length})
          </h3>
          <div className="space-y-2">
            {missingSkills.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                  s.importance === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                  s.importance === 'important' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>{s.importance}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.skill}</p>
                  {s.reason && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.reason}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strengths.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
            <h4 className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">Strengths</h4>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {weaknesses.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">Weaknesses</h4>
            <ul className="space-y-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                  <span className="text-red-500 mt-0.5">✗</span> {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SkillGapAnalysis;
