// models/admisionModel.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Admision extends Model {}

Admision.init(
  {
    tipo_admision: {
      type: DataTypes.ENUM("Programada", "Emergencia", "Derivada"),
      allowNull: false,
      validate: {
        notNull: { msg: "El tipo de admisión es obligatorio" },
      },
    },
    estado: {
      type: DataTypes.ENUM("Activo", "Cancelado", "Dados de Alta"),
      defaultValue: "Activo",
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pacientes",
        key: "id",
      },
    },
    cama_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "camas",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Admision",
    tableName: "admisiones",
    timestamps: true,
    createdAt: "fecha_admision",
    updatedAt: false,
  }
);


module.exports = Admision;