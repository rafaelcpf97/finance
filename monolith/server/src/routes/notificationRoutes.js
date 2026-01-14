const express = require('express');
const { param, query } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

router.get(
  '/:userId',
  [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    query('read').optional().isBoolean().withMessage('Read filter must be a boolean'),
  ],
  validateRequest,
  notificationController.getNotifications
);

router.patch(
  '/:notificationId/read',
  [param('notificationId').isUUID().withMessage('Valid notification ID is required')],
  validateRequest,
  notificationController.markAsRead
);

module.exports = router;
