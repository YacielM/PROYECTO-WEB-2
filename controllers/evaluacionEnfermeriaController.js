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
    //Variable para unir los signos vitales
    const signos_vitales = `TA: ${req.body.ta},
     FC: ${req.body.fc}, Temp: ${req.body.temp},
      SatO2: ${req.body.sato2}`;

      await EvaluacionEnfermeria.create({
    admision_id: req.body.admision_id,
    signos_vitales,
    sintomas: req.body.sintomas,
    plan_cuidado: req.body.plan_cuidado
});
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

// Ver detalle de una evaluación
exports.verDetalle = async (req, res) => {
  try {
    const evaluacion = await EvaluacionEnfermeria.findByPk(req.params.id, {
      include: [
        {
          model: Admision,
          include: [Paciente]
        }
      ]
    });
    if (!evaluacion) {
      return res.render("error", { mensaje: "Evaluación no encontrada" });
    }
    res.render("eva_enfermeria/detalle", { evaluacion });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar detalle" });
  }
};

// Formulario para editar evaluación
exports.formularioEditar = async (req, res) => {
  try {
    const evaluacion = await EvaluacionEnfermeria.findByPk(req.params.id, {
      include: [
        {
          model: Admision,
          include: [Paciente]
        }
      ]
    });
    if (!evaluacion) {
      return res.render("error", { mensaje: "Evaluación no encontrada" });
    }
    // Separar signos vitales para los inputs
    const regex = /TA: ([^,]+),\s*FC: ([^,]+),\s*Temp: ([^,]+),\s*SatO2: ([^,]+)/;
    const match = evaluacion.signos_vitales.match(regex);
    res.render("eva_enfermeria/editar", {
      evaluacion,
      ta: match ? match[1] : "",
      fc: match ? match[2] : "",
      temp: match ? match[3] : "",
      sato2: match ? match[4] : ""
    });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar edición" });
  }
};

// Editar evaluación (POST)
exports.editarEvaluacion = async (req, res) => {
  try {
    const signos_vitales = `TA: ${req.body.ta}, FC: ${req.body.fc}, Temp: ${req.body.temp}, SatO2: ${req.body.sato2}`;
    await EvaluacionEnfermeria.update(
      {
        signos_vitales,
        sintomas: req.body.sintomas,
        plan_cuidado: req.body.plan_cuidado
      },
      { where: { id: req.params.id } }
    );
    res.redirect("/eva_enfermeria");
  } catch (error) {
    res.render("error", { mensaje: "Error al editar evaluación" });
  }
};

// Eliminar evaluación
exports.eliminarEvaluacion = async (req, res) => {
  try {
    await EvaluacionEnfermeria.destroy({ where: { id: req.params.id } });
    res.redirect("/eva_enfermeria");
  } catch (error) {
    res.render("error", { mensaje: "Error al eliminar evaluación" });
  }
};