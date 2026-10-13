const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { validateEmail, validatePassword, validateRequired, sanitizeString } = require('../utils/validators');

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const missing = validateRequired(['name', 'email', 'password'], req.body);
        if (missing.length > 0) {
            return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
        }
        if (!validateEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email address.' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const colors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444'];
        const avatar_color = colors[Math.floor(Math.random() * colors.length)];

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, avatar_color) VALUES (?, ?, ?, ?)',
            [sanitizeString(name, 100), email.toLowerCase(), password_hash, avatar_color]
        );

        const user = { id: result.insertId, email: email.toLowerCase(), role: 'customer' };
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            token,
            user: { id: result.insertId, name: sanitizeString(name, 100), email: email.toLowerCase(), role: 'customer', avatar_color }
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const missing = validateRequired(['email', 'password'], req.body);
        if (missing.length > 0) {
            return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
        }

        const [rows] = await pool.execute(
            'SELECT id, name, email, password_hash, role, phone, address, city, avatar_color FROM users WHERE email = ?',
            [email.toLowerCase()]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken(user);
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        next(err);
    }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { name, phone, address, city } = req.body;
        await pool.execute(
            'UPDATE users SET name = ?, phone = ?, address = ?, city = ? WHERE id = ?',
            [
                sanitizeString(name || req.user.name, 100),
                sanitizeString(phone || '', 20),
                sanitizeString(address || '', 500),
                sanitizeString(city || '', 100),
                req.user.id
            ]
        );
        res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
