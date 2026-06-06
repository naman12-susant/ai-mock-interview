import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader, AlertCircle } from 'lucide-react';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import ResumePreview from './ResumePreview';

const ResumeUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setUploadError(null);
        setPreviewData(null);
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 5MB.');
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Only PDF, DOC, DOCX, JPG, and PNG files are allowed.');
      } else {
        toast.error('File upload failed.');
      }
    }
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await resumeAPI.upload(formData);
      
      // Store preview data if available
      if (response.data.preview) {
        setPreviewData(response.data.preview);
      }
      
      toast.success('Resume uploaded and analyzed successfully!');
      setFile(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data.resume);
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to upload resume';
      setUploadError(errorMessage);
      
      // Display user-friendly error messages
      if (errorMessage.includes('Invalid Resume')) {
        toast.error('❌ Invalid Resume\n\nThe uploaded file does not appear to be a professional resume or CV.\n\nPlease upload: PDF, DOCX, JPG, or PNG');
      } else if (errorMessage.includes('Resume Not Detected')) {
        toast.error('❌ Resume Not Detected\n\nPlease upload your professional CV or Resume.');
      } else if (errorMessage.includes('Unable to Read Resume')) {
        toast.error('❌ Unable to Read Resume\n\nTry uploading a text-based PDF or DOCX file.');
      } else if (errorMessage.includes('Unsupported File')) {
        toast.error('❌ Unsupported File\n\nPlease upload PDF, DOC, DOCX, JPG or PNG format.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadError(null);
    setPreviewData(null);
  };

  // Show preview if available
  if (previewData && previewData.detected) {
    return <ResumePreview data={previewData} onEdit={removeFile} />;
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary-500'
              : 'border-primary-300 hover:border-primary-500'
          }`}
          style={isDragActive ? { background: 'var(--color-primary-50)' } : { background: 'transparent' }}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-primary-400)' }} />
          <p className="text-lg font-medium text-text mb-2">
            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
          </p>
          <p className="text-sm text-text/60 mb-4">or click to browse</p>
          <p className="text-xs text-text/40">PDF, DOC, DOCX, JPG, or PNG • Max 5MB</p>
        </div>
      ) : (
        <div className="border-2 rounded-xl p-6 card-surface"
          style={{ borderColor: 'var(--color-primary-400)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-10 h-10" style={{ color: 'var(--color-primary-500)' }} />
              <div>
                <p className="font-medium text-text">{file.name}</p>
                <p className="text-sm text-text/60">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              disabled={uploading}
              className="p-2 hover:bg-red-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          </div>

          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 whitespace-pre-wrap">{uploadError}</div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full py-3 btn-brand rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <span>Upload & Analyze</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
