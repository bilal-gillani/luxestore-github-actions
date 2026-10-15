// ============================================================
// admin/dashboard.js — Admin Dashboard
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAdmin()) return;
    renderAdminNav('dashboard');
    Footer.render('footer');
    await loadStats();
});

async function loadStats() {
    const el = document.getElementById('stats-area');
    el.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;

    try {
        const data = await Api.get('/admin/stats');
        const s = data.data;

        // Stat cards
        document.getElementById('stat-cards').innerHTML = `
            <div class="stat-card stat-accent">
                <div class="stat-icon" style="background:var(--accent-glow);color:var(--accent);">${Icons.dollar}</div>
                <div>
                    <div class="stat-label">Total Revenue</div>
                    <div class="stat-value">${formatPrice(s.total_revenue)}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:var(--info-bg);color:var(--info);">${Icons.box}</div>
                <div>
                    <div class="stat-label">Total Orders</div>
                    <div class="stat-value">${s.total_orders}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:var(--success-bg);color:var(--success);">${Icons.users}</div>
                <div>
                    <div class="stat-label">Customers</div>
                    <div class="stat-value">${s.total_customers}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:rgba(139,92,246,0.12);color:#8B5CF6;">${Icons.bag}</div>
                <div>
                    <div class="stat-label">Products</div>
                    <div class="stat-value">${s.total_products}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:var(--warning-bg);color:var(--warning);">${Icons.clock}</div>
                <div>
                    <div class="stat-label">Pending Orders</div>
                    <div class="stat-value">${s.pending_orders}</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:var(--danger-bg);color:var(--danger);">${Icons.alert}</div>
                <div>
                    <div class="stat-label">Low Stock</div>
                    <div class="stat-value">${s.low_stock}</div>
                </div>
            </div>
        `;

        // Recent orders table
        document.getElementById('recent-orders').innerHTML = s.recent_orders.length === 0
            ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">No orders yet</td></tr>'
            : s.recent_orders.map(o => `
                <tr>
                    <td><strong>#${String(o.id).padStart(6,'0')}</strong></td>
                    <td>${o.customer_name}</td>
                    <td>${formatPrice(o.total_amount)}</td>
                    <td>${statusBadge(o.status)}</td>
                    <td class="text-muted text-sm">${formatDate(o.created_at)}</td>
                </tr>
            `).join('');

        // Top products
        document.getElementById('top-products').innerHTML = s.top_products.length === 0
            ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:30px;">No data yet</td></tr>'
            : s.top_products.map((p, i) => `
                <tr>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-weight:800;color:var(--accent);width:20px;">${i+1}</span>
                            <img src="${p.image_url||''}" alt="${p.name}" 
                                style="width:36px;height:36px;object-fit:cover;border-radius:6px;background:var(--bg-secondary);"
                                onerror="this.style.display='none'">
                            <span style="font-weight:600;font-size:.875rem;">${p.name}</span>
                        </div>
                    </td>
                    <td style="color:var(--text-secondary);">${p.total_sold} sold</td>
                    <td style="font-weight:700;color:var(--accent);">${formatPrice(p.revenue)}</td>
                </tr>
            `).join('');

        el.innerHTML = '';
    } catch (err) {
        el.innerHTML = emptyState(Icons.alert, 'Failed to load stats', err.message);
    }
}

function renderAdminNav(active) {
    AdminNav.render(active);
}
