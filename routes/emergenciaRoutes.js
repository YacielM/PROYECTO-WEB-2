const express = require('express');
const router = express.Router();
const emergenciaController = require('../controllers/emergenciaController');

// Mostrar formulario
router.get('/', emergenciaController.formularioEmergencia);

// Procesar formulario
router.post('/', emergenciaController.registrarEmergencia);

module.exports = router;