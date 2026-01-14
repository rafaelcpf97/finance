const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

const notificationService = {
  async getNotifications(userId, filters = {}) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return await notificationRepository.findByUserId(userId, filters);
  },

  async markAsRead(notificationId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return await notificationRepository.markAsRead(notificationId);
  },
};

module.exports = notificationService;
