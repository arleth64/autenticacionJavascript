const express = require('express');
const app = express();
const authRoutes = require('./routes/auth.routes');

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});