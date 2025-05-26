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

//Alta
router.get('/alta/:id', admisionController.formularioAlta);
router.post('/alta/:id', admisionController.darAlta);

//Reactivar
router.post('/reactivar/:id', admisionController.reactivarAdmision);
router.post('/reactivar/:id', admisionController.reactivarAdmision);

module.exports = router;