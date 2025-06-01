const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', pacienteController.obtenerTodos);
router.get('/nuevo',estaAutenticado, tieneRol(['admin', 'medico', 'enfermero', 'recepcionista']), pacienteController.mostrarFormularioNuevo);
router.post('/nuevo',estaAutenticado, tieneRol(['admin', 'medico', 'enfermero', 'recepcionista']), pacienteController.insertar);
router.get('/editar/:id',estaAutenticado, tieneRol(['admin', 'medico', 'enfermero', 'recepcionista']), pacienteController.mostrarFormularioEditar);
router.post('/editar/:id',estaAutenticado, tieneRol(['admin', 'medico', 'enfermero', 'recepcionista']), pacienteController.actualizar);
router.post('/eliminar/:id',estaAutenticado, tieneRol(['admin', 'medico', 'enfermero', 'recepcionista']), pacienteController.eliminar);
router.get('/antecedentes/:id',estaAutenticado, tieneRol(['admin', 'medico', 'enfermero', 'recepcionista']), pacienteController.verAntecedentes);

module.exports = router;