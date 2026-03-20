import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { validateRuntimeEnv } from './config/env.js';

// ── Route imports (added stage by stage) ────────────────────
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import uploadRoutes from './routes/upload.js';
import messageRoutes from './routes/messages.js';
import wishlistRoutes from './routes/wishlist.js';
import reportRoutes from './routes/reports.js';
import appealRoutes from './routes/appeals.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// ── Global middleware ────────────────────────────────────────
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);   // /api/products  +  /api/listings
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api', uploadRoutes);    // /api/upload-image
app.use('/api/messages', messageRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    if (err?.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Image file is too large. Maximum allowed size is 5 MB.' });
        }
        return res.status(400).json({ message: err.message || 'Invalid file upload request' });
    }

    if (err?.message === 'Only image files are allowed') {
        return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────
const start = async () => {
    validateRuntimeEnv();
    await testConnection();
    app.listen(PORT, () => {
        console.log(`🚀 CampusLoop backend running on port ${PORT}`);
    });
};

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
