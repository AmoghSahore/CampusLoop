import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// In ES modules, __dirname doesn't exist automatically, so we recreate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Multer storage configuration ──────────────────────────────
// multer is the middleware that handles multipart/form-data (file uploads).
// We configure two things:
//   destination — where to save the file on the server
//   filename    — what to name it (we use Date.now() to avoid collisions)
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../uploads'),
    filename: (_req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

// Only allow image file types — reject anything else before it's saved
const fileFilter = (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});
