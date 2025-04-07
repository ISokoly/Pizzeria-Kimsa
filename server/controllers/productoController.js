const Producto = require('../models/productoModel');
const path = require('path');
const fs = require('fs'); 
const Categoria = require('../models/categoriaModel');

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


const eliminarImagenHuerfana = (imagen, categoria) => {
  const imagenNombre = path.basename(imagen);
  const imagenRuta = path.join(__dirname, '../uploads/productos/', categoria, imagenNombre);

  if (fs.existsSync(imagenRuta)) {
      fs.unlinkSync(imagenRuta);
  }
};

const actualizarProductoNormal = (id, data, res) => {
  Producto.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, ...data });
  });
};

const actualizarProductoConRenombrado = (id, data, imagenAnterior, categoria, res) => {
  const nombreImagen = path.basename(imagenAnterior);
  const extension = path.extname(nombreImagen);

  // Renombramos la imagen usando el nombre del producto y el id
  const nuevoNombreImagen = `${data.nombre.replace(/\s+/g, ' ').replace(/[^a-zA-Z0-9]/g, '')}-${id}${extension}`;

  const oldPath = path.join(__dirname, '../uploads/productos', categoria, nombreImagen);
  const newPath = path.join(__dirname, '../uploads/productos', categoria, nuevoNombreImagen);

  // Renombramos la imagen en el sistema de archivos
  fs.rename(oldPath, newPath, (err) => {
    if (err) return res.status(500).json({ error: 'Error al renombrar la imagen' });

    // Actualizamos la URL de la imagen en la base de datos
    data.imagen = `http://localhost:3000/uploads/productos/${categoria}/${nuevoNombreImagen}`;

    // Actualizamos el producto en la base de datos
    Producto.update(id, data, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...data });
    });
  });
};


exports.updateProducto = (req, res) => {
  const id = req.params.id;
  const data = req.body;

  Producto.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoAnterior = results[0];
    const nombreAnterior = productoAnterior.nombre;
    const imagenAnterior = productoAnterior.imagen;
    const idCategoria = productoAnterior.id_categoria;

    Categoria.getById(idCategoria, (err, categoriaResults) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!categoriaResults || categoriaResults.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      const categoria = categoriaResults[0]?.nombre;

      if (nombreAnterior !== data.nombre && imagenAnterior) {
        actualizarProductoConRenombrado(id, data, imagenAnterior, categoria, res);
      } else {
        actualizarProductoNormal(id, data, res);
      }
    });
  });
};

exports.deleteProducto = (req, res) => {
  const id = req.params.id;
  
  Producto.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const imagen = results[0]?.imagen;
    const idCategoria = results[0]?.id_categoria;

    Categoria.getById(idCategoria, (err, categoriaResults) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (!categoriaResults || categoriaResults.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      const categoria = categoriaResults[0]?.nombre;

      // Eliminar producto
      Producto.delete(id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        if (imagen && categoria) {
          eliminarImagenHuerfana(imagen, categoria);
        }

        res.json({ message: 'Producto eliminado' });
      });
    });
  });
};
