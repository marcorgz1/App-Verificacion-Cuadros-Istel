const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const multer = require("multer");
const app = express();

app.use(cors());
app.use(express.json());

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Otras configuraciones de Express (body-parser, etc.)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos desde la carpeta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "producto_verificacion",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL server.");
});

app.post('/upload-image', upload.single('image'), (req, res) => {
  if (req.file) {
    const newFileName = `${req.file.filename}.jpg`;
    const newPath = path.join(__dirname, 'uploads', newFileName);
    fs.rename(req.file.path, newPath, (err) => {
      if (err) {
        return res.status(500).send('Error al renombrar la imagen');
      }
      res.status(200).json({ fileName: newFileName });
    });
  } else {
    res.status(400).send('Error al subir la imagen');
  }
});

// Rutas de autenticación y registro de usuarios
app.post("/register", (req, res) => {
  const { nombre_usuario, clave_secreta } = req.body;
  db.query(
    "INSERT INTO usuarios (nombre_usuario, clave_secreta) VALUES (?, ?)",
    [nombre_usuario, clave_secreta],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(result);
      }
    }
  );
});

app.post("/login", (req, res) => {
  const { nombre_usuario, clave_secreta } = req.body;
  db.query(
    "SELECT * FROM usuarios WHERE nombre_usuario = ?",
    [nombre_usuario],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else if (results.length > 0) {
        const user = results[0];
        if (clave_secreta === user.clave_secreta) {
          const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
            expiresIn: "1h",
          });
          res.status(200).json({ token });
        } else {
          res.status(401).send("Invalid credentials");
        }
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

app.post("/admin-login", (req, res) => {
  const { nombre_admin, contraseña } = req.body;
  db.query(
    "SELECT * FROM administrador WHERE nombre_admin = ? AND contraseña = ?",
    [nombre_admin, contraseña],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else if (results.length > 0) {
        const token = jwt.sign({ id: results[0].id }, "secret_key", {
          expiresIn: "1h",
        });
        res.status(200).json({ token });
      } else {
        res.status(401).send("Invalid credentials");
      }
    }
  );
});

// Ruta para obtener los nombres de las columnas de una tabla específica
app.get("/columns/:tableName", (req, res) => {
  const { tableName } = req.params;
  const sql = `SHOW COLUMNS FROM ??`;
  db.query(sql, [tableName], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      const columns = results.map((column) => column.Field);
      res.status(200).json(columns);
    }
  });
});

// Rutas para administradores
app.get("/administrador", (req, res) => {
  db.query("SELECT * FROM administrador", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

app.post("/administrador", (req, res) => {
  const { nombre_admin, contraseña } = req.body;
  db.query(
    "INSERT INTO administrador (nombre_admin, contraseña) VALUES (?, ?)",
    [nombre_admin, contraseña],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send("Administrador creado");
      }
    }
  );
});

app.put("/administrador/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_admin, contraseña } = req.body;
  db.query(
    "UPDATE administrador SET nombre_admin = ?, contraseña = ? WHERE id = ?",
    [nombre_admin, contraseña, id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send("Administrador actualizado");
      }
    }
  );
});

app.delete("/administrador/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM administrador WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Administrador eliminado");
    }
  });
});

// Rutas para clientes
app.get("/clientes", (req, res) => {
  db.query("SELECT * FROM clientes", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

app.post("/clientes", (req, res) => {
  const { nombre_cliente } = req.body;
  db.query(
    "INSERT INTO clientes (nombre_cliente) VALUES (?)",
    [nombre_cliente],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send("Cliente creado");
      }
    }
  );
});

app.put("/clientes/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_cliente } = req.body;
  db.query(
    "UPDATE clientes SET nombre_cliente = ? WHERE id = ?",
    [nombre_cliente, id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send("Cliente actualizado");
      }
    }
  );
});

app.delete("/clientes/:id", (req, res) => {
  const { id } = req.params;

  // Primero, eliminar los modelos asociados al cliente
  db.query("DELETE FROM modelos WHERE id_cliente = ?", [id], (err, results) => {
    if (err) {
      console.error("Error al eliminar modelos asociados:", err); // Registro detallado del error
      res.status(500).send(err);
    } else {
      // Luego, eliminar el cliente
      db.query("DELETE FROM clientes WHERE id = ?", [id], (err, results) => {
        if (err) {
          console.error("Error al eliminar el cliente:", err); // Registro detallado del error
          res.status(500).send(err);
        } else {
          res.status(200).send("Cliente eliminado");
        }
      });
    }
  });
});

// Rutas para modelos
app.get("/modelos", (req, res) => {
  const id_cliente = req.query.clienteId;
  const sql = "SELECT * FROM modelos WHERE id_cliente = ?";
  db.query(sql, [id_cliente], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/admin/modelos", (req, res) => {
  const sql = "SELECT * FROM modelos";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

// Ruta para crear modelos con imagen
app.post("/modelos", upload.single("imagen"), (req, res) => {
  const { nombre_modelo, id_cliente } = req.body;
  const imageName = req.file ? req.file.filename : null; // Obtener el nombre del archivo subido
  db.query(
    "INSERT INTO modelos (nombre_modelo, id_cliente, imagen) VALUES (?, ?, ?)",
    [nombre_modelo, id_cliente, imageName],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send("Modelo creado");
      }
    }
  );
});

app.put("/modelos/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_modelo, id_cliente } = req.body;
  db.query(
    "UPDATE modelos SET nombre_modelo = ?, id_cliente = ? WHERE id = ?",
    [nombre_modelo, id_cliente, id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send("Modelo actualizado");
      }
    }
  );
});

app.delete("/modelos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM modelos WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Modelo eliminado");
    }
  });
});

// Rutas para requisitos
app.get("/requisitos", (req, res) => {
  db.query("SELECT * FROM requisitos", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

app.get("/requisitos/:idModelo", (req, res) => {
  const { idModelo } = req.params;
  db.query(
    "SELECT * FROM requisitos WHERE id_modelo = ?",
    [idModelo],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(results);
      }
    }
  );
});

app.post("/requisitos", (req, res) => {
  const { id_modelo, nombre_requisito } = req.body;
  db.query(
    "INSERT INTO requisitos (id_modelo, nombre_requisito) VALUES (?, ?)",
    [id_modelo, nombre_requisito],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send("Requisito creado");
      }
    }
  );
});

app.put("/requisitos/:id", (req, res) => {
  const { id } = req.params;
  const { id_modelo, nombre_requisito } = req.body;
  db.query(
    "UPDATE requisitos SET id_modelo = ?, nombre_requisito = ? WHERE id = ?",
    [id_modelo, nombre_requisito, id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send("Requisito actualizado");
      }
    }
  );
});

app.delete("/requisitos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM requisitos WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Requisito eliminado");
    }
  });
});

// Rutas para usuarios
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(results);
    }
  });
});

app.post("/usuarios", (req, res) => {
  const { nombre_usuario, clave_secreta, recuerdame } = req.body;
  db.query(
    "INSERT INTO usuarios (nombre_usuario, clave_secreta, recuerdame) VALUES (?, ?, ?)",
    [nombre_usuario, clave_secreta, recuerdame],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send("Usuario creado");
      }
    }
  );
});

app.put("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_usuario, clave_secreta, recuerdame } = req.body;
  db.query(
    "UPDATE usuarios SET nombre_usuario = ?, clave_secreta = ?, recuerdame = ? WHERE id = ?",
    [nombre_usuario, clave_secreta, recuerdame, id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send("Usuario actualizado");
      }
    }
  );
});

app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  // Primero, eliminar las verificaciones asociadas al usuario
  db.query(
    "DELETE FROM verificaciones WHERE id_usuario = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al eliminar verificaciones asociadas:", err); // Registro detallado del error
        res.status(500).send(err);
      } else {
        // Luego, eliminar el usuario
        db.query("DELETE FROM usuarios WHERE id = ?", [id], (err, results) => {
          if (err) {
            console.error("Error al eliminar el usuario:", err); // Registro detallado del error
            res.status(500).send(err);
          } else {
            res.status(200).send("Usuario eliminado");
          }
        });
      }
    }
  );
});

app.get('/verificaciones', (req, res) => {
  const sql = `
      SELECT v.*, u.nombre_usuario, c.nombre_cliente, m.nombre_modelo
      FROM verificaciones v
      LEFT JOIN usuarios u ON v.id_usuario = u.id
      LEFT JOIN clientes c ON v.id_cliente = c.id
      LEFT JOIN modelos m ON v.id_modelo = m.id
  `;
  db.query(sql, (err, results) => {
      if (err) {
          res.status(500).send(err);
      } else {
          res.status(200).json(results);
      }
  });
});

app.post("/verificaciones", (req, res) => {
  const {
    id_usuario,
    id_cliente,
    id_modelo,
    numero_cuadro,
    numero_interruptor,
    numero_cliente,
    numero_cliente2,
    numero_cliente3,
    numero_cliente4,
    numero_cliente5,
    requisitos_cumplidos,
    imagenes,
    fecha,
  } = req.body;

  const cantidadRequisitosCumplidos = Object.values(
    requisitos_cumplidos
  ).filter((value) => value).length;
  const fechaActual = fecha || new Date().toISOString();

  const sql = `
      INSERT INTO verificaciones (
          id_usuario, id_cliente, id_modelo,
          numero_cuadro, numero_interruptor,
          numero_cliente, numero_cliente2,
          numero_cliente3, numero_cliente4,
          numero_cliente5, requisitos_cumplidos, imagenes, fecha
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    id_usuario || null,
    id_cliente || null,
    id_modelo || null,
    numero_cuadro || "",
    numero_interruptor || "",
    numero_cliente || "",
    numero_cliente2 || "",
    numero_cliente3 || "",
    numero_cliente4 || "",
    numero_cliente5 || "",
    cantidadRequisitosCumplidos,
    imagenes ? JSON.stringify(imagenes) : null,
    fechaActual,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(
        "Error al guardar la verificación en la base de datos:",
        err
      );
      res.status(500).send("Error al guardar la verificación");
    } else {
      res.status(200).send(result);
    }
  });
});

app.put("/verificaciones/:id", (req, res) => {
  const { id } = req.params;
  const {
    id_usuario,
    id_cliente,
    id_modelo,
    numero_cuadro,
    numero_interruptor,
    numero_cliente,
    numero_cliente2,
    numero_cliente3,
    numero_cliente4,
    numero_cliente5,
    requisitos_cumplidos,
    imagenes,
    fecha,
  } = req.body;

  const cantidadRequisitosCumplidos = Object.values(
    requisitos_cumplidos
  ).filter((value) => value).length;
  const fechaActual = fecha || new Date().toISOString();

  const sql = `
    UPDATE verificaciones SET
      id_usuario = ?, id_cliente = ?, id_modelo = ?,
      numero_cuadro = ?, numero_interruptor = ?,
      numero_cliente = ?, numero_cliente2 = ?,
      numero_cliente3 = ?, numero_cliente4 = ?,
      numero_cliente5 = ?, requisitos_cumplidos = ?, imagenes = ?, fecha = ?
    WHERE id = ?
  `;
  const values = [
    id_usuario,
    id_cliente,
    id_modelo,
    numero_cuadro,
    numero_interruptor,
    numero_cliente,
    numero_cliente2,
    numero_cliente3,
    numero_cliente4,
    numero_cliente5,
    cantidadRequisitosCumplidos,
    imagenes ? JSON.stringify(imagenes.split(',')) : null, // Convertir a JSON
    fechaActual,
    id,
  ];

  db.query(sql, values, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Verificación actualizada");
    }
  });
});

app.delete("/verificaciones/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM verificaciones WHERE id = ?", [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("Verificación eliminada");
    }
  });
});

// Ruta para obtener un elemento específico
app.get("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const sql = `SELECT * FROM ${type} WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
