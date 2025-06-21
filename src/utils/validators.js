import { APP_CONFIG } from '../constants/config.js';
import  {formatFileSize, parsePageRanges} from "../utils/helpers.js";

export const validatePDFFile = (file, userTier = 'free') => {
  const errors = [];
  
  // Check file type
  if (file.type !== 'application/pdf') {
    errors.push('Only PDF files are supported');
  }
  
  // Check file size
  const maxSize = APP_CONFIG.FILE_LIMITS[userTier.toUpperCase()];
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${formatFileSize(maxSize)} limit`);
  }
  
  // Check if file is corrupted (basic check)
  if (file.size < 100) {
    errors.push('File appears to be corrupted or empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePageRange = (rangeString, maxPages) => {
  if (!rangeString || rangeString.trim() === '') {
    return { isValid: false, error: 'Page range is required' };
  }
  
  const pattern = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/;
  if (!pattern.test(rangeString.trim())) {
    return { 
      isValid: false, 
      error: 'Invalid format. Use: 1,3,5-7' 
    };
  }
  
  try {
    const pages = parsePageRanges(rangeString, maxPages);
    if (pages.length === 0) {
      return { isValid: false, error: 'No valid pages found' };
    }
    
    return { isValid: true, pages };
  } catch (error) {
    return { isValid: false, error: 'Invalid page range'+error };
  }
};

export const validateFileCount = (fileCount, userTier = 'free') => {
  if (userTier === 'free' && fileCount > 2) {
    return {
      isValid: false,
      error: 'Free tier allows maximum 2 files. Upgrade to Pro for unlimited files.'
    };
  }
  
  return { isValid: true };
};