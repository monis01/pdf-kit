/* eslint-disable no-unused-vars */
// src/components/ui/ValidationProgress.jsx
import React from 'react';
import { CheckCircle, AlertCircle, FileText, Search, Settings } from 'lucide-react';

const ValidationProgress = ({ 
  progress = 0, 
  currentStep = '', 
  isComplete = false, 
  hasError = false,
  errorMessage = '',
  className = '' 
}) => {
  
  const validationSteps = [
    { id: 'basic', label: 'File Check', icon: FileText, threshold: 15 },
    { id: 'header', label: 'PDF Header', icon: Search, threshold: 40 },
    { id: 'parsing', label: 'Parsing Document', icon: Settings, threshold: 70 },
    { id: 'metadata', label: 'Extracting Info', icon: FileText, threshold: 90 },
    { id: 'complete', label: 'Validation Complete', icon: CheckCircle, threshold: 100 }
  ];

  const getCurrentStepIndex = () => {
    return validationSteps.findIndex(step => progress >= step.threshold);
  };

  const getStepStatus = (stepIndex) => {
    const currentIndex = getCurrentStepIndex();
    
    if (hasError) {
      return stepIndex <= currentIndex ? 'error' : 'pending';
    }
    
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  const getStepIcon = (step, status) => {
    const IconComponent = step.icon;
    
    if (status === 'completed') {
      return <CheckCircle size={20} className="text-success" />;
    } else if (status === 'error') {
      return <AlertCircle size={20} className="text-danger" />;
    } else {
      return <IconComponent size={20} className={status === 'active' ? 'text-primary' : 'text-muted'} />;
    }
  };

  return (
    <div className={`validation-progress ${className}`}>
      {/* Progress Bar */}
      <div className="progress mb-3" style={{ height: '8px' }}>
        <div 
          className={`progress-bar ${hasError ? 'bg-danger' : 'bg-primary'} progress-bar-striped ${!isComplete ? 'progress-bar-animated' : ''}`}
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      {/* Current Status */}
      <div className="validation-status mb-3">
        {hasError ? (
          <div className="alert alert-danger py-2 mb-0">
            <div className="d-flex align-items-center">
              <AlertCircle size={20} className="me-2" />
              <div>
                <strong>Validation Failed</strong>
                {errorMessage && <div className="small mt-1">{errorMessage}</div>}
              </div>
            </div>
          </div>
        ) : isComplete ? (
          <div className="alert alert-success py-2 mb-0">
            <div className="d-flex align-items-center">
              <CheckCircle size={20} className="me-2" />
              <strong>PDF validated successfully!</strong>
            </div>
          </div>
        ) : (
          <div className="alert alert-info py-2 mb-0">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Validating...</span>
              </div>
              <strong>Validating PDF file... {Math.round(progress)}%</strong>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Steps (Optional - shown when expanded) */}
      <div className="validation-steps">
        <div className="row">
          {validationSteps.slice(0, -1).map((step, index) => {
            const status = getStepStatus(index);
            
            return (
              <div key={step.id} className="col-6 col-md-3 mb-2">
                <div className={`validation-step ${status}`}>
                  <div className="step-icon mb-1">
                    {getStepIcon(step, status)}
                  </div>
                  <div className={`step-label small ${
                    status === 'completed' ? 'text-success' :
                    status === 'active' ? 'text-primary' :
                    status === 'error' ? 'text-danger' : 'text-muted'
                  }`}>
                    {step.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValidationProgress;