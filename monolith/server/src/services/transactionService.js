const db = require('../config/database');
const userRepository = require('../repositories/userRepository');
const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');
const notificationRepository = require('../repositories/notificationRepository');

const transactionService = {
  async transfer(fromUserId, toUserId, amount) {
    if (amount <= 0) {
      const error = new Error('Amount must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    if (fromUserId === toUserId) {
      const error = new Error('Cannot transfer to yourself');
      error.statusCode = 400;
      throw error;
    }

    // Validate users exist
    const fromUser = await userRepository.findById(fromUserId);
    const toUser = await userRepository.findById(toUserId);

    if (!fromUser) {
      const error = new Error('Sender user not found');
      error.statusCode = 404;
      throw error;
    }

    if (!toUser) {
      const error = new Error('Receiver user not found');
      error.statusCode = 404;
      throw error;
    }

    // Get wallets
    const fromWallet = await walletRepository.findByUserId(fromUserId);
    const toWallet = await walletRepository.findByUserId(toUserId);

    if (!fromWallet || !toWallet) {
      const error = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // Check sufficient balance
    if (parseFloat(fromWallet.balance) < amount) {
      const error = new Error('Insufficient balance');
      error.statusCode = 400;
      throw error;
    }

    // Perform atomic transfer using transaction
    return await db.transaction(async (trx) => {
      // Decrement sender balance
      await trx('wallets')
        .where({ id: fromWallet.id })
        .decrement('balance', amount)
        .update({ updated_at: db.fn.now() });

      // Increment receiver balance
      await trx('wallets')
        .where({ id: toWallet.id })
        .increment('balance', amount)
        .update({ updated_at: db.fn.now() });

      // Create TRANSFER_OUT transaction
      const transferOut = await trx('transactions')
        .insert({
          type: 'TRANSFER_OUT',
          amount,
          wallet_from_id: fromWallet.id,
          wallet_to_id: toWallet.id,
          status: 'COMPLETED',
        })
        .returning('*');

      // Create TRANSFER_IN transaction
      const transferIn = await trx('transactions')
        .insert({
          type: 'TRANSFER_IN',
          amount,
          wallet_from_id: fromWallet.id,
          wallet_to_id: toWallet.id,
          status: 'COMPLETED',
        })
        .returning('*');

      // Create notifications
      await trx('notifications').insert({
        user_id: fromUserId,
        type: 'TRANSFER_SENT',
        message: `You sent $${amount.toFixed(2)} to ${toUser.name}`,
        read: false,
      });

      await trx('notifications').insert({
        user_id: toUserId,
        type: 'TRANSFER_RECEIVED',
        message: `You received $${amount.toFixed(2)} from ${fromUser.name}`,
        read: false,
      });

      return {
        transferOut: transferOut[0],
        transferIn: transferIn[0],
      };
    });
  },

  async getTransactionHistory(userId, page = 1, pageSize = 20) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return await transactionRepository.findByUserId(userId, page, pageSize);
  },
};

module.exports = transactionService;
