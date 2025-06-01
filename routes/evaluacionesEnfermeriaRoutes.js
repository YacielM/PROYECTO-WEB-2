// routes/evaluacionesEnfermeriaRoutes.js
const express = require("express");
const router = express.Router();
const evaluacionController = require("../controllers/evaluacionEnfermeriaController");
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.listarEvaluaciones);
router.get('/nuevo', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.formularioNuevaEvaluacion);
router.post('/nuevo', estaAutenticado, tieneRol(['admin', 'enfermero']), evaluacionController.crearEvaluacion);

module.exports = router;