// controllers/admisionController.js
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const Admision = require('../models/admisionModel');
const Paciente = require('../models/pacienteModel');
const Cama = require('../models/camaModel');
const Sala = require('../models/salaModel');

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
  const t = await sequelize.transaction(); //  Usa la instancia importada
  try {
    const { paciente_id, cama_id, tipo_admision, motivo } = req.body;

    // Validación
    if (!paciente_id || !cama_id || !tipo_admision) {
      throw new Error('Faltan campos obligatorios');
    }

    // Crear admisión (con transacción)
    await Admision.create({
      paciente_id,
      cama_id,
      tipo_admision,
      motivo
    }, { transaction: t }); //  Pasa la transacción

    // Actualizar estado de la cama
    await Cama.update(
      { estado: 'Ocupada' },
      { 
        where: { id: cama_id }, 
        transaction: t //  Pasa la transacción
      }
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
    const [admision, camas] = await Promise.all([
      Admision.findByPk(req.params.id, {
        include: [Paciente, { model: Cama, include: [Sala] }]
      }),
      Cama.findAll({ 
        where: { estado: 'Disponible' },
        include: [Sala]
      })
    ]);

    if (!admision) throw new Error('Admisión no encontrada');
    res.render('admisiones/editar', { admision, camas });
  } catch (error) {
    res.render('error', { mensaje: error.message });
  }
};

// Actualizar admisión (con transacción)
exports.actualizarAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction });
    if (!admision) throw new Error('Admisión no existe');

    // Liberar cama anterior
    await Cama.update(
      { estado: 'Disponible' },
      { where: { id: admision.cama_id }, transaction }
    );

    // Actualizar admisión
    await admision.update({
      cama_id: req.body.cama_id,
      tipo_admision: req.body.tipo_admision,
      estado: req.body.estado,
      motivo: req.body.motivo
    }, { transaction });

    // Ocupar nueva cama
    await Cama.update(
      { estado: 'Ocupada' },
      { where: { id: req.body.cama_id }, transaction }
    );

    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    const camas = await Cama.findAll({ include: [Sala] });
    res.render('admisiones/editar', {
      error: error.message,
      admision: req.body,
      camas
    });
  }
};

// Eliminar admisión (con transacción)
exports.eliminarAdmision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const admision = await Admision.findByPk(req.params.id, { transaction });
    if (!admision) throw new Error('Admisión no existe');

    // Liberar cama
    await Cama.update(
      { estado: 'Disponible' },
      { where: { id: admision.cama_id }, transaction }
    );

    await admision.destroy({ transaction });
    await t.commit();
    res.redirect('/admisiones');
  } catch (error) {
    await t.rollback();
    res.render('error', { mensaje: 'Error al eliminar' });
  }
};