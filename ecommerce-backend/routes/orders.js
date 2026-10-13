const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { validateRequired, sanitizeString } = require('../utils/validators');

const router = express.Router();

// POST /api/orders  — place order (checkout)
router.post('/', auth, async (req, res, next) => {
    const conn = await pool.getConnection();
    try {
        const { shipping_name, shipping_address, shipping_city, shipping_phone, notes } = req.body;

        const missing = validateRequired(['shipping_name', 'shipping_address', 'shipping_city', 'shipping_phone'], req.body);
        if (missing.length > 0) {
            conn.release();
            return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
        }

        // Get cart items
        const [cartItems] = await conn.execute(
            `SELECT ci.quantity, p.id AS product_id, p.price, p.stock_quantity, p.name
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.user_id = ?`,
            [req.user.id]
        );

        if (cartItems.length === 0) {
            conn.release();
            return res.status(400).json({ success: false, message: 'Your cart is empty.' });
        }

        // Validate stock
        for (const item of cartItems) {
            if (item.stock_quantity < item.quantity) {
                conn.release();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${item.name}". Only ${item.stock_quantity} available.`
                });
            }
        }

        const total_amount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        await conn.beginTransaction();

        // Insert order
        const [orderResult] = await conn.execute(
            `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_address, shipping_city, shipping_phone, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                parseFloat(total_amount.toFixed(2)),
                sanitizeString(shipping_name, 100),
                sanitizeString(shipping_address, 500),
                sanitizeString(shipping_city, 100),
                sanitizeString(shipping_phone, 20),
                sanitizeString(notes || '', 500)
            ]
        );

        const orderId = orderResult.insertId;

        // Insert order items and decrement stock
        for (const item of cartItems) {
            await conn.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await conn.execute(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear cart
        await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

        await conn.commit();
        conn.release();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order_id: orderId,
            total_amount: parseFloat(total_amount.toFixed(2))
        });
    } catch (err) {
        await conn.rollback();
        conn.release();
        next(err);
    }
});

// GET /api/orders  — user's order history
router.get('/', auth, async (req, res, next) => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, COUNT(oi.id) AS item_count
             FROM orders o
             LEFT JOIN order_items oi ON oi.order_id = o.id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );
        res.json({ success: true, data: orders });
    } catch (err) {
        next(err);
    }
});

// GET /api/orders/:id  — single order detail
router.get('/:id', auth, async (req, res, next) => {
    try {
        const [orders] = await pool.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const [items] = await pool.execute(
            `SELECT oi.*, p.name, p.image_url
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        res.json({ success: true, data: { ...orders[0], items } });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
