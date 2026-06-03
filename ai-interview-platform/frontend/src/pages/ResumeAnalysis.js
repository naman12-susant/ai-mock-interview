import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Target, TrendingUp, AlertCircle, CheckCircle, Sparkles,
  FileText, Zap, BarChart3, Brain, ArrowRight, Loader, ChevronDown,
  ChevronUp, Star, XCircle, Lightbulb, Shield, Edit3, RefreshCw,
  Download, Eye, FileDown, Copy
} from 'lucide-react';

/* ── PDF Generator ── */
const generatePDF = async (optimizedResume) => {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPageIfNeeded = (needed = 12) => {
    if (y + needed > 280) { doc.addPage(); y = 20; }
  };

  // Name / Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text('Optimized Resume', margin, y);
  y += 10;

  // Summary
  if (optimizedResume.summary) {
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(59, 130, 246);
    doc.text('PROFESSIONAL SUMMARY', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(optimizedResume.summary, maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 6;
  }

  // Skills
  if (optimizedResume.skills?.length > 0) {
    addPageIfNeeded(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(59, 130, 246);
    doc.text('SKILLS', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const skillText = optimizedResume.skills.join('  •  ');
    const skillLines = doc.splitTextToSize(skillText, maxWidth);
    doc.text(skillLines, margin, y);
    y += skillLines.length * 5 + 6;
  }

  // Experience
  if (optimizedResume.experience?.length > 0) {
    addPageIfNeeded(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(59, 130, 246);
    doc.text('EXPERIENCE', margin, y);
    y += 7;
    optimizedResume.experience.forEach(exp => {
      addPageIfNeeded(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(`${exp.title || 'Role'} — ${exp.company || 'Company'}`, margin, y);
      y += 5;
      if (exp.duration) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(exp.duration, margin, y);
        y += 5;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      (exp.bullets || []).forEach(bullet => {
        addPageIfNeeded(8);
        const bLines = doc.splitTextToSize(`•  ${bullet}`, maxWidth - 4);
        doc.text(bLines, margin + 3, y);
        y += bLines.length * 5 + 1;
      });
      y += 4;
    });
  }

  // Projects
  if (optimizedResume.projects?.length > 0) {
    addPageIfNeeded(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(59, 130, 246);
    doc.text('PROJECTS', margin, y);
    y += 7;
    optimizedResume.projects.forEach(proj => {
      addPageIfNeeded(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(proj.title || 'Project', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      if (proj.description) {
        const pLines = doc.splitTextToSize(proj.description, maxWidth);
        doc.text(pLines, margin, y);
        y += pLines.length * 5 + 1;
      }
      if (proj.technologies?.length > 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Tech: ${proj.technologies.join(', ')}`, margin, y);
        y += 5;
      }
      y += 3;
    });
  }

  // Education
  if (optimizedResume.education?.length > 0) {
    addPageIfNeeded(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(59, 130, 246);
    doc.text('EDUCATION', margin, y);
    y += 7;
    optimizedResume.education.forEach(edu => {
      addPageIfNeeded(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`${edu.degree || 'Degree'} — ${edu.institution || 'Institution'}`, margin, y);
      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(edu.year, pageWidth - margin - 20, y);
      }
      y += 6;
    });
  }

  // Certifications
  if (optimizedResume.certifications?.length > 0) {
    addPageIfNeeded(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(59, 130, 246);
    doc.text('CERTIFICATIONS', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    optimizedResume.certifications.forEach(cert => {
      addPageIfNeeded(6);
      doc.text(`•  ${cert}`, margin + 3, y);
      y += 5;
    });
  }

  doc.save('TalentForge_Optimized_Resume.pdf');
};

/* ── DOCX Generator ── */
const generateDOCX = async (optimizedResume) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
  const { saveAs } = await import('file-saver');

  const sectionTitle = (text) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: '3B82F6', font: 'Calibri' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '3B82F6' } }
  });

  const children = [];

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Optimized Resume', bold: true, size: 40, color: '1E1E1E', font: 'Calibri' })],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    spacing: { after: 200 }
  }));

  // Summary
  if (optimizedResume.summary) {
    children.push(sectionTitle('PROFESSIONAL SUMMARY'));
    children.push(new Paragraph({
      children: [new TextRun({ text: optimizedResume.summary, size: 21, font: 'Calibri', color: '3C3C3C' })],
      spacing: { after: 150 }
    }));
  }

  // Skills
  if (optimizedResume.skills?.length > 0) {
    children.push(sectionTitle('SKILLS'));
    children.push(new Paragraph({
      children: [new TextRun({ text: optimizedResume.skills.join('  •  '), size: 21, font: 'Calibri', color: '3C3C3C' })],
      spacing: { after: 150 }
    }));
  }

  // Experience
  if (optimizedResume.experience?.length > 0) {
    children.push(sectionTitle('EXPERIENCE'));
    optimizedResume.experience.forEach(exp => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${exp.title || 'Role'} — ${exp.company || 'Company'}`, bold: true, size: 22, font: 'Calibri' }),
          ...(exp.duration ? [new TextRun({ text: `  |  ${exp.duration}`, italics: true, size: 20, color: '787878', font: 'Calibri' })] : [])
        ],
        spacing: { before: 100, after: 60 }
      }));
      (exp.bullets || []).forEach(bullet => {
        children.push(new Paragraph({
          children: [new TextRun({ text: bullet, size: 21, font: 'Calibri', color: '3C3C3C' })],
          bullet: { level: 0 },
          spacing: { after: 30 }
        }));
      });
    });
  }

  // Projects
  if (optimizedResume.projects?.length > 0) {
    children.push(sectionTitle('PROJECTS'));
    optimizedResume.projects.forEach(proj => {
      children.push(new Paragraph({
        children: [new TextRun({ text: proj.title || 'Project', bold: true, size: 22, font: 'Calibri' })],
        spacing: { before: 100, after: 40 }
      }));
      if (proj.description) {
        children.push(new Paragraph({
          children: [new TextRun({ text: proj.description, size: 21, font: 'Calibri', color: '3C3C3C' })],
          spacing: { after: 30 }
        }));
      }
      if (proj.technologies?.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, italics: true, size: 20, color: '646464', font: 'Calibri' })],
          spacing: { after: 80 }
        }));
      }
    });
  }

  // Education
  if (optimizedResume.education?.length > 0) {
    children.push(sectionTitle('EDUCATION'));
    optimizedResume.education.forEach(edu => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${edu.degree || 'Degree'} — ${edu.institution || 'Institution'}`, bold: true, size: 22, font: 'Calibri' }),
          ...(edu.year ? [new TextRun({ text: `  (${edu.year})`, size: 20, color: '787878', font: 'Calibri' })] : [])
        ],
        spacing: { after: 60 }
      }));
    });
  }

  // Certifications
  if (optimizedResume.certifications?.length > 0) {
    children.push(sectionTitle('CERTIFICATIONS'));
    optimizedResume.certifications.forEach(cert => {
      children.push(new Paragraph({
        children: [new TextRun({ text: cert, size: 21, font: 'Calibri', color: '3C3C3C' })],
        bullet: { level: 0 },
        spacing: { after: 30 }
      }));
    });
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'TalentForge_Optimized_Resume.docx');
};

/* ── Score Ring Component ── */
const ScoreRing = ({ score, max, label, color }) => {
  const pct = Math.round((score / max) * 100);
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  const colorMap = {
    blue: '#3B82F6', green: '#10B981', purple: '#8B5CF6',
    orange: '#F59E0B', red: '#EF4444'
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <motion.circle
          cx="45" cy="45" r={radius} fill="none" stroke={c} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ transformOrigin: '45px 45px', transform: 'rotate(-90deg)' }}
        />
        <text x="45" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill={c}>
          {max === 10 ? `${score}/10` : `${pct}%`}
        </text>
      </svg>
      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 text-center">{label}</span>
    </div>
  );
};

/* ── Skill Badge ── */
const SkillBadge = ({ skill, type }) => {
  const styles = {
    present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700',
    important: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
    nice: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${styles[type] || styles.nice}`}>
      {type === 'present' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {skill}
    </span>
  );
};

/* ── Collapsible Section ── */
const Section = ({ title, icon, children, defaultOpen = true, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-primary-600">{icon}</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full">
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Optimized Resume Preview Card ── */
const ResumePreviewCard = ({ title, data, variant = 'original' }) => {
  const isOptimized = variant === 'optimized';
  const borderColor = isOptimized ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700';
  const headerBg = isOptimized
    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
    : 'bg-gradient-to-r from-gray-500 to-gray-600';

  return (
    <div className={`rounded-2xl border-2 ${borderColor} overflow-hidden flex flex-col`}>
      <div className={`${headerBg} text-white px-5 py-3 flex items-center gap-2`}>
        {isOptimized ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        <span className="font-bold text-sm">{title}</span>
      </div>
      <div className="p-5 space-y-5 bg-white dark:bg-gray-950 flex-1">
        {/* Summary */}
        {data?.summary && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Professional Summary</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Skills */}
        {data?.skills?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <span key={i} className={`px-2 py-0.5 text-xs rounded-md font-medium ${
                  isOptimized
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}>
                  {typeof s === 'object' ? s.name : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {data?.experience?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Experience</h4>
            <div className="space-y-3">
              {data.experience.map((exp, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {exp.title || exp.role || 'Role'} — {exp.company || 'Company'}
                  </p>
                  {exp.duration && <p className="text-xs text-gray-500 dark:text-gray-400 italic">{exp.duration}</p>}
                  {exp.bullets?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                          <span className="text-blue-500 mt-0.5">•</span>{b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data?.projects?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Projects</h4>
            <div className="space-y-3">
              {data.projects.map((proj, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{proj.title}</p>
                  {proj.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((t, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] rounded font-medium">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data?.education?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Education</h4>
            {data.education.map((edu, i) => (
              <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{edu.degree}</span> — {edu.institution} {edu.year && <span className="text-gray-500">({edu.year})</span>}
              </p>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data?.certifications?.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">Certifications</h4>
            <ul className="space-y-1">
              {data.certifications.map((c, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Page ── */
const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [activeResume, setActiveResume] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteType, setRewriteType] = useState('experience');
  const [rewriting, setRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingDOCX, setDownloadingDOCX] = useState(false);

  const popularRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer',
    'Mobile Developer', 'UI/UX Designer', 'Product Manager', 'Software Architect'
  ];

  const sectionTypes = [
    'experience', 'summary', 'projects', 'skills', 'education', 'achievements'
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const resumeRes = await resumeAPI.getActive().catch(() => null);
      if (resumeRes?.data?.resume) {
        setActiveResume(resumeRes.data.resume);
      }
      const analysisRes = await resumeAPI.getGapAnalysis().catch(() => null);
      if (analysisRes?.data?.gapAnalysis) {
        setGapAnalysis(analysisRes.data.gapAnalysis);
        setTargetRole(analysisRes.data.gapAnalysis.targetRole || '');
      }
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim()) { toast.error('Please select or enter a target role'); return; }
    setAnalyzing(true);
    try {
      const res = await resumeAPI.performGapAnalysis({ targetRole: targetRole.trim() });
      setGapAnalysis(res.data.gapAnalysis);
      toast.success('Gap analysis complete!');
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to analyze resume';
      if (msg.includes('GROQ_API_KEY')) {
        toast.error('AI key not configured. See setup instructions below.', { duration: 6000 });
      } else {
        toast.error(msg);
      }
      console.error('Gap analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setOptimizeResult(null);
    setShowPreview(false);
    try {
      const res = await resumeAPI.optimizeResume({ targetRole: targetRole.trim() || 'Software Developer' });
      setOptimizeResult(res.data);
      setShowPreview(true);
      toast.success('Resume optimized successfully!');
      const ar = await resumeAPI.getGapAnalysis().catch(() => null);
      if (ar?.data?.gapAnalysis) setGapAnalysis(ar.data.gapAnalysis);
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to optimize resume';
      if (msg.includes('GROQ_API_KEY')) {
        toast.error('AI key not configured. See setup instructions below.', { duration: 6000 });
      } else {
        toast.error(msg);
      }
      console.error('Optimize error:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleRewrite = async () => {
    if (!rewriteText.trim()) { toast.error('Please paste the text you want to rewrite'); return; }
    setRewriting(true);
    setRewriteResult(null);
    try {
      const res = await resumeAPI.rewriteSection({
        sectionText: rewriteText.trim(),
        sectionType: rewriteType,
        targetRole: targetRole.trim() || 'Software Developer'
      });
      setRewriteResult(res.data);
      toast.success('Section rewritten!');
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to rewrite section';
      toast.error(msg);
    } finally {
      setRewriting(false);
    }
  };

  const handleDownloadPDF = useCallback(async () => {
    const data = optimizeResult?.optimizedResume || gapAnalysis?.optimizedResume;
    if (!data) { toast.error('No optimized resume available. Click "One-Click Optimize" first.'); return; }
    setDownloadingPDF(true);
    try {
      await generatePDF(data);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  }, [optimizeResult, gapAnalysis]);

  const handleDownloadDOCX = useCallback(async () => {
    const data = optimizeResult?.optimizedResume || gapAnalysis?.optimizedResume;
    if (!data) { toast.error('No optimized resume available. Click "One-Click Optimize" first.'); return; }
    setDownloadingDOCX(true);
    try {
      await generateDOCX(data);
      toast.success('DOCX downloaded!');
    } catch (err) {
      console.error('DOCX generation error:', err);
      toast.error('Failed to generate DOCX');
    } finally {
      setDownloadingDOCX(false);
    }
  }, [optimizeResult, gapAnalysis]);

  // Build original resume data from the parsed analysis for side-by-side comparison
  const originalResumeData = activeResume?.analysis ? {
    summary: activeResume.analysis.summary,
    skills: activeResume.analysis.skills?.map(s => s?.name).filter(Boolean) || [],
    experience: [], // raw extraction doesn't have structured experience bullets
    projects: activeResume.analysis.projects || [],
    education: activeResume.analysis.education || [],
    certifications: activeResume.analysis.certifications || []
  } : null;

  const optimizedData = optimizeResult?.optimizedResume || gapAnalysis?.optimizedResume;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!activeResume) {
    return (
      <div className="min-h-screen bg-white dark:bg-black py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-10 border-2 border-gray-100 dark:border-gray-800">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Resume Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Upload a resume first to run AI gap analysis</p>
            <button onClick={() => navigate('/resume')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-bold">
              Upload Resume
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 transition-colors duration-300 relative overflow-hidden">
      {/* Background orbs */}
      <motion.div animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-100/20 to-purple-100/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ y: [0, 30, 0], rotate: [360, 180, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-green-100/20 to-emerald-100/20 dark:from-green-500/10 dark:to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Brain className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">AI Resume Gap Analysis</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-11">
            Analyzing: <span className="font-semibold text-gray-700 dark:text-gray-300">{activeResume.fileName}</span>
          </p>
        </motion.div>

        {/* Role Selector + Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" /> Select Target Role
          </h2>
          <div className="space-y-4">
            <input
              type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g., Frontend Developer"
              list="roles-list"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
            <datalist id="roles-list">
              {popularRoles.map(r => <option key={r} value={r} />)}
            </datalist>
            <div className="flex flex-wrap gap-2">
              {popularRoles.slice(0, 6).map(role => (
                <button key={role} onClick={() => setTargetRole(role)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    targetRole === role
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}>
                  {role}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <button onClick={handleAnalyze} disabled={analyzing || !targetRole.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-xl hover:from-primary-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-lg">
                {analyzing ? <><Loader className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Sparkles className="w-5 h-5" /> Analyze Resume</>}
              </button>
              <button onClick={handleOptimize} disabled={optimizing || !activeResume}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-lg">
                {optimizing ? <><Loader className="w-5 h-5 animate-spin" /> Optimizing...</> : <><Zap className="w-5 h-5" /> One-Click Optimize</>}
              </button>
              {gapAnalysis && (
                <button onClick={handleAnalyze} disabled={analyzing}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium">
                  <RefreshCw className="w-4 h-4" /> Re-analyze
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════ OPTIMIZED RESUME PREVIEW & DOWNLOAD ═══════════════ */}
        <AnimatePresence>
          {(optimizeResult || optimizedData) && (
            <motion.div key="preview-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* ATS Score Banner */}
              {(optimizeResult?.atsScore || optimizedData?.atsScore) && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black">Resume Optimized Successfully!</h3>
                        <p className="text-green-100 text-sm">Your resume has been rewritten for ATS compatibility</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-green-200 uppercase tracking-wider">Before</p>
                        <p className="text-3xl font-black">{(optimizeResult?.atsScore || optimizedData?.atsScore)?.before || '?'}%</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-green-200" />
                      <div className="text-center">
                        <p className="text-xs text-green-200 uppercase tracking-wider">After</p>
                        <p className="text-3xl font-black text-yellow-300">{(optimizeResult?.atsScore || optimizedData?.atsScore)?.after || '?'}%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Download & Preview Buttons */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-bold">
                  <Eye className="w-4 h-4" /> {showPreview ? 'Hide Preview' : 'Preview Comparison'}
                </button>
                <button onClick={handleDownloadPDF} disabled={downloadingPDF}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 transition font-bold shadow-md">
                  {downloadingPDF ? <Loader className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} Download PDF
                </button>
                <button onClick={handleDownloadDOCX} disabled={downloadingDOCX}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition font-bold shadow-md">
                  {downloadingDOCX ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download DOCX
                </button>
              </div>

              {/* Side-by-Side Resume Preview */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <ResumePreviewCard title="Original Resume" data={originalResumeData} variant="original" />
                      <ResumePreviewCard title="AI Optimized Resume" data={optimizedData} variant="optimized" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Key Changes */}
              {(optimizeResult?.keyChanges?.length > 0 || optimizedData?.keyChanges?.length > 0) && (
                <Section title="Key Changes Made" icon={<Zap className="w-5 h-5 text-green-500" />}
                  badge={`${(optimizeResult?.keyChanges || optimizedData?.keyChanges || []).length} changes`}>
                  <ul className="space-y-2">
                    {(optimizeResult?.keyChanges || optimizedData?.keyChanges || []).map((c, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> {c}
                      </motion.li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Improved Sections (Before/After diffs) */}
              {optimizeResult?.improvedSections?.length > 0 && (
                <Section title="Section-by-Section Improvements" icon={<Edit3 className="w-5 h-5 text-purple-500" />}
                  badge={optimizeResult.improvedSections.length} defaultOpen={false}>
                  {optimizeResult.improvedSections.map((sec, i) => (
                    <div key={i} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <h4 className="font-bold text-primary-600 mb-3 capitalize">{sec.section}</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-red-600 mb-1">BEFORE</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">{sec.original}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-600 mb-1">AFTER</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">{sec.improved}</p>
                        </div>
                      </div>
                      {sec.reason && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{sec.reason}</p>}
                    </div>
                  ))}
                </Section>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════ GAP ANALYSIS RESULTS ═══════════════ */}
        <AnimatePresence>
          {gapAnalysis && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

              {/* Score Rings */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" /> Resume Score Dashboard
                  <span className="ml-2 text-sm font-normal text-gray-500">for {gapAnalysis.targetRole}</span>
                </h3>
                <div className="flex flex-wrap justify-around gap-6">
                  <ScoreRing score={gapAnalysis.overallScore || 0} max={100} label="Overall Score" color="blue" />
                  <ScoreRing score={gapAnalysis.skillMatchPercentage || 0} max={100} label="Skill Match" color="green" />
                  <ScoreRing score={gapAnalysis.atsAnalysis?.score || 0} max={100} label="ATS Score" color="purple" />
                  <ScoreRing score={gapAnalysis.categoryScores?.technicalSkills || 0} max={10} label="Technical" color="orange" />
                  <ScoreRing score={gapAnalysis.categoryScores?.projects || 0} max={10} label="Projects" color="blue" />
                  <ScoreRing score={gapAnalysis.categoryScores?.experience || 0} max={10} label="Experience" color="green" />
                </div>
              </motion.div>

              {/* Category Progress Bars */}
              {gapAnalysis.categoryScores && (
                <Section title="Category Breakdown" icon={<TrendingUp className="w-5 h-5" />}>
                  <div className="space-y-4">
                    {Object.entries(gapAnalysis.categoryScores).map(([cat, score], i) => (
                      <div key={cat}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {cat.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className={`text-sm font-bold ${score >= 7 ? 'text-green-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {score}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(score / 10) * 100}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-2.5 rounded-full ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Skills: Present vs Missing */}
              <div className="grid md:grid-cols-2 gap-6">
                {gapAnalysis.presentSkills?.length > 0 && (
                  <Section title="Skills You Have" icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                    badge={gapAnalysis.presentSkills.length}>
                    <div className="flex flex-wrap gap-2">
                      {gapAnalysis.presentSkills.map((s, i) => (
                        <SkillBadge key={i} skill={s.skill} type="present" />
                      ))}
                    </div>
                  </Section>
                )}
                {gapAnalysis.missingSkills?.length > 0 && (
                  <Section title="Missing Skills" icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                    badge={gapAnalysis.missingSkills.length}>
                    <div className="space-y-3">
                      {gapAnalysis.missingSkills.map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <SkillBadge skill={s.skill} type={s.importance === 'critical' ? 'critical' : s.importance === 'important' ? 'important' : 'nice'} />
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex-1">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6">
                {gapAnalysis.strengths?.length > 0 && (
                  <Section title="Strengths" icon={<Star className="w-5 h-5 text-yellow-500" />}>
                    <ul className="space-y-2">
                      {gapAnalysis.strengths.map((s, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {s}
                        </motion.li>
                      ))}
                    </ul>
                  </Section>
                )}
                {gapAnalysis.weaknesses?.length > 0 && (
                  <Section title="Weaknesses" icon={<AlertCircle className="w-5 h-5 text-orange-500" />}>
                    <ul className="space-y-2">
                      {gapAnalysis.weaknesses.map((w, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          {w}
                        </motion.li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>

              {/* AI Suggestions */}
              {gapAnalysis.aiSuggestions?.length > 0 && (
                <Section title="AI Improvement Suggestions" icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
                  badge={gapAnalysis.aiSuggestions.length}>
                  <div className="space-y-3">
                    {gapAnalysis.aiSuggestions.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-xl border-l-4 ${
                          s.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                          s.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                            s.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            s.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>{s.priority}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{s.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.suggestion}</p>
                        {s.impact && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Impact: {s.impact}</p>}
                      </motion.div>
                    ))}
                  </div>
                </Section>
              )}

              {/* ATS Analysis */}
              {gapAnalysis.atsAnalysis && (
                <Section title="ATS Optimization Report" icon={<Shield className="w-5 h-5 text-purple-500" />}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 text-sm">✅ Keywords Found</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {gapAnalysis.atsAnalysis.keywords?.present?.map((k, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-lg font-medium">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 text-sm">❌ Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {gapAnalysis.atsAnalysis.keywords?.missing?.map((k, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg font-medium">{k}</span>
                        ))}
                      </div>
                    </div>
                    {gapAnalysis.atsAnalysis.formatting?.issues?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 text-sm">⚠️ Formatting Issues</h4>
                        <ul className="space-y-1">
                          {gapAnalysis.atsAnalysis.formatting.issues.map((issue, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                              <span className="text-orange-500">•</span> {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {gapAnalysis.atsAnalysis.actionVerbs?.suggestions?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 text-sm">💪 Better Action Verbs</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {gapAnalysis.atsAnalysis.actionVerbs.suggestions.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-lg font-medium">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Rewriter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary-600" /> AI Section Rewriter
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Paste any section from your resume and AI will rewrite it with stronger language and ATS optimization.
          </p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <select value={rewriteType} onChange={e => setRewriteType(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                {sectionTypes.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <textarea value={rewriteText} onChange={e => setRewriteText(e.target.value)}
              placeholder="Paste your resume section here... e.g., 'Made website using React.'"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition" />
            <button onClick={handleRewrite} disabled={rewriting || !rewriteText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold shadow-lg">
              {rewriting ? <><Loader className="w-5 h-5 animate-spin" /> Rewriting...</> : <><Sparkles className="w-5 h-5" /> Rewrite Section</>}
            </button>
          </div>

          <AnimatePresence>
            {rewriteResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-xs font-bold text-red-600 mb-2">BEFORE</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rewriteText}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-xs font-bold text-green-600 mb-2">AFTER (AI Improved)</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rewriteResult.improved}</p>
                  </div>
                </div>
                {rewriteResult.changes?.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                    <p className="text-xs font-bold text-blue-600 mb-1">Changes Made:</p>
                    <ul className="space-y-0.5">
                      {rewriteResult.changes.map((c, i) => (
                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                          <span className="text-blue-500">•</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button onClick={() => { navigator.clipboard.writeText(rewriteResult.improved); toast.success('Copied to clipboard!'); }}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  <Copy className="w-3.5 h-3.5" /> Copy improved text
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-6 text-white text-center shadow-xl">
          <h3 className="text-2xl font-black mb-2">Ready to Practice?</h3>
          <p className="text-blue-100 mb-4">Use your optimized resume to start an AI mock interview</p>
          <button onClick={() => navigate('/interview/new')}
            className="flex items-center gap-2 mx-auto px-8 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">
            Start Interview <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default ResumeAnalysis;
