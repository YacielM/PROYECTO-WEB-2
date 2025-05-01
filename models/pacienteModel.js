const db = require('../config/db.js');
const Paciente = {
    
    async insertar(paciente) {
        const {
            dni, nombre, apellido, genero, fecha_nacimiento, direccion, telefono,
            contacto_emergencia, historial_medico
        } = paciente;

        await db.query(
            `INSERT INTO pacientes 
            (dni, nombre, apellido, genero, fecha_nacimiento, direccion, telefono, 
            contacto_emergencia, historial_medico) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dni, nombre, apellido, genero, fecha_nacimiento, direccion, telefono, 
            contacto_emergencia, historial_medico]
        );
    },

    async actualizar(id, paciente) {
        const {
            dni, nombre, apellido, genero, fecha_nacimiento, direccion, telefono,
            contacto_emergencia, historial_medico
        } = paciente;

        await db.query(
            `UPDATE pacientes 
            SET dni = ?, nombre = ?, apellido = ?, genero = ?, fecha_nacimiento = ?, 
            direccion = ?, telefono = ?, contacto_emergencia = ?, historial_medico = ? 
            WHERE id = ?`,
            [dni, nombre, apellido, genero, fecha_nacimiento, direccion, telefono, 
            contacto_emergencia, historial_medico, id]
        );
    },

    async eliminar(id) {
        await db.query(`DELETE FROM pacientes WHERE id = ?`, [id]);
    },
    
    async obtenerPorId(id) {
        const [rows] = await db.query(`SELECT * FROM pacientes WHERE id = ?`, [id]);
        return rows[0];
    },
    
    async obtenerTodos() {
        const [rows] = await db.query(`SELECT * FROM pacientes`);
        return rows;
    },
    
    async buscarPorDNI(dni) {
        const [rows] = await db.query(`SELECT * FROM pacientes WHERE dni = ?`, [dni]);
        return rows[0];
    },
    
    async buscarPorNombre(nombre) {
        const [rows] = await db.query(`SELECT * FROM pacientes WHERE nombre = ?`, [nombre]);
        return rows;
    }
};

module.exports = Paciente;