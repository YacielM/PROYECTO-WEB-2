// models/camaModel.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');



class Cama extends Model {}

Cama.init(
  {
    numero_cama: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1
      }
    },
    estado: {
      type: DataTypes.ENUM('Disponible', 'Ocupada', 'En Limpieza'),
      defaultValue: 'Disponible',
      allowNull: false
    },
    restriccion_genero: {
      type: DataTypes.ENUM('M', 'F', 'Ninguno'),
      defaultValue: 'Ninguno'
    }
  },
  {
    sequelize,
    modelName: 'Cama',
    tableName: 'camas',
    indexes: [
      {
        unique: true,
        fields: ['sala_id', 'numero_cama'] // Evita camas duplicadas en la misma sala
      }
    ],
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] } // Oculta campos innecesarios
    }
  }
);



module.exports = Cama;