const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const multer = require('multer');
const { jsPDF } = require('jspdf');

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer();

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

app.get('/clientes', (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/modelos', (req, res) => {
  const id_cliente = req.query.clienteId;
  const sql = 'SELECT * FROM modelos WHERE id_cliente = ?';
  db.query(sql, [id_cliente], (err, results) => {
    if (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).send(err);
    } else {
      console.log('Modelos obtenidos:', results);
      res.status(200).json(results);
    }
  });
});

app.get('/requisitos', (req, res) => {
  db.query('SELECT * FROM requisitos', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

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

app.get('/excel', (req, res) => {
  const filePath = path.join(__dirname, 'verificaciones.xlsx');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('El archivo no existe');
  }
});

app.post('/upload-excel', upload.none(), (req, res) => {
  const filePath = path.join(__dirname, 'verificaciones.xlsx');

  let workbook;
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  } else {
    workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[
      'N° Cuadro', 'Cliente', 'Modelo', 'N° Serie interruptor general', 'N° Cliente', 'Operario', 'Requisitos cumplidos', 'Fotos'
    ]]);
    XLSX.utils.book_append_sheet(workbook, ws, 'Verificaciones');
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const newRow = JSON.parse(req.body.newRow);
  XLSX.utils.sheet_add_json(worksheet, [newRow], { skipHeader: true, origin: -1 });

  XLSX.writeFile(workbook, filePath);
  res.status(200).send('Archivo Excel actualizado con éxito');
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});