const {Paciente, Admision, EvaluacionEnfermeria, EvaluacionMedica} = require('../models');
const PDFDocument = require('pdfkit');

// Obtener todos los pacientes o buscar por DNI
exports.obtenerTodos = async (req, res) => {
  try {
    let pacientes;
    let busqueda = req.query.dni || '';
    if (busqueda) {
      pacientes = await Paciente.findAll({ where: { dni: busqueda } });
    } else {
      pacientes = await Paciente.findAll();
    }
    res.render('paciente/index', {
    pacientes,
    busqueda: req.query.dni || '',
    activePage: 'pacientes-gestion'
  });
  } catch (error) {
    res.status(500).render('error', { mensaje: 'Error al cargar pacientes' });
  }
};

// Mostrar formulario de nuevo paciente (vista)
exports.mostrarFormularioNuevo = (req, res) => {
  res.render('paciente/nuevo');
};

// Insertar nuevo paciente (POST)
exports.insertar = async (req, res) => {
  try {
    let datos = req.body;
    if (!datos.antecedentes || datos.antecedentes.trim() === '') {
      datos.antecedentes = "Sin antecedentes médicos relevantes";
    }
    await Paciente.create(datos);
    res.redirect('/pacientes');
  } catch (error) {
    res.render('paciente/nuevo', { 
      error: 'Error al crear paciente: ' + error.message,
      datos: req.body
    });
  }
};

// Mostrar formulario de edición (vista)
exports.mostrarFormularioEditar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    res.render('paciente/editar', { paciente });
  } catch (error) {
    res.redirect('/pacientes');
  }
};

// Actualizar paciente (POST)
exports.actualizar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    let datos = req.body;
    if (!datos.antecedentes || datos.antecedentes.trim() === '') {
      datos.antecedentes = "Sin antecedentes médicos relevantes";
    }
    await paciente.update(datos);
    res.redirect('/pacientes');
  } catch (error) {
    res.render('paciente/editar', { 
      error: 'Error al actualizar: ' + error.message,
      paciente: req.body 
    });
  }
};

// Eliminar paciente (POST)
exports.eliminar = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    await paciente.destroy();
    res.redirect('/pacientes');
  } catch (error) {
    res.redirect('/pacientes');
  }
};

// Ver antecedentes médicos (GET)
exports.verAntecedentes = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id);
    if (!paciente) throw new Error('Paciente no encontrado');
    res.render('paciente/antecedentes', { paciente });
  } catch (error) {
    res.redirect('/pacientes');
  }
};



// CONTROLADOR PARA CREAR PDF DEL PACIENTE

exports.exportarPDF = async (req, res) => {
  try {
    const paciente = await Paciente.findByPk(req.params.id, {
      include: [
        {
          model: Admision,
          include: [
            { model: EvaluacionEnfermeria },
            { model: EvaluacionMedica }
          ]
        }
      ]
    });

    if (!paciente) {
      return res.status(404).send('Paciente no encontrado');
    }

    // Crear documento PDF con márgenes adecuados y tamaño A4
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="paciente_${paciente.id}.pdf"`);
    doc.pipe(res);

    // Título principal
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Datos del Paciente', { underline: true, align: 'center' });
    doc.moveDown();

    // Datos básicos del paciente
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(`Nombre: ${paciente.nombre} ${paciente.apellido}`)
      .text(`DNI: ${paciente.dni}`)
      .text(`Género: ${paciente.genero}`)
      .text(`Teléfono: ${paciente.telefono || 'No registrado'}`);
    doc.moveDown();

    // Sección de admisiones (si existen)
    if (paciente.Admisions && paciente.Admisions.length > 0) {
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Admisiones:', { underline: true });
      doc.moveDown(0.5);

      paciente.Admisions.forEach(adm => {
        // Datos de la admisión
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(`Motivo: ${adm.motivo} | Estado: ${adm.estado}`, { indent: 20 });
        doc.moveDown(0.5);

        // Evaluación de Enfermería (si existe)
        if (adm.EvaluacionEnfermeria && adm.EvaluacionEnfermeria.length > 0) {
          doc
            .font('Helvetica-Bold')
            .text('Evaluación Enfermería:', { indent: 40 });
          adm.EvaluacionEnfermeria.forEach(ev => {
            doc
              .font('Helvetica')
              .text(`- Signos vitales: ${ev.signos_vitales}`, { indent: 60 })
              .text(`- Síntomas: ${ev.sintomas}`, { indent: 60 })
              .text(`- Plan de cuidado: ${ev.plan_cuidado}`, { indent: 60 })
              .text(`- Fecha: ${ev.fecha_evaluacion ? ev.fecha_evaluacion.toLocaleString() : ''}`, { indent: 60 });
            doc.moveDown(0.5);
          });
        }

        // Evaluación Médica (si existe)
        if (adm.EvaluacionMedicas && adm.EvaluacionMedicas.length > 0) {
          doc
            .font('Helvetica-Bold')
            .text('Evaluación Médica:', { indent: 40 });
          adm.EvaluacionMedicas.forEach(ev => {
            doc
              .font('Helvetica')
              .text(`- Diagnóstico: ${ev.diagnostico}`, { indent: 60 })
              .text(`- Tratamiento: ${ev.tratamiento}`, { indent: 60 })
              .text(`- Seguimiento: ${ev.seguimiento || 'No registrado'}`, { indent: 60 })
              .text(`- Fecha: ${ev.fecha_evaluacion ? ev.fecha_evaluacion.toLocaleString() : ''}`, { indent: 60 });
            doc.moveDown(0.5);
          });
        }

        doc.moveDown();
      });
    }

    doc.end();
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).send('Error generando PDF');
  }
};