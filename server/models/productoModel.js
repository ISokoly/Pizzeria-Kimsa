const connection = require('../config/db');

/**
 * Actualiza la imagen de todos los productos de una categoría.
 * @param {string} nombreAnterior El nombre anterior de la categoría.
 * @param {string} nombreNuevo El nuevo nombre de la categoría.
 * @param {function} callback Función de callback para manejar el resultado.
 */

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
  },
  updateImagenCategoria : (nombreAnterior, nombreNuevo, callback) => {
    const oldUrl = `http://localhost:3000/uploads/productos/${nombreAnterior.replace(/\s+/g, '_')}`;
    const newUrl = `http://localhost:3000/uploads/productos/${nombreNuevo.replace(/\s+/g, '_')}`;
  
    // Actualiza la URL de imagen en todos los productos que pertenezcan a esta categoría
    const query = 'UPDATE productos SET imagen = REPLACE(imagen, ?, ?) WHERE imagen LIKE ?';
    
    connection.query(query, [oldUrl, newUrl, `${oldUrl}%`], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }
};


module.exports = Producto