const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Turno extends Model {}

Turno.init({
  fecha: { 
    type: DataTypes.DATE, 
    allowNull: false 
},
  estado: { 
    type: DataTypes.ENUM('pendiente', 'atendido', 'cancelado', 'internacion_pendiente'), 
    defaultValue: 'pendiente' 
},
  motivo: { 
    type: DataTypes.STRING 
},
  paciente_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: "pacientes", key: 'id' } 
},
  medico_id: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: "usuarios", key: 'id' } 
}
}, {
  sequelize,
  modelName: 'Turno',
  tableName: 'turnos',
  timestamps: false
});

module.exports = Turno;