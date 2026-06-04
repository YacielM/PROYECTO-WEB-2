// controllers/evaMedicasController.js

const { EvaluacionMedica, Admision, Paciente, Cama, Sala } = require('../models');
const sequelize = require("../config/db");

const DEFAULT_LIMIT = 10;

// Helper: compara fecha local (YYYY-MM-DD) con fecha almacenada (evita desplazamientos UTC)
const fechaEsIgualLocal = (fechaObj, qFechaStr) => {
  if (!fechaObj || !qFechaStr) return false;
  const parts = qFechaStr.split('-').map(Number);
  if (parts.length !== 3) return false;
  const [qy, qm, qd] = parts;
  const start = new Date(qy, qm - 1, qd, 0, 0, 0, 0);
  const end = new Date(qy, qm - 1, qd, 23, 59, 59, 999);

  let fa;
  if (typeof fechaObj === 'string') {
    const m = fechaObj.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      // si la string es solo YYYY-MM-DD, crear fecha local
      fa = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      if (fechaObj.length > 10) fa = new Date(fechaObj);
    } else {
      fa = new Date(fechaObj);
    }
  } else {
    fa = new Date(fechaObj);
  }
  if (isNaN(fa)) return false;
  return fa >= start && fa <= end;
};

// Listar evaluaciones con filtros por paciente y fecha, orden y paginación
exports.listarEvaluaciones = async (req, res) => {
  try {
    const qPaciente = (req.query.paciente || '').trim().toLowerCase();
    const qFecha = req.query.fecha || ''; // yyyy-mm-dd
    const ordenQuery = req.query.orden || 'fecha_evaluacion';
    const direccion = (req.query.direccion || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = parseInt(req.query.limite, 10) || DEFAULT_LIMIT;
    const offset = (pagina - 1) * limite;

    // Traer todas las evaluaciones con relaciones necesarias
    const evaluacionesRaw = await EvaluacionMedica.findAll({
      include: [
        {
          model: Admision,
          include: [
            { model: Paciente },
            { model: Cama, include: [Sala] }
          ]
        }
      ]
    });

    const lista = Array.isArray(evaluacionesRaw) ? evaluacionesRaw : [];

    // Filtrado en memoria por paciente (nombre/apellido) y por fecha (local)
    let filtradas = lista.filter(e => {
      // filtro paciente
      if (qPaciente) {
        const paciente = e.Admision && e.Admision.Paciente;
        const nombreCompleto = `${(paciente && paciente.nombre) || ''} ${(paciente && paciente.apellido) || ''}`.toLowerCase();
        if (!nombreCompleto.includes(qPaciente)) return false;
      }
      // filtro fecha (comparación local)
      if (qFecha) {
        if (!e.fecha_evaluacion) return false;
        if (!fechaEsIgualLocal(e.fecha_evaluacion, qFecha)) return false;
      }
      return true;
    });

    // Ordenamiento seguro (fecha asc/desc o por paciente)
    const camposPermitidos = ['fecha_evaluacion', 'paciente'];
    const campoOrden = camposPermitidos.includes(ordenQuery) ? ordenQuery : 'fecha_evaluacion';

    filtradas.sort((a, b) => {
      if (campoOrden === 'paciente') {
        const pa = a.Admision && a.Admision.Paciente ? `${a.Admision.Paciente.nombre} ${a.Admision.Paciente.apellido}`.toLowerCase() : '';
        const pb = b.Admision && b.Admision.Paciente ? `${b.Admision.Paciente.nombre} ${b.Admision.Paciente.apellido}`.toLowerCase() : '';
        if (pa < pb) return direccion === 'ASC' ? -1 : 1;
        if (pa > pb) return direccion === 'ASC' ? 1 : -1;
        return 0;
      }

      // fecha_evaluacion
      const da = a.fecha_evaluacion ? new Date(a.fecha_evaluacion) : new Date(0);
      const db = b.fecha_evaluacion ? new Date(b.fecha_evaluacion) : new Date(0);
      return direccion === 'ASC' ? da - db : db - da;
    });

    // Paginación
    const count = filtradas.length;
    const totalPaginas = Math.max(1, Math.ceil(count / limite));
    const pageItems = filtradas.slice(offset, offset + limite);

    // Formateo para la vista
    const evaluaciones = pageItems.map(ev => ({
      id: ev.id,
      fecha_evaluacion: ev.fecha_evaluacion ? new Date(ev.fecha_evaluacion) : null,
      pacienteNombre: ev.Admision && ev.Admision.Paciente ? `${ev.Admision.Paciente.nombre} ${ev.Admision.Paciente.apellido}` : 'Sin paciente',
      paciente_id: ev.Admision && ev.Admision.Paciente ? ev.Admision.Paciente.id : null,
      cama: ev.Admision && ev.Admision.Cama && ev.Admision.Cama.Sala ? `Sala ${ev.Admision.Cama.Sala.numero_sala} - Cama ${ev.Admision.Cama.numero_cama}` : 'Sin cama',
      diagnostico: ev.diagnostico || '',
      tratamiento: ev.tratamiento || ''
    }));

    res.render('eva_medicas/index', {
      evaluaciones,
      pagina,
      totalPaginas,
      limite,
      orden: ordenQuery,
      direccion,
      pacienteFiltro: req.query.paciente || '',
      fechaFiltro: req.query.fecha || '',
      count
    });
  } catch (error) {
    console.error('Error listarEvaluaciones:', error);
    res.render('error', { mensaje: 'Error al cargar evaluaciones médicas' });
  }
};

// El resto de funciones (formularioNuevaEvaluacion, crearEvaluacion, detalleEvaluacion, formularioEditarEvaluacion, editarEvaluacion, eliminarEvaluacion)
// se mantienen tal como las tenías.


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

// Función para mostrar el detalle de una evaluación médica
exports.detalleEvaluacion = async (req, res) => {
  try {
    const evaluacion = await EvaluacionMedica.findByPk(req.params.id, {
      include: [
        {
          model: Admision,
          include: [
            { model: Paciente },
            { model: Cama, include: [Sala] }
          ]
        }
      ]
    });
    if (!evaluacion) {
      return res.render("error", { mensaje: "Evaluación médica no encontrada" });
    }
    res.render("eva_medicas/detalle", { evaluacion });
  } catch (error) {
    console.error(error);
    res.render("error", { mensaje: "Error al cargar detalle de evaluación médica" });
  }
};

// Formulario para editar evaluación médica
exports.formularioEditarEvaluacion = async (req, res) => {
  try {
    const evaluacion = await EvaluacionMedica.findByPk(req.params.id, {
      include: [
        {
          model: Admision,
          include: [{ model: Paciente }]
        }
      ]
    });
    if (!evaluacion) {
      return res.render("error", { mensaje: "Evaluación médica no encontrada" });
    }
    res.render("eva_medicas/editar", { evaluacion });
  } catch (error) {
    console.error(error);
    res.render("error", { mensaje: "Error al cargar formulario de edición" });
  }
};

// Procesar actualización de evaluación médica (POST)
exports.editarEvaluacion = async (req, res) => {
  try {
    const { diagnostico, tratamiento, seguimiento } = req.body;
    await EvaluacionMedica.update(
      { diagnostico, tratamiento, seguimiento },
      { where: { id: req.params.id } }
    );
    res.redirect(`/eva_medicas/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.render("error", { mensaje: "Error al editar evaluación médica" });
  }
};

// Eliminar evaluación
exports.eliminarEvaluacion = async (req, res) => {
  try {
    await EvaluacionMedica.destroy({ where: { id: req.params.id } });
    res.redirect("/eva_medicas");
  } catch (error) {
    res.render("error", { mensaje: "Error al eliminar evaluación" });
  }
};