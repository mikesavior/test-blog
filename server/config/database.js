const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize("blog", process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {  
  // user: process.env.POSTGRES_USER,
  // password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
});
console.log(process.env.POSTGRES_USER);
console.log(__dirname + '/.env');
module.exports = sequelize;
