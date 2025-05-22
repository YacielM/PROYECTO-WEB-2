const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class EvaluacionMedica extends Model {}

EvaluacionMedica.init(
  {
    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tratamiento: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    seguimiento: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admision_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "admisiones", // nombre de la tabla
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "EvaluacionMedica",
    tableName: "evaluaciones_medicas",
    timestamps: true,
    createdAt: "fecha_evaluacion",
    updatedAt: false,
  }
);

module.exports = EvaluacionMedica;