import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.detail);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.detail);
          break;
          
        case 429:
          // Rate limited
          console.error('Rate limited:', data.detail);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.detail);
          break;
          
        default:
          console.error('API error:', data.detail);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


const downloadReport = async (jobId) => {
    try {
        const response = await api.get(`/jobs/${jobId}/report`, {
            responseType: 'blob', // Important: tells axios to treat the response as a binary file
        });

        // The backend should return the filename in the Content-Disposition header
        // If not, we use a default name
        const contentDisposition = response.headers['content-disposition'];
        let filename = `Forensic_Report_${jobId}.pdf`;

        if (contentDisposition) {
            const matches = /filename="?([^"]+)"?/.exec(contentDisposition);
            if (matches && matches[1]) {
                filename = matches[1];
            }
        }

        // Create a URL for the blob and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        console.error('Error downloading report:', error);
        throw error;
    }
};


// Forensic API endpoints
export const forensicAPI = {
  // Job submission
  submitURLJob: async (jobData) => {
    const response = await api.post('/jobs/url', jobData);
    return response;
  },
  
  submitUploadJob: async (formData) => {
    const response = await api.post('/jobs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
  
  // Job monitoring
  getJobStatus: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/status`);
    return response;
  },
  
  getJobDetails: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/details`);
    return response;
  },
  
  getAllJobs: async () => {
    const response = await api.get('/jobs');
    return response;
  },
  
  // Verification
  verifyIntegrity: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/verify`);
    return response;
  },
  
  // Reports
  downloadPDF: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/pdf`, {
      responseType: 'blob',
    });
    return response;
  },
  
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response;
  },
  
  // Utility
  cancelJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response;
  },
  
  // Batch operations
  batchVerify: async (jobIds) => {
    const response = await api.post('/jobs/batch/verify', { jobIds });
    return response;
  },
  
  downloadReport,
  
  // Analytics
  getAnalytics: async (period = '7d') => {
    const response = await api.get(`/analytics?period=${period}`);
    return response;
  },
};

// WebSocket service for real-time updates
export const createWebSocket = (jobId = null) => {
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
  const url = jobId ? `${wsUrl}?job_id=${jobId}` : wsUrl;
  
  const ws = new WebSocket(url);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return ws;
};

export default api;