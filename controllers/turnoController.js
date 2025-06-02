const { Usuario, Paciente, Turno } = require('../models');

exports.listarTurnos = async (req, res) => {
  let where = {};
  if (req.session.rol === 'medico') {
    where.medico_id = req.session.usuarioId;
  }
  const turnos = await Turno.findAll({
    where,
    include: [
      { model: Paciente, attributes: ['nombre', 'apellido'] },
      { model: Usuario, as: 'medico', attributes: ['nombre', 'apellido'] }
    ],
    order: [['fecha', 'ASC']]
  });

  // Agrega la propiedad tieneAdmisionActiva a cada paciente
  turnos.forEach(t => {
    t.Paciente.tieneAdmisionActiva = t.Paciente.Admisions && t.Paciente.Admisions.length > 0;
  });

  res.render('turnos/index', { turnos });
};

exports.formularioNuevoTurno = async (req, res) => {
  const pacientes = await Paciente.findAll();
  const medicos = await Usuario.findAll({ where: { rol: 'medico' } });
  res.render('turnos/nuevo', { pacientes, medicos });
};

exports.crearTurno = async (req, res) => {
  try {
    await Turno.create({
      fecha: req.body.fecha,
      motivo: req.body.motivo,
      paciente_id: req.body.paciente_id,
      medico_id: req.body.medico_id
    });
    res.redirect('/turnos');
  } catch (error) {
    res.render('turnos/nuevo', { error: error.message });
  }
};

exports.formularioEditarTurno = async (req, res) => {
  const turno = await Turno.findByPk(req.params.id);
  const pacientes = await Paciente.findAll();
  const medicos = await Usuario.findAll({ where: { rol: 'medico' } });
  res.render('turnos/editar', { turno, pacientes, medicos });
};

exports.actualizarTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    await turno.update({
      fecha: req.body.fecha,
      motivo: req.body.motivo,
      paciente_id: req.body.paciente_id,
      medico_id: req.body.medico_id
    });
    res.redirect('/turnos');
  } catch (error) {
    res.render('turnos/editar', { error: error.message, turno });
  }
};

exports.eliminarTurno = async (req, res) => {
  await Turno.destroy({ where: { id: req.params.id } });
  res.redirect('/turnos');
};

exports.cambiarEstado = async (req, res) => {
  const turno = await Turno.findByPk(req.params.id);
  await turno.update({ estado: req.body.estado });
  res.redirect('/turnos');
};