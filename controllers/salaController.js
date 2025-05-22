// controllers/salaController.js
const Sala = require("../models/salaModel");
const sequelize = require("../config/db");

exports.listarSalas = async (req, res) => {
  try {
    const salas = await Sala.findAll({ include: [Cama] });
    res.render("habitaciones/index", { salas });
  } catch (error) {
    res.render("error", { mensaje: "Error al cargar salas" });
  }
};

// Funciones para crear, editar y eliminar salas...