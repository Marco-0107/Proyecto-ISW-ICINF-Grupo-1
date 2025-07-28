import multer from "multer";
import path from "path";
import fs from "fs";

// Almacena archivos con ruta y nombre únicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tipo = req.body?.tipo || "actas";
    const uploadPath = path.join("src","upload", tipo);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const tipo = req.body?.tipo || "acta"; 
    const entidadId = req.body?.id || "0"; 
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1e6);
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "");
    const uniqueName = `${tipo}_${entidadId}_${timestamp}_${random}${ext}`;
    cb(null, uniqueName);
  }
});

// Acepta solo archivos PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos .pdf"), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Middleware para errores de multer
const handleFileSizeLimit = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "El archivo excede el límite de 5 MB." });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

export { upload, handleFileSizeLimit };
