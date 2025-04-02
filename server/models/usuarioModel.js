const connection = require('../config/db');
const bcrypt = require('bcryptjs');

const Usuario = {
  getAll: (callback) => {
    connection.query('SELECT * FROM usuarios', callback);
  },

  getById: (id, callback) => {
    connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id], callback);
  },

  create: async (data, callback) => {
    try {
      const hashedPassword = await bcrypt.hash(data.contrasena, 10); // Hashea la contraseña
      const newData = { ...data, contrasena: hashedPassword };
      connection.query('INSERT INTO usuarios SET ?', newData, callback);
    } catch (error) {
      callback(error, null);
    }
  },

  update: async (id, data, callback) => {
    try {
      if (data.contrasena) {
        data.contrasena = await bcrypt.hash(data.contrasena, 10); // Solo encripta si hay una nueva contraseña
      } else {
        delete data.contrasena; // Si está vacía, la eliminamos para que no sobrescriba la actual
      }
  
      let query = 'UPDATE usuarios SET ';
      let values = [];
  
      Object.keys(data).forEach((key, index) => {
        query += `${key} = ?`;
        if (index < Object.keys(data).length - 1) query += ', ';
        values.push(data[key]);
      });
  
      query += ' WHERE id_usuario = ?';
      values.push(id);
  
      connection.query(query, values, callback);
    } catch (error) {
      callback(error, null);
    }
  },
  
  delete: (id, callback) => {
    connection.query('DELETE FROM usuarios WHERE id_usuario = ?', [id], callback);
  },

  getByUsername: (usuario, callback) => {
    connection.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario], callback);
  }
};

module.exports = Usuario;
