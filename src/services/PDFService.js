/* eslint-disable no-unused-vars */
// src/services/pdfService.js - Real PDF Processing with pdf-lib
import { PDFDocument } from 'pdf-lib';

export class PDFService {
  /**
   * Validate and extract metadata from PDF file
   * @param {File} file - The PDF file to process
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<{isValid: boolean, metadata?: object, errors?: string[]}>}
   */
  static async validateAndExtractMetadata(file, onProgress = null) {
    const result = {
      isValid: false,
      metadata: null,
      errors: []
    };

    try {
      // Step 1: Basic validation (10%)
      if (onProgress) onProgress(10);
      
      const basicValidation = this.validateBasicFile(file);
      if (!basicValidation.isValid) {
        result.errors = basicValidation.errors;
        return result;
      }

      // Step 2: Read file as ArrayBuffer (30%)
      if (onProgress) onProgress(30);
      
      const arrayBuffer = await file.arrayBuffer();

      // Step 3: Load PDF with pdf-lib (60%)
      if (onProgress) onProgress(60);
      
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: false,
          capNumbers: false,
          throwOnInvalidPDF: true
        });
      } catch (error) {
        result.errors.push(this.getPDFLoadError(error));
        return result;
      }

      // Step 4: Extract real metadata (90%)
      if (onProgress) onProgress(90);
      
      const metadata = await this.extractRealMetadata(pdfDoc, file);

      // Step 5: Final validation (100%)
      if (onProgress) onProgress(100);
      
      const contentValidation = this.validatePDFContent(pdfDoc, metadata);
      if (!contentValidation.isValid) {
        result.errors = contentValidation.errors;
        return result;
      }

      result.isValid = true;
      result.metadata = metadata;
      
      return result;

    } catch (error) {
      console.error('PDF processing error:', error);
      result.errors.push('Failed to process PDF file. Please try again.');
      return result;
    }
  }

  /**
   * Extract real metadata from PDF document
   */
  static async extractRealMetadata(pdfDoc, file) {
    const metadata = {
      // File information
      fileName: file.name,
      fileSize: file.size,
      lastModified: new Date(file.lastModified),
      
      // Real PDF information
      pageCount: pdfDoc.getPageCount(),
      
      // PDF metadata (with fallbacks)
      title: pdfDoc.getTitle() || 'Untitled Document',
      author: pdfDoc.getAuthor() || 'Unknown Author',
      subject: pdfDoc.getSubject() || null,
      creator: pdfDoc.getCreator() || null,
      producer: pdfDoc.getProducer() || null,
      creationDate: pdfDoc.getCreationDate() || null,
      modificationDate: pdfDoc.getModificationDate() || null,
      keywords: pdfDoc.getKeywords() || null,
      
      // Version info
      version: this.extractPDFVersion(pdfDoc),
      
      // Page information (first 3 pages for performance)
      pages: [],
      
      // Features
      hasFormFields: false,
      hasAnnotations: false,
      isEncrypted: false,
      
      // Processing info
      extractedAt: new Date()
    };

    // Extract page dimensions (limit to first 3 for performance)
    const pagesToCheck = Math.min(3, metadata.pageCount);
    for (let i = 0; i < pagesToCheck; i++) {
      try {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        
        metadata.pages.push({
          pageNumber: i + 1,
          width: Math.round(width),
          height: Math.round(height),
          orientation: width > height ? 'landscape' : 'portrait'
        });
      } catch (error) {
        console.warn(`Failed to get page ${i + 1} dimensions:`, error);
      }
    }

    // Check for form fields
    try {
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      metadata.hasFormFields = fields.length > 0;
    } catch (error) {
      metadata.hasFormFields = false;
    }

    return metadata;
  }

  /**
   * Basic file validation
   */
  static validateBasicFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check MIME type
    if (file.type !== 'application/pdf') {
      errors.push('Only PDF files are supported');
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File must have a .pdf extension');
    }

    // Check file size
    if (file.size < 100) {
      errors.push('File appears to be empty or corrupted');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB safety limit
      errors.push('File is too large for browser processing');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate PDF content
   */
  static validatePDFContent(pdfDoc, metadata) {
    const errors = [];

    // Check for empty PDF
    if (metadata.pageCount === 0) {
      errors.push('PDF contains no pages');
    }

    // Check for reasonable page count
    if (metadata.pageCount > 1000) {
      errors.push('PDF has too many pages for browser processing (maximum: 1000 pages)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extract PDF version
   */
  static extractPDFVersion(pdfDoc) {
    // try {
    //   // Try to get version from document
    //   return '1.4'; // Default fallback
    // } catch (error) {
    //   return 'Unknown';
    // }
    // INTERVIEW question :  How below code is unreachable
    // try {
    //     return '1.4';
    // }catch(err) {
    //     // console.log(err);
    //     // return "unkown" ;
    // }

    return "1.4";
  }

  /**
   * Get user-friendly error message for PDF loading errors
   */
  static getPDFLoadError(error) {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
      return 'This PDF is password-protected. Please remove the password and try again.';
    }
    
    if (errorMessage.includes('invalid') || errorMessage.includes('corrupt')) {
      return 'This PDF file appears to be corrupted or invalid.';
    }
    
    if (errorMessage.includes('unsupported')) {
      return 'This PDF uses features that are not supported.';
    }
    
    return 'Failed to load PDF. The file may be corrupted or use unsupported features.';
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Default export for convenience
export default PDFService;