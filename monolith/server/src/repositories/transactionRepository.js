const db = require('../config/database');

const transactionRepository = {
  async create(transactionData) {
    const [transaction] = await db('transactions')
      .insert({
        type: transactionData.type,
        amount: transactionData.amount,
        wallet_from_id: transactionData.walletFromId || null,
        wallet_to_id: transactionData.walletToId,
        status: transactionData.status || 'COMPLETED',
      })
      .returning('*');
    return transaction;
  },

  async findByUserId(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    
    // Get user's wallet
    const wallet = await db('wallets').where({ user_id: userId }).first();
    if (!wallet) {
      return { transactions: [], total: 0 };
    }

    // Get transactions where user's wallet is involved
    const transactions = await db('transactions')
      .where(function() {
        this.where('wallet_from_id', wallet.id)
            .orWhere('wallet_to_id', wallet.id);
      })
      .orderBy('created_at', 'desc')
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db('transactions')
      .where(function() {
        this.where('wallet_from_id', wallet.id)
            .orWhere('wallet_to_id', wallet.id);
      })
      .count('* as count');

    return {
      transactions,
      total: parseInt(count),
      page,
      pageSize,
    };
  },

  async findById(id) {
    return await db('transactions').where({ id }).first();
  },
};

module.exports = transactionRepository;
