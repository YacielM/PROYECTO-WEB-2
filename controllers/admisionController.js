// controllers/admisionController.js
const sequelize = require('../config/db');
const { Admision, Paciente, Cama, Sala, Turno } = require('../models');

const DEFAULT_LIMIT = 10;

/**
 * Helper para validar la restricción de género en salas compartidas (capacidad >= 2)
 */
const validarRestriccionGenero = async (camaId, pacienteId, admisionIdActual = null, transaction = null) => {
  const cama = await Cama.findByPk(camaId, { include: [Sala], transaction });
  if (!cama) throw new Error('Cama no encontrada');

  const sala = cama.Sala;
  if (!sala) throw new Error('Sala no encontrada');

  const pacienteNuevo = await Paciente.findByPk(pacienteId, { transaction });
  if (!pacienteNuevo) throw new Error('Paciente no encontrado');

  // Si la sala aloja a 2 o más pacientes, aplicamos la restricción
  if (sala.capacidad >= 2) {
    const admisionesActivas = await Admision.findAll({
      where: { estado: 'Activo' },
      include: [
        { model: Paciente, attributes: ['id', 'nombre', 'apellido', 'genero'] },
        { 
          model: Cama, 
          where: { sala_id: sala.id },
          attributes: ['id', 'numero_cama', 'sala_id'] 
        }
      ],
      transaction
    });

    // Excluir la admisión actual si estamos editando
    const ocupantes = admisionesActivas.filter(adm => 
      !admisionIdActual || adm.id !== parseInt(admisionIdActual, 10)
    );

    for (const adm of ocupantes) {
      if (adm.Paciente && adm.Paciente.genero && pacienteNuevo.genero) {
        const genOcupante = String(adm.Paciente.genero).trim().toLowerCase();
        const genNuevo = String(pacienteNuevo.genero).trim().toLowerCase();

        if (genOcupante !== genNuevo) {
          throw new Error(
            `No se puede asignar la Cama ${cama.numero_cama} (Sala ${sala.numero_sala}): ` +
            `la sala está ocupada por ${adm.Paciente.nombre} ${adm.Paciente.apellido} de género diferente (${adm.Paciente.genero}).`
          );
        }
      }
    }
  }

  return { cama, sala, pacienteNuevo };
};

// Listar admisiones con filtros, orden y paginación
exports.listarAdmisiones = async (req, res) => {
  try {
    const qPaciente = (req.query.paciente || '').trim().toLowerCase();
    const qFecha = req.query.fecha || '';
    const ordenQuery = req.query.orden || 'fecha_admision';
    const direccion = (req.query.direccion || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = parseInt(req.query.limite, 10) || DEFAULT_LIMIT;
    const offset = (pagina - 1) * limite;

    const admisionesRaw = await Admision.findAll({
      include: [
        { model: Paciente, attributes: ['id', 'nombre', 'apellido', 'dni', 'genero'] },
        { model: Cama, include: [Sala], attributes: ['numero_cama'] }
      ]
    });

    const lista = Array.isArray(admisionesRaw) ? admisionesRaw : [];

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

      const va = ((x[campoOrden] || '')).toString().toLowerCase();
      const vb = ((y[campoOrden] || '')).toString().toLowerCase();
      if (va < vb) return direccion === 'ASC' ? -1 : 1;
      if (va > vb) return direccion === 'ASC' ? 1 : -1;
      return 0;
    });

    const count = filtradas.length;
    const totalPaginas = Math.max(1, Math.ceil(count / limite));
    const pageItems = filtradas.slice(offset, offset + limite);

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
      Paciente.findAll({ order: [['apellido', 'ASC']] }),
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

    if (!paciente_id || !cama_id || !tipo_admision) {
      throw new Error('Faltan campos obligatorios');
    }

    // Validar que el paciente no tenga una admisión activa
    const admisionActiva = await Admision.findOne({
      where: { paciente_id, estado: 'Activo' },
      transaction: t
    });
    if (admisionActiva) {
      throw new Error('Este paciente ya tiene una admisión activa.');
    }

    // Validar restricción de género en salas compartidas
    await validarRestriccionGenero(cama_id, paciente_id, null, t);

    // Crear admisión
    await Admision.create({
      paciente_id,
      cama_id,
      tipo_admision,
      motivo,
      estado: 'Activo'
    }, { transaction: t });

    // Ocupar cama
    await Cama.update(
      { estado: 'Ocupada' },
      { where: { id: cama_id }, transaction: t }
    );

    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    const [pacientes, camas] = await Promise.all([
      Paciente.findAll({ order: [['apellido', 'ASC']] }),
      Cama.findAll({ where: { estado: 'Disponible' }, include: [Sala] })
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
    const admision = await Admision.findByPk(req.params.id, { transaction: t, include: [Paciente] });
    if (!admision) throw new Error('Admisión no existe');

    const nuevaCamaId = req.body.cama_id;

    // Validar restricción de género para la nueva cama
    await validarRestriccionGenero(nuevaCamaId, admision.paciente_id, admision.id, t);

    if (admision.cama_id !== parseInt(nuevaCamaId, 10)) {
      // Liberar/limpiar la cama anterior
      await Cama.update(
        { estado: 'En Limpieza' },
        { where: { id: admision.cama_id }, transaction: t }
      );
      // Ocupar la nueva cama
      await Cama.update(
        { estado: 'Ocupada' },
        { where: { id: nuevaCamaId }, transaction: t }
      );
    }

    // Actualizar admisión
    await admision.update({
      cama_id: nuevaCamaId,
      tipo_admision: req.body.tipo_admision,
      motivo: req.body.motivo
    }, { transaction: t });

    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    const admision = await Admision.findByPk(req.params.id, { include: [Paciente, { model: Cama, include: [Sala] }] });
    const todasCamas = await Cama.findAll({ include: [Sala] });
    const camas = todasCamas.filter(c => c.estado === 'Disponible' || (admision && c.id === admision.cama_id));
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
    res.render('error', { mensaje: 'Error al eliminar la admisión' });
  }
};

// Volver a activar una admisión dada de alta
exports.reactivarAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction: t });
    if (!admision) throw new Error('Admisión no encontrada');

    // Verificar género antes de reactivar
    await validarRestriccionGenero(admision.cama_id, admision.paciente_id, admision.id, t);

    await admision.update({ estado: 'Activo' }, { transaction: t });
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

// Mostrar formulario de admisión con paciente ya seleccionado desde turno
exports.formularioDesdeTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.turnoId, { include: [Paciente] });
    const camas = await Cama.findAll({
      where: { estado: 'Disponible' },
      include: [Sala]
    });
    res.render('admisiones/nuevo_desde_turno', { paciente: turno ? turno.Paciente : null, camas, turno });
  } catch (error) {
    res.render('error', { mensaje: 'Error al abrir formulario desde turno' });
  }
};

// Crear admisión desde turno (con transacción y validación de género)
exports.crearDesdeTurno = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { paciente_id, cama_id, motivo } = req.body;
    const turnoId = req.params.turnoId;

    if (!paciente_id || !cama_id) {
      throw new Error('Debe seleccionar paciente y cama.');
    }

    // Validar si tiene admisión activa
    const admisionActiva = await Admision.findOne({
      where: { paciente_id, estado: 'Activo' },
      transaction: t
    });
    if (admisionActiva) {
      throw new Error('Este paciente ya tiene una admisión activa.');
    }

    // Validar restricción de género en la sala
    await validarRestriccionGenero(cama_id, paciente_id, null, t);

    // Crear admisión
    await Admision.create({
      paciente_id,
      cama_id,
      tipo_admision: 'Programada',
      motivo: motivo || 'Derivado desde turno',
      estado: 'Activo'
    }, { transaction: t });

    // Marcar cama como Ocupada
    await Cama.update({ estado: 'Ocupada' }, { where: { id: cama_id }, transaction: t });

    // Actualizar estado del turno
    await Turno.update(
      { estado: 'internacion_pendiente' },
      { where: { id: turnoId }, transaction: t }
    );

    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
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