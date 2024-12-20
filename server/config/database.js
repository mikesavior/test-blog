const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('blog', process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    ssl: process.env.DATABASE_URL ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

module.exports = sequelize;
