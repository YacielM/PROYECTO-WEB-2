const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

// Listar turnos (admin, recepcionista, medico)
router.get('/', estaAutenticado, tieneRol(['admin', 'recepcionista', 'medico']), turnoController.listarTurnos);

// Nuevo turno (solo admin y recepcionista)
router.get('/nuevo', estaAutenticado, tieneRol(['admin', 'recepcionista']), turnoController.formularioNuevoTurno);
router.post('/nuevo', estaAutenticado, tieneRol(['admin', 'recepcionista']), turnoController.crearTurno);

// Editar turno
router.get('/editar/:id', estaAutenticado, tieneRol(['admin', 'recepcionista']), turnoController.formularioEditarTurno);
router.post('/editar/:id', estaAutenticado, tieneRol(['admin', 'recepcionista']), turnoController.actualizarTurno);

// Eliminar turno
router.post('/eliminar/:id', estaAutenticado, tieneRol(['admin', 'recepcionista']), turnoController.eliminarTurno);

// Cambiar estado (atender/cancelar)
router.post('/estado/:id', estaAutenticado, tieneRol(['admin', 'recepcionista', 'medico']), turnoController.cambiarEstado);

module.exports = router;