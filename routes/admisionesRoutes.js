const express = require('express');
const router = express.Router();

// Ruta para mostrar la vista de admisiones
router.get('/', (req, res) => {
    res.render('admisiones/index', { admisiones: [] }); // Envía una lista vacía
});

module.exports = router;