const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/database');

const SECRET_KEY = 'clavesegura';

exports.register = (req, res) => {
  const { username, password, role } = req.body;

  // Verificar si el usuario ya existe
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Hashear la contraseña
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insertar el nuevo usuario en la base de datos
    connection.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
      if (err) throw err;
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Buscar el usuario en la base de datos
  connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = results[0];

    // Verificar la contraseña
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar el token JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  });
};

exports.profile = (req, res) => {
  // Verificar el token JWT
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No estás autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { userId, role } = decoded;

    // Buscar el usuario en la base de datos
    connection.query('SELECT username, role FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const { username, role } = results[0];
      res.json({ username, role });
    });
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};