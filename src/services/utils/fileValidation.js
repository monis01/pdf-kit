/* eslint-disable no-unused-vars */
// src/services/utils/fileValidation.js
import { PDFDocument } from 'pdf-lib';

export class PDFValidationService {
  
  /**
   * Comprehensive PDF validation with metadata extraction
   * @param {File} file - The PDF file to validate
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<{isValid: boolean, metadata?: object, errors?: string[]}>}
   */
  static async validatePDFFile(file, onProgress = null) {
    const result = {
      isValid: false,
      metadata: null,
      errors: []
    };

    try {
      // Step 1: Basic file checks (5%)
      if (onProgress) onProgress(5);
      
      const basicValidation = this.validateBasicFile(file);
      if (!basicValidation.isValid) {
        result.errors = basicValidation.errors;
        return result;
      }

      // Step 2: Check PDF magic bytes (15%)
      if (onProgress) onProgress(15);
      
      const headerValidation = await this.validatePDFHeader(file);
      if (!headerValidation.isValid) {
        result.errors = headerValidation.errors;
        return result;
      }

      // Step 3: Parse PDF with pdf-lib (40%)
      if (onProgress) onProgress(40);
      
      const arrayBuffer = await file.arrayBuffer();
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

      // Step 4: Extract metadata (70%)
      if (onProgress) onProgress(70);
      
      const metadata = await this.extractPDFMetadata(pdfDoc, file);

      // Step 5: Additional validations (90%)
      if (onProgress) onProgress(90);
      
      const additionalValidation = this.validatePDFContent(pdfDoc, metadata);
      if (!additionalValidation.isValid) {
        result.errors = additionalValidation.errors;
        return result;
      }

      // Step 6: Complete (100%)
      if (onProgress) onProgress(100);

      result.isValid = true;
      result.metadata = metadata;
      
      return result;

    } catch (error) {
      console.error('PDF validation error:', error);
      result.errors.push('Failed to validate PDF file. The file may be corrupted.');
      return result;
    }
  }

  /**
   * Basic file validation (type, size, extension)
   */
  static validateBasicFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check MIME type
    if (file.type !== 'application/pdf') {
      errors.push('File must be a PDF document');
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File must have a .pdf extension');
    }

    // Check file size (basic range check)
    if (file.size < 100) {
      errors.push('File appears to be empty or corrupted');
    }

    if (file.size > 1024 * 1024 * 1024) { // 1GB limit for safety
      errors.push('File is too large for browser processing');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate PDF header (magic bytes)
   */
  static async validatePDFHeader(file) {
    try {
      // Read first 8 bytes to check PDF header
      const headerBuffer = await file.slice(0, 8).arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);
      
      // PDF files start with "%PDF-" (0x25504446)
      const pdfSignature = [0x25, 0x50, 0x44, 0x46]; // %PDF
      
      const isValidPDF = pdfSignature.every((byte, index) => 
        headerBytes[index] === byte
      );

      if (!isValidPDF) {
        return {
          isValid: false,
          errors: ['File does not appear to be a valid PDF document']
        };
      }

      // Check PDF version from header
      const headerString = new TextDecoder().decode(headerBytes);
      const versionMatch = headerString.match(/%PDF-(\d\.\d)/);
      
      if (versionMatch) {
        const version = parseFloat(versionMatch[1]);
        if (version < 1.0 || version > 2.0) {
          return {
            isValid: false,
            errors: [`Unsupported PDF version: ${version}. Supported versions: 1.0-2.0`]
          };
        }
      }

      return { isValid: true, errors: [] };

    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to read PDF header. File may be corrupted.']
      };
    }
  }

  /**
   * Extract comprehensive metadata from PDF
   */
  static async extractPDFMetadata(pdfDoc, file) {
    const metadata = {
      // File information
      fileName: file.name,
      fileSize: file.size,
      lastModified: new Date(file.lastModified),
      
      // PDF structure
      pageCount: pdfDoc.getPageCount(),
      version: this.extractPDFVersion(pdfDoc),
      
      // PDF metadata
      title: pdfDoc.getTitle() || null,
      author: pdfDoc.getAuthor() || null,
      subject: pdfDoc.getSubject() || null,
      creator: pdfDoc.getCreator() || null,
      producer: pdfDoc.getProducer() || null,
      creationDate: pdfDoc.getCreationDate() || null,
      modificationDate: pdfDoc.getModificationDate() || null,
      keywords: pdfDoc.getKeywords() || null,
      
      // Page information
      pages: [],
      
      // Security & features
      isEncrypted: false, // pdf-lib handles this automatically
      hasFormFields: false,
      hasAnnotations: false,
      
      // Processing info
      extractedAt: new Date(),
      processingTime: null
    };

    // Extract page dimensions for first few pages (performance optimization)
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

    // Check for form fields (basic detection)
    try {
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      metadata.hasFormFields = fields.length > 0;
    } catch (error) {
      // No form or error accessing form
      metadata.hasFormFields = false;
    }

    return metadata;
  }

  /**
   * Extract PDF version from document
   */
  static extractPDFVersion(pdfDoc) {
    try {
      // Try to get version from document catalog
      const catalog = pdfDoc.catalog;
      if (catalog && catalog.get) {
        const version = catalog.get('Version');
        if (version) {
          return version.toString();
        }
      }
      
      // Fallback to default
      return '1.4'; // Most common version
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Validate PDF content and structure
   */
  static validatePDFContent(pdfDoc, metadata) {
    const errors = [];

    // Check for empty PDF
    if (metadata.pageCount === 0) {
      errors.push('PDF contains no pages');
    }

    // Check for reasonable page count (prevent memory issues)
    if (metadata.pageCount > 1000) {
      errors.push('PDF has too many pages for browser processing (maximum: 1000 pages)');
    }

    // Check for extremely large page dimensions
    const hasOversizedPages = metadata.pages.some(page => 
      page.width > 14400 || page.height > 14400 // 200 inches at 72 DPI
    );
    
    if (hasOversizedPages) {
      errors.push('PDF contains pages with extremely large dimensions');
    }

    // Check for password protection (pdf-lib should handle this, but double-check)
    if (metadata.isEncrypted) {
      errors.push('Password-protected PDFs are not supported');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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
    
    if (errorMessage.includes('memory') || errorMessage.includes('range')) {
      return 'This PDF is too complex or large for browser processing.';
    }
    
    return 'Failed to load PDF. The file may be corrupted or use unsupported features.';
  }

  /**
   * Quick validation for immediate feedback (lighter version)
   */
  static async quickValidate(file) {
    try {
      const basicValidation = this.validateBasicFile(file);
      if (!basicValidation.isValid) {
        return basicValidation;
      }

      const headerValidation = await this.validatePDFHeader(file);
      return headerValidation;
      
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to validate PDF file']
      };
    }
  }
}