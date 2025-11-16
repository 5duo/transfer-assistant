"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const auth_1 = require("./middleware/auth");
const clipboardController_1 = require("./controllers/clipboardController");
const authController_1 = require("./controllers/authController");
const historyController_1 = require("./controllers/historyController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '..', '..', 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const lastDotIndex = file.originalname.lastIndexOf('.');
        let name, ext;
        if (lastDotIndex === -1) {
            name = file.originalname;
            ext = '';
        }
        else {
            name = file.originalname.substring(0, lastDotIndex);
            ext = file.originalname.substring(lastDotIndex);
        }
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const fileFilter = (req, file, cb) => {
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
const guestStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '..', '..', 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const lastDotIndex = file.originalname.lastIndexOf('.');
        let name, ext;
        if (lastDotIndex === -1) {
            name = file.originalname;
            ext = '';
        }
        else {
            name = file.originalname.substring(0, lastDotIndex);
            ext = file.originalname.substring(lastDotIndex);
        }
        cb(null, 'guest-' + file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const guestUpload = (0, multer_1.default)({
    storage: guestStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
const setupRoutes = (app) => {
    app.post('/api/auth/login', authController_1.authController.login);
    app.post('/api/auth/register', authController_1.authController.register);
    app.post('/api/clipboard', auth_1.authenticateToken, clipboardController_1.clipboardController.create);
    app.get('/api/clipboard', auth_1.authenticateToken, clipboardController_1.clipboardController.getLatest);
    app.post('/api/clipboard/guest', clipboardController_1.clipboardController.createGuest);
    app.get('/api/clipboard/guest', clipboardController_1.clipboardController.getLatestGuest);
    app.get('/api/history', auth_1.authenticateToken, historyController_1.historyController.getAll);
    app.delete('/api/history/:id', auth_1.authenticateToken, historyController_1.historyController.delete);
    app.put('/api/history/:id', auth_1.authenticateToken, historyController_1.historyController.setAsLatest);
    app.post('/api/upload', auth_1.authenticateToken, upload.single('file'), clipboardController_1.clipboardController.uploadFile);
    app.post('/api/upload/guest', guestUpload.single('file'), clipboardController_1.clipboardController.uploadGuestFile);
    app.get('/api/files/:filename', (req, res) => {
        let encodedFileName = req.params.filename;
        try {
            encodedFileName = decodeURIComponent(encodedFileName);
        }
        catch (error) {
            console.warn('Could not decode filename normally:', error);
        }
        const filePath = path_1.default.join(__dirname, '..', '..', 'uploads', encodedFileName);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(404).json({ error: 'File not found' });
            }
        });
    });
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=routes.js.map