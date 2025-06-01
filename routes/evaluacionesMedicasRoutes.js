// routes/evaluacionesMedicasRoutes.js
const express = require("express");
const router = express.Router();
const evaluacionController = require("../controllers/evaluacionMedicaController");
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.listarEvaluaciones);
router.get('/nuevo', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.formularioNuevaEvaluacion);
router.post('/nuevo', estaAutenticado, tieneRol(['admin', 'medico']), evaluacionController.crearEvaluacion);

module.exports = router;