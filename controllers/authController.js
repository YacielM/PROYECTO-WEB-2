const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');

exports.formLogin = (req, res) => {
  res.render('autenticacion/login', { error: null });
};

exports.login = async (req, res) => {
  const { usuario, contraseña } = req.body;
  const user = await Usuario.findOne({ where: { usuario } });
  if (!user || !await bcrypt.compare(contraseña, user.contraseña)) {
    return res.render('autenticacion/login', { error: 'Usuario o contraseña incorrectos' });
  }
  req.session.usuarioId = user.id;
  req.session.rol = user.rol;
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};