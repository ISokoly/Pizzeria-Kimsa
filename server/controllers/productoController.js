const Producto = require('../models/productoModel');

exports.getAllProductos = (req, res) => {
  Producto.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results); // Enviar los productos tal cual, sin convertir imágenes
  });
};

exports.getProductoById = (req, res) => {
  const id = req.params.id;
  Producto.getById(id, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

exports.getByCategoriaNombre = (req, res) => {
  const nombreCategoria = req.params.nombreCategoria;

  Producto.getByCategoriaNombre(nombreCategoria, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results); // Enviar los productos sin modificar la imagen
  });
};

exports.createProducto = (req, res) => {
  const data = req.body;
  Producto.create(data, (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, ...data });
  });
};

exports.updateProducto = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Producto.update(id, data, (err) => {
    if (err) throw err;
    res.json({ id, ...data });
  });
};

exports.deleteProducto = (req, res) => {
  const id = req.params.id;
  Producto.delete(id, (err) => {
    if (err) throw err;
    res.json({ message: 'Producto eliminado' });
  });
};