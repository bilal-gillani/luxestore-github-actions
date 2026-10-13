// ============================================================
// admin/orders.js — Admin Order Management
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAdmin()) return;
    renderAdminNav('orders');
    await loadOrders();
    setupFilters();
});

let currentStatus = '';

async function loadOrders(status = '') {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = `<tr><td colspan="7"><div class="loading-overlay">${Spinner.html()}</div></td></tr>`;

    try {
        const q = status ? `?status=${status}` : '';
        const data = await Api.get(`/admin/orders${q}`);
        const orders = data.data;

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:40px;">No orders found.</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td><strong>#${String(o.id).padStart(6,'0')}</strong></td>
                <td>
                    <div style="font-weight:600;">${o.customer_name}</div>
                    <div class="text-xs text-muted">${o.customer_email}</div>
                </td>
                <td>${formatPrice(o.total_amount)}</td>
                <td>${o.item_count} item(s)</td>
                <td>${statusBadge(o.status)}</td>
                <td class="text-sm text-muted">${formatDate(o.created_at)}</td>
                <td>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary btn-sm" onclick="viewOrder(${o.id})">👁 View</button>
                        <select class="form-control" style="padding:6px 10px;font-size:.8rem;width:auto;"
                            onchange="updateStatus(${o.id}, this.value)">
                            <option value="">Update…</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:40px;">Failed to load orders.</td></tr>`;
    }
}

async function updateStatus(orderId, status) {
    if (!status) return;
    try {
        await Api.put(`/admin/orders/${orderId}`, { status });
        Toast.success(`Order #${String(orderId).padStart(6,'0')} updated to ${status}.`);
        await loadOrders(currentStatus);
    } catch (err) {
        Toast.error(err.message || 'Failed to update status.');
    }
}

async function viewOrder(orderId) {
    const body = document.getElementById('order-detail-body');
    body.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;
    Modal.open('order-detail-overlay');

    try {
        const data = await Api.get(`/admin/orders/${orderId}`);
        const o = data.data;

        body.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
                <div>
                    <h3>Order #${String(o.id).padStart(6,'0')}</h3>
                    <div class="text-sm text-muted">${formatDate(o.created_at)}</div>
                </div>
                ${statusBadge(o.status)}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                <div class="card" style="padding:16px;">
                    <div class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">Customer</div>
                    <div style="font-size:.875rem;">
                        <div><strong>${o.customer_name}</strong></div>
                        <div class="text-muted">${o.customer_email}</div>
                    </div>
                </div>
                <div class="card" style="padding:16px;">
                    <div class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">Shipping</div>
                    <div style="font-size:.875rem;">
                        <div>${o.shipping_name}</div>
                        <div>${o.shipping_address}, ${o.shipping_city}</div>
                        <div>${o.shipping_phone}</div>
                    </div>
                </div>
            </div>
            <div>
                <div class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px;">Items</div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                            ${o.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatPrice(item.price_at_purchase)}</td>
                                    <td style="color:var(--accent);font-weight:700;">${formatPrice(item.quantity * item.price_at_purchase)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="text-align:right;margin-top:12px;font-size:1.1rem;font-weight:700;">
                    Total: <span style="color:var(--accent);">${formatPrice(o.total_amount)}</span>
                </div>
            </div>
        `;
    } catch {
        body.innerHTML = emptyState('⚠️', 'Failed to load order', '');
    }
}

function setupFilters() {
    document.querySelectorAll('.filter-chip[data-status]').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentStatus = chip.dataset.status;
            loadOrders(currentStatus);
        });
    });
}

function renderAdminNav(active) {
    const user = Auth.getUser();
    const navEl = document.getElementById('navbar');
    if (navEl) {
        navEl.innerHTML = `
            <div class="navbar-inner">
                <a href="/admin/dashboard.html" class="navbar-logo">
                    <div class="navbar-logo-icon">⚙️</div>
                    <span>Luxe<span>Admin</span></span>
                </a>
                <div class="navbar-actions">
                    <a href="/index.html" class="btn btn-ghost btn-sm">🏪 View Store</a>
                    <button class="btn btn-danger btn-sm" onclick="Auth.logout()">Logout</button>
                </div>
            </div>
        `;
    }
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === active);
    });
}
