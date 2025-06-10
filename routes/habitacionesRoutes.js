const express = require('express');
const router = express.Router();
const habitacionesController = require('../controllers/habitacionesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.listarHabitaciones);

router.get('/nueva-sala', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.formularioNuevaSala);
router.post('/nueva-sala', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.crearSala);
router.post('/eliminar-sala/:id', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.eliminarSala);

router.get('/nueva-cama', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.formularioNuevaCama);
router.post('/nueva-cama', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.crearCama);
router.post('/eliminar-cama/:id', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.eliminarCama);

router.post('/cambiar-estado-cama/:id', estaAutenticado, tieneRol(['admin', 'recepcionista']), habitacionesController.cambiarEstadoCama);

module.exports = router;