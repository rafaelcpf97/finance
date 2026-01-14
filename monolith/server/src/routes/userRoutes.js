const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  validateRequest,
  userController.createUser
);

router.get(
  '/:userId',
  [param('userId').isUUID().withMessage('Valid user ID is required')],
  validateRequest,
  userController.getUserById
);

module.exports = router;
