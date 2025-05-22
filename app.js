const express = require('express');
const path = require('path');
const db = require('./config/db'); // Importa la conexión a la base de datos

const app = express();

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Ruta a la carpeta de vistas

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de ejemplo para renderizar el layout
app.get('/', (req, res) => {
  res.render('layout'); // Renderiza el archivo layout.pug
});
//RUTAS
const pacienteRoutes = require('./routes/pacienteRoutes');
const admisionesRoutes = require('./routes/admisionesRoutes');
const evaluacionesEnfermeriaRoutes = require('./routes/evaluacionesEnfermeriaRoutes');
const evaluacionesMedicasRoutes = require ("./routes/evaluacionesMedicasRoutes");

// Usar las rutas de pacientes y admisiones
app.use('/pacientes', pacienteRoutes);
app.use('/admisiones', admisionesRoutes);
app.use("/eva_enfermeria", evaluacionesEnfermeriaRoutes);
app.use("/eva_medicas", evaluacionesMedicasRoutes);

// Después de las rutas
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    mensaje: 'Error interno del servidor. Contacte al administrador.' 
  });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});