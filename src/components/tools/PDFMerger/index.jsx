/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import 'bootstrap/dist/css/bootstrap.min.css';

function PDFMerger() {
    // ===== CONFIGURATION CONSTANTS =====
    // These values control file upload limits and cross-tab memory management
    // Designed to prevent browser crashes while maintaining good UX
    const LIMITS = {
        // Per-tab limits (what user sees in UI)
        MAX_FILES_PER_TAB: 10,
        MAX_SIZE_MB_PER_TAB: 20,  // Reduced from 50MB for browser stability

        // Cross-tab browser limits (background monitoring)
        // BROWSER_WARNING_MB: 200,  // Show warning to user
        // BROWSER_MAX_MB: 250,      // Block further uploads

        // Technical constants
        // LOCALSTORAGE_KEY: 'pdfMerger_tabUsage',
        // TAB_CLEANUP_HOURS: 24,    // Ignore very old tab data

        // Convert MB to bytes for calculations
        get MAX_SIZE_BYTES_PER_TAB() { return this.MAX_SIZE_MB_PER_TAB * 1024 * 1024; },
        // get BROWSER_WARNING_BYTES() { return this.BROWSER_WARNING_MB * 1024 * 1024; },
        // get BROWSER_MAX_BYTES() { return this.BROWSER_MAX_MB * 1024 * 1024; }
    };

    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]); // Track selected files by index
    const [fileRotations, setFileRotations] = useState({}); // Track rotation for each file by index
    //   const [pdfLibLoaded, setPdfLibLoaded] = useState(false);

    // ===== CROSS-TAB MEMORY MANAGEMENT =====
    // Generate unique tab ID for tracking memory usage across browser tabs
    // const [tabId] = useState(() => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Generate tab ID that persists across refreshes for same tab
// const [tabId] = useState(() => {
//   // Get current counter and increment
//   const counter = parseInt(localStorage.getItem('pdfMerger_tabCounter') || '0') + 1;
//   localStorage.setItem('pdfMerger_tabCounter', counter.toString());
//   return `tab_${counter}`;
// });

    // Calculate current usage for this tab and across all tabs
    const currentTabSize = files.reduce((total, file) => total + file.size, 0);
    const remainingFiles = LIMITS.MAX_FILES_PER_TAB - files.length;
    const remainingSize = LIMITS.MAX_SIZE_BYTES_PER_TAB - currentTabSize;

    // ===== PDF-LIB LOADING =====

    /**
     * Load PDF-lib from CDN dynamically
     * This ensures the library is available when needed
     */
    //   const loadPdfLib = () => {
    //     return new Promise((resolve, reject) => {
    //       // Check if PDF-lib is already loaded
    //       if (window.PDFLib) {
    //         setPdfLibLoaded(true);
    //         resolve(window.PDFLib);
    //         return;
    //       }

    //       // Create script element to load PDF-lib from CDN
    //       const script = document.createElement('script');
    //       script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
    //       script.onload = () => {
    //         if (window.PDFLib) {
    //           setPdfLibLoaded(true);
    //           resolve(window.PDFLib);
    //         } else {
    //           reject(new Error('PDF-lib failed to load properly'));
    //         }
    //       };
    //       script.onerror = () => {
    //         reject(new Error('Failed to load PDF-lib from CDN'));
    //       };

    //       document.head.appendChild(script);
    //     });
    //   };

    // ===== CROSS-TAB MEMORY MANAGEMENT FUNCTIONS =====

    /**
     * Updates localStorage with current tab's memory usage
     * Called whenever files are added/removed to track cross-tab usage
     */

// Enhanced cleanup with more aggressive timing
// const updateTabUsageInStorage = (newSize) => {
//   try {
//     const allTabsData = JSON.parse(localStorage.getItem(LIMITS.LOCALSTORAGE_KEY) || '{}');
    
//     // Update current tab
//     allTabsData[tabId] = {
//       size: newSize,
//       timestamp: Date.now()
//     };
    
//     // Very aggressive cleanup - 2 minutes
//     const cutoffTime = Date.now() - (2 * 60 * 1000);
//     Object.keys(allTabsData).forEach(key => {
//       if (allTabsData[key].timestamp < cutoffTime) {
//         delete allTabsData[key];
//       }
//     });
    
//     localStorage.setItem(LIMITS.LOCALSTORAGE_KEY, JSON.stringify(allTabsData));
//   } catch (error) {
//     console.warn('Cross-tab memory tracking unavailable:', error);
//   }
// };
    /**
     * Calculates total memory usage across all browser tabs
     * Returns { total: number, tabCount: number, thisTabSize: number }
     */
    // const getAllTabsUsage = () => {
    //     try {
    //         const allTabsData = JSON.parse(localStorage.getItem(LIMITS.LOCALSTORAGE_KEY) || '{}');

    //         let totalSize = 0;
    //         let tabCount = 0;

    //         Object.values(allTabsData).forEach(tabData => {
    //             totalSize += tabData.size;
    //             tabCount++;
    //         });

    //         return {
    //             total: totalSize,
    //             tabCount: tabCount,
    //             thisTabSize: currentTabSize
    //         };
    //     } catch (error) {
    //         // Fallback to current tab only if localStorage fails
    //         return {
    //             total: currentTabSize,
    //             tabCount: 1,
    //             thisTabSize: currentTabSize
    //         };
    //     }
    // };

    /**
     * Shows Bootstrap toast messages for user feedback
     * Replaces browser alerts with better UX
     */
    // const showToast = (message, type = 'info') => {
    //     // Create toast container if it doesn't exist
    //     let toastContainer = document.getElementById('toast-container');
    //     if (!toastContainer) {
    //         toastContainer = document.createElement('div');
    //         toastContainer.id = 'toast-container';
    //         toastContainer.className = 'position-fixed top-0 end-0 p-3';
    //         toastContainer.style.zIndex = '9999';
    //         document.body.appendChild(toastContainer);
    //     }

    //     // Create toast element
    //     const toastId = `toast-${Date.now()}`;
    //     const toastHTML = `
    //   <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
    //     <div class="d-flex">
    //       <div class="toast-body">${message}</div>
    //       <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    //     </div>
    //   </div>
    // `;

    //     toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    //     // Initialize and show toast
    //     const toastElement = document.getElementById(toastId);
    //     const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    //     toast.show();

    //     // Clean up after toast is hidden
    //     toastElement.addEventListener('hidden.bs.toast', () => {
    //         toastElement.remove();
    //     });
    // };

    const showToast = (message, type = 'info') => {
  // Check if Bootstrap is available
  if (typeof window.bootstrap === 'undefined') {
    // Fallback to console if Bootstrap not loaded
    console.log(`Toast [${type}]: ${message}`);
    return;
  }

  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
    <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;
  
  toastContainer.insertAdjacentHTML('beforeend', toastHTML);
  
  // Initialize and show toast
  const toastElement = document.getElementById(toastId);
  const toast = new window.bootstrap.Toast(toastElement, { delay: 5000 });
  toast.show();
  
  // Clean up after toast is hidden
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
};
    
    /**
     * Checks if new file uploads are allowed based on cross-tab memory limits
     * Returns: 'allow', 'warning', or 'block'
     */
    // const checkCrossTabMemoryLimits = (newFilesTotalSize) => {
    //     const currentUsage = getAllTabsUsage();
    //     const projectedTotal = currentUsage.total - currentUsage.thisTabSize + currentTabSize + newFilesTotalSize;

    //     if (projectedTotal > LIMITS.BROWSER_MAX_BYTES) {
    //         return {
    //             status: 'block',
    //             message: `Browser memory optimized for performance. Please complete or close other PDF projects to continue. (Using ${formatFileSize(currentUsage.total)} across ${currentUsage.tabCount} tab${currentUsage.tabCount > 1 ? 's' : ''})`
    //         };
    //     }

    //     if (projectedTotal > LIMITS.BROWSER_WARNING_BYTES) {
    //         return {
    //             status: 'warning',
    //             message: `For optimal performance, consider completing current work before adding more files. (${formatFileSize(projectedTotal)}/${formatFileSize(LIMITS.BROWSER_MAX_BYTES)} browser memory)`
    //         };
    //     }

    //     return { status: 'allow', message: null };
    // };

    // ===== UTILITY FUNCTIONS =====

    /**
     * Get progress bar color based on usage percentage
     * Used for visual feedback on file count and size limits
     */
    const getProgressColor = (current, max, isSize = false) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return 'danger';
        if (percentage >= 70) return 'warning';
        return 'success';
    };

    /**
     * Format file size for display (bytes to human readable)
     * Consistent formatting across the application
     */
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // ===== FILE UPLOAD AND PROCESSING =====

    /**
     * Process new files with comprehensive validation and limit checking
     * Handles both per-tab and cross-tab memory limits
     */
    // const processNewFiles = (newFiles) => {
    //     const validFiles = [];
    //     const skippedFiles = [];
    //     let tempSize = currentTabSize;
    //     let tempCount = files.length;

    //     // First, check if any files would exceed cross-tab memory limits
    //     const totalNewFilesSize = Array.from(newFiles).reduce((sum, file) => sum + file.size, 0);
    //     const memoryCheck = checkCrossTabMemoryLimits(totalNewFilesSize);

    //     // Handle cross-tab memory limits
    //     if (memoryCheck.status === 'block') {
    //         showToast(memoryCheck.message, 'danger');
    //         return; // Stop processing entirely
    //     } else if (memoryCheck.status === 'warning') {
    //         showToast(memoryCheck.message, 'warning');
    //         // Continue processing but user is warned
    //     }

    //     // Process files sequentially in user's original order
    //     for (const file of newFiles) {
    //         // ===== FILE TYPE VALIDATION =====
    //         // Support all image types and PDFs only
    //         const validTypes = ['application/pdf'];
    //         const isValidImage = file.type.startsWith('image/');

    //         if (!validTypes.includes(file.type) && !isValidImage) {
    //             skippedFiles.push({
    //                 file,
    //                 reason: 'invalid file type (only PDFs and images allowed)'
    //             });
    //             continue;
    //         }

    //         // ===== PER-TAB FILE COUNT LIMIT =====
    //         if (tempCount >= LIMITS.MAX_FILES_PER_TAB) {
    //             skippedFiles.push({
    //                 file,
    //                 reason: `file limit reached (max ${LIMITS.MAX_FILES_PER_TAB} files per tab)`
    //             });
    //             continue;
    //         }

    //         // ===== PER-TAB SIZE LIMIT =====
    //         if (tempSize + file.size > LIMITS.MAX_SIZE_BYTES_PER_TAB) {
    //             skippedFiles.push({
    //                 file,
    //                 reason: `size limit reached (max ${LIMITS.MAX_SIZE_MB_PER_TAB}MB per tab)`
    //             });
    //             continue;
    //         }

    //         // File passed all validations - add it
    //         validFiles.push(file);
    //         tempSize += file.size;
    //         tempCount++;
    //     }

    //     // ===== UPDATE STATE AND STORAGE =====
    //     if (validFiles.length > 0) {
    //         const currentLength = files.length;
    //         setFiles(prevFiles => [...prevFiles, ...validFiles]);

    //         // Auto-select newly uploaded files for user convenience
    //         setSelectedFiles(prev => [...prev, ...validFiles.map((_, i) => currentLength + i)]);

    //         // Update cross-tab memory tracking
    //         updateTabUsageInStorage(tempSize);

    //         // Show success message
    //         showToast(
    //             `Successfully added ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`,
    //             'success'
    //         );
    //     }

    //     // ===== USER FEEDBACK FOR SKIPPED FILES =====
    //     if (skippedFiles.length > 0) {
    //         const totalAttempted = newFiles.length;
    //         const reasons = [...new Set(skippedFiles.map(s => s.reason))];
    //         const reasonText = reasons.join(' and ');

    //         const message = `Added ${validFiles.length} of ${totalAttempted} files. ${skippedFiles.length} files skipped (${reasonText}).`;
    //         showToast(message, validFiles.length > 0 ? 'warning' : 'danger');
    //     }

    //     console.log('Files processed:', {
    //         valid: validFiles.length,
    //         skipped: skippedFiles.length,
    //         tabMemoryUsage: formatFileSize(tempSize),
    //         crossTabUsage: formatFileSize(getAllTabsUsage().total)
    //     });
    // };

    // ===== EVENT HANDLERS =====

const processNewFiles = (newFiles) => {
  const validFiles = [];
  const skippedFiles = [];
  let tempSize = currentTabSize;
  let tempCount = files.length;
  
  for (const file of newFiles) {
    // Simple validations only
    const validTypes = ['application/pdf'];
    const isValidImage = file.type.startsWith('image/');
    
    if (!validTypes.includes(file.type) && !isValidImage) {
      skippedFiles.push({ file, reason: 'invalid file type' });
      continue;
    }
    
    if (tempCount >= LIMITS.MAX_FILES_PER_TAB) {
      skippedFiles.push({ file, reason: 'file limit reached' });
      continue;
    }
    
    if (tempSize + file.size > LIMITS.MAX_SIZE_BYTES_PER_TAB) {
      skippedFiles.push({ file, reason: 'size limit reached' });
      continue;
    }
    
    validFiles.push(file);
    tempSize += file.size;
    tempCount++;
  }
  
  // Simple state update
  if (validFiles.length > 0) {
    const currentLength = files.length;
    setFiles(prevFiles => [...prevFiles, ...validFiles]);
    setSelectedFiles(prev => [...prev, ...validFiles.map((_, i) => currentLength + i)]);
    showToast(`Added ${validFiles.length} file(s)`, 'success');
  }
  
  if (skippedFiles.length > 0) {
    showToast(`Skipped ${skippedFiles.length} file(s) - check limits`, 'warning');
  }
};


    /**
     * Handle file upload via file input (click to browse)
     */
    const handleFileUpload = (event) => {
        const selectedFiles = Array.from(event.target.files);
        processNewFiles(selectedFiles);
    };

    /**
     * Handle file upload via drag and drop
     */
    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files);
        processNewFiles(droppedFiles);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleSelectionChange = (index, isSelected) => {
        if (isSelected) {
            setSelectedFiles(prev => [...prev, index]);
        } else {
            setSelectedFiles(prev => prev.filter(i => i !== index));
        }
    };

    const handleSelectAll = () => {
        setSelectedFiles(files.map((_, index) => index));
    };

    const handleDeselectAll = () => {
        setSelectedFiles([]);
    };

    const handleRotateFile = (index) => {
        const file = files[index];
        // Only allow rotation for images
        if (!file.type.startsWith('image/')) {
            return;
        }

        setFileRotations(prev => ({
            ...prev,
            [index]: ((prev[index] || 0) + 90) % 360
        }));

        console.log('Rotate file at index:', index, 'New rotation:', ((fileRotations[index] || 0) + 90) % 360);
    };

    /**
     * Handle file deletion with proper cleanup
     * Updates both local state and cross-tab memory tracking
     */
    const handleDeleteFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);

        // Calculate new total size after deletion
        const newTotalSize = updatedFiles.reduce((total, file) => total + file.size, 0);

        // Update cross-tab memory tracking
        // updateTabUsageInStorage(newTotalSize);

        // Remove rotation data for deleted file and adjust indices
        setFileRotations(prev => {
            const newRotations = { ...prev };
            delete newRotations[index];

            // Adjust indices for remaining files (files after deleted index shift down)
            const adjustedRotations = {};
            Object.keys(newRotations).forEach(key => {
                const idx = parseInt(key);
                if (idx > index) {
                    adjustedRotations[idx - 1] = newRotations[key];
                } else {
                    adjustedRotations[idx] = newRotations[key];
                }
            });
            return adjustedRotations;
        });

        // Update selected files indices after deletion
        setSelectedFiles(prev =>
            prev.filter(selectedIndex => selectedIndex !== index)
                .map(selectedIndex => selectedIndex > index ? selectedIndex - 1 : selectedIndex)
        );

        showToast('File removed successfully', 'info');
    };

    const handlePreview = (index) => {
        console.log('Preview file at index:', index);
        // TODO: Implement preview functionality
    };

    // Drag and drop reordering
    const handleReorderDragStart = (event, index) => {
        setDraggedIndex(index);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleReorderDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleReorderDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const handleReorderDrop = (event, dropIndex) => {
        event.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const newFiles = [...files];
        const draggedFile = newFiles[draggedIndex];

        // Remove dragged item and insert at new position
        newFiles.splice(draggedIndex, 1);
        newFiles.splice(dropIndex, 0, draggedFile);

        setFiles(newFiles);

        // Update selected files indices after reordering
        setSelectedFiles(prev => {
            return prev.map(selectedIndex => {
                if (selectedIndex === draggedIndex) {
                    return dropIndex;
                } else if (draggedIndex < dropIndex && selectedIndex > draggedIndex && selectedIndex <= dropIndex) {
                    return selectedIndex - 1;
                } else if (draggedIndex > dropIndex && selectedIndex >= dropIndex && selectedIndex < draggedIndex) {
                    return selectedIndex + 1;
                }
                return selectedIndex;
            });
        });

        setDraggedIndex(null);
    };

    const mergePDFs = async () => {
        // Validate that files are selected for merging
        if (selectedFiles.length === 0) {
            showToast('Please select at least one file to merge', 'warning');
            return;
        }

        setIsLoading(true);
        setProgress(0);

        try {
            // ===== DIRECT PDF-LIB USAGE =====
            // No need to load library - it's already imported
            const mergedPdf = await PDFDocument.create();
            const totalFiles = selectedFiles.length;

            // Process each selected file
            for (let i = 0; i < totalFiles; i++) {
                const fileIndex = selectedFiles[i];
                const file = files[fileIndex];

                // Update progress for user feedback
                setProgress(((i + 1) / totalFiles) * 100);

                // Handle different file types with error handling
                if (file.type === 'application/pdf') {
                    // ===== PDF FILE PROCESSING =====
                    try {
                        const fileBuffer = await file.arrayBuffer();
                        const pdf = await PDFDocument.load(fileBuffer);
                        const pageCount = pdf.getPageCount();

                        // Copy all pages from this PDF to the merged document
                        const pages = await mergedPdf.copyPages(pdf, [...Array(pageCount).keys()]);
                        pages.forEach(page => mergedPdf.addPage(page));
                    } catch (pdfError) {
                        console.error(`Error processing PDF ${file.name}:`, pdfError);
                        showToast(`Error processing PDF "${file.name}". File may be corrupted or password-protected.`, 'danger');
                        // Continue with other files instead of stopping entire process
                        continue;
                    }
                } else if (file.type.startsWith('image/')) {
                    // ===== IMAGE FILE PROCESSING WITH ROTATION =====
                    try {
                        const imageBuffer = await file.arrayBuffer();
                        let image;

                        // Embed image based on type with proper error handling
                        if (file.type === 'image/png') {
                            image = await mergedPdf.embedPng(imageBuffer);
                        } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                            image = await mergedPdf.embedJpg(imageBuffer);
                        } else {
                            // For other image types, skip with warning
                            showToast(`Unsupported image format for "${file.name}". Skipping.`, 'warning');
                            continue;
                        }

                        if (image) {
                            // Create a new page for the image
                            const page = mergedPdf.addPage();
                            const { width, height } = page.getSize();

                            // Get rotation setting for this specific file
                            const rotation = fileRotations[fileIndex] || 0;

                            // Calculate image dimensions considering rotation
                            let imageAspectRatio = image.width / image.height;

                            // For 90° and 270° rotations, swap width/height for aspect ratio calculation
                            if (rotation === 90 || rotation === 270) {
                                imageAspectRatio = image.height / image.width;
                            }

                            const pageAspectRatio = width / height;

                            // Scale image to fit page while maintaining aspect ratio
                            let imageWidth, imageHeight;
                            if (imageAspectRatio > pageAspectRatio) {
                                // Image is wider than page ratio
                                imageWidth = width - 40; // 20px margin on each side
                                imageHeight = imageWidth / imageAspectRatio;
                            } else {
                                // Image is taller than page ratio
                                imageHeight = height - 40; // 20px margin top/bottom
                                imageWidth = imageHeight * imageAspectRatio;
                            }

                            // Center the image on the page
                            const x = (width - imageWidth) / 2;
                            const y = (height - imageHeight) / 2;

                            // Draw image with rotation applied
                            page.drawImage(image, {
                                x,
                                y,
                                width: imageWidth,
                                height: imageHeight,
                                rotate: { angle: rotation, type: 'degrees' }
                            });
                        }
                    } catch (imageError) {
                        console.error(`Error processing image ${file.name}:`, imageError);
                        showToast(`Error processing image "${file.name}". File may be corrupted or invalid.`, 'danger');
                        // Continue with other files instead of stopping
                        continue;
                    }
                }
            }

            // ===== GENERATE AND DOWNLOAD FINAL PDF =====
            const pdfBytes = await mergedPdf.save();

            // Create download link and trigger download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `merged-document-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Show success message
            showToast(`Successfully merged ${selectedFiles.length} files into PDF!`, 'success');

            console.log('PDF merge completed successfully');

        } catch (error) {
            // Handle any unexpected errors during the merge process
            console.error('Error during PDF merge:', error);
            if (error.message.includes('PDF-lib')) {
                showToast('Failed to load PDF processing library. Please check your internet connection and try again.', 'danger');
            } else {
                showToast('An unexpected error occurred during PDF merge. Please try again.', 'danger');
            }
        } finally {
            // Reset loading state regardless of success or failure
            setIsLoading(false);
            setProgress(0);
        }
    };

    // ===== COMPONENT LIFECYCLE =====

   /**
 * Initialize tab tracking and setup cleanup on unmount
 * Only runs once when component mounts
 */
// React.useEffect(() => {
//   // Update initial tab usage
// //   updateTabUsageInStorage(currentTabSize);
  
//   // Cleanup function when component unmounts or tab closes
//   return () => {
//     try {
//       // Remove this tab's data from localStorage
//       const allTabsData = JSON.parse(localStorage.getItem(LIMITS.LOCALSTORAGE_KEY) || '{}');
//       delete allTabsData[tabId];
//       localStorage.setItem(LIMITS.LOCALSTORAGE_KEY, JSON.stringify(allTabsData));
//     } catch (error) {
//       console.warn('Tab cleanup failed:', error);
//     }
//   };
// }, []); // Empty dependency array - only run on mount/unmount

/**
 * Update cross-tab memory tracking whenever files change
 * Runs whenever currentTabSize changes (files added/removed)
 */
// React.useEffect(() => {
//   updateTabUsageInStorage(currentTabSize);
// }, [currentTabSize]); // Only depends on currentTabSize

    // State 1: No files uploaded - Show upload interface
    if (files.length === 0) {
        return (
            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1>PDF Merger</h1>
                <p>Combine multiple PDFs and images into a single document</p>

                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '60px 20px',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc',
                        marginTop: '40px',
                        cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
                    <h3>Drag and drop files here</h3>
                    <p>or click to browse</p>
                    <p style={{ fontSize: '14px', color: '#64748b', marginTop: '10px' }}>
                        Supports PDF, JPG, PNG files
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>
                        Limit: {LIMITS.MAX_FILES_PER_TAB} files, {LIMITS.MAX_SIZE_MB_PER_TAB}MB total
                    </p>

                    <input
                        id="fileInput"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        );
    }

    // State 2: Files uploaded - Show file management with cards
    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>PDF Merger</h1>

            {/* Limits Display Header */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label small text-muted">Files ({files.length}/{LIMITS.MAX_FILES_PER_TAB})</label>
                    <div className="progress mb-1" style={{ height: '10px' }}>
                        <div
                            className={`progress-bar bg-${getProgressColor(files.length, LIMITS.MAX_FILES_PER_TAB)}`}
                            style={{ width: `${(files.length / LIMITS.MAX_FILES_PER_TAB) * 100}%` }}
                        ></div>
                    </div>
                    <small className="text-muted">{remainingFiles} files remaining</small>
                </div>
                <div className="col-md-6">
                    <label className="form-label small text-muted">Size ({formatFileSize(currentTabSize)}/{LIMITS.MAX_SIZE_MB_PER_TAB}MB)</label>
                    <div className="progress mb-1" style={{ height: '10px' }}>
                        <div
                            className={`progress-bar bg-${getProgressColor(currentTabSize, LIMITS.MAX_SIZE_BYTES_PER_TAB, true)}`}
                            style={{ width: `${(currentTabSize / LIMITS.MAX_SIZE_BYTES_PER_TAB) * 100}%` }}
                        ></div>
                    </div>
                    <small className="text-muted">{formatFileSize(remainingSize)} remaining</small>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="badge bg-primary me-2">📁 Total: {files.length}</span>
                    <span className="badge bg-success">✓ Selected: {selectedFiles.length}</span>
                </div>
                <div>
                    <button onClick={handleSelectAll} className="btn btn-outline-primary btn-sm me-2">
                        Select All
                    </button>
                    <button onClick={handleDeselectAll} className="btn btn-outline-secondary btn-sm">
                        Deselect All
                    </button>
                </div>
            </div>

            {/* Add more files zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    border: `2px dashed ${files.length >= LIMITS.MAX_FILES_PER_TAB || currentTabSize >= LIMITS.MAX_SIZE_BYTES_PER_TAB ? '#ef4444' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: files.length >= LIMITS.MAX_FILES_PER_TAB || currentTabSize >= LIMITS.MAX_SIZE_BYTES_PER_TAB ? '#fef2f2' : '#f8fafc',
                    marginBottom: '30px',
                    cursor: files.length >= LIMITS.MAX_FILES_PER_TAB || currentTabSize >= LIMITS.MAX_SIZE_BYTES_PER_TAB ? 'not-allowed' : 'pointer'
                }}
                onClick={() => {
                    if (files.length < LIMITS.MAX_FILES_PER_TAB && currentTabSize < LIMITS.MAX_SIZE_BYTES_PER_TAB) {
                        document.getElementById('fileInput').click();
                    }
                }}
            >
                {files.length >= LIMITS.MAX_FILES_PER_TAB ? (
                    <>
                        <span style={{ fontSize: '18px', marginRight: '8px', color: '#ef4444' }}>🚫</span>
                        Maximum {LIMITS.MAX_FILES_PER_TAB} files reached. Remove files to add more.
                    </>
                ) : currentTabSize >= LIMITS.MAX_SIZE_BYTES_PER_TAB ? (
                    <>
                        <span style={{ fontSize: '18px', marginRight: '8px', color: '#ef4444' }}>🚫</span>
                        Size limit reached ({LIMITS.MAX_SIZE_MB_PER_TAB}MB). Remove files to add more.
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: '18px', marginRight: '8px' }}>+</span>
                        Drag and drop more files here, or click to browse
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                            {remainingFiles} files, {formatFileSize(remainingSize)} remaining
                        </div>
                    </>
                )}

                <input
                    id="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
            </div>

            {/* File Cards Grid */}
            <div className="row">
                {files.map((file, index) => (
                    <div key={index} className="col-md-4 mb-3">
                        <FileCard
                            file={file}
                            index={index}
                            onRotate={() => handleRotateFile(index)}
                            onDelete={() => handleDeleteFile(index)}
                            onPreview={() => handlePreview(index)}
                            onReorderDragStart={handleReorderDragStart}
                            onReorderDragEnd={handleReorderDragEnd}
                            onReorderDragOver={handleReorderDragOver}
                            onReorderDrop={handleReorderDrop}
                            isDragging={draggedIndex === index}
                            isSelected={selectedFiles.includes(index)}
                            onSelectionChange={handleSelectionChange}
                            rotation={fileRotations[index] || 0}
                        />
                    </div>
                ))}
            </div>

            {/* Selected files merge section */}
            {files.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                        onClick={mergePDFs}
                        disabled={isLoading || selectedFiles.length === 0}
                        className="btn btn-primary btn-lg"
                        style={{ minWidth: '200px' }}
                    >
                        {isLoading ? 'Merging...' : `Merge ${selectedFiles.length} Selected Files`}
                    </button>

                    {isLoading && (
                        <div style={{ marginTop: '20px' }}>
                            <div className="progress" style={{ height: '10px' }}>
                                <div
                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <small className="text-muted">Processing files... {Math.round(progress)}%</small>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FileCard({ file, index, onRotate, onDelete, onPreview, onReorderDragStart, onReorderDragEnd, onReorderDragOver, onReorderDrop, isDragging, isSelected, onSelectionChange, rotation = 0 }) {
    const [imagePreview, setImagePreview] = useState(null);

    // Generate preview for images
    React.useEffect(() => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    }, [file]);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div
            style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#ffffff',
                position: 'relative',
                opacity: isDragging ? 0.5 : 1,
                cursor: isDragging ? 'grabbing' : 'default'
            }}
            draggable
            onDragStart={(e) => onReorderDragStart(e, index)}
            onDragEnd={onReorderDragEnd}
            onDragOver={onReorderDragOver}
            onDrop={(e) => onReorderDrop(e, index)}
        >
            {/* Drag Handle */}
            <div
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    cursor: 'grab'
                }}
                onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
            >
                <div style={{ width: '20px', height: '3px', backgroundColor: '#cbd5e1', marginBottom: '3px', borderRadius: '2px' }}></div>
                <div style={{ width: '20px', height: '3px', backgroundColor: '#cbd5e1', marginBottom: '3px', borderRadius: '2px' }}></div>
                <div style={{ width: '20px', height: '3px', backgroundColor: '#cbd5e1', borderRadius: '2px' }}></div>
            </div>

            {/* Selection Checkbox */}
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px'
            }}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectionChange(index, e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                />
            </div>

            {/* Preview Area */}
            <div style={{
                marginTop: '30px',
                marginBottom: '16px',
                height: '200px',
                border: '1px solid #f1f5f9',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc'
            }}>
                {file.type.startsWith('image/') && imagePreview ? (
                    <img
                        src={imagePreview}
                        alt={file.name}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 0.3s ease'
                        }}
                    />
                ) : file.type === 'application/pdf' ? (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                        <div>PDF Preview</div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📄</div>
                        <div>File Preview</div>
                    </div>
                )}
            </div>

            {/* File Info */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    wordBreak: 'break-word'
                }}>
                    {file.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase()}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Only show rotation for images */}
                    {file.type.startsWith('image/') && (
                        <button
                            onClick={onRotate}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                backgroundColor: '#f1f5f9',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                            title={`Rotate (${rotation}°)`}
                        >
                            ↻
                        </button>
                    )}
                    <button
                        onClick={onPreview}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            backgroundColor: '#f1f5f9',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                        title="Preview"
                    >
                        👁
                    </button>
                </div>
                <button
                    onClick={onDelete}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                    title="Delete"
                >
                    🗑
                </button>
            </div>
        </div>
    );
}

export default PDFMerger;