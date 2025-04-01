const connection = require('../config/db');

const Producto = {
  getAll: (callback) => {
    connection.query('SELECT * FROM productos', callback);
  },
  getById: (id, callback) => {
    connection.query('SELECT * FROM productos WHERE id = ?', [id], callback);
  },

  getByCategoriaNombre: (nombreCategoria, callback) => {
    const query = `
      SELECT p.* FROM productos p 
      JOIN categorias c ON p.id_categoria = c.id 
      WHERE c.nombre = ?`;
    connection.query(query, [nombreCategoria], callback);
  },
  
  create: (data, callback) => {
    connection.query('INSERT INTO productos SET ?', data, callback);
  },
  update: (id, data, callback) => {
    connection.query('UPDATE productos SET ? WHERE id = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    connection.query('DELETE FROM productos WHERE id = ?', [id], callback);
  }
};

module.exports = Producto;