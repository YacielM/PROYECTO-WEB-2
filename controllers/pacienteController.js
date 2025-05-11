const Paciente = require('../models/pacienteModel');

exports.obtenerTodos = async (req, res) => {
  try {
    const pacientes = await Paciente.obtenerTodos(); // Obtiene los pacientes desde el modelo
    console.log('Pacientes obtenidos:', pacientes); // Verifica si los datos se obtienen correctamente
    res.render('paciente/vista', { pacientes }); // Renderiza la vista con los datos
  } catch (error) {
    console.error('Error al obtener los pacientes:', error);
    res.status(500).send('Error al obtener los pacientes');
  }
};

// Controlador para mostrar el formulario de nuevo paciente
exports.mostrarFormularioNuevo = (req, res) => {
  res.render('paciente/nuevo'); // Renderiza el formulario
};

// Controlador para agregar un nuevo paciente
exports.insertar = async (req, res) => {
  try {
    await Paciente.insertar(req.body); // Inserta los datos enviados desde el formulario
    res.redirect('/pacientes'); // Redirige a la lista de pacientes
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el paciente');
  }
};

// Controlador para mostrar un paciente por ID
exports.obtenerPorId = async (req, res) => {
  try {
    const paciente = await Paciente.obtenerPorId(req.params.id);
    if (!paciente) {
      return res.status(404).send('Paciente no encontrado');
    }
    res.render('paciente/detalle', { paciente }); // Renderiza una vista con los detalles del paciente
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el paciente');
  }
};

// Controlador para actualizar un paciente
exports.actualizar = async (req, res) => {
  try {
    await Paciente.actualizar(req.params.id, req.body);
    res.redirect('/pacientes'); // Redirige a la lista de pacientes
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el paciente');
  }
};

// Controlador para eliminar un paciente
exports.eliminar = async (req, res) => {
  try {
    await Paciente.eliminar(req.params.id);
    res.redirect('/pacientes'); // Redirige a la lista de pacientes
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el paciente');
  }
};