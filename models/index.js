// models/index.js
const Paciente = require('./pacienteModel');
const Sala = require('./salaModel');
const Cama = require('./camaModel');
const Admision = require('./admisionModel');
const EvaluacionEnfermeria = require('./evaluacionEnfermeriaModel');
const EvaluacionMedica = require('./evaluacionMedicaModel');
const Usuario = require('./usuarioModel');
const Turno = require('./turnoModel');

// Relaciones
// Admisión -> Paciente y Cama
Admision.belongsTo(Paciente, { foreignKey: "paciente_id" });
Admision.belongsTo(Cama, { foreignKey: "cama_id" });


// Admisión -> Evaluaciones
Admision.hasMany(EvaluacionEnfermeria, { 
  foreignKey: "admision_id",
  onDelete: "CASCADE" 
});
Admision.hasMany(EvaluacionMedica, { 
  foreignKey: "admision_id",
  onDelete: "CASCADE" 
});

// Evaluaciones -> Admisión
EvaluacionEnfermeria.belongsTo(Admision, { 
  foreignKey: "admision_id",
  onDelete: "CASCADE" 
});
EvaluacionMedica.belongsTo(Admision, { 
  foreignKey: "admision_id",
  onDelete: "CASCADE" 
});

Cama.belongsTo(Sala, { 
  foreignKey: "sala_id",
  onDelete: "CASCADE" 
});

Sala.hasMany(Cama, {
  foreignKey: "sala_id"
});

Cama.hasMany(Admision, { 
  foreignKey: "cama_id"
 });

 Turno.belongsTo(Paciente, {
   foreignKey: 'paciente_id' 
  });
  
 Turno.belongsTo(Usuario, {
   as: 'medico',
   foreignKey: 'medico_id' 
  });

 module.exports = {
  Paciente,
  Sala,
  Cama,
  Admision,
  EvaluacionEnfermeria,
  EvaluacionMedica ,
  Usuario,
  Turno
};