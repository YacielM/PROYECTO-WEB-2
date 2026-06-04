// controllers/admisionController.js

const sequelize = require('../config/db');
const { Admision, Paciente, Cama, Sala, Turno } = require('../models');

const DEFAULT_LIMIT = 10;

// Listar admisiones con filtros, orden y paginación
exports.listarAdmisiones = async (req, res) => {
  try {
    const qPaciente = (req.query.paciente || '').trim().toLowerCase();
    const qFecha = req.query.fecha || ''; // yyyy-mm-dd desde input date
    const ordenQuery = req.query.orden || 'fecha_admision';
    const direccion = (req.query.direccion || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = parseInt(req.query.limite, 10) || DEFAULT_LIMIT;
    const offset = (pagina - 1) * limite;

    // Traer admisiones con relaciones
    const admisionesRaw = await Admision.findAll({
      include: [
        { model: Paciente, attributes: ['id', 'nombre', 'apellido', 'dni'] },
        { model: Cama, include: [Sala], attributes: ['numero_cama'] }
      ]
    });

    const lista = Array.isArray(admisionesRaw) ? admisionesRaw : [];

    // Helper: compara fecha local (YYYY-MM-DD) o usa rango local (inicio/fin del día)
    const fechaEsIgualLocal = (fechaObj, qFechaStr) => {
      if (!fechaObj || !qFechaStr) return false;
      // Construir start/end del día en zona local a partir de qFechaStr
      const parts = qFechaStr.split('-').map(Number);
      if (parts.length !== 3) return false;
      const [qy, qm, qd] = parts;
      const start = new Date(qy, qm - 1, qd, 0, 0, 0, 0); // inicio del día local
      const end = new Date(qy, qm - 1, qd, 23, 59, 59, 999); // fin del día local

      // Normalizar fechaObj a Date
      let fa;
      if (typeof fechaObj === 'string') {
        // Si viene como 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:MM:SS', intentar parseo local
        const m = fechaObj.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) {
          fa = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
          // Si la string incluye hora, fallback a Date(string)
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

    // Filtrado por paciente y por fecha (comparando localmente)
    let filtradas = lista.filter(a => {
      if (qPaciente) {
        const nombreCompleto = `${(a.Paciente && a.Paciente.nombre) || ''} ${(a.Paciente && a.Paciente.apellido) || ''}`.toLowerCase();
        if (!nombreCompleto.includes(qPaciente)) return false;
      }
      if (qFecha) {
        if (!a.fecha_admision) return false;
        if (!fechaEsIgualLocal(a.fecha_admision, qFecha)) return false;
      }
      return true;
    });

    // Ordenamiento seguro: permitimos campos concretos (incluye tipo_admision)
    const camposPermitidos = ['fecha_admision', 'tipo_admision', 'estado', 'paciente'];
    const campoOrden = camposPermitidos.includes(ordenQuery) ? ordenQuery : 'fecha_admision';

    filtradas.sort((x, y) => {
      if (campoOrden === 'paciente') {
        const ax = `${(x.Paciente && x.Paciente.nombre) || ''} ${(x.Paciente && x.Paciente.apellido) || ''}`.toLowerCase();
        const ay = `${(y.Paciente && y.Paciente.nombre) || ''} ${(y.Paciente && y.Paciente.apellido) || ''}`.toLowerCase();
        if (ax < ay) return direccion === 'ASC' ? -1 : 1;
        if (ax > ay) return direccion === 'ASC' ? 1 : -1;
        return 0;
      }

      if (campoOrden === 'fecha_admision') {
        const da = x.fecha_admision ? new Date(x.fecha_admision) : new Date(0);
        const db = y.fecha_admision ? new Date(y.fecha_admision) : new Date(0);
        return direccion === 'ASC' ? da - db : db - da;
      }

      // tipo_admision o estado (strings)
      const va = ((x[campoOrden] || '')).toString().toLowerCase();
      const vb = ((y[campoOrden] || '')).toString().toLowerCase();
      if (va < vb) return direccion === 'ASC' ? -1 : 1;
      if (va > vb) return direccion === 'ASC' ? 1 : -1;
      return 0;
    });

    // Paginación
    const count = filtradas.length;
    const totalPaginas = Math.max(1, Math.ceil(count / limite));
    const pageItems = filtradas.slice(offset, offset + limite);

    // Formateo para la vista
    const admisiones = pageItems.map(adm => ({
      id: adm.id,
      paciente: adm.Paciente ? `${adm.Paciente.nombre} ${adm.Paciente.apellido}` : 'Sin paciente',
      paciente_id: adm.Paciente ? adm.Paciente.id : null,
      dni: adm.Paciente ? adm.Paciente.dni : '',
      fecha_admision: adm.fecha_admision ? new Date(adm.fecha_admision).toLocaleDateString('es-AR') : '',
      tipo_admision: adm.tipo_admision || '',
      estado: adm.estado || '',
      cama: adm.Cama && adm.Cama.Sala ? `Cama ${adm.Cama.numero_cama} - Sala ${adm.Cama.Sala.numero_sala}` : (adm.Cama ? `Cama ${adm.Cama.numero_cama}` : '')
    }));

    res.render('admisiones/index', {
      admisiones,
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
    console.error('Error listarAdmisiones:', error);
    res.status(500).render('error', { mensaje: 'Error al cargar el listado' });
  }
};



// Formulario para nueva admisión
exports.formularioNuevaAdmision = async (req, res) => {
  try {
    const [pacientes, camas] = await Promise.all([
      Paciente.findAll(),
      Cama.findAll({
        where: { estado: 'Disponible' },
        include: [Sala]
      })
    ]);

    res.render('admisiones/nuevo', { pacientes, camas });
  } catch (error) {
    res.render('error', { mensaje: 'Error al cargar recursos' });
  }
};

// Crear nueva admisión (con transacción)
exports.crearAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { paciente_id, cama_id, tipo_admision, motivo } = req.body;

    // Validación básica
    if (!paciente_id || !cama_id || !tipo_admision) {
      throw new Error('Faltan campos obligatorios');
    }

    // Validar que el paciente no tenga una admisión activa
    const admisionActiva = await Admision.findOne({
      where: {
        paciente_id,
        estado: 'Activo'
      }
    });
    if (admisionActiva) {
      throw new Error('Este paciente ya tiene una admisión activa.');
    }

    // 1. Obtener la cama y la sala
    const cama = await Cama.findByPk(cama_id, { include: [Sala] });
    if (!cama) throw new Error('Cama no encontrada');
    const sala = cama.Sala;

    // 2. Si la sala tiene capacidad 2, buscar la otra cama ocupada
    if (sala.capacidad === 2) {
      // Traer todas las camas ocupadas de la sala
      const camasOcupadas = await Cama.findAll({
        where: {
          sala_id: sala.id,
          estado: 'Ocupada'
        }
      });

      // Buscar la otra cama ocupada (que no sea la seleccionada)
      const otraCamaOcupada = camasOcupadas.find(c => c.id != cama.id);

      if (otraCamaOcupada) {
        // Buscar el género del paciente que ocupa la otra cama
        const admisionOcupante = await Admision.findOne({
          where: {
            cama_id: otraCamaOcupada.id,
            estado: 'Activo'
          }
        });
        if (admisionOcupante) {
          const pacienteOcupante = await Paciente.findByPk(admisionOcupante.paciente_id);
          const pacienteNuevo = await Paciente.findByPk(paciente_id);
          if (pacienteOcupante && pacienteNuevo && pacienteOcupante.genero !== pacienteNuevo.genero) {
            throw new Error('No se puede asignar esta cama: la otra cama está ocupada por un paciente de género diferente.');
          }
        }
      }
    }

    // Crear admisión (con transacción)
    await Admision.create({
      paciente_id,
      cama_id,
      tipo_admision,
      motivo
    }, { transaction: t });

    // Actualizar estado de la cama
    await Cama.update(
      { estado: 'Ocupada' },
      { where: { id: cama_id }, transaction: t }
    );

    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    const [pacientes, camas] = await Promise.all([
      Paciente.findAll(),
      Cama.findAll({ include: [Sala] })
    ]);
    res.render('admisiones/nuevo', {
      error: error.message,
      pacientes,
      camas,
      datos: req.body
    });
  }
};

// Formulario de edición
exports.formularioEditarAdmision = async (req, res) => {
  try {
    const admision = await Admision.findByPk(req.params.id, {
      include: [Paciente, { model: Cama, include: [Sala] }]
    });

    if (!admision) throw new Error('Admisión no encontrada');

    // Traer camas disponibles + la cama actual de la admisión (sin Op)
  const todasCamas = await Cama.findAll({ include: [Sala] });
  const camas = todasCamas.filter(c =>
  c.estado === 'Disponible' || c.id === admision.cama_id
  );

    res.render('admisiones/editar', { admision, camas });
  } catch (error) {
    res.render('error', { mensaje: error.message });
  }
};

// Actualizar admisión (con transacción)
exports.actualizarAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction: t, include: [Paciente, { model: Cama, include: [Sala] }] });
    if (!admision) throw new Error('Admisión no existe');

    await Cama.update(
      { estado: 'En Limpieza' },
      { where: { id: admision.cama_id }, transaction: t }
    );

    // Actualizar admisión
    await admision.update({
      cama_id: req.body.cama_id,
      tipo_admision: req.body.tipo_admision,
      motivo: req.body.motivo
    }, { transaction: t });

    // Ocupar nueva cama
    await Cama.update(
      { estado: 'Ocupada' },
      { where: { id: req.body.cama_id }, transaction: t }
    );

    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    // Vuelve a buscar la admisión para mostrar el nombre del paciente
    const admision = await Admision.findByPk(req.params.id, { include: [Paciente, { model: Cama, include: [Sala] }] });
    const camas = await Cama.findAll({ include: [Sala] });
    res.render('admisiones/editar', {
      error: error.message,
      admision,
      camas
    });
  }
};

// Eliminar admisión (con transacción)
exports.eliminarAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction: t });
    if (!admision) throw new Error('Admisión no existe');

    // Liberar cama
    await Cama.update(
      { estado: 'Disponible' },
      { where: { id: admision.cama_id }, transaction: t }
    );

    await admision.destroy({ transaction: t });
    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    res.render('error', { mensaje: 'Error al eliminar' });
  }
};

// Volver a activar una admisión dada de alta
exports.reactivarAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction: t });
    if (!admision) throw new Error('Admisión no encontrada');
    await admision.update({ estado: 'Activo' }, { transaction: t });
    // Cambiar estado de la cama a "Ocupada"
    await Cama.update(
      { estado: 'Ocupada' },
      { where: { id: admision.cama_id }, transaction: t }
    );
    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    res.render('error', { mensaje: error.message });
  }
};

// ALTA
exports.formularioAlta = async (req, res) => {
  const admision = await Admision.findByPk(req.params.id, { include: [Paciente] });
  if (!admision) return res.render('error', { mensaje: 'Admisión no encontrada' });
  res.render('admisiones/alta', { admision });
};

exports.darAlta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction: t });
    if (!admision) throw new Error('Admisión no encontrada');
    await admision.update({
      estado: 'Dados de Alta',
      motivo_alta: req.body.motivo_alta ? req.body.motivo_alta : admision.motivo_alta
    }, { transaction: t });
    // Cambiar estado de la cama a "En Limpieza"
    await Cama.update(
      { estado: 'En Limpieza' },
      { where: { id: admision.cama_id }, transaction: t }
    );
    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    res.render('error', { mensaje: error.message });
  }
};

// Mostrar formulario de admisión con paciente ya seleccionado
exports.formularioDesdeTurno = async (req, res) => {
  const turno = await Turno.findByPk(req.params.turnoId, { include: [Paciente] });
  const camas = await Cama.findAll({
  where: { estado: 'Disponible' },
  include: [Sala]
});
  res.render('admisiones/nuevo_desde_turno', { paciente: turno.Paciente, camas, turno });
};

// Crear admisión desde turno
exports.crearDesdeTurno = async (req, res) => {
  try {
    // Validar que el paciente no tenga una admisión activa
    const admisionActiva = await Admision.findOne({
      where: {
        paciente_id: req.body.paciente_id,
        estado: 'Activo'
      }
    });
    if (admisionActiva) {
      throw new Error('Este paciente ya tiene una admisión activa.');
    }

    await Admision.create({
      paciente_id: req.body.paciente_id,
      cama_id: req.body.cama_id,
      tipo_admision: 'Programada',
      motivo: req.body.motivo,
      estado: 'Activo'
    });
    await Cama.update({ estado: 'Ocupada' }, { where: { id: req.body.cama_id } });

    // Cambiar estado del turno a "internacion_pendiente"
    await Turno.update(
      { estado: 'internacion_pendiente' },
      { where: { id: req.params.turnoId } }
    );

    res.redirect('/admisiones');
  } catch (error) {
    const turno = await Turno.findByPk(req.params.turnoId, { include: [Paciente] });
    const camas = await Cama.findAll({
      where: { estado: 'Disponible' },
      include: [Sala]
    });
    res.render('admisiones/nuevo_desde_turno', {
      error: error.message,
      paciente: turno ? turno.Paciente : null,
      camas,
      turno
    });
  }
};