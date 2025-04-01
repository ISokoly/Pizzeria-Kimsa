const connection = require('../config/db');

const Categoria = {
  getAll: (callback) => {
    connection.query('SELECT * FROM categorias', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM categorias WHERE id = ?', [id], callback);
  },
  create: (data, callback) => {
    connection.query('INSERT INTO categorias SET ?', data, callback);
  },
  update: (id, data, callback) => {
    connection.query('UPDATE categorias SET ? WHERE id = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    connection.query('DELETE FROM categorias WHERE id = ?', [id], callback);
  },
  getByNombre: (nombre, callback) => {
    connection.query('SELECT * FROM categorias WHERE nombre = ?', [nombre], callback);
  }
};

module.exports = Categoria;