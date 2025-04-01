const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.getAllUsuarios = (req, res) => {
  Usuario.getAll((err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
    res.json(results);
  });
};

exports.getUsuarioById = (req, res) => {
  const id = req.params.id;
  Usuario.getById(id, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
    res.json(results[0] || {});
  });
};

exports.createUsuario = (req, res) => {
  const data = req.body;
  Usuario.create(data, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al crear usuario' });
    res.json({ id: results.insertId, ...data });
  });
};

exports.updateUsuario = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  Usuario.update(id, data, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    res.json({ id, ...data });
  });
};

exports.deleteUsuario = (req, res) => {
  const id = req.params.id;
  Usuario.delete(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    res.json({ message: 'Usuario eliminado' });
  });
};

exports.loginUsuario = (req, res) => {
  const { usuario, contrasena } = req.body;

  Usuario.getByUsername(usuario, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = results[0];

    bcrypt.compare(contrasena, user.contrasena, (err, isMatch) => {
      if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });

      if (isMatch) {
        const token = jwt.sign({ id: user.id_usuario, usuario: user.usuario }, 'secreto', { expiresIn: '1h' });

        res.json({ 
          success: true, 
          message: 'Inicio de sesión exitoso', 
          usuario: user, 
          token 
        });
      } else {
        res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }
    });
  });
};
