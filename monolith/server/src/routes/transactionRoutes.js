const express = require('express');
const { body, param, query } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/transfer',
  [
    body('fromUserId').isUUID().withMessage('Valid sender user ID is required'),
    body('toUserId').isUUID().withMessage('Valid receiver user ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  ],
  validateRequest,
  transactionController.transfer
);

router.get(
  '/:userId',
  [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Page size must be between 1 and 100'),
  ],
  validateRequest,
  transactionController.getTransactionHistory
);

module.exports = router;
