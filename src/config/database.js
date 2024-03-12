const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'api_auth'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conexión a la base de datos establecida');
});

module.exports = connection;

