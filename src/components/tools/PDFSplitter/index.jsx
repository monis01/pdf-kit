// Example: Using FileUpload with Validation in PDFSplitter component
// src/components/tools/PDFSplitter/index.jsx

import React from 'react';
import FileUpload from '../shared/FileUpload';
import ValidationProgress from '../../ui/ValidationProgress';
import { useFileUpload } from '../../../hooks/useFileUpload';
import { formatFileSize } from '../../../utils/helpers';

const PDFSplitter = ({ userTier = 'free' }) => {
  const {
    selectedFile,
    isValidating,
    validationError,
    fileMetadata,
    validationProgress,
    validationStep,
    handleFileSelect,
    handleFileRemove,
    hasValidFile,
    isReady,
    isValidationComplete,
    fileSizeLimit
  } = useFileUpload({
    userTier,
    onFileValidated: (file, metadata) => {
      console.log('File validated successfully:', {
        fileName: file.name,
        pageCount: metadata.pageCount,
        fileSize: formatFileSize(file.size)
      });
    },
    onError: (error, type) => {
      console.error('File validation failed:', { error, type });
      // Here you could show a toast notification
    }
  });

  return (
    <div className="pdf-splitter">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* Page Header */}
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold">PDF Splitter</h1>
              <p className="lead text-muted">
                Extract specific pages or split your PDF into separate files
              </p>
            </div>

            {/* File Upload Section */}
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onFileRemove={handleFileRemove}
              maxSize={fileSizeLimit}
              userTier={userTier}
              disabled={isValidating}
              className="mb-4"
            />

            {/* Validation Progress */}
            {(isValidating || isValidationComplete) && (
              <ValidationProgress
                progress={validationProgress}
                currentStep={validationStep}
                isComplete={isValidationComplete}
                hasError={!!validationError}
                errorMessage={validationError}
                className="mb-4"
              />
            )}

            {/* File Metadata Display */}
            {hasValidFile && fileMetadata && (
              <div className="card mb-4">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <h5 className="card-title mb-0">PDF Information</h5>
                  <span className="badge bg-success">Ready</span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>File Name:</strong>
                        <div className="text-muted">{fileMetadata.fileName}</div>
                      </div>
                      <div className="mb-3">
                        <strong>File Size:</strong>
                        <div className="text-muted">{formatFileSize(fileMetadata.fileSize)}</div>
                      </div>
                      <div className="mb-3">
                        <strong>Pages:</strong>
                        <div className="text-muted">{fileMetadata.pageCount} pages</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      {fileMetadata.title && (
                        <div className="mb-3">
                          <strong>Title:</strong>
                          <div className="text-muted">{fileMetadata.title}</div>
                        </div>
                      )}
                      {fileMetadata.author && (
                        <div className="mb-3">
                          <strong>Author:</strong>
                          <div className="text-muted">{fileMetadata.author}</div>
                        </div>
                      )}
                      {fileMetadata.version && (
                        <div className="mb-3">
                          <strong>PDF Version:</strong>
                          <div className="text-muted">{fileMetadata.version}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Page Information */}
                  {fileMetadata.pages && fileMetadata.pages.length > 0 && (
                    <div className="mt-3 pt-3 border-top">
                      <strong>Page Information:</strong>
                      <div className="mt-2">
                        {fileMetadata.pages.map((page, index) => (
                          <span key={index} className="badge bg-light text-dark me-2 mb-1">
                            Page {page.pageNumber}: {page.width}×{page.height}px ({page.orientation})
                          </span>
                        ))}
                        {fileMetadata.pageCount > fileMetadata.pages.length && (
                          <span className="text-muted small">
                            ... and {fileMetadata.pageCount - fileMetadata.pages.length} more pages
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Split Configuration (only shown when file is ready) */}
            {isReady && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Split Configuration</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">
                    Specify which pages to extract from your {fileMetadata.pageCount}-page document
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      Page ranges <span className="text-muted">(e.g., 1-5, 8, 10-12)</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder={`1-5, 10, ${Math.max(1, fileMetadata.pageCount - 2)}-${fileMetadata.pageCount}`}
                    />
                    <div className="form-text">
                      Separate ranges with commas. Use hyphens for page ranges.
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary">
                      Split PDF
                    </button>
                    <button className="btn btn-outline-secondary">
                      Preview Pages
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Upgrade Prompt for Free Users */}
            {userTier === 'free' && selectedFile && (
              <div className="card border-warning mt-4">
                <div className="card-body text-center">
                  <h6 className="card-title text-warning">Free Tier Limitations</h6>
                  <p className="card-text small text-muted mb-3">
                    Free users can process files up to {formatFileSize(fileSizeLimit)} and basic splitting features.
                  </p>
                  <button className="btn btn-warning btn-sm">
                    Upgrade to Pro for unlimited features
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSplitter;