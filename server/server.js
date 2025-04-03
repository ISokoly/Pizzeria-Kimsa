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
const tempPath = path.join(__dirname, 'uploads', 'temp');  // Carpeta temporal

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pizzeria'
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

app.use('/api', marcaRoutes);
app.use('/api', usuarioRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', productoRoutes);
app.use('/api', tiposMarcaRoutes);

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

    fs.mkdirSync(uploadPath, { recursive: true });
    fs.mkdirSync(tempPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = req.body.nombre || 'imagen';
    const extension = '.jpg';
    cb(null, nombreArchivo + extension);
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se envió una imagen' });
  }

  const tipo = req.body.tipo;
  const categoria = req.body.categoria;
  let imageUrl = `http://localhost:${port}/uploads`;

  const filePath = req.file.path;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    const tempFilePath = path.join(tempPath, req.file.filename);

    if (metadata.height > metadata.width) {
      await image.resize(800, 1200, { fit: 'fill' });
    } else {
      await image.resize(1200, 800, { fit: 'fill' });
    }

    await image.toFile(tempFilePath);

    fs.renameSync(tempFilePath, filePath);

    if (tipo === 'productos' && categoria) {
      imageUrl += `/productos/${categoria}/${req.file.filename}`;
    } else if (tipo === 'categorias') {
      imageUrl += `/categorias/${req.file.filename}`;
    }

    res.json({ filePath: imageUrl });

  } catch (error) {
    console.error('Error al redimensionar la imagen', error);
    return res.status(500).json({ message: 'Error al redimensionar la imagen' });
  }
});


app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
