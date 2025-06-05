// routes/evaluacionesEnfermeriaRoutes.js
const express = require("express");
const router = express.Router();
const evaluacionController = require("../controllers/evaluacionEnfermeriaController");
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.listarEvaluaciones);
router.get('/nuevo', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.formularioNuevaEvaluacion);
router.post('/nuevo', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.crearEvaluacion);
router.get('/detalle/:id', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.verDetalle);
router.get('/editar/:id', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.formularioEditar);
router.post('/editar/:id', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.editarEvaluacion);
router.post('/eliminar/:id', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.eliminarEvaluacion);

module.exports = router;