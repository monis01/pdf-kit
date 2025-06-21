/* eslint-disable no-unused-vars */
// src/hooks/useFileUpload.js
import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../constants/config';
import { PDFValidationService } from '../services/utils/fileValidation';

export const useFileUpload = ({ 
  userTier = 'free',
  onFileValidated = null,
  onError = null 
} = {}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationStep, setValidationStep] = useState('');

  // Get file size limit based on user tier
  const getMaxFileSize = useCallback(() => {
    return APP_CONFIG.FILE_LIMITS[userTier.toUpperCase()];
  }, [userTier]);

  // Basic file validation (before PDF-specific validation)
  const validateBasicFile = useCallback((file) => {
    const errors = [];
    
    // Check if file exists
    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      errors.push('Only PDF files are supported');
    }

    // Check file extension as backup
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File must have .pdf extension');
    }

    // Check file size
    const maxSize = getMaxFileSize();
    if (file.size > maxSize) {
      const tierText = userTier === 'free' ? 'Free tier' : 'Pro tier';
      const sizeText = `${Math.round(maxSize / (1024 * 1024))}MB`;
      errors.push(`${tierText} supports files up to ${sizeText}. ${userTier === 'free' ? 'Upgrade to Pro for larger files.' : ''}`);
    }

    // Check for empty files
    if (file.size < 100) {
      errors.push('File appears to be empty or corrupted');
    }

    // Check for extremely large files that might crash browser
    const browserLimit = 500 * 1024 * 1024; // 500MB browser safety limit
    if (file.size > browserLimit) {
      errors.push('File is too large for browser processing. Please use a smaller file.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [getMaxFileSize, userTier]);

  // Handle file selection with full PDF validation
  const handleFileSelect = useCallback(async (file) => {
    setValidationError(null);
    setIsValidating(true);
    setValidationProgress(0);
    setValidationStep('Starting validation...');
    
    try {
      // Quick basic validation first
      const quickValidation = await PDFValidationService.quickValidate(file);
      
      if (!quickValidation.isValid) {
        const errorMessage = quickValidation.errors.join('. ');
        setValidationError(errorMessage);
        if (onError) {
          onError(errorMessage, 'validation');
        }
        return;
      }

      // Set file for immediate UI feedback
      setSelectedFile(file);
      
      // Progress callback for validation steps
      const progressCallback = (progress) => {
        setValidationProgress(progress);
        
        // Update step descriptions
        if (progress <= 15) {
          setValidationStep('Checking file format...');
        } else if (progress <= 40) {
          setValidationStep('Validating PDF structure...');
        } else if (progress <= 70) {
          setValidationStep('Parsing document...');
        } else if (progress <= 90) {
          setValidationStep('Extracting metadata...');
        } else {
          setValidationStep('Validation complete!');
        }
      };

      // Full PDF validation with metadata extraction
      const validationResult = await PDFValidationService.validatePDFFile(file, progressCallback);
      
      if (!validationResult.isValid) {
        const errorMessage = validationResult.errors.join('. ');
        setValidationError(errorMessage);
        if (onError) {
          onError(errorMessage, 'pdf_validation');
        }
        return;
      }

      // Check file size against tier limits
      const maxSize = getMaxFileSize();
      if (file.size > maxSize) {
        const tierText = userTier === 'free' ? 'Free tier' : 'Pro tier';
        const sizeText = `${Math.round(maxSize / (1024 * 1024))}MB`;
        const errorMessage = `${tierText} supports files up to ${sizeText}. ${userTier === 'free' ? 'Upgrade to Pro for larger files.' : ''}`;
        
        setValidationError(errorMessage);
        if (onError) {
          onError(errorMessage, 'size_limit');
        }
        return;
      }

      // Success - update metadata and notify parent
      setFileMetadata(validationResult.metadata);
      setValidationStep('Ready for processing!');

      if (onFileValidated) {
        onFileValidated(file, validationResult.metadata);
      }

    } catch (error) {
      console.error('File validation error:', error);
      const errorMessage = 'Failed to validate PDF file. Please try again.';
      setValidationError(errorMessage);
      if (onError) {
        onError(errorMessage, 'processing');
      }
    } finally {
      setIsValidating(false);
    }
  }, [getMaxFileSize, userTier, onFileValidated, onError]);

  // Handle file removal
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setFileMetadata(null);
    setValidationError(null);
    setIsValidating(false);
    setValidationProgress(0);
    setValidationStep('');
  }, []);

  // Update file metadata (called by validation service)
  const updateFileMetadata = useCallback((newMetadata) => {
    setFileMetadata(prev => ({
      ...prev,
      ...newMetadata
    }));
  }, []);

  // Check if file meets requirements for specific operation
  const canProcessFile = useCallback((operation = 'split') => {
    if (!selectedFile || validationError) {
      return false;
    }

    // Check feature availability for user tier
    const features = APP_CONFIG.FEATURES[userTier.toUpperCase()];
    
    switch (operation) {
      case 'split':
        return features.includes('split-basic') || features.includes('split-advanced');
      case 'merge':
        return features.includes('merge-2files') || features.includes('merge-unlimited');
      case 'compress':
        return features.includes('compress');
      default:
        return true;
    }
  }, [selectedFile, validationError, userTier]);

  // Get upgrade message for locked features
  const getUpgradeMessage = useCallback((operation) => {
    if (userTier !== 'free') {
      return null;
    }

    switch (operation) {
      case 'compress':
        return 'PDF compression is available for Pro users. Upgrade to access this feature.';
      case 'split-advanced':
        return 'Advanced splitting options are available for Pro users.';
      case 'merge-unlimited':
        return 'Unlimited file merging is available for Pro users.';
      default:
        return null;
    }
  }, [userTier]);

  return {
    // State
    selectedFile,
    isValidating,
    validationError,
    fileMetadata,
    validationProgress,
    validationStep,
    
    // Actions
    handleFileSelect,
    handleFileRemove,
    updateFileMetadata,
    
    // Utilities
    getMaxFileSize,
    canProcessFile,
    getUpgradeMessage,
    
    // Computed values
    hasValidFile: selectedFile && !validationError && !isValidating,
    isReady: selectedFile && !validationError && !isValidating && validationProgress === 100,
    fileSizeLimit: getMaxFileSize(),
    isValidationComplete: validationProgress === 100 && !isValidating,
  };
};