const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateRequired, sanitizeString, validatePositiveNumber, validateInteger } = require('../utils/validators');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, admin);

// ── Dashboard Stats ─────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
    try {
        const [[{ total_orders }]] = await pool.execute('SELECT COUNT(*) AS total_orders FROM orders');
        const [[{ total_revenue }]] = await pool.execute("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != 'cancelled'");
        const [[{ total_customers }]] = await pool.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'");
        const [[{ total_products }]] = await pool.execute('SELECT COUNT(*) AS total_products FROM products');
        const [[{ pending_orders }]] = await pool.execute("SELECT COUNT(*) AS pending_orders FROM orders WHERE status = 'pending'");
        const [[{ low_stock }]] = await pool.execute('SELECT COUNT(*) AS low_stock FROM products WHERE stock_quantity <= 5');

        const [orders_by_status] = await pool.execute(
            'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
        );
        const [recent_orders] = await pool.execute(
            `SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS customer_name
             FROM orders o JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC LIMIT 10`
        );
        const [top_products] = await pool.execute(
            `SELECT p.id, p.name, p.price, p.image_url,
                    COALESCE(SUM(oi.quantity), 0) AS total_sold,
                    COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) AS revenue
             FROM products p
             LEFT JOIN order_items oi ON oi.product_id = p.id
             GROUP BY p.id
             ORDER BY total_sold DESC
             LIMIT 5`
        );
        const [monthly_revenue] = await pool.execute(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                    SUM(total_amount) AS revenue,
                    COUNT(*) AS orders
             FROM orders
             WHERE status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month
             ORDER BY month ASC`
        );

        res.json({
            success: true,
            data: {
                total_orders, total_revenue: parseFloat(total_revenue),
                total_customers, total_products, pending_orders, low_stock,
                orders_by_status, recent_orders, top_products, monthly_revenue
            }
        });
    } catch (err) {
        next(err);
    }
});

// ── Product Management ──────────────────────────────────────────────────────

// POST /api/admin/products
router.post('/products', async (req, res, next) => {
    try {
        const { category_id, name, description, price, stock_quantity, image_url, featured } = req.body;

        const missing = validateRequired(['name', 'price'], req.body);
        if (missing.length > 0) {
            return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
        }
        if (!validatePositiveNumber(price)) {
            return res.status(400).json({ success: false, message: 'Price must be a positive number.' });
        }

        const [result] = await pool.execute(
            `INSERT INTO products (category_id, name, description, price, stock_quantity, image_url, featured)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id || null,
                sanitizeString(name, 255),
                sanitizeString(description || '', 2000),
                parseFloat(price),
                parseInt(stock_quantity) || 0,
                sanitizeString(image_url || '', 500),
                featured ? 1 : 0
            ]
        );

        res.status(201).json({ success: true, message: 'Product created.', id: result.insertId });
    } catch (err) {
        next(err);
    }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res, next) => {
    try {
        const { category_id, name, description, price, stock_quantity, image_url, featured } = req.body;

        const [existing] = await pool.execute('SELECT id FROM products WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        await pool.execute(
            `UPDATE products SET category_id=?, name=?, description=?, price=?, stock_quantity=?, image_url=?, featured=?
             WHERE id=?`,
            [
                category_id || null,
                sanitizeString(name, 255),
                sanitizeString(description || '', 2000),
                parseFloat(price),
                parseInt(stock_quantity) || 0,
                sanitizeString(image_url || '', 500),
                featured ? 1 : 0,
                req.params.id
            ]
        );

        res.json({ success: true, message: 'Product updated.' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
    try {
        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
        next(err);
    }
});

// ── Category Management ─────────────────────────────────────────────────────

// POST /api/admin/categories
router.post('/categories', async (req, res, next) => {
    try {
        const { name, description, icon } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }
        const [result] = await pool.execute(
            'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
            [sanitizeString(name, 100), sanitizeString(description || '', 500), sanitizeString(icon || '📦', 10)]
        );
        res.status(201).json({ success: true, message: 'Category created.', id: result.insertId });
    } catch (err) {
        next(err);
    }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res, next) => {
    try {
        const { name, description, icon } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }
        const [result] = await pool.execute(
            'UPDATE categories SET name=?, description=?, icon=? WHERE id=?',
            [sanitizeString(name, 100), sanitizeString(description || '', 500), sanitizeString(icon || '📦', 10), req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.json({ success: true, message: 'Category updated.' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res, next) => {
    try {
        const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }
        res.json({ success: true, message: 'Category deleted.' });
    } catch (err) {
        next(err);
    }
});

// ── Order Management ────────────────────────────────────────────────────────

// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        // Use safe integer literals — do NOT pass LIMIT/OFFSET as prepared stmt params
        const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeOffset = (safePage - 1) * safeLimit;
        const params = [];
        let where = '';

        if (status) {
            where = 'WHERE o.status = ?';
            params.push(status);
        }

        const [[{ total }]] = await pool.execute(
            `SELECT COUNT(*) AS total FROM orders o ${where}`,
            [...params]
        );

        // Embed LIMIT and OFFSET as integer literals — safe because they are parseInt'd above
        const [orders] = await pool.execute(
            `SELECT o.*, u.name AS customer_name, u.email AS customer_email,
                    COUNT(oi.id) AS item_count
             FROM orders o
             JOIN users u ON u.id = o.user_id
             LEFT JOIN order_items oi ON oi.order_id = o.id
             ${where}
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
            params
        );

        res.json({
            success: true,
            data: orders,
            pagination: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) }
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/admin/orders/:id  — update status
router.put('/orders/:id', async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true, message: 'Order status updated.' });
    } catch (err) {
        next(err);
    }
});

// GET /api/admin/orders/:id — order detail
router.get('/orders/:id', async (req, res, next) => {
    try {
        const [orders] = await pool.execute(
            `SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM orders o JOIN users u ON u.id = o.user_id
             WHERE o.id = ?`,
            [req.params.id]
        );
        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        const [items] = await pool.execute(
            `SELECT oi.*, p.name, p.image_url FROM order_items oi
             JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
            [req.params.id]
        );
        res.json({ success: true, data: { ...orders[0], items } });
    } catch (err) {
        next(err);
    }
});

// ── Customer Management ─────────────────────────────────────────────────────

// GET /api/admin/customers
router.get('/customers', async (req, res, next) => {
    try {
        const [customers] = await pool.execute(
            `SELECT u.id, u.name, u.email, u.phone, u.city, u.role, u.avatar_color, u.created_at,
                    COUNT(o.id) AS order_count,
                    COALESCE(SUM(o.total_amount), 0) AS total_spent
             FROM users u
             LEFT JOIN orders o ON o.user_id = u.id
             WHERE u.role = 'customer'
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );
        res.json({ success: true, data: customers });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
