import React from 'react';
import { CheckCircle, Edit2, Code2, Mail } from 'lucide-react';

const ResumePreview = ({ data, onEdit }) => {
  return (
    <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
      {/* Header with checkmark */}
      <div className="flex items-center space-x-3 mb-6">
        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
        <div>
          <h3 className="text-xl font-bold text-green-900">Resume Detected ✓</h3>
          <p className="text-sm text-green-700">
            Confidence: {data.confidence}%
          </p>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t-2 border-green-200 my-4"></div>

      {/* Preview Content */}
      <div className="space-y-4 mb-6">
        {/* Name */}
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
            Name
          </p>
          <p className="text-lg font-semibold text-gray-900">{data.name}</p>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Mail className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
              Email
            </p>
          </div>
          <p className="text-sm text-gray-700 font-mono">{data.email}</p>
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Code2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                Detected Skills
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
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
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
              Preview
            </p>
            <div className="bg-white border border-green-200 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {data.previewText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="border-t-2 border-green-200 my-4"></div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="flex-1 py-3 px-4 bg-white border-2 border-green-300 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition flex items-center justify-center space-x-2"
        >
          <Edit2 className="w-5 h-5" />
          <span>Upload Different Resume</span>
        </button>
        <button
          className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          disabled
        >
          Continuing Analysis...
        </button>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-4 bg-green-100 rounded-lg border border-green-300">
        <p className="text-sm text-green-800">
          ℹ️ We've successfully read your resume. Your resume is now being analyzed for gaps, skills, and optimization opportunities.
        </p>
      </div>
    </div>
  );
};

export default ResumePreview;
