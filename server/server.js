const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const path = require('path'); // <-- Asegúrate de importar esto
const fs = require('fs'); 
const sharp = require('sharp');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

connection.connect(async (err) => {
  if (err) throw err;
  await connection.promise().query('CREATE DATABASE IF NOT EXISTS pizzeria');

  console.log('✅ Base de datos `pizzeria` creada o ya existe');

  await connection.promise().query('USE pizzeria');
  console.log('✅ Usando base de datos `pizzeria`');

  const queries = [
    
    `CREATE TABLE IF NOT EXISTS tipos_marcas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      imagen TEXT NULL,
      marca BOOLEAN DEFAULT FALSE
    )`,
    `CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      apellido VARCHAR(255) NOT NULL,
      dni VARCHAR(8) NOT NULL UNIQUE,
      telefono VARCHAR(9) NOT NULL,
      direccion TEXT NOT NULL,
      rol ENUM('Administrador', 'Empleado') NOT NULL,
      usuario VARCHAR(255) NOT NULL UNIQUE,
      contrasena VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS marcas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      tipos_marcas INT NOT NULL,
      FOREIGN KEY (tipos_marcas) REFERENCES tipos_marcas(id)
    )`,

    `CREATE TABLE IF NOT EXISTS productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10, 2) NOT NULL,
      id_marca INT,
      id_categoria INT NOT NULL,
      imagen TEXT NULL,
      FOREIGN KEY (id_categoria) REFERENCES categorias(id),
      FOREIGN KEY (id_marca) REFERENCES marcas(id) ON DELETE SET NULL
    )`,

    `CREATE TABLE IF NOT EXISTS caracteristicas_productos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      producto_id INT NOT NULL,
      nombre_caracteristica VARCHAR(100) NOT NULL,
      valor_caracteristica VARCHAR(255) NOT NULL,
      FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
      )`
  ];

  for (const query of queries) {
    await connection.promise().query(query);
  }
  console.log('✅ Tablas creadas o ya existen');

  // Verificar si hay usuarios registrados
  const [users] = await connection.promise().query('SELECT COUNT(*) AS count FROM usuarios');
  if (users[0].count === 0) {
    console.log('⚠️  No hay usuarios en la base de datos. Creando usuario por defecto...');

    const hashedPassword = await bcrypt.hash('password', 10);
    const adminUser = {
      nombre: 'Admin',
      apellido: 'User',
      dni: '00000000',
      telefono: '999999999',
      direccion: 'Dirección Admin',
      rol: 'Administrador',
      usuario: 'admin',
      contrasena: hashedPassword
    };

    await connection.promise().query('INSERT INTO usuarios SET ?', adminUser);
    console.log('✅ Usuario administrador creado por defecto: admin/password');
  } else {
    console.log('✅ Ya existen usuarios en la base de datos.');
  }
});

// Rutas API
const marcaRoutes = require('./routes/marcaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const tiposMarcaRoutes = require('./routes/tiposMarcaRoutes');
const caracteristicaProductosRoutes = require('./routes/caracteristicaProductosRoutes');

app.use('/api', marcaRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', productoRoutes);
app.use('/api', tiposMarcaRoutes);
app.use('/api', caracteristicaProductosRoutes);

const tempPath = path.join(__dirname, 'uploads/temp');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = req.body.tipo;
    const categoria = req.body.categoria;

    let uploadPath = 'uploads';
    if (tipo === 'productos' && categoria) {
      uploadPath = `uploads/productos/${categoria}`;
    } else if (tipo === 'categorias') {
      uploadPath = 'uploads/categorias';
    }

    fs.mkdirSync(uploadPath, { recursive: true }); // Aseguramos que la ruta exista
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const nombreArchivoBase = req.body.nombre || 'imagen';
    const tipo = req.body.tipo;
    const categoria = req.body.categoria || 'sin_categoria';
    const extension = '.jpg';
    let uploadPath = 'uploads';

    if (tipo === 'productos' && categoria) {
      uploadPath = `uploads/productos/${categoria}`;
    } else if (tipo === 'categorias') {
      uploadPath = 'uploads/categorias';
    }

    let count = 1;
    let finalName = `${nombreArchivoBase}-${count}${extension}`;
    let fullPath = path.join(uploadPath, finalName);

    // Si estamos actualizando la imagen
    if (req.body.isUpdate === 'true') {
      const productoId = req.body.productoId; // Asegúrate de que se pase correctamente el productoId
      const imagenAnterior = `${nombreArchivoBase}-${productoId}${extension}`;
      const imagenAnteriorRuta = path.join(uploadPath, imagenAnterior);

      // Verificar si la imagen anterior existe
      if (fs.existsSync(imagenAnteriorRuta)) {
        // Eliminar la imagen anterior
        fs.unlinkSync(imagenAnteriorRuta);

        // Renombrar la nueva imagen con el productoId
        finalName = `${nombreArchivoBase}-${productoId}${extension}`;
        fullPath = path.join(uploadPath, finalName);
      }
    } else {
      // Si no estamos actualizando, solo asignamos el nombre con un contador si ya existe
      while (fs.existsSync(fullPath)) {
        count++;
        finalName = `${nombreArchivoBase}-${count}${extension}`;
        fullPath = path.join(uploadPath, finalName);
      }
    }

    cb(null, finalName);
  }
});



const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió una imagen' });
    }

    const { tipo, categoria } = req.body;
    const filename = req.file.filename;
    const filePath = req.file.path;
    const tempFilePath = path.join(tempPath, filename);

    let imageUrl = `http://localhost:${port}/uploads`;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const resizedImage = metadata.height > metadata.width
      ? image.resize(800, 1200, { fit: 'fill' })
      : image.resize(1200, 800, { fit: 'fill' });

    await resizedImage.toFile(tempFilePath);
    fs.renameSync(tempFilePath, filePath);

    if (tipo === 'productos' && categoria) {
      imageUrl += `/productos/${categoria}/${filename}`;
    } else if (tipo === 'categorias') {
      imageUrl += `/categorias/${filename}`;
    }

    res.json({ filePath: imageUrl });

  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ message: 'Error al procesar la imagen' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
