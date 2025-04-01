const connection = require('../config/db');

const TiposMarca = {
  getAll: (callback) => {
    connection.query('SELECT * FROM tipos_marcas', callback);
  },
  getByNombre: (nombre, callback) => {
    connection.query('SELECT * FROM tipos_marcas WHERE nombre = ? LIMIT 1', [nombre], callback);
  },
  create: (data, callback) => {
    connection.query('INSERT INTO tipos_marcas SET ?', data, callback);
  },
  update: (nombre, data, callback) => {
    connection.query('UPDATE tipos_marcas SET ? WHERE nombre = ?', [data, nombre], callback);
  },
  delete: (nombre, callback) => {
    connection.query('DELETE FROM tipos_marcas WHERE nombre = ?', [nombre], callback);
  }
};

module.exports = TiposMarca;