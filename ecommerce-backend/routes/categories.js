const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
    try {
        const [categories] = await pool.execute(
            `SELECT c.*, COUNT(p.id) AS product_count
             FROM categories c
             LEFT JOIN products p ON p.category_id = c.id
             GROUP BY c.id
             ORDER BY c.name ASC`
        );
        res.json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
});

// GET /api/categories/:id
router.get('/:id', async (req, res, next) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
