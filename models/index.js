const Paciente = require('./pacienteModel');
const Sala = require('./salaModel');
const Cama = require('./camaModel');
const Admision = require('./admisionModel');
const EvaluacionEnfermeria = require('./evaluacionEnfermeriaModel');

// Relaciones
Admision.belongsTo(Paciente, { foreignKey: "paciente_id" });
Admision.belongsTo(Cama, { foreignKey: "cama_id" });
Admision.hasMany(EvaluacionEnfermeria, { foreignKey: "admision_id" });
EvaluacionEnfermeria.belongsTo(Admision, { foreignKey: "admision_id", onDelete: "CASCADE" });

module.exports = {
  Paciente,
  Sala,
  Cama,
  Admision,
  EvaluacionEnfermeria
};