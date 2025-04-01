const Categoria = require('../models/categoriaModel');

exports.getAllCategorias = (req, res) => {
  Categoria.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
};

exports.getCategoriaById = (req, res) => {
  const id = req.params.id;
  Categoria.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.createCategoria = (req, res) => {
  const data = req.body;
  Categoria.create(data, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: results.insertId, ...data });
  });
};

exports.updateCategoria = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Categoria.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...data });
  });
};

exports.deleteCategoria = (req, res) => {
  const id = req.params.id;
  Categoria.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Categoría eliminada' });
  });
};

exports.getCategoriaByNombre = (req, res) => {
  const nombre = req.params.nombre;
  Categoria.getByNombre(nombre, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
