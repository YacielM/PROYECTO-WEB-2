// models/admisionModel.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Paciente = require('./pacienteModel');
const Cama = require('./camaModel');

class Admision extends Model {}

Admision.init(
  {
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Paciente,
        key: 'id'
      }
    },
    cama_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cama,
        key: 'id'
      }
    },
    tipo_admision: {
      type: DataTypes.ENUM('Programada', 'Emergencia', 'Derivada'),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Cancelado', 'Dados de Alta'),
      defaultValue: 'Activo'
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Admision',
    tableName: 'admisiones',
    timestamps: true,
    createdAt: 'fecha_admision',
    updatedAt: false
  }
);

// Relaciones
Admision.belongsTo(Paciente, { foreignKey: 'paciente_id' });
Admision.belongsTo(Cama, { foreignKey: 'cama_id' });

module.exports = Admision;