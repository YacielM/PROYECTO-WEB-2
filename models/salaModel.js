// models/salaModel.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Sala extends Model {}

Sala.init(
  {
    ala: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    numero_sala: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  },
  {
    sequelize,
    modelName: 'Sala',
    tableName: 'salas'
  }
);

module.exports = Sala;