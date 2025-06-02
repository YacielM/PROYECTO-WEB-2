const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario extends Model {
  validPassword(password) {
    return bcrypt.compareSync(password, this.contraseña);
  }
}

Usuario.init({
  usuario: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('admin', 'medico',
         'enfermero', 'recepcionista'),
    allowNull: false
  },
  nombre: { 
    type: DataTypes.STRING,
    allowNull: false 
  },
  apellido: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING 
  },
  telefono: { 
    type: DataTypes.STRING 
  }

}, {
  sequelize,
  modelName: 'Usuario',
  tableName: 'usuarios',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      usuario.contraseña = await bcrypt.hash(usuario.contraseña, 10);
    }
  }
});

module.exports = Usuario;