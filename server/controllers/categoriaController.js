const Categoria = require('../models/categoriaModel');
const path = require('path');
const fs = require('fs'); 
const Producto = require('../models/productoModel');
const pool = require('../config/db')

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
    
    // Si 'marca' es verdadero, también se inserta en 'tipos_marcas'
    if (data.marca) {
      pool.query(
        'INSERT IGNORE INTO tipos_marcas (nombre) VALUES (?)',
        [data.nombre],
        (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: results.insertId, ...data });
        }
      );
    } else {
      res.json({ id: results.insertId, ...data });
    }
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
    const marcaAnterior = categoriaAnterior.marca; // Guardamos el valor de la marca anterior
    const marcaActual = data.marca; // Guardamos el valor de la marca actual

    if (nombreAnterior !== data.nombre && imagenAnterior) {
      actualizarCategoriaConRenombrado(id, data, nombreAnterior, imagenAnterior, res);
    } else {
      actualizarCategoriaNormal(id, data, nombreAnterior, res);
    }

    // Ahora llamamos a la función para manejar los tipos de marcas
    actualizarTiposMarcas(nombreAnterior, data.nombre, marcaAnterior, marcaActual, res);
  });
};

async function actualizarTiposMarcas(nombreAnterior, nuevoNombre, marcaAnterior, marcaActual, res) {
  try {
    // Si la marca pasó de false a true, creamos el tipo de marca si no existe
    if (!marcaAnterior && marcaActual) {
      const [rows] = await pool.promise().query(
        'SELECT * FROM tipos_marcas WHERE nombre = ?',
        [nuevoNombre]
      );

      // Si no existe un tipo de marca con este nombre, lo creamos
      if (rows.length === 0) {
        await pool.promise().query(
          'INSERT INTO tipos_marcas (nombre) VALUES (?)',
          [nuevoNombre]
        );
        console.log('Nuevo tipo de marca creado');
      }
    }

    // Si la marca no cambió o incluso si pasó de true a false, actualizamos el nombre de los tipos de marcas
    await pool.promise().query(
      'UPDATE tipos_marcas SET nombre = ? WHERE nombre = ?',
      [nuevoNombre, nombreAnterior]
    );
    console.log('Tipos de marcas actualizados correctamente');

  } catch (err) {
    console.error('Error al manejar tipos de marcas:', err);
    return res.status(500).json({ error: 'Error al manejar tipos de marcas' });
  }
}


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