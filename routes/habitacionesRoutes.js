const express = require('express');
const router = express.Router();
const habitacionesController = require('../controllers/habitacionesController');

router.get('/', habitacionesController.listarHabitaciones);

router.get('/nueva-sala', habitacionesController.formularioNuevaSala);
router.post('/nueva-sala', habitacionesController.crearSala);
router.post('/eliminar-sala/:id', habitacionesController.eliminarSala);

router.get('/nueva-cama', habitacionesController.formularioNuevaCama);
router.post('/nueva-cama', habitacionesController.crearCama);
router.post('/eliminar-cama/:id', habitacionesController.eliminarCama);

router.post('/cambiar-estado-cama/:id', habitacionesController.cambiarEstadoCama);

module.exports = router;