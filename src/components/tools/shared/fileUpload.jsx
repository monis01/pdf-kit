/* eslint-disable no-unused-vars */
import React, { useState, useRef, useCallback } from 'react';
import { formatFileSize } from '../../../utils/helpers';

const FileUpload = ({
    onFileSelect,
    selectedFile,
    onFileRemove,
    maxSize = 10 * 1024 * 1024, // 10MB default
    userTier = 'free',
    accept = '.pdf',
    disabled = false,
    className = ''
}) => {

    const [isDragActive, setIsDragActive] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);
    const fileInputRef = useRef(null);

    // Handle file selection from input
    const handleFileSelect = useCallback((event) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onFileSelect]);

    // Handle drag events
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => {
            const newCounter = prev - 1;
            if (newCounter === 0) {
                setIsDragActive(false);
            }
            return newCounter;
        });
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);


    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragActive(false);
        setDragCounter(0);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            onFileSelect(file);
        }
    }, [onFileSelect]);

    // Handle click to browse
    const handleBrowseClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, [disabled]);

    // Handle file removal
    const handleRemoveFile = useCallback((e) => {
        e.stopPropagation();
        onFileRemove();
    }, [onFileRemove]);




    const getSizeLimitText = () => {
        return `${userTier === 'free' ? 'Free tier: Up to' : 'Pro tier: Up to'} ${formatFileSize(maxSize)}`;
    };

    return (
    <div className={`file-upload-container ${className}`}>
      {selectedFile ? (
        // File selected state
        <div className="selected-file-display">
          <div className="file-info">
            <div className="file-icon">
              <FileText size={48} className="text-success" />
            </div>
            <div className="file-details">
              <h4 className="file-name">{selectedFile.name}</h4>
              <p className="file-size text-muted">{formatFileSize(selectedFile.size)}</p>
              {selectedFile.pageCount && (
                <p className="file-pages text-muted">{selectedFile.pageCount} pages</p>
              )}
            </div>
            <button 
              className="remove-file-btn"
              onClick={handleRemoveFile}
              title="Remove file"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        // Upload area
        <div 
          className={`upload-area ${isDragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled}
            className="file-input"
          />
          
          <div className="upload-content">
            <div className="upload-icon">
              <Upload size={48} className={isDragActive ? 'text-primary' : 'text-muted'} />
            </div>
            
            <div className="upload-text">
              <h3 className="upload-title">
                {isDragActive ? 'Drop PDF file here' : 'Upload PDF file'}
              </h3>
              <p className="upload-subtitle">
                Drag and drop your PDF file here, or <span className="browse-link">click to browse</span>
              </p>
              <p className="upload-limits">
                {getSizeLimitText()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

export default FileUpload;