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
    },
    sala_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'salas',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'Cama',
    tableName: 'camas',
    indexes: [
      {
        unique: true,
        fields: ['sala_id', 'numero_cama']
      }
    ],
    defaultScope: {
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    }
  }
);



module.exports = Cama;