const Paciente = require('../models/pacienteModel');

// Obtener todos los pacientes
exports.obtenerTodos = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll();
    res.render('paciente/index', { pacientes });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al cargar pacientes' });
  }
};

// Mostrar formulario de nuevo paciente (vista)
exports.mostrarFormularioNuevo = (req, res) => {
  res.render('paciente/nuevo');
};

// Insertar nuevo paciente (POST)
exports.insertar = async (req, res) => {
  try {
    await Paciente.create(req.body);
    res.redirect('/pacientes');
  } catch (error) {
    res.render('paciente/nuevo', { 
      error: 'Error al crear paciente: ' + error.message,
      datos: req.body // Mantener datos ingresados
    });
  }
};

// Mostrar formulario de edición (vista)
exports.mostrarFormularioEditar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    res.render('paciente/editar', { paciente });
  } catch (error) {
    res.redirect('/pacientes');
  }
};

// Actualizar paciente (POST)
exports.actualizar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    await paciente.update(req.body);
    res.redirect('/pacientes');
  } catch (error) {
    res.render('paciente/editar', { 
      error: 'Error al actualizar: ' + error.message,
      paciente: req.body 
    });
  }
};

// Eliminar paciente (POST)
exports.eliminar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    await paciente.destroy();
    res.redirect('/pacientes');
  } catch (error) {
    res.redirect('/pacientes');
  }
};