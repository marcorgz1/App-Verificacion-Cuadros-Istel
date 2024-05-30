const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const e = require('express');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'producto_verificacion'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL server.');
});

// Ruta para servir el archivo Excel
app.get('/excel', (req, res) => {
  const filePath = path.join(__dirname, 'verificaciones.xlsx');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('El archivo no existe');
  }
});

// Registro de usuario
app.post('/register', (req, res) => {
  const { nombre_usuario, clave_secreta } = req.body;
  db.query('INSERT INTO usuarios (nombre_usuario, clave_secreta) VALUES (?, ?)', [nombre_usuario, clave_secreta], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});

// Login de usuario
app.post('/login', (req, res) => {
  const { nombre_usuario, clave_secreta } = req.body;
  db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else if (results.length > 0) {
      const user = results[0];
      if (clave_secreta === user.clave_secreta) {
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
      } else {
        res.status(401).send('Invalid credentials');
      }
    } else {
      res.status(404).send('User not found');
    }
  });
});

// Obtener clientes
app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

// Crear nuevo cliente
app.post('/clientes', (req, res) => {
  const { nombre_cliente } = req.body;
  db.query('INSERT INTO clientes (nombre_cliente) VALUES (?)', [nombre_cliente], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});

// Obtener modelos
app.get('/modelos', (req, res) => {
  db.query('SELECT * FROM modelos', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

// Crear nuevo modelo
app.post('/modelos', (req, res) => {
  const { nombre_modelo } = req.body;
  db.query('INSERT INTO modelos (nombre_modelo) VALUES (?)', [nombre_modelo], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }    
  })
})

// Obtener Requisitos

app.get('/requisitos', (req, res) => {
  const { idModelo } = req.params;
  db.query('SELECT * FROM requisitos', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

// Obtener requisitos por modelo
app.get('/requisitos/:idModelo', (req, res) => {
  const { idModelo } = req.params;
  db.query('SELECT * FROM requisitos WHERE id_modelo = ?', [idModelo], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

// Crear nuevo requisito

app.post('/requisitos', (req, res) => {
  const { nombre_requisito } = req.body;
  db.query('INSERT INTO requisitos (nombre_requisito, id_modelo) VALUES (?)', [nombre_requisito], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(result);
    }    
  })
})

// Obtener usuarios
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

// Obtener verificaciones
app.get('/verificaciones', (req, res) => {
  db.query('SELECT * FROM verificaciones', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
})

// Guardar verificación de producto
app.post('/verificaciones', (req, res) => {
  const { id_usuario, id_cliente, id_modelo, numero_cuadro, numero_interruptor, numero_cliente, requisitos_cumplidos, imagenes } = req.body;

  console.log('Datos recibidos para guardar la verificación:', req.body);

  const requisitosCumplidosTodos = Object.values(requisitos_cumplidos).every(value => value) ? 1 : 0;

  const sql = 'INSERT INTO verificaciones (id_usuario, id_cliente, id_modelo, numero_cuadro, numero_interruptor, numero_cliente, requisitos_cumplidos, imagenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [id_usuario, id_cliente, id_modelo, numero_cuadro, numero_interruptor, numero_cliente, requisitosCumplidosTodos, JSON.stringify(imagenes)];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al guardar la verificación en la base de datos:', err);
      res.status(500).send('Error al guardar la verificación');
    } else {
      res.status(200).send(result);
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
