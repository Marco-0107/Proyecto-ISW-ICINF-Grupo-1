import multer from "multer";

// Configuración de almacenamiento en memoria para postulaciones
const storage = multer.memoryStorage();

// Filtro para aceptar solo archivos que sean .pdf
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true); // Acepta el archivo
  } else {
    cb(new Error("Solo se permiten archivos PDF"), false); // Rechaza el archivo
  }
};

// Configuración de Multer para postulaciones
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB de límite de tamaño por archivo
    files: 10 // Máximo 10 archivos
  },
  fileFilter: fileFilter
});

// Middleware para manejar múltiples archivos
export const uploadArchive = upload.array('archivos', 10);

// Middleware para manejar errores de upload
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: "El tamaño del archivo excede el límite de 5 MB" 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: "Máximo 10 archivos permitidos" 
      });
    }
    return res.status(400).json({ 
      message: "Error al subir archivo: " + err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      message: err.message 
    });
  }
  next();
};
