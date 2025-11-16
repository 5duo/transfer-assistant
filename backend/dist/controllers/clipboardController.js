"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipboardController = void 0;
const clipboardService_1 = require("../services/clipboardService");
exports.clipboardController = {
    create: async (req, res) => {
        try {
            const { content, type } = req.body;
            const userId = req.user.id;
            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }
            const clipboardItem = await clipboardService_1.clipboardService.create(userId, content, type);
            res.status(201).json(clipboardItem);
            return;
        }
        catch (error) {
            console.error('Error creating clipboard item:', error);
            res.status(500).json({ error: 'Failed to create clipboard item' });
            return;
        }
    },
    getLatest: async (req, res) => {
        try {
            const userId = req.user.id;
            const clipboardItem = await clipboardService_1.clipboardService.getLatestByUser(userId);
            if (!clipboardItem) {
                res.status(404).json({ error: 'No clipboard items found' });
                return;
            }
            res.json(clipboardItem);
            return;
        }
        catch (error) {
            console.error('Error getting latest clipboard item:', error);
            res.status(500).json({ error: 'Failed to get clipboard item' });
            return;
        }
    },
    createGuest: async (req, res) => {
        try {
            const { content, type } = req.body;
            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }
            const clipboardItem = await clipboardService_1.clipboardService.createGuest(content, type);
            res.status(201).json(clipboardItem);
            return;
        }
        catch (error) {
            console.error('Error creating guest clipboard item:', error);
            res.status(500).json({ error: 'Failed to create guest clipboard item' });
            return;
        }
    },
    getLatestGuest: async (req, res) => {
        try {
            const clipboardItem = await clipboardService_1.clipboardService.getLatestGuest();
            if (!clipboardItem) {
                res.status(404).json({ error: 'No clipboard items found' });
                return;
            }
            res.json(clipboardItem);
            return;
        }
        catch (error) {
            console.error('Error getting latest guest clipboard item:', error);
            res.status(500).json({ error: 'Failed to get guest clipboard item' });
            return;
        }
    },
    uploadFile: async (req, res) => {
        try {
            const userId = req.user.id;
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: 'File is required' });
                return;
            }
            const clipboardItem = await clipboardService_1.clipboardService.createFile(userId, file);
            res.status(201).json(clipboardItem);
            return;
        }
        catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file' });
            return;
        }
    },
    uploadGuestFile: async (req, res) => {
        try {
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: 'File is required' });
                return;
            }
            const clipboardItem = await clipboardService_1.clipboardService.createGuestFile(file);
            res.status(201).json(clipboardItem);
            return;
        }
        catch (error) {
            console.error('Error uploading guest file:', error);
            res.status(500).json({ error: 'Failed to upload guest file' });
            return;
        }
    }
};
//# sourceMappingURL=clipboardController.js.map