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

/* ── PDF Generator (Canvas based) ── */
const generatePDF = async (element, filename = 'TalentForge_Optimized_Resume.pdf') => {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};


/* ── Resume Canvas Preview Component ── */
const ResumeCanvas = React.forwardRef(({ data, contact, template }, ref) => {
  if (!data) return null;

  const { name, email, phone, linkedin, github } = contact;
  const { summary, skills, experience, projects, education, certifications } = data;

  if (template === 'modern-ats') {
    return (
      <div ref={ref} id="resume-canvas-preview" className="font-sans text-gray-900 bg-white p-10 shadow-lg max-w-[800px] mx-auto text-left border border-gray-200">
        <div className="border-b-2 border-gray-900 pb-4 mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase">{name || 'Your Name'}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs font-semibold text-gray-600">
            {email && <span>{email}</span>}
            {phone && <span>| {phone}</span>}
            {linkedin && <span>| LinkedIn: {linkedin}</span>}
            {github && <span>| GitHub: {github}</span>}
          </div>
        </div>

        {summary && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">Professional Summary</h2>
            <p className="text-xs text-gray-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {skills?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">Skills</h2>
            <p className="text-xs text-gray-700 leading-relaxed font-semibold">{skills.map(s => typeof s === 'object' ? s.name : s).join('  •  ')}</p>
          </div>
        )}

        {experience?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">Work Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold text-xs text-gray-900">
                    <span>{exp.title} — {exp.company}</span>
                    <span>{exp.duration}</span>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-gray-700 leading-normal">{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">Projects</h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-xs text-gray-900">{proj.title}</div>
                  {proj.description && <p className="text-xs text-gray-700 mt-0.5">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p className="text-xs text-gray-500 italic mt-0.5">Technologies: {proj.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education?.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">Education</h2>
            <div className="space-y-1">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-700">
                  <span className="font-bold">{edu.degree} — {edu.institution}</span>
                  <span>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-0.5 mb-2">Certifications</h2>
            <ul className="list-disc pl-4 space-y-0.5 text-xs text-gray-700">
              {certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (template === 'professional-corporate') {
    return (
      <div ref={ref} id="resume-canvas-preview" className="font-serif text-[#1f2937] bg-white p-12 shadow-lg max-w-[800px] mx-auto text-left border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#1e3a8a]">{name || 'Your Name'}</h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs italic text-gray-600">
            {email && <span>{email}</span>}
            {phone && <span>• {phone}</span>}
            {linkedin && <span>• {linkedin}</span>}
            {github && <span>• {github}</span>}
          </div>
        </div>

        {summary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-0.5 mb-2">Professional Summary</h2>
            <p className="text-xs text-gray-700 leading-relaxed italic">{summary}</p>
          </div>
        )}

        {skills?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-0.5 mb-2">Key Expertise</h2>
            <p className="text-xs text-gray-700 leading-relaxed font-semibold">{skills.map(s => typeof s === 'object' ? s.name : s).join('  •  ')}</p>
          </div>
        )}

        {experience?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-0.5 mb-2">Professional Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold text-xs text-gray-900">
                    <span>{exp.title}</span>
                    <span className="font-normal text-gray-600 italic">{exp.duration}</span>
                  </div>
                  <div className="text-xs text-[#1e3a8a] italic font-semibold">{exp.company}</div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-gray-700 leading-relaxed">{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-0.5 mb-2">Notable Projects</h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-xs text-gray-950">{proj.title}</div>
                  {proj.description && <p className="text-xs text-gray-700 mt-0.5">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p className="text-xs text-gray-500 italic mt-0.5">Technologies: {proj.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-0.5 mb-2">Academic Background</h2>
            <div className="space-y-1">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between text-xs text-gray-700">
                  <span className="font-bold">{edu.degree} — {edu.institution}</span>
                  <span>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider border-b-2 border-[#1e3a8a] pb-0.5 mb-2">Certifications</h2>
            <ul className="list-disc pl-4 space-y-0.5 text-xs text-gray-700">
              {certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (template === 'software-engineer') {
    return (
      <div ref={ref} id="resume-canvas-preview" className="font-sans text-slate-800 bg-white p-8 shadow-lg max-w-[800px] mx-auto text-left border border-gray-200 flex gap-6">
        <div className="w-[33%] bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-5">
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">{name || 'Your Name'}</h1>
            <div className="mt-3 space-y-2 text-[11px] text-slate-600 break-all">
              {email && <div className="flex flex-col"><span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Email</span>{email}</div>}
              {phone && <div className="flex flex-col"><span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Phone</span>{phone}</div>}
              {linkedin && <div className="flex flex-col"><span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">LinkedIn</span>{linkedin}</div>}
              {github && <div className="flex flex-col"><span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">GitHub</span>{github}</div>}
            </div>
          </div>

          {skills?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-900">Technical Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] rounded font-semibold">
                    {typeof s === 'object' ? s.name : s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-900">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-[11px] text-slate-700">
                    <div className="font-bold">{edu.degree}</div>
                    <div>{edu.institution}</div>
                    <div className="text-slate-500 italic mt-0.5">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-900">Certifications</h2>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                {certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="w-[67%] flex flex-col gap-5">
          {summary && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-900">About Me</h2>
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {experience?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-900">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-bold text-xs text-slate-900">
                      <span>{exp.title}</span>
                      <span className="font-normal text-slate-500 text-[10px]">{exp.duration}</span>
                    </div>
                    <div className="text-xs text-blue-600 font-bold">{exp.company}</div>
                    {exp.bullets?.length > 0 && (
                      <ul className="list-disc pl-4 mt-1.5 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-slate-700 leading-normal">{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 pb-1 border-b-2 border-slate-900">Key Projects</h2>
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-2 border border-slate-100 rounded-lg">
                    <div className="font-bold text-xs text-slate-900">{proj.title}</div>
                    {proj.description && <p className="text-xs text-slate-700 mt-1">{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] rounded font-bold">{tech}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (template === 'data-scientist') {
    return (
      <div ref={ref} id="resume-canvas-preview" className="font-sans text-gray-800 bg-white p-10 shadow-lg max-w-[800px] mx-auto text-left border border-gray-200">
        <div className="flex justify-between items-start border-b-4 border-[#047857] pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{name || 'Your Name'}</h1>
            <div className="text-xs text-[#047857] font-bold mt-1 uppercase tracking-widest">Data Scientist / Analyst</div>
          </div>
          <div className="text-right text-[11px] text-gray-600 space-y-0.5">
            {email && <div>{email}</div>}
            {phone && <div>{phone}</div>}
            {linkedin && <div>{linkedin}</div>}
            {github && <div>{github}</div>}
          </div>
        </div>

        {summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2">Executive Summary</h2>
            <p className="text-xs text-gray-700 leading-relaxed bg-emerald-50/30 p-3 rounded-lg border-l-4 border-[#047857]">{summary}</p>
          </div>
        )}

        {skills?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2">Core Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-[#065f46] text-xs rounded border border-emerald-100 font-semibold">
                  {typeof s === 'object' ? s.name : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {experience?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2">Professional Practice</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l border-emerald-100 pl-4 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#047857] absolute -left-[5px] top-1" />
                  <div className="flex justify-between font-bold text-xs text-gray-900">
                    <span>{exp.title} — {exp.company}</span>
                    <span className="font-normal text-gray-500">{exp.duration}</span>
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc pl-4 mt-1.5 space-y-1">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-gray-700 leading-normal">{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2">Projects & Research</h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-xs text-gray-900">{proj.title}</div>
                    {proj.description && <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{proj.description}</p>}
                  </div>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="px-1.5 py-0.5 bg-emerald-100/50 text-[#047857] text-[9px] rounded font-bold">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {education?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs text-gray-700">
                    <div className="font-bold">{edu.degree}</div>
                    <div>{edu.institution}</div>
                    <div className="text-gray-500 italic">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2">Certifications</h2>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                {certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (template === 'product-manager') {
    return (
      <div ref={ref} id="resume-canvas-preview" className="font-sans text-gray-900 bg-white p-10 shadow-lg max-w-[800px] mx-auto text-left border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-[#6d28d9] uppercase tracking-wider">{name || 'Your Name'}</h1>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs font-semibold text-gray-500">
            {email && <span>{email}</span>}
            {phone && <span>• {phone}</span>}
            {linkedin && <span>• {linkedin}</span>}
            {github && <span>• {github}</span>}
          </div>
        </div>

        {summary && (
          <div className="mb-6 text-center max-w-xl mx-auto">
            <p className="text-xs text-gray-700 leading-relaxed italic">{summary}</p>
          </div>
        )}

        {skills?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-black text-center text-[#6d28d9] uppercase tracking-widest border-t-2 border-b-2 border-[#6d28d9]/10 py-1 mb-3">Product Competencies</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-50 text-[#5b21b6] text-xs rounded-full border border-purple-100 font-bold">
                  {typeof s === 'object' ? s.name : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {experience?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-black text-[#6d28d9] uppercase tracking-wider border-b border-purple-200 pb-1 mb-3">Professional Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between font-bold text-xs text-gray-900">
                    <span>{exp.title}</span>
                    <span className="text-[#6d28d9]">{exp.company}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 italic mt-0.5">{exp.duration}</div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc pl-4 mt-2 space-y-1.5">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-gray-700 leading-normal">{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-black text-[#6d28d9] uppercase tracking-wider border-b border-purple-200 pb-1 mb-3">Impact Initiatives</h2>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="font-bold text-xs text-gray-905">{proj.title}</div>
                  {proj.description && <p className="text-xs text-gray-700 mt-1 leading-relaxed">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p className="text-xs text-purple-700 font-bold mt-1">Focus: {proj.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {education?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-[#6d28d9] uppercase tracking-wider border-b border-purple-200 pb-1 mb-2">Education</h2>
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-xs text-gray-700">
                    <div className="font-bold">{edu.degree}</div>
                    <div>{edu.institution}</div>
                    <div className="text-gray-500 italic">{edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications?.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-[#6d28d9] uppercase tracking-wider border-b border-purple-200 pb-1 mb-2">Credentials</h2>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                {certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
});

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



/* ── Main Page ── */
const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [activeResume, setActiveResume] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
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


  const [selectedTemplate, setSelectedTemplate] = useState('modern-ats');
  const [contactDetails, setContactDetails] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '+1 (555) 019-2834',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe'
  });
  const resumeCanvasRef = React.useRef(null);

  const popularRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer',
    'Mobile Developer', 'UI/UX Designer', 'Product Manager', 'Software Architect'
  ];

  const sectionTypes = [
    'experience', 'summary', 'projects', 'skills', 'education', 'achievements'
  ];

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (activeResume) {
      setContactDetails(prev => ({
        ...prev,
        name: activeResume.user?.name || prev.name,
        email: activeResume.user?.email || prev.email
      }));
    }
  }, [activeResume]);

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
        setJobDescription(analysisRes.data.gapAnalysis.jobDescription || '');
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
      const res = await resumeAPI.performGapAnalysis({
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim()
      });
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
      const res = await resumeAPI.optimizeResume({
        targetRole: targetRole.trim() || 'Software Developer',
        jobDescription: jobDescription.trim()
      });
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
      await generatePDF(resumeCanvasRef.current, `${contactDetails.name.replace(/\s+/g, '_')}_Optimized_Resume.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPDF(false);
    }
  }, [optimizeResult, gapAnalysis, contactDetails]);



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
            <Target className="w-5 h-5 text-primary-600" /> Select Target Role & Requirements
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Target Role
              </label>
              <input
                type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g., Frontend Developer"
                list="roles-list"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
              <datalist id="roles-list">
                {popularRoles.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
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
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the job description or posting here to analyze gaps and optimize your resume..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
              />
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
                  <Eye className="w-4 h-4" /> {showPreview ? 'Hide Preview Editor' : 'Customize Template & Preview'}
                </button>
                <button onClick={handleDownloadPDF} disabled={downloadingPDF}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 disabled:opacity-50 transition font-bold shadow-md">
                  {downloadingPDF ? <Loader className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />} Download PDF
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
                    className="overflow-hidden space-y-6"
                  >
                    <div className="grid lg:grid-cols-12 gap-6">
                      
                      {/* Left: Template Selector & Contact Editor */}
                      <div className="lg:col-span-4 space-y-6">
                        
                        {/* Template Selection */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-md">
                          <h3 className="font-bold text-gray-950 dark:text-white mb-3 text-sm uppercase tracking-wide">Select Template Layout</h3>
                          <div className="flex flex-col gap-2">
                            {[
                              { id: 'modern-ats', name: 'Modern ATS', desc: 'Clean, plain & highly parseable single-column layout' },
                              { id: 'professional-corporate', name: 'Professional Corporate', desc: 'Elegant serif headers & right-aligned dates' },
                              { id: 'software-engineer', name: 'Software Engineer', desc: 'Modern 2-column slate design for tech roles' },
                              { id: 'data-scientist', name: 'Data Scientist', desc: 'Emerald green accents & structured grid layout' },
                              { id: 'product-manager', name: 'Product Manager', desc: 'Purple theme with centered header & bolded metrics' }
                            ].map(t => (
                              <button
                                key={t.id}
                                onClick={() => setSelectedTemplate(t.id)}
                                className={`p-3 rounded-xl border text-left transition flex flex-col ${
                                  selectedTemplate === t.id
                                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-primary-950 dark:text-primary-400 font-semibold ring-2 ring-primary-500/20'
                                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <span className="text-sm">{t.name}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal mt-0.5">{t.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Contact Details Form */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-md space-y-3">
                          <h3 className="font-bold text-gray-950 dark:text-white text-sm uppercase tracking-wide">Edit Contact Details</h3>
                          <div className="space-y-2">
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                              <input
                                type="text"
                                value={contactDetails.name}
                                onChange={e => setContactDetails(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Email Address</label>
                              <input
                                type="text"
                                value={contactDetails.email}
                                onChange={e => setContactDetails(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone Number</label>
                              <input
                                type="text"
                                value={contactDetails.phone}
                                onChange={e => setContactDetails(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">LinkedIn URL</label>
                              <input
                                type="text"
                                value={contactDetails.linkedin}
                                onChange={e => setContactDetails(prev => ({ ...prev, linkedin: e.target.value }))}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">GitHub URL</label>
                              <input
                                type="text"
                                value={contactDetails.github}
                                onChange={e => setContactDetails(prev => ({ ...prev, github: e.target.value }))}
                                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Right: Live Resume Canvas Preview */}
                      <div className="lg:col-span-8 space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-850 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Live Preview Canvas</span>
                          <span className="text-[11px] text-gray-500 italic">Downloads will export this rendering</span>
                        </div>
                        <div className="overflow-x-auto p-4 bg-gray-100 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 flex justify-center">
                          <ResumeCanvas
                            ref={resumeCanvasRef}
                            data={optimizedData}
                            contact={contactDetails}
                            template={selectedTemplate}
                          />
                        </div>
                      </div>

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
