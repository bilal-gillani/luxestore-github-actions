const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust the first proxy (Apache/Nginx reverse proxy)
// Required when behind a reverse proxy that sets X-Forwarded-For
app.set('trust proxy', 1);

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ── Rate Limiting ───────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// ── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'E-Commerce API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// app.get('/api/demo-error', (req, res) => {
//     // This exact string will be picked up by our KQL query
//     console.error("ERROR: Simulated critical production failure for demo purposes.");
//     res.status(500).json({ error: "Simulated Error" });
// });

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 E-Commerce API Server running`);
    console.log(`   Port     : ${PORT}`);
    console.log(`   Env      : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health   : http://localhost:${PORT}/api/health`);
    console.log(`   CORS     : ${process.env.CORS_ORIGIN || '*'}\n`);
});

module.exports = app;
