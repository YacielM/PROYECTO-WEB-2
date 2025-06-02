const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');

exports.listarPersonal = async (req, res) => {
  const personal = await Usuario.findAll();
  res.render('personal/index', { personal });
};

exports.formularioNuevoPersonal = (req, res) => {
  res.render('personal/nuevo');
};

exports.crearPersonal = async (req, res) => {
  try {
    await Usuario.create({
      usuario: req.body.usuario,
      contraseña: req.body.contraseña,
      rol: req.body.rol,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email,
      telefono: req.body.telefono
    });
    res.redirect('/personal');
  } catch (error) {
    res.render('personal/nuevo', { error: error.message });
  }
};

exports.formularioEditarPersonal = async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  res.render('personal/editar', { usuario });
};

exports.actualizarPersonal = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    await usuario.update({
      usuario: req.body.usuario,
      rol: req.body.rol,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email,
      telefono: req.body.telefono
    });
    res.redirect('/personal');
  } catch (error) {
    res.render('personal/editar', { error: error.message, usuario });
  }
};

exports.eliminarPersonal = async (req, res) => {
  await Usuario.destroy({ where: { id: req.params.id } });
  res.redirect('/personal');
};