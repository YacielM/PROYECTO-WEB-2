const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

// Rutas para pacientes
router.get('/', pacienteController.obtenerTodos);
router.get('/nuevo', pacienteController.mostrarFormularioNuevo);
router.post('/nuevo', pacienteController.insertar);
router.get('/:id', pacienteController.obtenerPorId);
router.post('/editar/:id', pacienteController.actualizar);
router.post('/eliminar/:id', pacienteController.eliminar);

module.exports = router;