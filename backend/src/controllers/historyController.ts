import { Request, Response } from 'express';
import { historyService } from '../services/historyService';

export const historyController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const history = await historyService.getAllByUser(userId);
      
      res.json(history);
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({ error: 'Failed to get history' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const historyId = req.params.id;
      
      await historyService.deleteById(userId, historyId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting history item:', error);
      res.status(500).json({ error: 'Failed to delete history item' });
    }
  },

  setAsLatest: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const historyId = req.params.id;
      
      const result = await historyService.setAsLatest(userId, historyId);
      
      res.json(result);
    } catch (error) {
      console.error('Error setting history as latest:', error);
      res.status(500).json({ error: 'Failed to set history as latest' });
    }
  }
};