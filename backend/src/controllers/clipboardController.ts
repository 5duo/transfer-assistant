import { Request, Response } from 'express';
import { clipboardService } from '../services/clipboardService';

export const clipboardController = {
  // Create new clipboard content for authenticated user
  create: async (req: Request, res: Response) => {
    try {
      const { content, type } = req.body;
      const userId = (req as any).user.id;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const clipboardItem = await clipboardService.create(userId, content, type);

      res.status(201).json(clipboardItem);
      return;
    } catch (error) {
      console.error('Error creating clipboard item:', error);
      res.status(500).json({ error: 'Failed to create clipboard item' });
      return;
    }
  },

  // Get latest clipboard content for authenticated user
  getLatest: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const clipboardItem = await clipboardService.getLatestByUser(userId);

      if (!clipboardItem) {
        res.status(404).json({ error: 'No clipboard items found' });
        return;
      }

      res.json(clipboardItem);
      return;
    } catch (error) {
      console.error('Error getting latest clipboard item:', error);
      res.status(500).json({ error: 'Failed to get clipboard item' });
      return;
    }
  },

  // Create new clipboard content for guest
  createGuest: async (req: Request, res: Response) => {
    try {
      const { content, type } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const clipboardItem = await clipboardService.createGuest(content, type);

      res.status(201).json(clipboardItem);
      return;
    } catch (error) {
      console.error('Error creating guest clipboard item:', error);
      res.status(500).json({ error: 'Failed to create guest clipboard item' });
      return;
    }
  },

  // Get latest clipboard content for guests
  getLatestGuest: async (req: Request, res: Response) => {
    try {
      const clipboardItem = await clipboardService.getLatestGuest();

      if (!clipboardItem) {
        res.status(404).json({ error: 'No clipboard items found' });
        return;
      }

      res.json(clipboardItem);
      return;
    } catch (error) {
      console.error('Error getting latest guest clipboard item:', error);
      res.status(500).json({ error: 'Failed to get guest clipboard item' });
      return;
    }
  },

  // Upload file for authenticated user
  uploadFile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'File is required' });
        return;
      }

      const clipboardItem = await clipboardService.createFile(userId, file);

      res.status(201).json(clipboardItem);
      return;
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
      return;
    }
  },

  // Upload file for guest
  uploadGuestFile: async (req: Request, res: Response) => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'File is required' });
        return;
      }

      // For guest uploads, use the new createGuestFile method
      const clipboardItem = await clipboardService.createGuestFile(file);

      res.status(201).json(clipboardItem);
      return;
    } catch (error) {
      console.error('Error uploading guest file:', error);
      res.status(500).json({ error: 'Failed to upload guest file' });
      return;
    }
  }
};