const walletService = require('../services/walletService');

const walletController = {
  async getBalance(req, res, next) {
    try {
      const result = await walletService.getBalance(req.params.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async deposit(req, res, next) {
    try {
      const result = await walletService.deposit(req.params.userId, req.body.amount);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = walletController;
