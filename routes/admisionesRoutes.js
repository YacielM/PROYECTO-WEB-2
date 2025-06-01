// routes/admisionesRoutes.js
const express = require('express');
const router = express.Router();
const admisionController = require('../controllers/admisionController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

// Listar admisiones
router.get('/', estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.listarAdmisiones);

// Formulario y creación
router.get('/nuevo',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.formularioNuevaAdmision);
router.post('/nuevo',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.crearAdmision);

// Edición
router.get('/editar/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.formularioEditarAdmision);
router.post('/editar/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.actualizarAdmision);

// Eliminación
router.post('/eliminar/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.eliminarAdmision);

//Alta
router.get('/alta/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.formularioAlta);
router.post('/alta/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.darAlta);

//Reactivar
router.post('/reactivar/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.reactivarAdmision);
router.post('/reactivar/:id',estaAutenticado, tieneRol(['admin', 'recepcionista']), admisionController.reactivarAdmision);

module.exports = router;