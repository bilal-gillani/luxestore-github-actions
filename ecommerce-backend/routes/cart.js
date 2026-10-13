const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { validateInteger } = require('../utils/validators');

const router = express.Router();

// GET /api/cart
router.get('/', auth, async (req, res, next) => {
    try {
        const [items] = await pool.execute(
            `SELECT ci.id, ci.quantity, ci.created_at,
                    p.id AS product_id, p.name, p.price, p.image_url, p.stock_quantity
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.user_id = ?
             ORDER BY ci.created_at DESC`,
            [req.user.id]
        );

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            data: items,
            summary: {
                item_count: items.length,
                total_items: items.reduce((sum, i) => sum + i.quantity, 0),
                total_amount: parseFloat(total.toFixed(2))
            }
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/cart  — add item
router.post('/', auth, async (req, res, next) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ success: false, message: 'product_id is required.' });
        }
        if (!validateInteger(quantity, 1)) {
            return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
        }

        // Check product exists and has stock
        const [products] = await pool.execute(
            'SELECT id, stock_quantity FROM products WHERE id = ?',
            [product_id]
        );
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        if (products[0].stock_quantity < quantity) {
            return res.status(400).json({ success: false, message: `Only ${products[0].stock_quantity} items in stock.` });
        }

        // Upsert cart item
        await pool.execute(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
            [req.user.id, product_id, parseInt(quantity)]
        );

        res.status(201).json({ success: true, message: 'Item added to cart.' });
    } catch (err) {
        next(err);
    }
});

// PUT /api/cart/:id  — update quantity
router.put('/:id', auth, async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!validateInteger(quantity, 1)) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
        }

        const [items] = await pool.execute(
            'SELECT ci.id, p.stock_quantity FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.id = ? AND ci.user_id = ?',
            [req.params.id, req.user.id]
        );
        if (items.length === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }
        if (items[0].stock_quantity < quantity) {
            return res.status(400).json({ success: false, message: `Only ${items[0].stock_quantity} items in stock.` });
        }

        await pool.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
            [parseInt(quantity), req.params.id, req.user.id]
        );

        res.json({ success: true, message: 'Cart updated.' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/cart/:id  — remove item
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }
        res.json({ success: true, message: 'Item removed from cart.' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/cart  — clear entire cart
router.delete('/', auth, async (req, res, next) => {
    try {
        await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
        res.json({ success: true, message: 'Cart cleared.' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
