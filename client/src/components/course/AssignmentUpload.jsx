import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiFile, FiCheckCircle, FiX } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

/**
 * AssignmentUpload — Drag-and-drop file upload mockup.
 *
 * Props:
 *   title      — assignment title
 *   onSubmit   — () => void (called after mock submit)
 */
const AssignmentUpload = ({ title = 'Assignment', onSubmit }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!file) return;
    setIsSubmitted(true);
    showToast('Assignment submitted successfully!');
    if (onSubmit) onSubmit();
  };

  const clearFile = () => {
    setFile(null);
    setIsSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isSubmitted) {
    return (
      <div className="assignment-upload">
        <div className="assignment-success">
          <FiCheckCircle size={48} color="#16A34A" />
          <h3 style={{ margin: '1rem 0 0.5rem' }}>Assignment Submitted!</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            <strong>{file?.name}</strong> has been uploaded successfully.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Your instructor will review and grade your submission.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-upload">
      <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiUploadCloud color="var(--primary-blue)" /> {title}
      </h3>

      <div
        className={`assignment-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.zip,.py,.js,.jsx,.ts,.tsx,.html,.css"
          style={{ display: 'none' }}
        />

        {file ? (
          <div className="assignment-file-info">
            <FiFile size={32} color="var(--primary-blue)" />
            <div>
              <strong>{file.name}</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block' }}>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              className="assignment-clear-btn"
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              title="Remove file"
            >
              <FiX />
            </button>
          </div>
        ) : (
          <>
            <FiUploadCloud size={48} color="var(--primary-blue)" style={{ opacity: 0.6 }} />
            <p style={{ margin: '0.75rem 0 0.25rem', fontWeight: '600' }}>
              Drag & drop your file here
            </p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              or click to browse
            </p>
            <span style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '0.25rem 0.75rem', borderRadius: '4px' }}>
              PDF, DOC, ZIP, JS, PY, HTML
            </span>
          </>
        )}
      </div>

      {file && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', padding: '0.75rem' }}
          onClick={handleSubmit}
        >
          <FiUploadCloud /> Submit Assignment
        </button>
      )}
    </div>
  );
};

export default AssignmentUpload;
