const db = require('../config/database');

const walletRepository = {
  async create(walletData) {
    const [wallet] = await db('wallets')
      .insert({
        user_id: walletData.userId,
        balance: walletData.balance || 0,
      })
      .returning('*');
    return wallet;
  },

  async findByUserId(userId) {
    return await db('wallets').where({ user_id: userId }).first();
  },

  async findById(id) {
    return await db('wallets').where({ id }).first();
  },

  async updateBalance(walletId, newBalance) {
    const [wallet] = await db('wallets')
      .where({ id: walletId })
      .update({ balance: newBalance, updated_at: db.fn.now() })
      .returning('*');
    return wallet;
  },

  async incrementBalance(walletId, amount) {
    const [wallet] = await db('wallets')
      .where({ id: walletId })
      .increment('balance', amount)
      .update({ updated_at: db.fn.now() })
      .returning('*');
    return wallet;
  },

  async decrementBalance(walletId, amount) {
    const [wallet] = await db('wallets')
      .where({ id: walletId })
      .decrement('balance', amount)
      .update({ updated_at: db.fn.now() })
      .returning('*');
    return wallet;
  },
};

module.exports = walletRepository;
