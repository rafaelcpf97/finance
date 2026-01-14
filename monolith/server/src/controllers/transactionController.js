const transactionService = require('../services/transactionService');

const transactionController = {
  async transfer(req, res, next) {
    try {
      const { fromUserId, toUserId, amount } = req.body;
      const result = await transactionService.transfer(fromUserId, toUserId, amount);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const result = await transactionService.getTransactionHistory(userId, page, pageSize);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = transactionController;
