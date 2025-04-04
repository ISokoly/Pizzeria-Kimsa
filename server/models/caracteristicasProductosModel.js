const connection = require('../config/db');

const CaracteristicasProductos = {
  getAll: (callback) => {
    connection.query('SELECT * FROM caracteristicas_productos', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM caracteristicas_productos WHERE id = ?', [id], callback);
  },
  create: (data, callback) => {
    connection.query('INSERT INTO caracteristicas_productos SET ?', data, callback);
  },
  update: (id, data, callback) => {
    connection.query('UPDATE caracteristicas_productos SET ? WHERE id = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    connection.query('DELETE FROM caracteristicas_productos WHERE id = ?', [id], callback);
  },
  getByProducto: (producto_id, callback) => {
    connection.query('SELECT * FROM caracteristicas_productos WHERE producto_id = ?', [producto_id], callback);
  }
};

module.exports = CaracteristicasProductos;