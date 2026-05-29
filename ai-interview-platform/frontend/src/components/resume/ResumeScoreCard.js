import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

const Ring = ({ score, max, label, color }) => {
  const pct = Math.round((score / max) * 100);
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const colors = { blue: '#3B82F6', green: '#10B981', purple: '#8B5CF6', orange: '#F59E0B' };
  const c = colors[color] || colors.blue;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#E5E7EB" strokeWidth="7" className="dark:stroke-gray-700" />
        <motion.circle cx="40" cy="40" r={r} fill="none" stroke={c} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ transformOrigin: '40px 40px', transform: 'rotate(-90deg)' }} />
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="bold" fill={c}>
          {max === 10 ? `${score}/10` : `${pct}%`}
        </text>
      </svg>
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
    </div>
  );
};

const ResumeScoreCard = ({ gapAnalysis }) => {
  if (!gapAnalysis) return null;
  const overall = gapAnalysis.overallScore || 0;
  const grade = overall >= 80 ? { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }
    : overall >= 60 ? { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' }
    : overall >= 40 ? { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }
    : { label: 'Needs Work', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" /> Resume Score Dashboard
        </h2>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${grade.bg} ${grade.color}`}>
          {grade.label}
        </span>
      </div>
      <div className="flex flex-wrap justify-around gap-4">
        <Ring score={gapAnalysis.overallScore || 0} max={100} label="Overall Score" color="blue" />
        <Ring score={gapAnalysis.skillMatchPercentage || 0} max={100} label="Skill Match" color="green" />
        <Ring score={gapAnalysis.atsAnalysis?.score || 0} max={100} label="ATS Score" color="purple" />
        <Ring score={gapAnalysis.categoryScores?.technicalSkills || 0} max={10} label="Technical" color="orange" />
        <Ring score={gapAnalysis.categoryScores?.projects || 0} max={10} label="Projects" color="blue" />
        <Ring score={gapAnalysis.categoryScores?.experience || 0} max={10} label="Experience" color="green" />
      </div>
      {gapAnalysis.categoryScores && (
        <div className="mt-6 space-y-3">
          {Object.entries(gapAnalysis.categoryScores).map(([cat, score], i) => (
            <div key={cat}>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 capitalize">
                  {cat.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`text-xs font-bold ${score >= 7 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(score / 10) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-2 rounded-full ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ResumeScoreCard;
