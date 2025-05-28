// controllers/evaluacionEnfermeriaController.js
const { Paciente, Sala, Cama, Admision, EvaluacionEnfermeria } = require('../models');
const sequelize = require("../config/db");

exports.listarEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await EvaluacionEnfermeria.findAll({
      include: [
      {
        model: Admision,
        include: [Paciente]
      }
    ],
    order: [["fecha_evaluacion", "ASC"]],
  });
    res.render("eva_enfermeria/index", { evaluaciones });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar evaluaciones" });
  }
};

exports.formularioNuevaEvaluacion = async (req, res) => {
  try {
    const admisiones = await Admision.findAll({
      where: { estado: "Activo" }, // Solo admisiones activas
       include: [Paciente]
    });
    res.render("eva_enfermeria/nuevo", { admisiones });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar datos" });
  }
};

exports.crearEvaluacion = async (req, res) => {
  try {
    await EvaluacionEnfermeria.create(req.body);
    res.redirect("/eva_enfermeria");
  } catch (error) {
    const admisiones = await Admision.findAll();
    res.render("eva_enfermeria/nuevo", {
      error: "Error al crear evaluación",
      admisiones,
      datos: req.body,
    });
  }
};