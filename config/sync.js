// sync.js
const sequelize = require('../config/db');
const Admision = require('../models/admisionModel'); // Añade esta línea
const Paciente = require('../models/pacienteModel');
const Cama = require('../models/camaModel');

async function syncDB() {
  try {
    await sequelize.sync({ force: true }); // Crea todas las tablas
    console.log('Tablas creadas: Admisiones, Pacientes, Camas');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

syncDB();