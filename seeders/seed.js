// seeders/seed.js
const sequelize = require('../config/db');
const Paciente = require('../models/pacienteModel');
const Sala = require('../models/salaModel');
const Cama = require('../models/camaModel');
const Admision = require('../models/admisionModel');
const EvaluacionEnfermeria = require('../models/evaluacionEnfermeriaModel');
const EvaluacionMedica = require('../models/evaluacionMedicaModel');

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

    // 3. Crear Pacientes con historial médico
    const pacientes = await Paciente.bulkCreate([
      {
        dni: '33444555',
        nombre: 'Carlos',
        apellido: 'Gómez',
        genero: 'M',
        fecha_nacimiento: '1985-07-15',
        direccion: 'Av. Siempre Viva 742',
        telefono: '555-1234',
        contacto_emergencia: 'María Gómez',
        historial_medico: 'Hipertensión arterial, alergia a la penicilina, cirugía de apéndice en 2010.'
      },
      {
        dni: '25666777',
        nombre: 'Ana',
        apellido: 'López',
        genero: 'F',
        fecha_nacimiento: '1992-03-22',
        direccion: 'Calle Falsa 123',
        telefono: '555-5678',
        contacto_emergencia: 'Pedro López',
        historial_medico: 'Asma leve, vacunación completa, sin antecedentes quirúrgicos.'
      },
      {
        dni: '37888999',
        nombre: 'Luisa',
        apellido: 'Martínez',
        genero: 'F',
        fecha_nacimiento: '1978-11-30',
        direccion: 'Boulevard Central 456',
        telefono: '555-9012',
        contacto_emergencia: 'Juan Martínez',
        historial_medico: 'Diabetes tipo 2, tratamiento con metformina, retinopatía diabética en control.'
      }
    ]);
    console.log(' Pacientes creados');

    // 4. Crear Admisiones de prueba
    const admisiones = await Admision.bulkCreate([
      {
        paciente_id: pacientes[0].id, // Carlos
        cama_id: camas[3].id, // Cama 2 en Sala 201 (En Limpieza)
        tipo_admision: 'Emergencia',
        estado: 'Activo',
        motivo: 'Dolor torácico agudo'
      },
      {
        paciente_id: pacientes[1].id, // Ana
        cama_id: camas[6].id, // Cama 1 en Pediatría
        tipo_admision: 'Programada',
        estado: 'Activo',
        motivo: 'Cirugía de vesícula programada'
      }
    ]);
    console.log(' Admisiones creadas');

    // 5. Evaluaciones de Enfermería
    await EvaluacionEnfermeria.bulkCreate([
      {
        admision_id: admisiones[0].id,
        signos_vitales: "TA: 150/90, FC: 88, Temp: 36.8°C",
        sintomas: "Dolor precordial, dificultad respiratoria",
        plan_cuidado: "Monitorización cardíaca, administrar nitroglicerina sublingual."
      },
      {
        admision_id: admisiones[1].id,
        signos_vitales: "TA: 120/80, FC: 72, Temp: 36.5°C",
        sintomas: "Náuseas postquirúrgicas",
        plan_cuidado: "Administrar antieméticos según protocolo."
      }
    ]);
    console.log(' Evaluaciones de enfermería creadas');

    // 6. Evaluaciones Médicas
    await EvaluacionMedica.bulkCreate([
      {
        admision_id: admisiones[0].id,
        diagnostico: "Síndrome coronario agudo",
        tratamiento: "Aspirina 300mg, clopidogrel 75mg, reposo absoluto",
        seguimiento: "Ecocardiograma en 24 horas"
      },
      {
        admision_id: admisiones[1].id,
        diagnostico: "Colecistitis aguda",
        tratamiento: "Colecistectomía laparoscópica exitosa",
        seguimiento: "Retirar puntos en 10 días"
      }
    ]);
    console.log(' Evaluaciones médicas creadas');

    console.log('¡Datos de prueba insertados exitosamente!');
    
  } catch (error) {
    console.error('Error en el seeder:', error);
  } finally {
    process.exit();
  }
}

seed();