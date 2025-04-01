const connection = require('../config/db');

const Marca = {
  getAll: (callback) => {
    connection.query('SELECT * FROM marcas', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM marcas WHERE id = ?', [id], callback);
  },
  create: (data, callback) => {
    connection.query('INSERT INTO marcas SET ?', data, callback);
  },
  update: (id, data, callback) => {
    connection.query('UPDATE marcas SET ? WHERE id = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    connection.query('DELETE FROM marcas WHERE id = ?', [id], callback);
  }
};

module.exports = Marca;