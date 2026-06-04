const express = require('express');
const router = express.Router();
const emergenciaController = require('../controllers/emergenciaController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

// Mostrar formulario
router.get('/',estaAutenticado, tieneRol(['admin','medico', 'enfermero','recepcionista']), emergenciaController.formularioEmergencia);

// Procesar formulario
router.post('/',estaAutenticado, tieneRol(['admin','medico', 'enfermero','recepcionista']), emergenciaController.registrarEmergencia);

module.exports = router;