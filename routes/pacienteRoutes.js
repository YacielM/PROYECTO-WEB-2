const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

// Rutas para pacientes
router.get('/', pacienteController.obtenerTodos); // Lista de pacientes
router.get('/nuevo', pacienteController.mostrarFormularioNuevo); // Formulario para agregar un nuevo paciente
router.post('/nuevo', pacienteController.insertar); // Procesar nuevo paciente
router.get('/editar/:id', pacienteController.mostrarFormularioEditar); // Formulario para editar un paciente
router.post('/editar/:id', pacienteController.actualizar); // Procesar edición de paciente
router.post('/eliminar/:id', pacienteController.eliminar); // Eliminar un paciente

module.exports = router;