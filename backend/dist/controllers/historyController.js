"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyController = void 0;
const historyService_1 = require("../services/historyService");
exports.historyController = {
    getAll: async (req, res) => {
        try {
            const userId = req.user.id;
            const history = await historyService_1.historyService.getAllByUser(userId);
            res.json(history);
        }
        catch (error) {
            console.error('Error getting history:', error);
            res.status(500).json({ error: 'Failed to get history' });
        }
    },
    delete: async (req, res) => {
        try {
            const userId = req.user.id;
            const historyId = req.params.id;
            await historyService_1.historyService.deleteById(userId, historyId);
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting history item:', error);
            res.status(500).json({ error: 'Failed to delete history item' });
        }
    },
    setAsLatest: async (req, res) => {
        try {
            const userId = req.user.id;
            const historyId = req.params.id;
            const result = await historyService_1.historyService.setAsLatest(userId, historyId);
            res.json(result);
        }
        catch (error) {
            console.error('Error setting history as latest:', error);
            res.status(500).json({ error: 'Failed to set history as latest' });
        }
    }
};
//# sourceMappingURL=historyController.js.map