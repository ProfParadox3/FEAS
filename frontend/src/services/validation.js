// URL validation
export const validateURL = (url) => {
    try {
      const urlObj = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          message: 'URL must use HTTP or HTTPS protocol'
        };
      }
      
      // Check allowed domains
      const allowedDomains = [
        'twitter.com',
        'x.com',
        'youtube.com',
        'youtu.be'
      ];
      
      const domain = urlObj.hostname.toLowerCase();
      const isAllowed = allowedDomains.some(allowed => domain.includes(allowed));
      
      if (!isAllowed) {
        return {
          isValid: false,
          message: `Domain not allowed. Allowed: ${allowedDomains.join(', ')}`
        };
      }
      
      return {
        isValid: true,
        domain: domain,
        platform: detectPlatform(domain)
      };
      
    } catch (error) {
      return {
        isValid: false,
        message: 'Please enter a valid URL'
      };
    }
  };
  
  // File validation
  export const validateFile = (file) => {
    // Check file size (500MB max)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        message: `File size ${formatFileSize(file.size)} exceeds maximum allowed ${formatFileSize(maxSize)}`
      };
    }
    
    // Check file extension
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.heic', '.heif',
      '.mp4', '.mov', '.avi',
      '.mp3', '.wav'
    ];
    
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        message: `File extension ${fileExtension} not allowed. Allowed: ${allowedExtensions.join(', ')}`
      };
    }
    
    // Check MIME type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'audio/mpeg',
      'audio/wav'
    ];
    
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        message: `File type ${file.type} not allowed`
      };
    }
    
    return {
      isValid: true,
      fileSize: file.size,
      mimeType: file.type
    };
  };
  
  // Investigator ID validation
  export const validateInvestigatorId = (id) => {
    if (!id || id.trim().length === 0) {
      return {
        isValid: false,
        message: 'Investigator ID is required'
      };
    }
    
    if (id.length > 100) {
      return {
        isValid: false,
        message: 'Investigator ID must be less than 100 characters'
      };
    }
    
    // Optional: Add pattern validation
    const pattern = /^[A-Z0-9-_]+$/i;
    if (!pattern.test(id)) {
      return {
        isValid: false,
        message: 'Investigator ID can only contain letters, numbers, hyphens, and underscores'
      };
    }
    
    return {
      isValid: true
    };
  };
  
  // Case number validation
  export const validateCaseNumber = (caseNumber) => {
    if (!caseNumber || caseNumber.trim().length === 0) {
      return {
        isValid: true, // Optional field
        message: ''
      };
    }
    
    if (caseNumber.length > 50) {
      return {
        isValid: false,
        message: 'Case number must be less than 50 characters'
      };
    }
    
    return {
      isValid: true
    };
  };
  
  // Notes validation
  export const validateNotes = (notes) => {
    if (!notes || notes.trim().length === 0) {
      return {
        isValid: true, // Optional field
        message: ''
      };
    }
    
    if (notes.length > 1000) {
      return {
        isValid: false,
        message: 'Notes must be less than 1000 characters'
      };
    }
    
    return {
      isValid: true
    };
  };
  
  // Helper functions
  const detectPlatform = (domain) => {
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return 'twitter';
    }
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'youtube';
    }
    return 'web';
  };
  
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Form validation
  export const validateSubmissionForm = (data) => {
    const errors = {};
    
    // Validate investigator ID
    const idValidation = validateInvestigatorId(data.investigatorId);
    if (!idValidation.isValid) {
      errors.investigatorId = idValidation.message;
    }
    
    // Validate case number if provided
    if (data.caseNumber) {
      const caseValidation = validateCaseNumber(data.caseNumber);
      if (!caseValidation.isValid) {
        errors.caseNumber = caseValidation.message;
      }
    }
    
    // Validate notes if provided
    if (data.notes) {
      const notesValidation = validateNotes(data.notes);
      if (!notesValidation.isValid) {
        errors.notes = notesValidation.message;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };