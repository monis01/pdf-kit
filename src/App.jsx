/* eslint-disable no-unused-vars */
// src/App.jsx - Production Version with Real PDF Processing
import React, { useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import PDFService from './services/PDFService'; // Real PDF processing
import { PDFDocument } from 'pdf-lib'; // For splitting functionality


// ======================================= SPLIT PDF FILE CODE COMMENTED ==============================================================
// // Simple FileUpload Component (inline for testing)
// const SimpleFileUpload = ({ onFileSelect, selectedFile, onFileRemove }) => {
//   const [isDragActive, setIsDragActive] = useState(false);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     setIsDragActive(false);
//     const files = e.dataTransfer.files;
//     if (files && files.length > 0) {
//       onFileSelect(files[0]);
//     }
//   }, [onFileSelect]);

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     setIsDragActive(true);
//   }, []);

//   const handleDragLeave = useCallback((e) => {
//     e.preventDefault();
//     setIsDragActive(false);
//   }, []);

//   const handleFileSelect = useCallback((e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       onFileSelect(file);
//     }
//   }, [onFileSelect]);

//   if (selectedFile) {
//     return (
//       <div className="card p-4 mb-4">
//         <div className="d-flex align-items-center gap-3">
//           <div className="text-success">
//             📄
//           </div>
//           <div className="flex-grow-1">
//             <h6 className="mb-1">{selectedFile.name}</h6>
//             <small className="text-muted">
//               {PDFService.formatFileSize(selectedFile.size)}
//             </small>
//           </div>
//           <button 
//             className="btn btn-outline-danger btn-sm"
//             onClick={onFileRemove}
//           >
//             ✕
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div 
//       className={`border border-2 border-dashed rounded p-5 text-center ${
//         isDragActive ? 'border-primary bg-light' : 'border-secondary'
//       }`}
//       style={{ minHeight: '200px', cursor: 'pointer' }}
//       onDrop={handleDrop}
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onClick={() => document.getElementById('fileInput').click()}
//     >
//       <input
//         id="fileInput"
//         type="file"
//         accept=".pdf"
//         onChange={handleFileSelect}
//         style={{ display: 'none' }}
//       />
      
//       <div className="mb-3">
//         <span style={{ fontSize: '3rem' }}>📁</span>
//       </div>
      
//       <h5 className={isDragActive ? 'text-primary' : 'text-secondary'}>
//         {isDragActive ? 'Drop PDF file here' : 'Upload PDF File'}
//       </h5>
      
//       <p className="text-muted mb-0">
//         Drag and drop your PDF file here, or click to browse
//       </p>
      
//       <small className="text-muted">
//         Free tier: Up to 10MB
//       </small>
//     </div>
//   );
// };

// // Simple Validation Progress Component
// const SimpleValidationProgress = ({ progress, isValidating, error, isComplete }) => {
//   if (!isValidating && !error && !isComplete) return null;

//   return (
//     <div className="card p-3 mb-4">
//       {/* Progress Bar */}
//       <div className="progress mb-3" style={{ height: '8px' }}>
//         <div 
//           className={`progress-bar ${error ? 'bg-danger' : 'bg-success'} ${!isComplete ? 'progress-bar-striped progress-bar-animated' : ''}`}
//           style={{ width: `${progress}%` }}
//         />
//       </div>

//       {/* Status Message */}
//       {error ? (
//         <div className="alert alert-danger py-2 mb-0">
//           <strong>❌ Validation Failed:</strong> {error}
//         </div>
//       ) : isComplete ? (
//         <div className="alert alert-success py-2 mb-0">
//           <strong>✅ PDF validated successfully!</strong>
//         </div>
//       ) : (
//         <div className="alert alert-info py-2 mb-0">
//           <strong>🔄 Validating PDF... {Math.round(progress)}%</strong>
//         </div>
//       )}
//     </div>
//   );
// };

// // Simple PDF Metadata Display
// const SimplePDFInfo = ({ metadata }) => {
//   if (!metadata) return null;

//   return (
//     <div className="card mb-4">
//       <div className="card-header d-flex justify-content-between align-items-center">
//         <h6 className="mb-0">📄 PDF Information</h6>
//         <span className="badge bg-success">Ready</span>
//       </div>
//       <div className="card-body">
//         <div className="row">
//           <div className="col-md-6">
//             <p><strong>File Name:</strong> {metadata.fileName}</p>
//             <p><strong>File Size:</strong> {PDFService.formatFileSize(metadata.fileSize)}</p>
//             <p><strong>Pages:</strong> {metadata.pageCount} pages</p>
//           </div>
//           <div className="col-md-6">
//             <p><strong>Title:</strong> {metadata.title}</p>
//             <p><strong>Author:</strong> {metadata.author}</p>
//             <p><strong>PDF Version:</strong> {metadata.version}</p>
//           </div>
//         </div>
        
//         {/* Page Information */}
//         {metadata.pages && metadata.pages.length > 0 && (
//           <div className="mt-3 pt-3 border-top">
//             <strong>Page Details:</strong>
//             <div className="mt-2">
//               {metadata.pages.map((page, index) => (
//                 <span key={index} className="badge bg-light text-dark me-2 mb-1">
//                   Page {page.pageNumber}: {page.width}×{page.height}px ({page.orientation})
//                 </span>
//               ))}
//               {metadata.pageCount > metadata.pages.length && (
//                 <span className="text-muted small">
//                   ... and {metadata.pageCount - metadata.pages.length} more pages
//                 </span>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Main App Component
// function App() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isValidating, setIsValidating] = useState(false);
//   const [validationProgress, setValidationProgress] = useState(0);
//   const [validationError, setValidationError] = useState(null);
//   const [pdfMetadata, setPdfMetadata] = useState(null);
  
//   // Splitting states
//   const [pageRanges, setPageRanges] = useState('');
//   const [isSplitting, setIsSplitting] = useState(false);
//   const [splitProgress, setSplitProgress] = useState(0);
//   const [splitError, setSplitError] = useState(null);
//   const [splitResults, setSplitResults] = useState([]);
//   const [showPreview, setShowPreview] = useState(false);
//   const [previewPages, setPreviewPages] = useState([]);
//   const [previewLayout, setPreviewLayout] = useState('cards'); // 'cards' or 'list'
//   const [autoPreview, setAutoPreview] = useState(true); // Auto-update preview

//   // Parse page ranges like "1-3, 5, 7-9" into groups
//   const parsePageRanges = (rangeString, totalPages) => {
//     if (!rangeString.trim()) {
//       throw new Error('Please specify pages to extract');
//     }

//     const groups = [];
//     const parts = rangeString.split(',').map(p => p.trim());

//     for (const part of parts) {
//       if (part.includes('-')) {
//         // Range like "1-3"
//         const [start, end] = part.split('-').map(n => parseInt(n.trim()));
//         if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
//           throw new Error(`Invalid range: ${part}. Must be between 1-${totalPages}`);
//         }
//         groups.push({ 
//           type: 'range', 
//           start: start - 1, // Convert to 0-based 
//           end: end - 1,
//           label: `${start}-${end}`,
//           pages: Array.from({length: end - start + 1}, (_, i) => start + i - 1)
//         });
//       } else {
//         // Single page like "5"
//         const pageNum = parseInt(part);
//         if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
//           throw new Error(`Invalid page: ${part}. Must be between 1-${totalPages}`);
//         }
//         groups.push({ 
//           type: 'single', 
//           page: pageNum - 1, // Convert to 0-based
//           label: `${pageNum}`,
//           pages: [pageNum - 1]
//         });
//       }
//     }

//     // Warn about too many files
//     if (groups.length > 10) {
//       throw new Error(`Too many separate files (${groups.length}). Consider using ranges like "1-5" instead of "1,2,3,4,5"`);
//     }

//     return groups;
//   };

//   // Preview selected pages - Enhanced version
//   const updatePreview = useCallback((rangeString) => {
//     if (!pdfMetadata || !rangeString.trim()) {
//       setShowPreview(false);
//       setPreviewPages([]);
//       setSplitError(null);
//       return;
//     }

//     try {
//       setSplitError(null);
//       const groups = parsePageRanges(rangeString, pdfMetadata.pageCount);
      
//       const preview = groups.map((group, index) => ({
//         ...group,
//         id: index + 1,
//         description: group.type === 'range' 
//           ? `Pages ${group.label} (${group.pages.length} pages)`
//           : `Page ${group.label}`,
//         fileName: `${selectedFile.name.replace('.pdf', '')}_pages_${group.label}.pdf`,
//         estimatedSize: `~${Math.round((pdfMetadata.fileSize / pdfMetadata.pageCount) * group.pages.length / 1024)} KB`
//       }));

//       setPreviewPages(preview);
//       if (autoPreview) {
//         setShowPreview(true);
//       }
//     } catch (error) {
//       setSplitError(error.message);
//       setShowPreview(false);
//       setPreviewPages([]);
//     }
//   }, [pdfMetadata, selectedFile, autoPreview, parsePageRanges]);

//   // Manual preview toggle
//   const handlePreviewPages = () => {
//     if (showPreview) {
//       setShowPreview(false);
//     } else {
//       updatePreview(pageRanges);
//     }
//   };

//   // Handle page range changes with auto-preview
//   const handlePageRangeChange = (value) => {
//     setPageRanges(value);
    
//     // Debounced auto-preview
//     if (autoPreview) {
//       clearTimeout(window.previewTimeout);
//       window.previewTimeout = setTimeout(() => {
//         updatePreview(value);
//       }, 500); // 500ms delay after user stops typing
//     }
//   };

//   // Preview a single file in browser
//   const previewFileInBrowser = async (group) => {
//     try {
//       // Create a temporary PDF with just these pages
//       const arrayBuffer = await selectedFile.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);
//       const newPdf = await PDFDocument.create();
      
//       const pagesToCopy = await newPdf.copyPages(pdfDoc, group.pages);
//       pagesToCopy.forEach(page => newPdf.addPage(page));
      
//       const pdfBytes = await newPdf.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
      
//       // Open in new tab
//       window.open(url, '_blank');
      
//       // Clean up after delay
//       setTimeout(() => URL.revokeObjectURL(url), 30000);
//     } catch (error) {
//       alert('Failed to preview file. Please try splitting instead.');
//     }
//   };

//   // Download a single preview file
//   const downloadPreviewFile = async (group) => {
//     try {
//       // Create a temporary PDF with just these pages
//       const arrayBuffer = await selectedFile.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);
//       const newPdf = await PDFDocument.create();
      
//       const pagesToCopy = await newPdf.copyPages(pdfDoc, group.pages);
//       pagesToCopy.forEach(page => newPdf.addPage(page));
      
//       const pdfBytes = await newPdf.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);
      
//       // Download directly
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = group.fileName;
//       link.style.display = 'none';
      
//       document.body.appendChild(link);
//       link.click();
      
//       // Clean up
//       setTimeout(() => {
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//       }, 100);
      
//     } catch (error) {
//       alert('Failed to download preview file. Please try splitting instead.');
//     }
//   };

//   // Split PDF into multiple files
//   const handleSplitPDF = async () => {
//     if (!selectedFile || !pdfMetadata) {
//       setSplitError('Please select a file and specify page ranges');
//       return;
//     }

//     setIsSplitting(true);
//     setSplitProgress(0);
//     setSplitError(null);
//     setSplitResults([]);

//     try {
//       // Parse page ranges
//       const groups = parsePageRanges(pageRanges, pdfMetadata.pageCount);
//       setSplitProgress(10);

//       // Load the PDF
//       const arrayBuffer = await selectedFile.arrayBuffer();
//       const pdfDoc = await PDFDocument.load(arrayBuffer);
//       setSplitProgress(30);

//       const results = [];
      
//       // Create separate PDF for each group
//       for (let i = 0; i < groups.length; i++) {
//         const group = groups[i];
//         setSplitProgress(30 + (i / groups.length) * 60);

//         // Create new PDF document
//         const newPdf = await PDFDocument.create();
        
//         // Copy pages to new document
//         const pagesToCopy = await newPdf.copyPages(pdfDoc, group.pages);
//         pagesToCopy.forEach(page => newPdf.addPage(page));

//         // Generate PDF bytes
//         const pdfBytes = await newPdf.save();
        
//         // Create blob and download URL
//         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//         const url = URL.createObjectURL(blob);
        
//         // Generate filename
//         const baseName = selectedFile.name ? selectedFile.name.replace('.pdf', '') : 'document';
//         const fileName = `${baseName}_pages_${group.label}.pdf`;
        
//         results.push({
//           fileName,
//           url,
//           size: pdfBytes.length,
//           pageCount: group.pages.length,
//           description: group.type === 'range' 
//             ? `Pages ${group.label} (${group.pages.length} pages)`
//             : `Page ${group.label}`
//         });
//       }

//       setSplitProgress(100);
//       setSplitResults(results);
      
//       // DON'T auto-download - let user choose
      
//     } catch (error) {
//       console.error('Split error:', error);
//       setSplitError(error.message || 'Failed to split PDF. Please try again.');
//       setSplitProgress(0);
//     } finally {
//       setIsSplitting(false);
//     }
//   };

//   // Download a split result with better user experience
//   const downloadSplitFile = (result) => {
//     try {
//       const link = document.createElement('a');
//       link.href = result.url;
//       link.download = result.fileName;
//       link.style.display = 'none';
      
//       // Add to document, click, and remove
//       document.body.appendChild(link);
//       link.click();
      
//       // Clean up after a short delay
//       setTimeout(() => {
//         document.body.removeChild(link);
//         URL.revokeObjectURL(result.url); // Free up memory
//       }, 100);
      
//     } catch (error) {
//       console.error('Download failed:', error);
//       alert(`Failed to download ${result.fileName}. Please try again.`);
//     }
//   };

//   // Download all split files with user interaction
//   const downloadAllSplitFiles = () => {
//     // Show instruction to user
//     alert('Multiple files will be downloaded. Please click "Allow" when browser asks for permission.');
    
//     // Download files one by one with delay
//     for (let i = 0; i < splitResults.length; i++) {
//       setTimeout(() => {
//         downloadSplitFile(splitResults[i]);
//       }, i * 100); // Small delay between downloads
//     }
//   };

//   const validatePDF = async (file) => {
//     setIsValidating(true);
//     setValidationProgress(0);
//     setValidationError(null);
//     setPdfMetadata(null);

//     try {
//       // Progress callback
//       const onProgress = (progress) => {
//         setValidationProgress(progress);
//       };

//       // Use real PDF service
//       const result = await PDFService.validateAndExtractMetadata(file, onProgress);

//       if (!result.isValid) {
//         throw new Error(result.errors.join('. '));
//       }

//       // Apply tier limits
//       const maxSizeForFree = 10 * 1024 * 1024; // 10MB
//       if (file.size > maxSizeForFree) {
//         throw new Error('File size exceeds 10MB limit for free tier. Upgrade to Pro for larger files.');
//       }

//       // Set real metadata
//       setPdfMetadata(result.metadata);

//     } catch (error) {
//       setValidationError(error.message);
//       setValidationProgress(0);
//     } finally {
//       setIsValidating(false);
//     }
//   };

//   const handleFileSelect = (file) => {
//     setSelectedFile(file);
//     validatePDF(file);
//     // Reset split-related state when new file is selected
//     setSplitResults([]);
//     setShowPreview(false);
//     setPreviewPages([]);
//     setPageRanges('');
//   };

//   const handleFileRemove = () => {
//     setSelectedFile(null);
//     setIsValidating(false);
//     setValidationProgress(0);
//     setValidationError(null);
//     setPdfMetadata(null);
//     // Reset split-related state
//     setSplitResults([]);
//     setShowPreview(false);
//     setPreviewPages([]);
//     setPageRanges('');
//   };

//   const isReady = selectedFile && !isValidating && !validationError && pdfMetadata;

//   return (
//     <div className="App">
//       {/* Header */}
//       <header className="bg-primary text-white py-3 mb-4">
//         <div className="container">
//           <h1 className="h3 mb-0">📄 PDF Toolkit Hub</h1>
//           <small>File Upload & Validation Demo</small>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="container">
//         <div className="row justify-content-center">
//           <div className="col-lg-8">
            
//             {/* Page Title */}
//             <div className="text-center mb-5">
//               <h2>PDF Splitter</h2>
//               <p className="text-muted">Upload a PDF file to see our validation system in action</p>
//             </div>

//             {/* File Upload */}
//             <SimpleFileUpload
//               onFileSelect={handleFileSelect}
//               selectedFile={selectedFile}
//               onFileRemove={handleFileRemove}
//             />

//             {/* Validation Progress */}
//             <SimpleValidationProgress
//               progress={validationProgress}
//               isValidating={isValidating}
//               error={validationError}
//               isComplete={!!pdfMetadata}
//             />

//             {/* PDF Information */}
//             <SimplePDFInfo metadata={pdfMetadata} />

//             {/* Split Configuration (when ready) */}
//             {isReady && (
//               <div className="card mb-4">
//                 <div className="card-header">
//                   <h6 className="mb-0">✂️ Split Configuration</h6>
//                 </div>
//                 <div className="card-body">
//                   <p className="text-muted mb-3">
//                     Specify which pages to extract from your {pdfMetadata.pageCount}-page document
//                   </p>
                  
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Page ranges <span className="text-muted">(e.g., 1-5, 8, 10-12)</span>
//                     </label>
//                     <input 
//                       type="text" 
//                       className="form-control" 
//                       placeholder="1-3, 5, 7-9"
//                       value={pageRanges}
//                       onChange={(e) => handlePageRangeChange(e.target.value)}
//                     />
//                     <div className="form-text d-flex justify-content-between align-items-center">
//                       <span>Use commas to separate ranges. Each range/page creates a separate PDF file.</span>
//                       <div className="form-check form-switch">
//                         <input 
//                           className="form-check-input" 
//                           type="checkbox" 
//                           id="autoPreview"
//                           checked={autoPreview}
//                           onChange={(e) => setAutoPreview(e.target.checked)}
//                         />
//                         <label className="form-check-label" htmlFor="autoPreview">
//                           Auto Preview
//                         </label>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="d-flex gap-2 mb-3">
//                     <button 
//                       className="btn btn-primary" 
//                       onClick={handleSplitPDF}
//                       disabled={isSplitting || !pageRanges.trim()}
//                     >
//                       {isSplitting ? 'Splitting...' : 'Split PDF'}
//                     </button>
//                     <button 
//                       className="btn btn-outline-secondary" 
//                       onClick={handlePreviewPages}
//                       disabled={!pageRanges.trim()}
//                     >
//                       {showPreview ? 'Hide Preview' : 'Show Preview'}
//                     </button>
//                   </div>

//                   {/* Split Progress */}
//                   {isSplitting && (
//                     <div className="mb-3">
//                       <div className="progress mb-2" style={{ height: '8px' }}>
//                         <div 
//                           className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
//                           style={{ width: `${splitProgress}%` }}
//                         />
//                       </div>
//                       <small className="text-muted">Splitting PDF... {Math.round(splitProgress)}%</small>
//                     </div>
//                   )}

//                   {/* Split Error */}
//                   {splitError && (
//                     <div className="alert alert-danger">
//                       <strong>❌ Error:</strong> {splitError}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Enhanced Preview Results */}
//             {showPreview && previewPages.length > 0 && (
//               <div className="card mb-4">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <h6 className="mb-0">👀 Preview: {previewPages.length} files to be created</h6>
//                   <div className="d-flex gap-2">
//                     <div className="btn-group btn-group-sm" role="group">
//                       <button 
//                         type="button" 
//                         className={`btn ${previewLayout === 'cards' ? 'btn-primary' : 'btn-outline-primary'}`}
//                         onClick={() => setPreviewLayout('cards')}
//                       >
//                         Cards
//                       </button>
//                       <button 
//                         type="button" 
//                         className={`btn ${previewLayout === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
//                         onClick={() => setPreviewLayout('list')}
//                       >
//                         List
//                       </button>
//                     </div>
//                     <button 
//                       className="btn btn-outline-secondary btn-sm"
//                       onClick={() => setShowPreview(false)}
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 </div>
//                 <div className="card-body">
                  
//                   {previewLayout === 'cards' ? (
//                     /* Card Layout */
//                     <div className="row">
//                       {previewPages.map((preview, index) => (
//                         <div key={index} className="col-md-6 col-lg-4 mb-3">
//                           <div className="card h-100 border">
//                             <div className="card-body d-flex flex-column">
//                               <div className="text-center mb-3">
//                                 <div style={{ fontSize: '2rem' }}>📄</div>
//                                 <span className="badge bg-primary">{preview.id}</span>
//                               </div>
                              
//                               <h6 className="card-title text-center">{preview.description}</h6>
                              
//                               <div className="mt-auto">
//                                 <p className="small text-muted mb-2">
//                                   <strong>Filename:</strong><br />
//                                   {preview.fileName}
//                                 </p>
//                                 <p className="small text-muted mb-3">
//                                   <strong>Est. Size:</strong> {preview.estimatedSize}
//                                 </p>
                                
//                                 <div className="d-grid gap-2">
//                                   <button 
//                                     className="btn btn-outline-primary btn-sm"
//                                     onClick={() => previewFileInBrowser(preview)}
//                                   >
//                                     👁️ Quick Preview
//                                   </button>
//                                   <button 
//                                     className="btn btn-outline-success btn-sm"
//                                     onClick={() => downloadPreviewFile(preview)}
//                                   >
//                                     📥 Download This File
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     /* List Layout */
//                     <div>
//                       {previewPages.map((preview, index) => (
//                         <div key={index} className="d-flex align-items-center gap-3 p-3 border rounded mb-2 bg-light">
//                           <div style={{ fontSize: '1.5rem' }}>📄</div>
//                           <span className="badge bg-primary">{preview.id}</span>
//                           <div className="flex-grow-1">
//                             <h6 className="mb-1">{preview.description}</h6>
//                             <div className="row">
//                               <div className="col-md-8">
//                                 <small className="text-muted">
//                                   <strong>Filename:</strong> {preview.fileName}
//                                 </small>
//                               </div>
//                               <div className="col-md-4">
//                                 <small className="text-muted">
//                                   <strong>Size:</strong> {preview.estimatedSize}
//                                 </small>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="d-flex gap-2">
//                             <button 
//                               className="btn btn-outline-primary btn-sm"
//                               onClick={() => previewFileInBrowser(preview)}
//                             >
//                               👁️ Preview
//                             </button>
//                             <button 
//                               className="btn btn-outline-success btn-sm"
//                               onClick={() => downloadPreviewFile(preview)}
//                             >
//                               📥 Download
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
                  
//                   <div className="alert alert-info mt-3">
//                     <div className="d-flex align-items-center">
//                       <span className="me-2">💡</span>
//                       <div>
//                         <strong>Preview Features:</strong>
//                         <ul className="mb-0 mt-1">
//                           <li><strong>Quick Preview:</strong> View files in browser (blob URLs cannot be downloaded from browser tab)</li>
//                           <li><strong>Download This File:</strong> Direct download of individual preview files</li>
//                           <li><strong>Auto Preview:</strong> Updates automatically as you type page ranges</li>
//                           <li><strong>Layout Toggle:</strong> Switch between card and list views</li>
//                         </ul>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Split Results - Individual Downloads */}
//             {splitResults.length > 0 && (
//               <div className="card mb-4">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <h6 className="mb-0">📁 Split Results ({splitResults.length} files)</h6>
//                   <button 
//                     className="btn btn-success btn-sm"
//                     onClick={downloadAllSplitFiles}
//                   >
//                     Download All Files
//                   </button>
//                 </div>
//                 <div className="card-body">
//                   <p className="text-success mb-3">
//                     ✅ PDF successfully split! Click individual files to download:
//                   </p>
                  
//                   {splitResults.map((result, index) => (
//                     <div key={index} className="d-flex align-items-center gap-3 p-3 border rounded mb-2 bg-light">
//                       <div className="text-success">📄</div>
//                       <div className="flex-grow-1">
//                         <h6 className="mb-1">{result.fileName}</h6>
//                         <div className="d-flex gap-3">
//                           <small className="text-muted">{result.description}</small>
//                           <small className="text-muted">Size: {PDFService.formatFileSize(result.size)}</small>
//                         </div>
//                       </div>
//                       <button 
//                         className="btn btn-outline-primary btn-sm"
//                         onClick={() => downloadSplitFile(result)}
//                       >
//                         Download
//                       </button>
//                     </div>
//                   ))}
                  
//                   <div className="alert alert-info mt-3">
//                     <small>
//                       💡 <strong>Tip:</strong> If downloads don't work automatically, click "Allow" when browser asks for permission to download multiple files.
//                     </small>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Demo Status */}
//             <div className="alert alert-success mt-4">
//               <h6>🚀 Production Ready Status:</h6>
//               <ul className="mb-0">
//                 <li>✅ File Upload (drag & drop)</li>
//                 <li>✅ Real PDF Validation (pdf-lib)</li>
//                 <li>✅ Accurate Metadata Extraction</li>
//                 <li>✅ Progress Tracking</li>
//                 <li>✅ Error Handling</li>
//                 <li>✅ PDF Splitting with Individual Downloads</li>
//                 <li>✅ Preview Functionality</li>
//               </ul>
//             </div>

//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-light text-center py-3 mt-5">
//         <small className="text-muted">
//           React Components: File Upload ✅ | Validation ✅ | Progress Tracking ✅ | PDF Splitting ✅
//         </small>
//       </footer>
//     </div>
//   );
// }


function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<SplitPDF />} /> */}
        <Route path="/merge-pdf" element={<MergePDF />} />
      </Routes>
    </Router>
  );
}

export default App;