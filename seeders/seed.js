// seeders/seed.js
const sequelize = require('../config/db');
const Paciente = require('../models/pacienteModel');
const Sala = require('../models/salaModel');
const Cama = require('../models/camaModel');
const Admision = require('../models/admisionModel');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log(' Tablas recreadas');

    // 1. Crear Salas
    const salas = await Sala.bulkCreate([
      { ala: 'Norte', numero_sala: '101', capacidad: 2 },
      { ala: 'Sur', numero_sala: '201', capacidad: 4 },
      { ala: 'Pediatría', numero_sala: '301', capacidad: 3 }
    ]);
    console.log(' Salas creadas');

    // 2. Crear Camas
    const camas = await Cama.bulkCreate([
      // Sala 101 (2 camas)
      { sala_id: salas[0].id, numero_cama: 1, estado: 'Disponible', restriccion_genero: 'Ninguno' },
      { sala_id: salas[0].id, numero_cama: 2, estado: 'Disponible', restriccion_genero: 'F' },
      
      // Sala 201 (4 camas)
      { sala_id: salas[1].id, numero_cama: 1, estado: 'Disponible', restriccion_genero: 'Ninguno' },
      { sala_id: salas[1].id, numero_cama: 2, estado: 'En Limpieza', restriccion_genero: 'M' },
      { sala_id: salas[1].id, numero_cama: 3, estado: 'Disponible', restriccion_genero: 'Ninguno' },
      { sala_id: salas[1].id, numero_cama: 4, estado: 'Ocupada', restriccion_genero: 'Ninguno' },
      
      // Sala 301 (3 camas)
      { sala_id: salas[2].id, numero_cama: 1, estado: 'Disponible', restriccion_genero: 'Ninguno' },
      { sala_id: salas[2].id, numero_cama: 2, estado: 'Disponible', restriccion_genero: 'Ninguno' },
      { sala_id: salas[2].id, numero_cama: 3, estado: 'Disponible', restriccion_genero: 'Ninguno' }
    ]);
    console.log(' Camas creadas');

    // 3. Crear Pacientes
    const pacientes = await Paciente.bulkCreate([
      {
        dni: '33444555',
        nombre: 'Carlos',
        apellido: 'Gómez',
        genero: 'M',
        direccion: 'Av. Siempre Viva 742',
        telefono: '555-1234',
        contacto_emergencia: 'María Gómez'
      },
      {
        dni: '25666777',
        nombre: 'Ana',
        apellido: 'López',
        genero: 'F',
        direccion: 'Calle Falsa 123',
        telefono: '555-5678',
        contacto_emergencia: 'Pedro López'
      },
      {
        dni: '37888999',
        nombre: 'Luisa',
        apellido: 'Martínez',
        genero: 'F',
        direccion: 'Boulevard Central 456',
        telefono: '555-9012',
        contacto_emergencia: 'Juan Martínez'
      }
    ]);
    console.log(' Pacientes creados');

    // 4. Crear Admisiones de prueba
    await Admision.bulkCreate([
      {
        paciente_id: pacientes[0].id, // Carlos Gómez
        cama_id: camas[4].id, // Cama ocupada en Sala 201
        tipo_admision: 'Emergencia',
        estado: 'Activo',
        motivo: 'Fractura de brazo'
      },
      {
        paciente_id: pacientes[1].id, // Ana López
        cama_id: camas[7].id, // Cama en Pediatría
        tipo_admision: 'Programada',
        estado: 'Activo',
        motivo: 'Cirugía programada'
      }
    ]);
    console.log(' Admisiones de prueba creadas');

    console.log(' ¡Datos de prueba insertados exitosamente!');
    
  } catch (error) {
    console.error(' Error en el seeder:', error);
  } finally {
    process.exit();
  }
}

seed();