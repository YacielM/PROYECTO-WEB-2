// routes/admisionesRoutes.js
const express = require('express');
const router = express.Router();
const admisionController = require('../controllers/admisionController');

// Listar admisiones
router.get('/', admisionController.listarAdmisiones);

// Formulario y creación
router.get('/nuevo', admisionController.formularioNuevaAdmision);
router.post('/nuevo', admisionController.crearAdmision);

// Edición
router.get('/editar/:id', admisionController.formularioEditarAdmision);
router.post('/editar/:id', admisionController.actualizarAdmision);

// Eliminación
router.post('/eliminar/:id', admisionController.eliminarAdmision);

module.exports = router;