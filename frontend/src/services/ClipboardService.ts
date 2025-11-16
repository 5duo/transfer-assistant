import axios from 'axios';

// Use the same protocol as the current page (HTTP or HTTPS)
// This ensures API requests work correctly when behind reverse proxy
const currentProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const currentHost = window.location.host;
const API_BASE_URL = `${currentProtocol}//${currentHost}`;

export const ClipboardService = {
  // Login
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username,
      password
    });
    return response.data;
  },

  // Register
  register: async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      username,
      password
    });
    return response.data;
  },

  // Create clipboard content for authenticated user
  create: async (content: string, type: 'text' | 'file', token: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/clipboard`,
      { content, type },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Get latest clipboard content for authenticated user
  getLatest: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/clipboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Create clipboard content for guest
  createGuest: async (content: string, type: 'text' | 'file') => {
    const response = await axios.post(`${API_BASE_URL}/api/clipboard/guest`, {
      content, 
      type
    });
    return response.data;
  },

  // Get latest clipboard content for guest
  getLatestGuest: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/clipboard/guest`);
    return response.data;
  },

  // Upload file for authenticated user
  uploadFile: async (
    file: File, 
    token: string, 
    onProgress?: (progress: number) => void
  ) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle success
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      // Configure and send request
      xhr.open('POST', `${API_BASE_URL}/api/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  // Upload file for guest user
  uploadGuestFile: async (
    file: File, 
    onProgress?: (progress: number) => void
  ) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      // Handle success
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      // Configure and send request
      xhr.open('POST', `${API_BASE_URL}/api/upload/guest`);
      
      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  },

  // Get history for authenticated user
  getHistory: async (token: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Delete history item
  deleteHistory: async (id: string, token: string) => {
    await axios.delete(`${API_BASE_URL}/api/history/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Set history item as latest
  setHistoryAsLatest: async (id: string, token: string) => {
    const response = await axios.put(`${API_BASE_URL}/api/history/${id}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};