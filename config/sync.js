// sync.js
const sequelize = require('../config/db');
const Admision = require('../models/admisionModel'); // Añade esta línea
const Paciente = require('../models/pacienteModel');
const Cama = require('../models/camaModel');
const EvaluacionEnfermeria = require('../models/evaluacionEnfermeriaModel'); // Añade esta línea
const Sala = require('../models/salaModel'); // Añade esta línea


async function syncDB() {
  try {
    // Paso 1: Deshabilitar restricciones de clave foránea
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Paso 2: Sincronizar modelos (eliminar y recrear tablas)
    await sequelize.sync({ force: true });

    // Paso 3: Habilitar restricciones de nuevo
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Tablas recreadas exitosamente");
  } catch (error) {
    console.error(" Error:", error.message);
  } finally {
    process.exit();
  }
}

syncDB();