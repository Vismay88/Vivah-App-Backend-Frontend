const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth.middleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types — checked against actual content type, not just extension
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sanitise user ID — must be a valid MongoDB ObjectId
    const userId = req.user._id.toString();
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      return cb(new Error('Invalid user ID'));
    }
    const dir = path.join(uploadDir, userId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate a safe filename — never use original filename
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);
  const extOk  = ALLOWED_EXTENSIONS.has(ext);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG, GIF, WebP) and videos (MP4, MOV) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10,                   // max 10 files per request
  },
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'Too many files. Maximum 10 per upload.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

router.post('/single', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const userId = req.user._id.toString();
    const fileUrl = `/uploads/${userId}/${req.file.filename}`;
    res.json({ success: true, url: fileUrl, filename: req.file.filename });
  });
});

router.post('/multiple', protect, (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const userId = req.user._id.toString();
    const files = req.files.map((f) => ({
      url: `/uploads/${userId}/${f.filename}`,
      filename: f.filename,
      type: f.mimetype.startsWith('video') ? 'video' : 'image',
    }));
    res.json({ success: true, files });
  });
});

module.exports = router;
