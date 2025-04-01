const TiposMarca = require('../models/tiposMarcaModel');

exports.getAllTiposMarcas = (req, res) => {
  TiposMarca.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getTiposMarcaByNombre = (req, res) => {
  TiposMarca.getByNombre(req.params.nombre, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createTiposMarca = (req, res) => {
  const data = req.body;
  TiposMarca.create(data, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...data });
  });
};

exports.updateTiposMarca = (req, res) => {
  const nombre = req.params.nombre;
  const data = req.body;
  TiposMarca.update(nombre, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ nombre, ...data });
  });
};

exports.deleteTiposMarca = (req, res) => {
  const nombre = req.params.nombre;
  TiposMarca.delete(nombre, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Tipo de Marca eliminada' });
  });
};
