import { Application, Request, Response } from 'express';
import { authenticateToken } from './middleware/auth';
import { clipboardController } from './controllers/clipboardController';
import { authController } from './controllers/authController';
import { historyController } from './controllers/historyController';
import multer from 'multer';
import path from 'path';

// Set up multer for authenticated file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path to the project's root uploads directory
    // The backend is in a subdirectory, so we need to go up one level
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Use the last dot to separate filename and extension to handle Chinese filenames properly
    const lastDotIndex = file.originalname.lastIndexOf('.');
    let name, ext;

    if (lastDotIndex === -1) {
      // No extension case
      name = file.originalname;
      ext = '';
    } else {
      name = file.originalname.substring(0, lastDotIndex);
      ext = file.originalname.substring(lastDotIndex); // includes the dot
    }

    // For the actual filename, we'll use the unique suffix only, but keep the original name in the DB
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Allow all file types for now - can be restricted later
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Set up multer for guest file uploads
const guestStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path to the project's root uploads directory
    // The backend is in a subdirectory, so we need to go up one level
    const uploadPath = path.join(__dirname, '..', '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Use the last dot to separate filename and extension to handle Chinese filenames properly
    const lastDotIndex = file.originalname.lastIndexOf('.');
    let name, ext;

    if (lastDotIndex === -1) {
      // No extension case
      name = file.originalname;
      ext = '';
    } else {
      name = file.originalname.substring(0, lastDotIndex);
      ext = file.originalname.substring(lastDotIndex); // includes the dot
    }

    // For the actual filename, we'll use the unique suffix only, but keep the original name in the DB
    cb(null, 'guest-' + file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const guestUpload = multer({ 
  storage: guestStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export const setupRoutes = (app: Application) => {
  // Authentication routes
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/register', authController.register);

  // Clipboard routes
  app.post('/api/clipboard', authenticateToken, clipboardController.create);
  app.get('/api/clipboard', authenticateToken, clipboardController.getLatest);
  app.post('/api/clipboard/guest', clipboardController.createGuest);
  app.get('/api/clipboard/guest', clipboardController.getLatestGuest);

  // History routes (only for authenticated users)
  app.get('/api/history', authenticateToken, historyController.getAll);
  app.delete('/api/history/:id', authenticateToken, historyController.delete);
  app.put('/api/history/:id', authenticateToken, historyController.setAsLatest);

  // File upload endpoints
  app.post('/api/upload', authenticateToken, upload.single('file'), clipboardController.uploadFile);
  app.post('/api/upload/guest', guestUpload.single('file'), clipboardController.uploadGuestFile);
  
  // File download endpoint
  app.get('/api/files/:filename', (req: Request, res: Response) => {
    // Decode the filename parameter to handle special characters including Chinese characters
    let encodedFileName = req.params.filename;

    // Additional handling for encoded Chinese characters in filename
    try {
      // First try normal decoding
      encodedFileName = decodeURIComponent(encodedFileName);
    } catch (error) {
      console.warn('Could not decode filename normally:', error);
      // If normal decoding fails, keep the encoded version
    }

    // Use absolute path to the project's root uploads directory
    // The backend is in a subdirectory, so we need to go up one level
    const filePath = path.join(__dirname, '..', '..', 'uploads', encodedFileName);
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(404).json({ error: 'File not found' });
      }
    });
  });
};