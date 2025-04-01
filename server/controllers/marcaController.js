const Marca = require('../models/marcaModel');

exports.getAllMarcas = (req, res) => {
  Marca.getAll((err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

exports.getMarcaById = (req, res) => {
  const id = req.params.id;
  Marca.getById(id, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
};

exports.createMarca = (req, res) => {
  const data = req.body;
  Marca.create(data, (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, ...data });
  });
};

exports.updateMarca = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Marca.update(id, data, (err) => {
    if (err) throw err;
    res.json({ id, ...data });
  });
};

exports.deleteMarca = (req, res) => {
  const id = req.params.id;
  Marca.delete(id, (err) => {
    if (err) throw err;
    res.json({ message: 'Marca eliminada' });
  });
};