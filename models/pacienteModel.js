const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Paciente extends Model {}

Paciente.init(
  {
    dni: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: {
        msg: 'El DNI ya está registrado'
      }
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    genero: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: false
    },
    direccion: DataTypes.STRING(255),
    telefono: DataTypes.STRING(50),
    contacto_emergencia: DataTypes.STRING(100),
    historial_medico: DataTypes.TEXT
  },
  {
    sequelize,
    modelName: 'Paciente',
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'creado_en',
    updatedAt: false,
    validate: {
      camposObligatorios() {
        if (!this.dni || !this.nombre || !this.apellido || !this.genero) {
          throw new Error('DNI, nombre, apellido y género son obligatorios');
        }
      }
    }
  }
);

module.exports = Paciente;