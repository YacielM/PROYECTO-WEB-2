// controllers/pacientesController.js

const { Paciente, Admision, EvaluacionEnfermeria, EvaluacionMedica } = require('../models');
const PDFDocument = require('pdfkit');

const DEFAULT_LIMIT = 10;

// Listar pacientes: filtros, orden, paginación y flag de admisión activa
// Listar pacientes: filtros, orden, paginación y flag de admisión activa
// Listar pacientes: filtros, orden, paginación y flag de admisión activa
exports.obtenerTodos = async (req, res) => {
  try {
    const busquedaDni = (req.query.dni || '').trim();
    const busquedaNombre = (req.query.nombre || '').trim().toLowerCase();
    const ordenQuery = req.query.orden || 'apellido';
    const direccion = (req.query.direccion || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = parseInt(req.query.limite, 10) || DEFAULT_LIMIT;

    // Traer todos con inclusión de admisiones activas (required: false)
    const pacientesRaw = await Paciente.findAll({
      include: [
        {
          model: Admision,
          where: { estado: 'Activo' },
          required: false,
          attributes: ['id']
        }
      ]
    });

    const lista = Array.isArray(pacientesRaw) ? pacientesRaw : [];

    // Filtrado en memoria
    let pacientesFiltrados = lista.filter(p => {
      if (busquedaDni && !(p.dni || '').toString().includes(busquedaDni)) return false;
      if (busquedaNombre) {
        const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
        if (!nombreCompleto.includes(busquedaNombre)) return false;
      }
      return true;
    });

    // Ordenamiento en memoria: ahora admite 'admisiones' además de campos normales
    const camposPermitidos = ['nombre', 'apellido', 'dni', 'fecha_nac', 'admisiones'];
    const campoOrden = camposPermitidos.includes(ordenQuery) ? ordenQuery : 'apellido';

    pacientesFiltrados.sort((a, b) => {
      // Orden por admisiones activas: primero los que tienen admisión (ASC = con admisión primero)
      if (campoOrden === 'admisiones') {
        const aHas = (Array.isArray(a.Admisions) ? a.Admisions.length : (a.Admisions ? 1 : 0)) > 0;
        const bHas = (Array.isArray(b.Admisions) ? b.Admisions.length : (b.Admisions ? 1 : 0)) > 0;
        if (aHas === bHas) return 0;
        return direccion === 'ASC' ? (aHas ? -1 : 1) : (aHas ? 1 : -1);
      }

      // Orden por fecha
      if (campoOrden === 'fecha_nac') {
        const va = a.fecha_nac ? new Date(a.fecha_nac) : new Date(0);
        const vb = b.fecha_nac ? new Date(b.fecha_nac) : new Date(0);
        const diff = va - vb;
        return direccion === 'ASC' ? diff : -diff;
      }

      // Orden por string
      const va = (a[campoOrden] || '').toString().toLowerCase();
      const vb = (b[campoOrden] || '').toString().toLowerCase();
      if (va < vb) return direccion === 'ASC' ? -1 : 1;
      if (va > vb) return direccion === 'ASC' ? 1 : -1;
      return 0;
    });

    // Paginación
    const count = pacientesFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(count / limite));
    const offset = (pagina - 1) * limite;
    const pacientesPage = pacientesFiltrados.slice(offset, offset + limite);

    // Formateo seguro
    const pacientes = pacientesPage.map(p => {
      let fechaFormateada = '';
      if (p.fecha_nac) {
        const d = new Date(p.fecha_nac);
        if (!isNaN(d)) fechaFormateada = d.toLocaleDateString('es-AR');
      }
      const admisionesArr = Array.isArray(p.Admisions) ? p.Admisions : (p.Admisions ? [p.Admisions] : []);
      return {
        id: p.id,
        dni: p.dni || '',
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        genero: p.genero || '',
        fecha_nac: fechaFormateada,
        historial_medico: p.historial_medico || 'Sin antecedentes médicos relevantes',
        tieneAdmisionActiva: admisionesArr.length > 0
      };
    });

    res.render('paciente/index', {
      pacientes,
      busqueda: busquedaDni,
      busquedaDni,
      busquedaNombre,
      pagina,
      totalPaginas,
      limite,
      orden: ordenQuery,
      direccion,
      count,
      activePage: 'pacientes-gestion'
    });
  } catch (error) {
    console.error('Error obtenerTodos pacientes:', error);
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

// controllers/pacientesController.js

// Ver antecedentes médicos (GET) - trae la última evaluación médica y de enfermería de forma robusta
exports.verAntecedentes = async (req, res) => {
  try {
    const pacienteId = req.params.id;
    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) throw new Error('Paciente no encontrado');

    // Última evaluación médica del paciente (todas las admisiones)
    const ultimaMedica = await EvaluacionMedica.findOne({
      include: [{
        model: Admision,
        where: { paciente_id: pacienteId },
        attributes: ['id', 'paciente_id']
      }],
      order: [['fecha_evaluacion', 'DESC']],
      limit: 1
    });

    // Última evaluación de enfermería del paciente (todas las admisiones)
    const ultimaEnfermeria = await EvaluacionEnfermeria.findOne({
      include: [{
        model: Admision,
        where: { paciente_id: pacienteId },
        attributes: ['id', 'paciente_id']
      }],
      order: [['fecha_evaluacion', 'DESC']],
      limit: 1
    });

    // Flags y datos para la vista
    const tieneEvaMedica = !!ultimaMedica;
    const tieneEvaEnfermeria = !!ultimaEnfermeria;
    const ultimoMedId = ultimaMedica ? ultimaMedica.id : null;
    const ultimoEnfId = ultimaEnfermeria ? ultimaEnfermeria.id : null;

    res.render('paciente/antecedentes', {
      paciente,
      tieneEvaMedica,
      tieneEvaEnfermeria,
      ultimoMedId,
      ultimoEnfId,
      ultimaMedica,
      ultimaEnfermeria
    });
  } catch (error) {
    console.error('Error verAntecedentes:', error);
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
      .text(`Fecha de nacimiento: ${paciente.fecha_nac}`)
      .text(`Dirección: ${paciente.direccion || 'No registrada'}`)
      .text(`Teléfono: ${paciente.telefono || 'No registrado'}`)
      .text(`Contacto de emergencia: ${paciente.contacto_emergencia || 'No registrado'}`);
    doc.moveDown();

    // Antecedentes médicos
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Antecedentes médicos:', { underline: true });
    doc.moveDown(0.5);

    if (paciente.historial_medico && paciente.historial_medico !== 'Sin antecedentes médicos relevantes') {
      doc
        .font('Helvetica')
        .fontSize(12)
        .text(paciente.historial_medico, { indent: 20 });
    } else {
      doc
        .font('Helvetica')
        .fontSize(12)
        .text('Sin antecedentes médicos relevantes', { indent: 20 });
    }
    doc.moveDown();

    // Sección de admisiones (si existen)
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text('Admisiones:', { underline: true });
    doc.moveDown(0.5);

    if (paciente.Admisions && paciente.Admisions.length > 0) {
      paciente.Admisions.forEach(adm => {
        // Datos de la admisión
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(`Motivo: ${adm.motivo} | Estado: ${adm.estado}`, { indent: 20 });
        
        // Agregar motivo de alta, si corresponde
        if (adm.estado === 'Dados de Alta' && adm.motivo_alta) {
          doc.moveDown(0.5);
          doc
            .font('Helvetica')
            .fontSize(12)
            .text(`Motivo de alta: ${adm.motivo_alta}`, { indent: 30 });
        }
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
    } else {
      doc
        .font('Helvetica')
        .fontSize(12)
        .text('Este paciente no ha sido admitido todavía.', { indent: 20 });
    }


    doc.end();
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    res.status(500).send('Error generando PDF');
  }
};