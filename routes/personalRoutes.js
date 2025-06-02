const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

// Solo admin puede gestionar personal
router.get('/', estaAutenticado, tieneRol(['admin']), personalController.listarPersonal);
router.get('/nuevo', estaAutenticado, tieneRol(['admin']), personalController.formularioNuevoPersonal);
router.post('/nuevo', estaAutenticado, tieneRol(['admin']), personalController.crearPersonal);
router.get('/editar/:id', estaAutenticado, tieneRol(['admin']), personalController.formularioEditarPersonal);
router.post('/editar/:id', estaAutenticado, tieneRol(['admin']), personalController.actualizarPersonal);
router.post('/eliminar/:id', estaAutenticado, tieneRol(['admin']), personalController.eliminarPersonal);

module.exports = router;