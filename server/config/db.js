const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia por tu usuario
  password: '', // Cambia por tu contraseña
  database: 'pizzeria' // Base de datos `pizzeria`
});

connection.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

module.exports = connection;