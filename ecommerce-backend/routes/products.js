const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/products  — public, with filters
router.get('/', async (req, res, next) => {
    try {
        const {
            category,
            search,
            sort = 'created_at',
            order = 'DESC',
            page = 1,
            limit = 12,
            featured
        } = req.query;

        // Use safe integers — do NOT pass LIMIT/OFFSET as prepared stmt params
        // mysql2 sends JS numbers as DOUBLE in binary protocol, MySQL rejects them for LIMIT/OFFSET
        const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 12));
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeOffset = (safePage - 1) * safeLimit;

        const params = [];
        const conditions = [];

        if (category) {
            conditions.push('p.category_id = ?');
            params.push(parseInt(category));
        }
        if (search) {
            conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (featured === 'true') {
            conditions.push('p.featured = 1');
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const allowedSort = { price: 'p.price', name: 'p.name', created_at: 'p.created_at' };
        const sortCol = allowedSort[sort] || 'p.created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) as total FROM products p ${where}`,
            [...params]
        );

        // Embed LIMIT and OFFSET as integer literals — safe because they are parseInt'd above
        const [products] = await pool.execute(
            `SELECT p.*, c.name AS category_name, c.icon AS category_icon
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             ${where}
             ORDER BY ${sortCol} ${sortOrder}
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            params
        );

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: safePage,
                limit: safeLimit,
                totalPages: Math.ceil(total / safeLimit)
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/featured
router.get('/featured', async (req, res, next) => {
    try {
        const [products] = await pool.execute(
            `SELECT p.*, c.name AS category_name, c.icon AS category_icon
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.featured = 1
             ORDER BY p.created_at DESC
             LIMIT 8`
        );
        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, c.name AS category_name, c.icon AS category_icon
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Related products from same category
        const [related] = await pool.execute(
            `SELECT p.*, c.name AS category_name FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.category_id = ? AND p.id != ?
             ORDER BY RAND() LIMIT 4`,
            [rows[0].category_id, req.params.id]
        );

        res.json({ success: true, data: rows[0], related });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
