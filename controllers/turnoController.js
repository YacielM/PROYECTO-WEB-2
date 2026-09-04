// controllers/turnoController.js
const { Usuario, Paciente, Turno, Admision } = require('../models');

const DEFAULT_LIMIT = 10;

exports.listarTurnos = async (req, res) => {
  try {
    const busquedaPaciente = (req.query.paciente || '').trim().toLowerCase();
    const busquedaMedico = (req.query.medico || '').trim().toLowerCase();
    const busquedaEstado = (req.query.estado || '').trim();
    const ordenQuery = req.query.orden || 'fecha';
    const direccion = (req.query.direccion || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = parseInt(req.query.limite, 10) || DEFAULT_LIMIT;

    // Filtro por rol (Médicos ven solo sus turnos)
    let whereClause = {};
    if (req.session && req.session.rol === 'medico') {
      whereClause.medico_id = req.session.usuarioId;
    }

    // Traer todos los turnos con sus relaciones (incluyendo Admision dentro de Paciente)
    const turnosRaw = await Turno.findAll({
      where: whereClause,
      include: [
        {
          model: Paciente,
          attributes: ['id', 'nombre', 'apellido', 'dni'],
          include: [
            {
              model: Admision,
              where: { estado: 'Activo' },
              required: false,
              attributes: ['id']
            }
          ]
        },
        {
          model: Usuario,
          as: 'medico',
          attributes: ['id', 'nombre', 'apellido']
        }
      ]
    });

    const lista = Array.isArray(turnosRaw) ? turnosRaw : [];

    // Filtrado en memoria (Paciente, Médico y Estado)
    let turnosFiltrados = lista.filter(t => {
      // Filtro Paciente (Nombre completo o DNI)
      if (busquedaPaciente) {
        const nomPac = t.Paciente ? `${t.Paciente.nombre || ''} ${t.Paciente.apellido || ''} ${t.Paciente.dni || ''}`.toLowerCase() : '';
        if (!nomPac.includes(busquedaPaciente)) return false;
      }
      // Filtro Médico
      if (busquedaMedico) {
        const nomMed = t.medico ? `${t.medico.nombre || ''} ${t.medico.apellido || ''}`.toLowerCase() : '';
        if (!nomMed.includes(busquedaMedico)) return false;
      }
      // Filtro Estado
      if (busquedaEstado && t.estado !== busquedaEstado) {
        return false;
      }
      return true;
    });

    // Ordenamiento dinámico
    const camposPermitidos = ['fecha', 'paciente', 'medico', 'estado'];
    const campoOrden = camposPermitidos.includes(ordenQuery) ? ordenQuery : 'fecha';

    turnosFiltrados.sort((a, b) => {
      if (campoOrden === 'fecha') {
        const va = a.fecha ? new Date(a.fecha) : new Date(0);
        const vb = b.fecha ? new Date(b.fecha) : new Date(0);
        const diff = va - vb;
        return direccion === 'ASC' ? diff : -diff;
      }

      if (campoOrden === 'paciente') {
        const va = a.Paciente ? `${a.Paciente.apellido} ${a.Paciente.nombre}`.toLowerCase() : '';
        const vb = b.Paciente ? `${b.Paciente.apellido} ${b.Paciente.nombre}`.toLowerCase() : '';
        if (va < vb) return direccion === 'ASC' ? -1 : 1;
        if (va > vb) return direccion === 'ASC' ? 1 : -1;
        return 0;
      }

      if (campoOrden === 'medico') {
        const va = a.medico ? `${a.medico.apellido} ${a.medico.nombre}`.toLowerCase() : '';
        const vb = b.medico ? `${b.medico.apellido} ${b.medico.nombre}`.toLowerCase() : '';
        if (va < vb) return direccion === 'ASC' ? -1 : 1;
        if (va > vb) return direccion === 'ASC' ? 1 : -1;
        return 0;
      }

      if (campoOrden === 'estado') {
        const va = (a.estado || '').toLowerCase();
        const vb = (b.estado || '').toLowerCase();
        if (va < vb) return direccion === 'ASC' ? -1 : 1;
        if (va > vb) return direccion === 'ASC' ? 1 : -1;
        return 0;
      }

      return 0;
    });

    // Paginación
    const count = turnosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(count / limite));
    const offset = (pagina - 1) * limite;
    const turnosPage = turnosFiltrados.slice(offset, offset + limite);

    // Mapeo seguro y cálculo del flag tieneAdmisionActiva
    const turnos = turnosPage.map(t => {
      const tieneAdmision = t.Paciente && Array.isArray(t.Paciente.Admisions) && t.Paciente.Admisions.length > 0;
      
      return {
        id: t.id,
        fecha: t.fecha ? new Date(t.fecha).toLocaleString('es-AR') : '',
        motivo: t.motivo || '-',
        estado: t.estado,
        pacienteNombre: t.Paciente ? `${t.Paciente.nombre} ${t.Paciente.apellido}` : 'Sin paciente',
        medicoNombre: t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : 'Sin médico',
        tieneAdmisionActiva: tieneAdmision
      };
    });

    res.render('turnos/index', {
      turnos,
      busquedaPaciente,
      busquedaMedico,
      busquedaEstado,
      pagina,
      totalPaginas,
      limite,
      orden: ordenQuery,
      direccion,
      count,
      activePage: 'turnos'
    });
  } catch (error) {
    console.error('Error listarTurnos:', error);
    res.status(500).render('error', { mensaje: 'Error al cargar los turnos' });
  }
};

exports.formularioNuevoTurno = async (req, res) => {
  try {
    const pacientes = await Paciente.findAll({ order: [['apellido', 'ASC']] });
    const medicos = await Usuario.findAll({ where: { rol: 'medico' }, order: [['apellido', 'ASC']] });
    res.render('turnos/nuevo', { pacientes, medicos });
  } catch (error) {
    console.error('Error formularioNuevoTurno:', error);
    res.redirect('/turnos');
  }
};

exports.crearTurno = async (req, res) => {
  try {
    await Turno.create({
      fecha: req.body.fecha,
      motivo: req.body.motivo,
      paciente_id: req.body.paciente_id,
      medico_id: req.body.medico_id
    });
    res.redirect('/turnos');
  } catch (error) {
    const pacientes = await Paciente.findAll();
    const medicos = await Usuario.findAll({ where: { rol: 'medico' } });
    res.render('turnos/nuevo', { error: 'Error al crear turno: ' + error.message, pacientes, medicos, datos: req.body });
  }
};

exports.formularioEditarTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) throw new Error('Turno no encontrado');
    const pacientes = await Paciente.findAll({ order: [['apellido', 'ASC']] });
    const medicos = await Usuario.findAll({ where: { rol: 'medico' }, order: [['apellido', 'ASC']] });
    res.render('turnos/editar', { turno, pacientes, medicos });
  } catch (error) {
    console.error('Error formularioEditarTurno:', error);
    res.redirect('/turnos');
  }
};

exports.actualizarTurno = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) throw new Error('Turno no encontrado');
    await turno.update({
      fecha: req.body.fecha,
      motivo: req.body.motivo,
      paciente_id: req.body.paciente_id,
      medico_id: req.body.medico_id
    });
    res.redirect('/turnos');
  } catch (error) {
    const pacientes = await Paciente.findAll();
    const medicos = await Usuario.findAll({ where: { rol: 'medico' } });
    res.render('turnos/editar', { error: 'Error al actualizar: ' + error.message, turno: req.body, pacientes, medicos });
  }
};

exports.eliminarTurno = async (req, res) => {
  try {
    await Turno.destroy({ where: { id: req.params.id } });
    res.redirect('/turnos');
  } catch (error) {
    console.error('Error eliminarTurno:', error);
    res.redirect('/turnos');
  }
};

exports.cambiarEstado = async (req, res) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (turno) {
      await turno.update({ estado: req.body.estado });
    }
    res.redirect('/turnos');
  } catch (error) {
    console.error('Error cambiarEstado:', error);
    res.redirect('/turnos');
  }
};