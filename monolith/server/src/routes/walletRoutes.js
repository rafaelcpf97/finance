const express = require('express');
const { body, param } = require('express-validator');
const walletController = require('../controllers/walletController');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

router.get(
  '/:userId/balance',
  [param('userId').isUUID().withMessage('Valid user ID is required')],
  validateRequest,
  walletController.getBalance
);

router.post(
  '/:userId/deposit',
  [
    param('userId').isUUID().withMessage('Valid user ID is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  ],
  validateRequest,
  walletController.deposit
);

module.exports = router;
