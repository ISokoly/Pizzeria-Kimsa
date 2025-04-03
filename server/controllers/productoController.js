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
    console.log(`🗑️ Intentando eliminar imagen: ${imagenRuta}`);
    try {
      fs.unlinkSync(imagenRuta);
      console.log(`🗑️ Imagen huérfana eliminada: ${imagenRuta}`);
    } catch (error) {
      console.error(`❌ Error al eliminar imagen: ${imagenRuta}`, error);
    }
  } else {
    console.log(`❌ Imagen no encontrada: ${imagenRuta}`);
  }
};

exports.updateProducto = (req, res) => {
  const id = req.params.id;
  const data = req.body;

  // Obtener el producto actual para verificar si el nombre ha cambiado
  Producto.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoAnterior = results[0];
    const imagenAnterior = productoAnterior.imagen;
    const idCategoria = productoAnterior.id_categoria;

    // Obtener la categoría actual
    Categoria.getById(idCategoria, (err, categoriaResults) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!categoriaResults || categoriaResults.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      const categoria = categoriaResults[0]?.nombre;

      // Comprobar si el nombre ha cambiado
      if (productoAnterior.nombre !== data.nombre) {
        // Si el nombre ha cambiado, eliminar la imagen anterior solo si existe
        if (imagenAnterior && categoria) {
          eliminarImagenHuerfana(imagenAnterior, categoria);
        }
      }

      // Proceder con la actualización del producto
      Producto.update(id, data, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, ...data });
      });
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
