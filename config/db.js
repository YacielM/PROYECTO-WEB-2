// db.js
const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2'); // Agrega esta línea

const sequelize = new Sequelize(
  'his_db',   // Nombre de tu BD en MySQL Workbench
  'root',     // Usuario
  'admin',    // Contraseña
  {
    host: 'localhost',
    dialect: 'mysql',
    dialectModule: mysql2, // Agrega esta opción para forzar el uso de mysql2
    logging: false // Oculta los logs de SQL en consola
  }
);

module.exports = sequelize;
