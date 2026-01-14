const notificationService = require('../services/notificationService');

const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const userId = req.params.userId;
      const filters = {};
      if (req.query.read !== undefined) {
        filters.read = req.query.read === 'true';
      }
      const notifications = await notificationService.getNotifications(userId, filters);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
