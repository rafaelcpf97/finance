const userRepository = require('../repositories/userRepository');
const walletRepository = require('../repositories/walletRepository');

const userService = {
  async createUser(userData) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('Email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create user
    const user = await userRepository.create(userData);

    // Create associated wallet with balance 0
    await walletRepository.create({ userId: user.id, balance: 0 });

    return user;
  },

  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },
};

module.exports = userService;
