/* eslint-disable no-unused-vars */
import React, { useState } from "react";

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
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          fontWeight: '600', 
          fontSize: '14px',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {file.name}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          {file.type.startsWith('image/') ? `${file.type.split('/')[1].toUpperCase()}` : 'PDF'} • {formatFileSize(file.size)}
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

function PDFMerger() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // Track selected files by index
  const [fileRotations, setFileRotations] = useState({}); // Track rotation for each file by index
  
  // Limits configuration
  const MAX_FILES = 10;
  const MAX_SIZE_MB = 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  
  // Calculate current usage
  const currentSize = files.reduce((total, file) => total + file.size, 0);
  const remainingFiles = MAX_FILES - files.length;
  const remainingSize = MAX_SIZE_BYTES - currentSize;
  
  // Get progress bar color based on usage
  const getProgressColor = (current, max, isSize = false) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'success';
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    processNewFiles(selectedFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processNewFiles(droppedFiles);
  };

  // Process new files with limit checking and validation
  const processNewFiles = (newFiles) => {
    const validFiles = [];
    const skippedFiles = [];
    let tempSize = currentSize;
    let tempCount = files.length;
    
    // Process files sequentially in user's order
    for (const file of newFiles) {
      // File type validation - Support all image types and PDFs
      const validTypes = ['application/pdf'];
      const isValidImage = file.type.startsWith('image/');
      
      if (!validTypes.includes(file.type) && !isValidImage) {
        skippedFiles.push({ file, reason: 'invalid file type (only PDFs and images allowed)' });
        continue;
      }
      
      // Check file count limit
      if (tempCount >= MAX_FILES) {
        skippedFiles.push({ file, reason: 'file limit reached' });
        continue;
      }
      
      // Check size limit
      if (tempSize + file.size > MAX_SIZE_BYTES) {
        skippedFiles.push({ file, reason: 'size limit reached' });
        continue;
      }
      
      // File is valid, add it
      validFiles.push(file);
      tempSize += file.size;
      tempCount++;
    }
    
    // Update state with valid files
    if (validFiles.length > 0) {
      const currentLength = files.length;
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      // Auto-select newly uploaded files
      setSelectedFiles(prev => [...prev, ...validFiles.map((_, i) => currentLength + i)]);
    }
    
    // Show user feedback
    if (skippedFiles.length > 0) {
      const totalAttempted = newFiles.length;
      const reasons = [...new Set(skippedFiles.map(s => s.reason))];
      const reasonText = reasons.join(' and ');
      
      alert(`Added ${validFiles.length} of ${totalAttempted} files. ${skippedFiles.length} files skipped (${reasonText}).`);
    }
    
    console.log('Files processed:', { valid: validFiles.length, skipped: skippedFiles.length });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // State 1: No files uploaded - Show upload area
  if (files.length === 0) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>PDF Merger</h1>
        <p>Combine multiple PDFs and images into a single document</p>
        
        {/* Limits Display */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label small text-muted">Files ({files.length}/{MAX_FILES})</label>
            <div className="progress mb-1" style={{ height: '8px' }}>
              <div 
                className={`progress-bar bg-${getProgressColor(files.length, MAX_FILES)}`}
                style={{ width: `${(files.length / MAX_FILES) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Size ({formatFileSize(currentSize)}/{MAX_SIZE_MB}MB)</label>
            <div className="progress mb-1" style={{ height: '8px' }}>
              <div 
                className={`progress-bar bg-${getProgressColor(currentSize, MAX_SIZE_BYTES, true)}`}
                style={{ width: `${(currentSize / MAX_SIZE_BYTES) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
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
            Limit: {MAX_FILES} files, {MAX_SIZE_MB}MB total
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

  const handleDeleteFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    // Remove rotation data for deleted file
    setFileRotations(prev => {
      const newRotations = { ...prev };
      delete newRotations[index];
      // Adjust indices for remaining files
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
  };

  // Handle selection changes
  const handleSelectionChange = (index, isSelected) => {
    setSelectedFiles(prev => {
      if (isSelected) {
        return [...prev, index].sort((a, b) => a - b); // Keep sorted for order preservation
      } else {
        return prev.filter(selectedIndex => selectedIndex !== index);
      }
    });
  };

  const handlePreviewFile = (index) => {
    console.log('Preview file at index:', index);
    // TODO: Implement preview logic
  };

  // Drag and Drop Handlers for File Reordering
  const handleReorderDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleReorderDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleReorderDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleReorderDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) {
      return;
    }

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    
    // Remove the dragged file from its original position
    newFiles.splice(draggedIndex, 1);
    
    // Insert the dragged file at the target position
    const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    newFiles.splice(adjustedTargetIndex, 0, draggedFile);
    
    setFiles(newFiles);
    
    // Update selected files indices to maintain selection after reordering
    setSelectedFiles(prev => {
      return prev.map(selectedIndex => {
        if (selectedIndex === draggedIndex) {
          return adjustedTargetIndex;
        } else if (draggedIndex < adjustedTargetIndex && selectedIndex > draggedIndex && selectedIndex <= adjustedTargetIndex) {
          return selectedIndex - 1;
        } else if (draggedIndex > adjustedTargetIndex && selectedIndex >= adjustedTargetIndex && selectedIndex < draggedIndex) {
          return selectedIndex + 1;
        }
        return selectedIndex;
      }).sort((a, b) => a - b);
    });
    
    setDraggedIndex(null);
  };

  const handleMergePDFs = async () => {
    const selectedFilesList = selectedFiles.map(index => files[index]).filter(file => file); // Get selected files in order
    
    if (selectedFilesList.length === 0) {
      alert('Please select at least one file to merge.');
      return;
    }

    // Load pdf-lib from CDN if not already loaded
    if (!window.PDFLib) {
      try {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      } catch (error) {
        alert('Failed to load PDF library. Please try again.');
        return;
      }
    }

    setIsLoading(true);
    setProgress(0);

    try {
      console.log('Starting PDF merge process...');
      
      // Create a new PDF document using the global PDFLib
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();
      const totalFiles = selectedFilesList.length;
      
      // Process each SELECTED file in order
      for (let i = 0; i < selectedFilesList.length; i++) {
        const file = selectedFilesList[i];
        console.log(`Processing selected file ${i + 1}/${selectedFilesList.length}: ${file.name}`);
        
        // Update progress
        const currentProgress = Math.round(((i + 1) / totalFiles) * 90); // Save 10% for final save
        setProgress(currentProgress);
        
        if (file.type === 'application/pdf') {
          // Handle PDF files
          try {
            const fileBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(fileBuffer);
            const pageCount = pdf.getPageCount();
            
            // Copy all pages from this PDF
            const pages = await mergedPdf.copyPages(pdf, [...Array(pageCount).keys()]);
            pages.forEach(page => mergedPdf.addPage(page));
          } catch (pdfError) {
            console.error(`Error processing PDF ${file.name}:`, pdfError);
            alert(`Error processing PDF "${file.name}". File may be corrupted or password-protected.`);
            // Continue with other files instead of stopping
            continue;
          }
          
        } else if (file.type.startsWith('image/')) {
          // Handle image files - convert to PDF page with rotation
          try {
            const imageBuffer = await file.arrayBuffer();
            let image;
            
            if (file.type === 'image/png') {
              image = await mergedPdf.embedPng(imageBuffer);
            } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
              image = await mergedPdf.embedJpg(imageBuffer);
            }
            
            if (image) {
              // Create a page with the image
              const page = mergedPdf.addPage();
              const { width, height } = page.getSize();
              
              // Get rotation for this file
              const fileIndex = selectedFiles[i];
              const rotation = fileRotations[fileIndex] || 0;
              
              // Scale image to fit page while maintaining aspect ratio
              let imageAspectRatio = image.width / image.height;
              
              // Adjust aspect ratio for 90° and 270° rotations
              if (rotation === 90 || rotation === 270) {
                imageAspectRatio = image.height / image.width;
              }
              
              const pageAspectRatio = width / height;
              
              let imageWidth, imageHeight;
              if (imageAspectRatio > pageAspectRatio) {
                // Image is wider than page
                imageWidth = width - 40; // 20px margin on each side
                imageHeight = imageWidth / imageAspectRatio;
              } else {
                // Image is taller than page
                imageHeight = height - 40; // 20px margin on each side
                imageWidth = imageHeight * imageAspectRatio;
              }
              
              // Center the image on the page
              const x = (width - imageWidth) / 2;
              const y = (height - imageHeight) / 2;
              
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
            alert(`Error processing image "${file.name}". File may be corrupted or invalid.`);
            // Continue with other files instead of stopping
            continue;
          }
        }
      }
      
      // Save the merged PDF
      setProgress(95);
      console.log('Saving merged PDF...');
      const pdfBytes = await mergedPdf.save();
      
      // Create download link
      setProgress(100);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('PDF merge completed successfully!');
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging files: ' + error.message);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>PDF Merger</h1>
      
      {/* Limits Display Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label small text-muted">Files ({files.length}/{MAX_FILES})</label>
          <div className="progress mb-1" style={{ height: '10px' }}>
            <div 
              className={`progress-bar bg-${getProgressColor(files.length, MAX_FILES)}`}
              style={{ width: `${(files.length / MAX_FILES) * 100}%` }}
            ></div>
          </div>
          <small className="text-muted">{remainingFiles} files remaining</small>
        </div>
        <div className="col-md-6">
          <label className="form-label small text-muted">Size ({formatFileSize(currentSize)}/{MAX_SIZE_MB}MB)</label>
          <div className="progress mb-1" style={{ height: '10px' }}>
            <div 
              className={`progress-bar bg-${getProgressColor(currentSize, MAX_SIZE_BYTES, true)}`}
              style={{ width: `${(currentSize / MAX_SIZE_BYTES) * 100}%` }}
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
      </div>

      {/* Add more files zone */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: `2px dashed ${files.length >= MAX_FILES || currentSize >= MAX_SIZE_BYTES ? '#ef4444' : '#cbd5e1'}`,
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: files.length >= MAX_FILES || currentSize >= MAX_SIZE_BYTES ? '#fef2f2' : '#f8fafc',
          marginBottom: '30px',
          cursor: files.length >= MAX_FILES || currentSize >= MAX_SIZE_BYTES ? 'not-allowed' : 'pointer'
        }}
        onClick={() => {
          if (files.length < MAX_FILES && currentSize < MAX_SIZE_BYTES) {
            document.getElementById('fileInput').click();
          }
        }}
      >
        {files.length >= MAX_FILES ? (
          <>
            <span style={{ fontSize: '18px', marginRight: '8px', color: '#ef4444' }}>🚫</span>
            Maximum {MAX_FILES} files reached. Remove files to add more.
          </>
        ) : currentSize >= MAX_SIZE_BYTES ? (
          <>
            <span style={{ fontSize: '18px', marginRight: '8px', color: '#ef4444' }}>🚫</span>
            Size limit reached ({MAX_SIZE_MB}MB). Remove files to add more.
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

      {/* Loading Progress Indicator */}
      {isLoading && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '15px', fontSize: '16px', color: '#374151' }}>
            Merging PDFs... {progress}%
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#f3f4f6',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease',
              borderRadius: '5px'
            }}></div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
            Processing files, please wait...
          </div>
        </div>
      )}

      {/* File Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {files.map((file, index) => (
          <FileCard
            key={`${file.name}-${index}`}
            file={file}
            index={index}
            onRotate={() => handleRotateFile(index)}
            onDelete={() => handleDeleteFile(index)}
            onPreview={() => handlePreviewFile(index)}
            onReorderDragStart={handleReorderDragStart}
            onReorderDragEnd={handleReorderDragEnd}
            onReorderDragOver={handleReorderDragOver}
            onReorderDrop={handleReorderDrop}
            isDragging={draggedIndex === index}
            isSelected={selectedFiles.includes(index)}
            onSelectionChange={handleSelectionChange}
            rotation={fileRotations[index] || 0}
          />
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-secondary me-2">📁 {files.length}</span>
            <span className="badge bg-primary me-3">✓ {selectedFiles.length}</span>
            <small className="text-muted">Total files: {files.length} | Selected: {selectedFiles.length}</small>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setFiles([])}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              backgroundColor: isLoading ? '#f9fafb' : '#f1f5f9',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: isLoading ? '#9ca3af' : '#374151'
            }}
          >
            Clear All
          </button>
          <button 
            onClick={handleMergePDFs}
            disabled={isLoading || selectedFiles.length === 0}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: isLoading || selectedFiles.length === 0 ? '#9ca3af' : '#3b82f6',
              color: 'white',
              cursor: isLoading || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {isLoading ? 'Merging...' : `Merge ${selectedFiles.length} Selected PDFs`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PDFMerger;