import React from 'react';
import { CheckCircle, Edit2, Code2, Mail } from 'lucide-react';

const ResumePreview = ({ data, onEdit }) => {
  return (
    <div className="w-full card-surface rounded-xl p-8 border"
      style={{ borderColor: 'var(--color-primary-300)' }}>
      {/* Header with checkmark */}
      <div className="flex items-center space-x-3 mb-6">
        <CheckCircle className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--color-primary-500)' }} />
        <div>
          <h3 className="text-xl font-bold text-text">Resume Detected ✓</h3>
          <p className="text-sm" style={{ color: 'var(--color-primary-600)' }}>
            Confidence: {data.confidence}%
          </p>
        </div>
      </div>

      {/* Separator */}
      <div className="my-4" style={{ borderTop: '2px solid var(--color-primary-200)' }}></div>

      {/* Preview Content */}
      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: 'var(--color-primary-600)' }}>
            Name
          </p>
          <p className="text-lg font-semibold text-text">{data.name}</p>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Mail className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />
            <p className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-primary-600)' }}>
              Email
            </p>
          </div>
          <p className="text-sm text-text/70 font-mono">{data.email}</p>
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Code2 className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />
              <p className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-primary-600)' }}>
                Detected Skills
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    background: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Preview Text */}
        {data.previewText && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2"
              style={{ color: 'var(--color-primary-600)' }}>
              Preview
            </p>
            <div className="rounded-lg p-4 max-h-48 overflow-y-auto border card-surface"
              style={{ borderColor: 'var(--color-primary-200)' }}>
              <p className="text-sm text-text/80 whitespace-pre-wrap font-mono">
                {data.previewText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="my-4" style={{ borderTop: '2px solid var(--color-primary-200)' }}></div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 px-4 font-semibold rounded-lg hover:opacity-80 transition flex items-center justify-center space-x-2 border-2"
          style={{
            borderColor: 'var(--color-primary-400)',
            color: 'var(--color-primary-600)',
            background: 'transparent'
          }}
        >
          <Edit2 className="w-5 h-5" />
          <span>Upload Different Resume</span>
        </button>
        <button
          className="flex-1 py-3 px-4 font-semibold rounded-lg transition btn-brand opacity-60 cursor-not-allowed"
          disabled
        >
          Continuing Analysis...
        </button>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-4 rounded-lg border"
        style={{
          background: 'var(--color-primary-50)',
          borderColor: 'var(--color-primary-200)',
          color: 'var(--color-primary-700)'
        }}>
        <p className="text-sm">
          ℹ️ We've successfully read your resume. Your resume is now being analyzed for gaps, skills, and optimization opportunities.
        </p>
      </div>
    </div>
  );
};

export default ResumePreview;
