// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'his_db',   // Nombre de tu BD en MySQL Workbench
  'root',     // Usuario
  'admin',    // Contraseña
  {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Oculta los logs de SQL en consola
  }
);

module.exports = sequelize;