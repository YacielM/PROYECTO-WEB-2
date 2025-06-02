// sync.js
const sequelize = require('../config/db');
const { EvaluacionEnfermeria, EvaluacionMedica, Admision,
   Paciente, Cama, Sala, Usuario, Turno } = require('../models');


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