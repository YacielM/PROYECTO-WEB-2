
const { Sala, Cama, Admision } = require('../models');
const sequelize = require("../config/db");

// Listar salas y camas
exports.listarHabitaciones = async (req, res) => {
  const salas = await Sala.findAll({
    include: [Cama],
    order: [
      ['ala', 'ASC'],
      ['numero_sala', 'ASC']
    ]
  });
  res.render('habitaciones/index', { salas, error: req.query.error });
};

// Formulario para nueva sala
exports.formularioNuevaSala = (req, res) => {
  res.render('habitaciones/nuevaSala');
};

// Crear sala
exports.crearSala = async (req, res) => {
  await Sala.create(req.body);
  res.redirect('/habitaciones');
};

// Eliminar sala
exports.eliminarSala = async (req, res) => {
  await Sala.destroy({ where: { id: req.params.id } });
  res.redirect('/habitaciones');
};

// Formulario para nueva cama
exports.formularioNuevaCama = async (req, res) => {
  const salas = await Sala.findAll();
  res.render('habitaciones/nuevaCama', { salas });
};

// Crear cama
exports.crearCama = async (req, res) => {
  const sala = await Sala.findByPk(req.body.sala_id, { include: [Cama] });
  if (sala.Camas.length >= sala.capacidad) {
    return res.redirect('/habitaciones?error=La capacidad de camas ya está llena en esta sala.');
  }
  await Cama.create(req.body);
  res.redirect('/habitaciones');
};

// Eliminar cama
exports.eliminarCama = async (req, res) => {
  const cama = await Cama.findByPk(req.params.id);
  if (!cama) return res.redirect('/habitaciones');
  // Verifica si hay una admisión activa en esa cama
  const admisionActiva = await Admision.findOne({ where: { cama_id: cama.id, estado: 'Activo' } });
  if (admisionActiva) {
    // Puedes usar flash o pasar un mensaje por query
    return res.redirect('/habitaciones?error=No se puede eliminar una cama ocupada por una admisión activa.');
  }
  await cama.destroy();
  res.redirect('/habitaciones');
};

// Cambiar estado de cama
exports.cambiarEstadoCama = async (req, res) => {
  const cama = await Cama.findByPk(req.params.id);
  if (cama) {
    cama.estado = req.body.estado;
    await cama.save();
  }
  res.redirect('/habitaciones');
};