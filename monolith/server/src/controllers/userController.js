const userService = require('../services/userService');

const userController = {
  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
