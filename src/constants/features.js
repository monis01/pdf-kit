export const TOOLS = {
  SPLITTER: {
    id: 'splitter',
    name: 'PDF Splitter',
    description: 'Extract specific pages or split by page ranges',
    icon: 'Scissors',
    route: '/split',
    features: {
      free: ['Basic page extraction', '10MB file limit', 'Page ranges'],
      pro: ['Advanced options', '100MB file limit', 'Batch processing']
    }
  },
  
  MERGER: {
    id: 'merger',
    name: 'PDF Merger',
    description: 'Combine multiple PDF files into one document',
    icon: 'FileText',
    route: '/merge',
    features: {
      free: ['Combine 2 files', '10MB total limit', 'Basic merging'],
      pro: ['Unlimited files', '100MB per file', 'Custom ordering']
    }
  },
  
  COMPRESSOR: {
    id: 'compressor',
    name: 'PDF Compressor',
    description: 'Reduce file size while maintaining quality',
    icon: 'Settings',
    route: '/compress',
    features: {
      free: ['Pro feature only'],
      pro: ['Quality options', 'Batch compression', 'Size optimization']
    },
    proOnly: true
  }
};

export const UPGRADE_TRIGGERS = {
  FILE_SIZE_EXCEEDED: 'file_size_exceeded',
  FEATURE_LOCKED: 'feature_locked',
  FILE_COUNT_EXCEEDED: 'file_count_exceeded'
};

export const PROCESSING_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error'
};