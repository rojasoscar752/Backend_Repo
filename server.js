const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Almacenamiento de datos en memoria
let citas = [];

// Configuración de multer para almacenamiento de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Middleware para procesar JSON
app.use(express.json());

// Crear cita médica
app.post('/crear-cita', upload.single('foto'), (req, res) => {
  const { cc, fecha } = req.body;
  const fotoPath = req.file.path;
  const codigoCita = uuidv4();

  const nuevaCita = {
    codigo: codigoCita,
    cc,
    fecha,
    foto: fotoPath,
    cancelada: false
  };

  citas.push(nuevaCita);

  res.json({ mensaje: 'Cita creada', codigo: codigoCita });
});

// Consultar citas en un rango de fechas
app.get('/consultar-citas', (req, res) => {
  const { fechaInicio, fechaFin } = req.query;

  const citasFiltradas = citas.filter(cita => {
    return new Date(cita.fecha) >= new Date(fechaInicio) &&
           new Date(cita.fecha) <= new Date(fechaFin);
  });

  res.json(citasFiltradas);
});

// Cancelar cita
app.delete('/cancelar-cita/:codigo', (req, res) => {
  const { codigo } = req.params;

  const cita = citas.find(cita => cita.codigo === codigo);
  if (cita) {
    cita.cancelada = true;
    res.json({ mensaje: 'Cita cancelada' });
  } else {
    res.status(404).json({ mensaje: 'Cita no encontrada' });
  }
});

// Servir las fotos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
