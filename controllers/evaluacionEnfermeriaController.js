// controllers/evaluacionEnfermeriaController.js

const { Paciente, Sala, Cama, Admision, EvaluacionEnfermeria } = require('../models');
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
    const evaluacionesRaw = await EvaluacionEnfermeria.findAll({
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

    // Formateo para la vista (incluye ID y paciente_id)
    const evaluaciones = pageItems.map(ev => ({
      id: ev.id,
      fecha_evaluacion: ev.fecha_evaluacion ? new Date(ev.fecha_evaluacion) : null,
      pacienteNombre: ev.Admision && ev.Admision.Paciente ? `${ev.Admision.Paciente.nombre} ${ev.Admision.Paciente.apellido}` : 'Sin paciente',
      paciente_id: ev.Admision && ev.Admision.Paciente ? ev.Admision.Paciente.id : null,
      cama: ev.Admision && ev.Admision.Cama && ev.Admision.Cama.Sala ? `Sala ${ev.Admision.Cama.Sala.numero_sala} - Cama ${ev.Admision.Cama.numero_cama}` : 'Sin cama',
      signos_vitales: ev.signos_vitales || '',
      sintomas: ev.sintomas || '',
      plan_cuidado: ev.plan_cuidado || ''
    }));

    res.render('eva_enfermeria/index', {
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
    console.error('Error listarEvaluaciones enfermeria:', error);
    res.render('error', { mensaje: 'Error al cargar evaluaciones' });
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