// controllers/admisionController.js

const sequelize = require('../config/db');
const { Admision, Paciente, Cama, Sala, Turno } = require('../models');


// Listar todas las admisiones con datos relacionados
exports.listarAdmisiones = async (req, res) => {
  try {
    const admisiones = await Admision.findAll({
      include: [
        { 
          model: Paciente,
          attributes: ['nombre', 'apellido', 'dni']
        },
        { 
          model: Cama,
          include: [Sala],
          attributes: ['numero_cama']
        }
      ],
      order: [['fecha_admision', 'DESC']]
    });

    res.render('admisiones/index', {
      admisiones: admisiones.map(admision => ({
        id: admision.id,
        paciente: `${admision.Paciente.nombre} ${admision.Paciente.apellido}`,
        dni: admision.Paciente.dni,
        fecha_admision: admision.fecha_admision.toLocaleDateString('es-AR'),
        tipo_admision: admision.tipo_admision,
        estado: admision.estado,
        cama: `Cama ${admision.Cama.numero_cama} - Sala ${admision.Cama.Sala.numero_sala}`
      }))
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
      // Buscar otra cama ocupada en la misma sala
      const otraCamaOcupada = await Cama.findOne({
        where: {
          sala_id: sala.id,
          id: { [Op.ne]: cama.id }, // que no sea la misma cama
          estado: 'Ocupada'
        }
      });

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