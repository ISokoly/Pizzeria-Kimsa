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

exports.updateCategoria = (req, res) => {
  const id = req.params.id;
  const data = req.body;

  // Obtener la categoría actual para verificar si el nombre cambió
  Categoria.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Comprobar si el nombre ha cambiado
    const categoriaAnterior = results[0];
    if (categoriaAnterior.nombre !== data.nombre) {
      // Si el nombre ha cambiado, eliminar la imagen anterior
      const imagenAnterior = categoriaAnterior.imagen;
      if (imagenAnterior) {
        eliminarImagenHuerfana(imagenAnterior);
      }
    }

    // Proceder con la actualización de la categoría
    Categoria.update(id, data, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...data });
    });
  });
};

exports.deleteCategoria = (req, res) => {
  const id = req.params.id;

  // Obtener la categoría para ver si tiene imagen antes de eliminarla
  Categoria.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const imagen = results[0]?.imagen;
    const nombreCategoria = results[0]?.nombre;

    // Eliminar la categoría de la base de datos
    Categoria.delete(id, (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Si hay una imagen asociada, eliminarla
      if (imagen) {
        eliminarImagenHuerfana(imagen);
      }

      // Verificar y eliminar la carpeta de productos asociada a la categoría
      if (nombreCategoria) {
        const carpetaProductos = path.join(__dirname, '../uploads/productos', nombreCategoria);
        
        if (fs.existsSync(carpetaProductos)) {
          console.log(`🗑️ Intentando eliminar carpeta de productos: ${carpetaProductos}`);
          try {
            fs.rmSync(carpetaProductos, { recursive: true, force: true }); // Usando fs.rm en lugar de fs.rmdir
            console.log(`🗑️ Carpeta de productos eliminada: ${carpetaProductos}`);
          } catch (error) {
            console.error(`❌ Error al eliminar la carpeta de productos: ${carpetaProductos}`, error);
          }
        } else {
          console.log(`❌ Carpeta de productos no encontrada: ${carpetaProductos}`);
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
