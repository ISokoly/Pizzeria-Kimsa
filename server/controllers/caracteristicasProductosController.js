const CaracteristicasProductos = require('../models/caracteristicasProductosModel');

exports.getAllCaracteristicasProductos = (req, res) => {
  CaracteristicasProductos.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getCaracteristicasProductosById = (req, res) => {
  const id = req.params.id;
  CaracteristicasProductos.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getCaracteristicasProductosByProducto = (req, res) => {
  CaracteristicasProductos.getByProducto(req.params.producto_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createCaracteristicasProductos = (req, res) => {
  const data = req.body;
  CaracteristicasProductos.create(data, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...data });
  });
};

exports.updateCaracteristicasProductos = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  CaracteristicasProductos.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...data });
  });
};

exports.deleteCaracteristicasProductos = (req, res) => {
  const id = req.params.id;
  CaracteristicasProductos.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Caracteristica de Producto eliminada' });
  });
};
