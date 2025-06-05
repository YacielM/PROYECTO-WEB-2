// routes/evaluacionesMedicasRoutes.js
const express = require("express");
const router = express.Router();
const evaluacionController = require("../controllers/evaluacionMedicaController");
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.listarEvaluaciones);
router.get('/nuevo', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.formularioNuevaEvaluacion);
router.post('/nuevo', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.crearEvaluacion);

// Rutas para detalle y edición
router.get('/editar/:id', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.formularioEditarEvaluacion);
router.post('/editar/:id', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.editarEvaluacion);
router.get('/:id', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.detalleEvaluacion);

router.post('/eliminar/:id', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.eliminarEvaluacion);

module.exports = router;