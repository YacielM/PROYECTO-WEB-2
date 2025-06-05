const sequelize = require('../config/db');
const { EvaluacionEnfermeria, EvaluacionMedica, Admision,
   Paciente, Cama, Sala, Usuario } = require('../models');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log(' Tablas recreadas');

    // 1. Crear Salas (ampliadas)
    const salas = await Sala.bulkCreate([
      { ala: 'Norte', numero_sala: '101', capacidad: 2 },
      { ala: 'Norte', numero_sala: '102', capacidad: 2 },
      { ala: 'Norte', numero_sala: '103', capacidad: 2 },
      { ala: 'Norte', numero_sala: '104', capacidad: 2 },
      { ala: 'Sur', numero_sala: '201', capacidad: 2 },
      { ala: 'Sur', numero_sala: '202', capacidad: 2 },
      { ala: 'Sur', numero_sala: '203', capacidad: 2 },
      { ala: 'Pediatría', numero_sala: '301', capacidad: 2 },
      { ala: 'Pediatría', numero_sala: '302', capacidad: 2 },
      { ala: 'Cardiología', numero_sala: '401', capacidad: 2 },
      { ala: 'Cardiología', numero_sala: '402', capacidad: 2 }
    ]);
    console.log(' Salas creadas');

    // 2. Crear Camas (ampliadas)
    const camas = [];
    const estados = ['Disponible', 'Ocupada', 'En Limpieza'];
    
    // Crear 4 camas por sala
    for (const sala of salas) {
      for (let i = 1; i <= 2; i++) {
        const estado = estados[Math.floor(Math.random() * estados.length)];
        camas.push({
          sala_id: sala.id,
          numero_cama: i,
          estado: estado,
          restriccion_genero: 'Ninguno'
        });
      }
    }
    
    await Cama.bulkCreate(camas);
    console.log(' Camas creadas');

    // 3. Crear Pacientes (15 en total) con fechas de nacimiento
  const pacientes = await Paciente.bulkCreate([
    // Pacientes originales actualizados
    {
      dni: '33444555',
      nombre: 'Carlos',
      apellido: 'Gómez',
      genero: 'M',
      fecha_nac: '1975-08-15', // 48 años
      direccion: 'Av. Siempre Viva 742',
      telefono: '02665551234',
      contacto_emergencia: '02665551235',
      historial_medico: 'Hipertensión arterial, alergia a la penicilina, cirugía de apéndice en 2010.'
    },
    {
      dni: '25666777',
      nombre: 'Ana',
      apellido: 'López',
      genero: 'F',
      fecha_nac: '1988-03-22', // 35 años
      direccion: 'Calle Falsa 123',
      telefono: '02665556789',
      contacto_emergencia: '02665556780',
      historial_medico: 'Asma leve, vacunación completa, sin antecedentes quirúrgicos.'
    },
    {
      dni: '37888999',
      nombre: 'Luisa',
      apellido: 'Martínez',
      genero: 'F',
      fecha_nac: '1965-11-30', // 58 años
      direccion: 'Boulevard Central 456',
      telefono: '02665559012',
      contacto_emergencia: '02665559013',
      historial_medico: 'Diabetes tipo 2, tratamiento con metformina, retinopatía diabética en control.'
    },
    {
      dni: '12345678',
      nombre: 'Pedro',
      apellido: 'Ramírez',
      genero: 'M',
      fecha_nac: '1992-07-10', // 31 años
      direccion: 'Calle 9 de Julio 100',
      telefono: '02665552222',
      contacto_emergencia: '02665552223',
      historial_medico: 'Sin antecedentes médicos relevantes'
    },
    // Nuevos pacientes (11 adicionales)
    {
      dni: '23456789',
      nombre: 'María',
      apellido: 'Fernández',
      genero: 'F',
      fecha_nac: '1978-04-05', // 45 años
      direccion: 'Av. Libertador 1500',
      telefono: '02664441111',
      contacto_emergencia: '02664441112',
      historial_medico: 'Artritis reumatoide, tratamiento con inmunosupresores'
    },
    {
      dni: '34567890',
      nombre: 'Juan',
      apellido: 'Pérez',
      genero: 'M',
      fecha_nac: '1983-09-18', // 40 años
      direccion: 'Calle San Martín 500',
      telefono: '02663332222',
      contacto_emergencia: '02663332223',
      historial_medico: 'Hernia discal L4-L5, en espera de cirugía'
    },
    {
      dni: '45678901',
      nombre: 'Laura',
      apellido: 'García',
      genero: 'F',
      fecha_nac: '1995-12-25', // 28 años
      direccion: 'Bv. España 789',
      telefono: '02662223344',
      contacto_emergencia: '02662223345',
      historial_medico: 'Embarazo de 32 semanas, control prenatal'
    },
    {
      dni: '56789012',
      nombre: 'Roberto',
      apellido: 'Sánchez',
      genero: 'M',
      fecha_nac: '1958-02-14', // 65 años
      direccion: 'Calle Belgrano 321',
      telefono: '02661112233',
      contacto_emergencia: '02661112234',
      historial_medico: 'EPOC, oxigenoterapia domiciliaria'
    },
    {
      dni: '67890123',
      nombre: 'Sofía',
      apellido: 'Rodríguez',
      genero: 'F',
      fecha_nac: '1972-06-08', // 51 años
      direccion: 'Av. Colón 654',
      telefono: '02669998877',
      contacto_emergencia: '02669998878',
      historial_medico: 'Cáncer de mama, en quimioterapia'
    },
    {
      dni: '78901234',
      nombre: 'Miguel',
      apellido: 'López',
      genero: 'M',
      fecha_nac: '1980-10-31', // 43 años
      direccion: 'Calle Sarmiento 987',
      telefono: '02668887766',
      contacto_emergencia: '02668887767',
      historial_medico: 'Insuficiencia cardíaca, marcapasos implantado'
    },
    {
      dni: '89012345',
      nombre: 'Elena',
      apellido: 'Martín',
      genero: 'F',
      fecha_nac: '1945-05-20', // 78 años
      direccion: 'Av. Rivadavia 111',
      telefono: '02667776655',
      contacto_emergencia: '02667776656',
      historial_medico: 'Alzheimer en etapa moderada'
    },
    {
      dni: '90123456',
      nombre: 'Diego',
      apellido: 'Gómez',
      genero: 'M',
      fecha_nac: '1998-01-15', // 25 años
      direccion: 'Calle Mitre 222',
      telefono: '02666665544',
      contacto_emergencia: '02666665545',
      historial_medico: 'Accidente cerebrovascular, en rehabilitación'
    },
    {
      dni: '11223344',
      nombre: 'Carmen',
      apellido: 'Díaz',
      genero: 'F',
      fecha_nac: '1970-07-04', // 53 años
      direccion: 'Bv. San Juan 333',
      telefono: '02665554433',
      contacto_emergencia: '02665554434',
      historial_medico: 'Depresión mayor, tratamiento farmacológico'
    },
    {
      dni: '22334455',
      nombre: 'Jorge',
      apellido: 'Ruiz',
      genero: 'M',
      fecha_nac: '1968-12-12', // 55 años
      direccion: 'Av. Independencia 444',
      telefono: '02664443322',
      contacto_emergencia: '02664443323',
      historial_medico: 'Cirrosis hepática, en lista de trasplante'
    },
    {
      dni: '33445566',
      nombre: 'Patricia',
      apellido: 'Hernández',
      genero: 'F',
      fecha_nac: '1985-09-28', // 38 años
      direccion: 'Calle Urquiza 555',
      telefono: '02663332211',
      contacto_emergencia: '02663332212',
      historial_medico: 'Lupus eritematoso sistémico'
    }
  ]);
  console.log(' Pacientes creados con fechas de nacimiento');

    // 4. Crear Admisiones (5 en total)
    const admisiones = await Admision.bulkCreate([
      // Admisiones originales
  {
    paciente_id: pacientes[0].id, // Carlos
    cama_id: 3,
    tipo_admision: 'Emergencia',
    estado: 'Activo',
    motivo: 'Dolor torácico agudo',
    fecha_admision: new Date('2024-05-01')
  },
  {
    paciente_id: pacientes[1].id, // Ana
    cama_id: 8,
    tipo_admision: 'Programada',
    estado: 'Activo',
    motivo: 'Cirugía de vesícula programada',
    fecha_admision: new Date('2024-05-02')
  },
  // Nuevas admisiones (3 adicionales)
  {
    paciente_id: pacientes[4].id, // María
    cama_id: 12,
    tipo_admision: 'Emergencia', // <-- Cambiado de "Urgencia" a "Emergencia"
    estado: 'Activo',
    motivo: 'Crisis asmática severa',
    fecha_admision: new Date('2024-05-03')
  },
  {
    paciente_id: pacientes[7].id, // Roberto
    cama_id: 15,
    tipo_admision: 'Programada',
    estado: 'Activo',
    motivo: 'Revisión de marcapasos',
    fecha_admision: new Date('2024-05-04')
  },
  {
    paciente_id: pacientes[10].id, // Diego
    cama_id: 22,
    tipo_admision: 'Emergencia',
    estado: 'Activo',
    motivo: 'Complicaciones post-ACV',
    fecha_admision: new Date('2024-05-05')
  }
]);
console.log(' Admisiones creadas');

    // 5. Evaluaciones de Enfermería (5 en total)
    await EvaluacionEnfermeria.bulkCreate([
      // Originales
      {
        admision_id: admisiones[0].id,
        signos_vitales: "TA: 150/90, FC: 88, Temp: 36.8°C, SatO2: 92%",
        sintomas: "Dolor precordial, dificultad respiratoria",
        plan_cuidado: "Monitorización cardíaca, administrar nitroglicerina sublingual",
        fecha: new Date('2024-05-01T10:30:00')
      },
      {
        admision_id: admisiones[1].id,
        signos_vitales: "TA: 120/80, FC: 72, Temp: 36.5°C, SatO2: 98%",
        sintomas: "Náuseas postquirúrgicas",
        plan_cuidado: "Administrar antieméticos según protocolo",
        fecha: new Date('2024-05-02T11:15:00')
      },
      // Nuevas evaluaciones
      {
        admision_id: admisiones[2].id,
        signos_vitales: "TA: 130/85, FC: 110, Temp: 37.1°C, SatO2: 89%",
        sintomas: "Disnea severa, sibilancias",
        plan_cuidado: "Administrar broncodilatadores, oxigenoterapia",
        fecha: new Date('2024-05-03T09:45:00')
      },
      {
        admision_id: admisiones[3].id,
        signos_vitales: "TA: 125/80, FC: 75, Temp: 36.7°C, SatO2: 96%",
        sintomas: "Mareos ocasionales",
        plan_cuidado: "Monitorizar constantes, revisión de marcapasos",
        fecha: new Date('2024-05-04T14:20:00')
      },
      {
        admision_id: admisiones[4].id,
        signos_vitales: "TA: 140/90, FC: 95, Temp: 37.0°C, SatO2: 94%",
        sintomas: "Debilidad muscular lateral izquierda",
        plan_cuidado: "Fisioterapia, evaluación neurológica",
        fecha: new Date('2024-05-05T16:10:00')
      }
    ]);
    console.log(' Evaluaciones de enfermería creadas');

    // 6. Evaluaciones Médicas (5 en total)
    await EvaluacionMedica.bulkCreate([
      // Originales
      {
        admision_id: admisiones[0].id,
        diagnostico: "Síndrome coronario agudo",
        tratamiento: "Aspirina 300mg, clopidogrel 75mg, reposo absoluto",
        seguimiento: "Ecocardiograma en 24 horas",
        fecha: new Date('2024-05-01T12:00:00')
      },
      {
        admision_id: admisiones[1].id,
        diagnostico: "Colecistitis aguda",
        tratamiento: "Colecistectomía laparoscópica exitosa",
        seguimiento: "Retirar puntos en 10 días",
        fecha: new Date('2024-05-02T13:30:00')
      },
      // Nuevas evaluaciones
      {
        admision_id: admisiones[2].id,
        diagnostico: "Estado asmático severo",
        tratamiento: "Salbutamol nebulizado, corticoides IV",
        seguimiento: "Evaluar respuesta terapéutica en 4 horas",
        fecha: new Date('2024-05-03T11:00:00')
      },
      {
        admision_id: admisiones[3].id,
        diagnostico: "Disfunción de marcapasos",
        tratamiento: "Reemplazo de batería, reprogramación",
        seguimiento: "Control cardiológico en 1 semana",
        fecha: new Date('2024-05-04T15:45:00')
      },
      {
        admision_id: admisiones[4].id,
        diagnostico: "Secuelas de ACV isquémico",
        tratamiento: "Fisioterapia intensiva, anticoagulantes",
        seguimiento: "RMN cerebral en 48 horas",
        fecha: new Date('2024-05-05T17:30:00')
      }
    ]);
    console.log(' Evaluaciones médicas creadas');

    // 7. Crear Usuarios (sin cambios)
    await Usuario.create({
  usuario: 'admin',
  contraseña: 'admin123',
  rol: 'admin',
  nombre: 'Yaciel Maximiliano',
  apellido: 'Muñoz',
  email: 'yacielzombers@gmail.com',
  telefono: '02664256205'
});
await Usuario.create({
  usuario: 'medico1',
  contraseña: 'medico123',
  rol: 'medico',
  nombre: 'Gregory',
  apellido: 'House',
  email: 'doctorhouse@gmail.com',
  telefono: '02665768933'
});
await Usuario.create({
  usuario: 'enfermero1',
  contraseña: 'enfermero123',
  rol: 'enfermero',
  nombre: 'Robert',
  apellido: 'Chase',
  email: 'doctorchase@gmail.com',
  telefono: '02664744931'
});
await Usuario.create({
  usuario: 'recepcion1',
  contraseña: 'recepcion123',
  rol: 'recepcionista',
  nombre: 'Gordon',
  apellido: 'Freeman',
  email: 'gordonfreeman@gmail.com',
  telefono: '02664666332'
});
console.log('Usuarios de prueba creados');

    console.log('¡Datos de prueba insertados exitosamente!');
    
  } catch (error) {
    console.error('Error en el seeder:', error);
  } finally {
    process.exit();
  }
}

seed();