require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'notification-db',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'notification_db',
    },
    migrations: {
      directory: './src/database/migrations',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'notification-db',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'notification_db',
    },
    migrations: {
      directory: './src/database/migrations',
    },
  },
};
