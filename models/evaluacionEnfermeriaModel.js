// models/evaluacionEnfermeriaModel.js
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class EvaluacionEnfermeria extends Model {}

EvaluacionEnfermeria.init(
  {
    signos_vitales: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sintomas: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    plan_cuidado: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    admision_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admisiones",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "EvaluacionEnfermeria",
    tableName: "evaluaciones_enfermeria",
    timestamps: true,
    createdAt: "fecha_evaluacion",
    updatedAt: false,
  }
);

module.exports = EvaluacionEnfermeria;