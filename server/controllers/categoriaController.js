const Categoria = require('../models/categoriaModel');
const path = require('path');
const fs = require('fs'); 
const Producto = require('../models/productoModel');

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

const renombrarCarpetaProductos = (nombreAnterior, nombreNuevo, callback) => {
  const oldFolderPath = path.join(__dirname, '../uploads/productos', nombreAnterior.replace(/\s+/g, '_'));
  const newFolderPath = path.join(__dirname, '../uploads/productos', nombreNuevo.replace(/\s+/g, '_'));

  if (fs.existsSync(oldFolderPath)) {
    fs.rename(oldFolderPath, newFolderPath, (err) => {
      if (err) {
        return callback({ error: 'Error al renombrar la carpeta de productos' });
      }

      Producto.updateImagenCategoria(nombreAnterior, nombreNuevo, callback);
    });
  } else {
    callback({ error: 'Carpeta de productos no encontrada' });
  }
};

const actualizarCategoriaNormal = (id, data, nombreAnterior, res) => {
  Categoria.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    renombrarCarpetaProductos(nombreAnterior, data.nombre, (err) => {
      if (err) {
        return res.status(500).json({ error: err.error });
      }

      res.json({ id, ...data });
    });
  });
};

const actualizarCategoriaConRenombrado = (id, data, nombreAnterior, imagenAnterior, res) => {
  const nombreImagen = path.basename(imagenAnterior);
  const extension = path.extname(nombreImagen);

  const nuevoNombreImagen = `${data.nombre.replace(/\s+/g, '_')}${extension}`;
  const oldPath = path.join(__dirname, '../uploads/categorias', nombreImagen);
  const newPath = path.join(__dirname, '../uploads/categorias', nuevoNombreImagen);

  fs.rename(oldPath, newPath, (err) => {
    if (!err) {
      data.imagen = `http://localhost:3000/uploads/categorias/${nuevoNombreImagen}`;
    }

    Categoria.update(id, data, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      renombrarCarpetaProductos(nombreAnterior, data.nombre, (err) => {
        if (err) {
          return res.status(500).json({ error: err.error });
        }

        res.json({ id, ...data });
      });
    });
  });
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
    const nombreAnterior = categoriaAnterior.nombre;
    const imagenAnterior = categoriaAnterior.imagen;

    if (nombreAnterior !== data.nombre && imagenAnterior) {
      actualizarCategoriaConRenombrado(id, data, nombreAnterior, imagenAnterior, res);
    } else {
      actualizarCategoriaNormal(id, data, nombreAnterior, res);
    }
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