const { Admision, Paciente, Cama } = require('../models');

exports.formularioEmergencia = async (req, res) => {
  res.render('emergencia/formulario', { activePage: 'emergencia' });
};

exports.registrarEmergencia = async (req, res) => {
  try {
    // Buscar una cama disponible (sin importar género ni sala)
    const cama = await Cama.findOne({ where: { estado: 'Disponible' } });
    if (!cama) throw new Error('No hay camas disponibles para emergencia.');

    // Crear paciente rápido (puedes pedir solo nombre y apellido si quieres)
const timestamp = Date.now().toString();
const dniEmergencia = 'EMG' + timestamp.slice(-6); // Máximo 9 caracteres

const paciente = await Paciente.create({
  nombre: req.body.nombre || 'Emergencia',
  apellido: req.body.apellido || 'Sin datos',
  dni: req.body.dni || dniEmergencia,
  genero: req.body.genero || 'M',
  telefono: req.body.telefono || null
});

    // Crear admisión de emergencia
    await Admision.create({
      paciente_id: paciente.id,
      cama_id: cama.id,
      tipo_admision: 'Emergencia',
      motivo: req.body.motivo,
      estado: 'Activo'
    });

    // Marcar cama como ocupada
    await Cama.update({ estado: 'Ocupada' }, { where: { id: cama.id } });

    res.render('emergencia/exito', { paciente, cama, activePage: 'emergencia' });
  } catch (error) {
    res.render('emergencia/formulario', { error: error.message, activePage: 'emergencia' });
  }
};