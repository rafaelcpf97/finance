const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');

const walletService = {
  async getBalance(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      const error = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    return { balance: parseFloat(wallet.balance) };
  },

  async deposit(userId, amount) {
    if (amount <= 0) {
      const error = new Error('Amount must be greater than 0');
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      const error = new Error('Wallet not found');
      error.statusCode = 404;
      throw error;
    }

    // Increment balance
    const updatedWallet = await walletRepository.incrementBalance(wallet.id, amount);

    // Create DEPOSIT transaction
    await transactionRepository.create({
      type: 'DEPOSIT',
      amount,
      walletToId: wallet.id,
      status: 'COMPLETED',
    });

    return { balance: parseFloat(updatedWallet.balance) };
  },
};

module.exports = walletService;
