const Categoria = require('../models/categoriaModel');
const path = require('path');
const fs = require('fs'); 

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

const eliminarImagenHuerfana = (imagen) => {
  const imagenNombre = path.basename(imagen);
  
  const imagenRuta = path.join(__dirname, '../uploads/categorias', imagenNombre);

  if (fs.existsSync(imagenRuta)) {
      fs.unlinkSync(imagenRuta);
  }
};

exports.updateCategoria = (req, res) => {
  const id = req.params.id;
  const data = req.body;

  Categoria.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const categoriaAnterior = results[0];
    if (categoriaAnterior.nombre !== data.nombre) {
      const imagenAnterior = categoriaAnterior.imagen;
      if (imagenAnterior) {
        eliminarImagenHuerfana(imagenAnterior);
      }
    }

    Categoria.update(id, data, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...data });
    });
  });
};

exports.deleteCategoria = (req, res) => {
  const id = req.params.id;

  Categoria.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const imagen = results[0]?.imagen;
    const nombreCategoria = results[0]?.nombre;

    Categoria.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      if (imagen) {
        eliminarImagenHuerfana(imagen);
      }

      if (nombreCategoria) {
        const carpetaProductos = path.join(__dirname, '../uploads/productos', nombreCategoria);
        
        if (fs.existsSync(carpetaProductos)) {
            fs.rmSync(carpetaProductos, { recursive: true, force: true });
        }
      }

      res.json({ message: 'Categoría eliminada' });
    });
  });
};

exports.getCategoriaByNombre = (req, res) => {
  const nombre = req.params.nombre;
  Categoria.getByNombre(nombre, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};