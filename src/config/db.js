// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
  
//   {
//     host: process.env.DB_HOST,
//     dialect: 'postgres', 
//     logging: false, 
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000
//     }
//   }
// );
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  },
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('Соединение c базой данных успешно установлено');
  })
  .catch(error => {
    console.error('Невозможно подключиться к базе данных:', error.message);
  });

module.exports = sequelize;