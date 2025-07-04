require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./config/db'); 
require('./models/sync'); 
const app = express();

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Ruta a la carpeta de vistas

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
const session = require('express-session');
app.use(session({
  secret: '39394014',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 60 * 60 * 1000 } // 1 hora
}));

//Mostrar/Ocultar botones según sesión y rol
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Rutas de autenticación (debe ir antes que las rutas protegidas)
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Ruta de inicio
const indexRoutes = require('./routes/indexRoutes');
app.use('/', indexRoutes);


// RUTAS principales
const pacienteRoutes = require('./routes/pacienteRoutes');
const admisionesRoutes = require('./routes/admisionesRoutes');
const evaluacionesEnfermeriaRoutes = require('./routes/evaluacionesEnfermeriaRoutes');
const evaluacionesMedicasRoutes = require ("./routes/evaluacionesMedicasRoutes");
const habitacionesRoutes = require('./routes/habitacionesRoutes');
const personalRoutes = require('./routes/personalRoutes');
const turnosRoutes = require('./routes/turnosRoutes');
const emergenciaRoutes = require('./routes/emergenciaRoutes');

app.use('/pacientes', pacienteRoutes);
app.use('/admisiones', admisionesRoutes);
app.use("/eva_enfermeria", evaluacionesEnfermeriaRoutes);
app.use("/eva_medicas", evaluacionesMedicasRoutes);
app.use('/habitaciones', habitacionesRoutes);
app.use('/personal', personalRoutes);
app.use('/turnos', turnosRoutes);
app.use('/emergencia', emergenciaRoutes);

// Después de las rutas
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    mensaje: 'Error interno del servidor. Contacte al administrador.' 
  });
});
 
// Iniciar el servidor
if (require.main === module) {
  const PORT = process.env.PORT;
  db.sync({ alter: true })
  .then(() => {
      console.log("Modelos sincronizados");
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('Error al sincronizar modelos:', err);
    });
} else {
  module.exports = app;
}