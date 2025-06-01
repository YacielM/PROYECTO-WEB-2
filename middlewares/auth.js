exports.estaAutenticado = (req, res, next) => {
  if (!req.session || !req.session.usuarioId) {
    return res.redirect('/login');
  }
  next();
};

exports.tieneRol = (roles) => (req, res, next) => {
  if (!roles.includes(req.session.rol)) {
    return res.status(403).render('error', { mensaje: 'No tienes permiso para acceder a esta sección.' });
  }
  next();
};