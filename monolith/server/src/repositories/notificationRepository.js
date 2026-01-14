const db = require('../config/database');

const notificationRepository = {
  async create(notificationData) {
    const [notification] = await db('notifications')
      .insert({
        user_id: notificationData.userId,
        type: notificationData.type,
        message: notificationData.message,
        read: notificationData.read || false,
      })
      .returning('*');
    return notification;
  },

  async findByUserId(userId, filters = {}) {
    let query = db('notifications').where({ user_id: userId });

    if (filters.read !== undefined) {
      query = query.where({ read: filters.read });
    }

    return await query.orderBy('created_at', 'desc');
  },

  async markAsRead(id) {
    const [notification] = await db('notifications')
      .where({ id })
      .update({ read: true, updated_at: db.fn.now() })
      .returning('*');
    return notification;
  },

  async findById(id) {
    return await db('notifications').where({ id }).first();
  },
};

module.exports = notificationRepository;
