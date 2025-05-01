const express = require('express');
const path = require('path');

const app = express();

// Configurar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // Ruta a la carpeta de vistas

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de ejemplo para renderizar el layout
app.get('/', (req, res) => {
  res.render('layout'); // Renderiza el archivo layout.pug
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});