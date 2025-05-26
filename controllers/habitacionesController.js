const Sala = require('../models/salaModel');
const Cama = require('../models/camaModel');
const sequelize = require("../config/db");

// Listar salas y camas
exports.listarHabitaciones = async (req, res) => {
  const salas = await Sala.findAll({ include: [Cama] });
  res.render('habitaciones/index', { salas });
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
  await Cama.create(req.body);
  res.redirect('/habitaciones');
};

// Eliminar cama
exports.eliminarCama = async (req, res) => {
  await Cama.destroy({ where: { id: req.params.id } });
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