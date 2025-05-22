// routes/evaluacionesEnfermeriaRoutes.js
const express = require("express");
const router = express.Router();
const evaluacionController = require("../controllers/evaluacionEnfermeriaController");

router.get("/", evaluacionController.listarEvaluaciones);
router.get("/nuevo", evaluacionController.formularioNuevaEvaluacion);
router.post("/nuevo", evaluacionController.crearEvaluacion);

module.exports = router;