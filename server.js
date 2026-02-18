const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Headers de seguridad y CSP
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:3000 ws://localhost:3000; frame-src 'self';");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Removido X-Frame-Options para permitir desarrollo
  next();
});

app.use(express.static(path.join(__dirname))); // Servir archivos estáticos desde el directorio raíz

// Ruta raíz - redirigir a login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'assets', 'autos');

    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `auto_${timestamp}${extension}`;
    cb(null, filename);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Endpoint para subir imágenes
app.post('/upload', upload.single('foto'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Devolver la ruta relativa de la imagen
    const imagePath = `assets/autos/${req.file.filename}`;
    res.json({
      success: true,
      imagePath: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener lista de autos (simulando API)
app.get('/api/autos', (req, res) => {
  // Leer autos desde datos simulados o archivo
  try {
    const autosPath = path.join(__dirname, 'js', 'datosFake.js');
    const datosFake = require('./js/datosFake.js');

    // Si hay autos en localStorage simulado, usar esos
    const autosGuardados = fs.readFileSync(path.join(__dirname, 'autos.json'), 'utf8');
    const autos = JSON.parse(autosGuardados);

    res.json(autos);
  } catch (error) {
    // Usar datos por defecto
    const datosFake = require('./js/datosFake.js');
    res.json(datosFake.autos);
  }
});

// Endpoint para guardar autos
app.post('/api/autos', (req, res) => {
  try {
    const autos = req.body;
    fs.writeFileSync(path.join(__dirname, 'autos.json'), JSON.stringify(autos, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar autos' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos desde: ${__dirname}`);
  console.log(`🖼️  Imágenes se guardan en: ${path.join(__dirname, 'assets', 'autos')}`);
});
