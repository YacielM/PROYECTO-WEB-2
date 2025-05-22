const { EvaluacionMedica, Admision, Paciente, Cama, Sala } = require('../models');
const sequelize = require("../config/db");

exports.listarEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await EvaluacionMedica.findAll({
      include: [
        {
          model: Admision,
          include: [
            { model: Paciente },
            { model: Cama, include: [Sala] }
          ]
        }
      ],
      order: [["fecha_evaluacion", "ASC"]],
    });
    res.render("eva_medicas/index", { evaluaciones });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar evaluaciones médicas" });
  }
};

exports.formularioNuevaEvaluacion = async (req, res) => {
  try {
    const admisiones = await Admision.findAll({
      where: { estado: "Activo" },
      include: [Paciente]
    });
    res.render("eva_medicas/nuevo", { admisiones });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar admisiones activas" });
  }
};

exports.crearEvaluacion = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { admision_id, diagnostico, tratamiento, seguimiento } = req.body;

    if (!admision_id || !diagnostico || !tratamiento) {
      throw new Error("Diagnóstico y tratamiento son obligatorios");
    }

    await EvaluacionMedica.create({
      admision_id,
      diagnostico,
      tratamiento,
      seguimiento: seguimiento || null
    }, { transaction: t });

    await t.commit();
    res.redirect("/eva_medicas");
  } catch (error) {
    await t.rollback();
    const admisiones = await Admision.findAll({ include: [Paciente] });
    res.render("eva_medicas/nuevo", {
      error: error.message,
      admisiones,
      datos: req.body
    });
  }
};