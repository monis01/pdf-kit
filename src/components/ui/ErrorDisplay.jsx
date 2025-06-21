/* eslint-disable no-unused-vars */
// src/components/ui/ErrorDisplay.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';

const ErrorDisplay = ({ 
  error, 
  errorType = 'general',
  onRetry = null,
  onUpgrade = null,
  className = '' 
}) => {
  
  const getErrorConfig = (type, message) => {
    switch (type) {
      case 'validation':
        return {
          icon: AlertTriangle,
          title: 'File Validation Error',
          color: 'danger',
          showRetry: true,
          showHelp: true
        };
      
      case 'size_limit':
        return {
          icon: AlertTriangle,
          title: 'File Size Limit Exceeded',
          color: 'warning',
          showRetry: false,
          showUpgrade: true,
          showHelp: true
        };
      
      case 'pdf_validation':
        return {
          icon: AlertTriangle,
          title: 'PDF Processing Error',
          color: 'danger',
          showRetry: true,
          showHelp: true
        };
      
      case 'processing':
        return {
          icon: AlertTriangle,
          title: 'Processing Error',
          color: 'danger',
          showRetry: true,
          showHelp: false
        };
      
      default:
        return {
          icon: AlertTriangle,
          title: 'Error',
          color: 'danger',
          showRetry: true,
          showHelp: false
        };
    }
  };

  const getErrorSolutions = (type, message) => {
    switch (type) {
      case 'size_limit':
        return [
          'Try compressing your PDF before uploading',
          'Upgrade to Pro for larger file support',
          'Split the document into smaller sections'
        ];
      
      case 'pdf_validation':
        if (message.includes('password') || message.includes('encrypted')) {
          return [
            'Remove password protection from the PDF',
            'Save the PDF without security restrictions',
            'Use a different PDF that is not encrypted'
          ];
        }
        if (message.includes('corrupt')) {
          return [
            'Try opening the PDF in another application',
            'Re-save or re-export the PDF',
            'Use a different PDF file'
          ];
        }
        return [
          'Ensure the file is a valid PDF document',
          'Try re-saving the PDF from its original application',
          'Use a different PDF file'
        ];
      
      case 'validation':
        return [
          'Ensure the file is a PDF document',
          'Check that the file is not corrupted',
          'Try uploading a different file'
        ];
      
      default:
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Try uploading the file again'
        ];
    }
  };

  const config = getErrorConfig(errorType, error);
  const solutions = getErrorSolutions(errorType, error);
  const IconComponent = config.icon;

  return (
    <div className={`error-display alert alert-${config.color} ${className}`} role="alert">
      <div className="d-flex">
        <div className="flex-shrink-0">
          <IconComponent size={24} className="mt-1" />
        </div>
        
        <div className="flex-grow-1 ms-3">
          <h6 className="alert-heading mb-2">{config.title}</h6>
          
          <p className="mb-3">{error}</p>
          
          {/* Solutions */}
          {solutions.length > 0 && (
            <div className="mb-3">
              <strong className="small">Possible solutions:</strong>
              <ul className="small mb-0 mt-1">
                {solutions.map((solution, index) => (
                  <li key={index}>{solution}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="d-flex flex-wrap gap-2">
            {config.showRetry && onRetry && (
              <button 
                className={`btn btn-sm btn-outline-${config.color}`}
                onClick={onRetry}
              >
                <RefreshCw size={14} className="me-1" />
                Try Again
              </button>
            )}
            
            {config.showUpgrade && onUpgrade && (
              <button 
                className="btn btn-sm btn-warning"
                onClick={onUpgrade}
              >
                <ExternalLink size={14} className="me-1" />
                Upgrade to Pro
              </button>
            )}
            
            {config.showHelp && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  // Could open help modal or link to documentation
                  console.log('Show help for:', errorType);
                }}
              >
                <HelpCircle size={14} className="me-1" />
                Get Help
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;