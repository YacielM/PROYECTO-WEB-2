const Paciente = require('../models/pacienteModel');

// Obtener todos los pacientes o buscar por DNI
exports.obtenerTodos = async (req, res) => {
  try {
    let pacientes;
    let busqueda = req.query.dni || '';
    if (busqueda) {
      pacientes = await Paciente.findAll({ where: { dni: busqueda } });
    } else {
      pacientes = await Paciente.findAll();
    }
    res.render('paciente/index', { pacientes, busqueda });
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
    let datos = req.body;
    if (!datos.antecedentes || datos.antecedentes.trim() === '') {
      datos.antecedentes = "Sin antecedentes médicos relevantes";
    }
    await Paciente.create(datos);
    res.redirect('/pacientes');
  } catch (error) {
    res.render('paciente/nuevo', { 
      error: 'Error al crear paciente: ' + error.message,
      datos: req.body
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
    let datos = req.body;
    if (!datos.antecedentes || datos.antecedentes.trim() === '') {
      datos.antecedentes = "Sin antecedentes médicos relevantes";
    }
    await paciente.update(datos);
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

// Ver antecedentes médicos (GET)
exports.verAntecedentes = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    res.render('paciente/antecedentes', { paciente });
  } catch (error) {
    res.redirect('/pacientes');
  }
};