import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';

// ── Route imports (added stage by stage) ────────────────────
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import uploadRoutes from './routes/upload.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────
const start = async () => {
    await testConnection();
    app.listen(PORT, () => {
        console.log(`🚀 CampusLoop backend running on port ${PORT}`);
    });
};

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
