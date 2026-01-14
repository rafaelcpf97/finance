const db = require('../config/database');

const userRepository = {
  async create(userData) {
    const [user] = await db('users')
      .insert({
        name: userData.name,
        email: userData.email,
      })
      .returning('*');
    return user;
  },

  async findById(id) {
    return await db('users').where({ id }).first();
  },

  async findByEmail(email) {
    return await db('users').where({ email }).first();
  },

  async findAll() {
    return await db('users').select('*');
  },
};

module.exports = userRepository;
