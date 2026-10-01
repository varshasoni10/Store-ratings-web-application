const { Sequelize } = require('sequelize');
require('dotenv').config();

const options = {
  dialect: 'postgres',
  logging: false,
  dialectOptions:
    process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
};

// Hosted providers give a single DATABASE_URL; local setups use the DB_* variables.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, options)
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      ...options,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });

module.exports = sequelize;
