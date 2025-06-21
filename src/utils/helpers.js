// File size formatting
// NOT_CLEAR
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate unique IDs
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function 
// NOT_CLEAR
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if user is on mobile
export const isMobile = () => {
  return window.innerWidth < 768;
};

// Download file
export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Format page ranges (e.g., "1,3,5-7" -> [1,3,5,6,7])
// NOT_CLEAR
export const parsePageRanges = (rangeString, maxPages) => {
  const ranges = rangeString.split(',').map(r => r.trim());
  const pages = new Set();
  
  for (const range of ranges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(n => parseInt(n));
      for (let i = start; i <= end && i <= maxPages; i++) {
        if (i > 0) pages.add(i);
      }
    } else {
      const page = parseInt(range);
      if (page > 0 && page <= maxPages) {
        pages.add(page);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
};