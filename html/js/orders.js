// ============================================================
// orders.js — Order History Page
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAuth()) return;
    Navbar.render();
    Footer.render('footer');
    await loadOrders();
});

async function loadOrders() {
    const el = document.getElementById('orders-list');
    el.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;

    try {
        const data = await Api.get('/orders');
        const orders = data.data;

        if (orders.length === 0) {
            el.innerHTML = emptyState('📦', 'No orders yet', 'Start shopping to see your orders here!',
                `<a href="/index.html" class="btn btn-primary">Shop Now</a>`);
            return;
        }

        el.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-card-header">
                    <div>
                        <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:2px;">Order ID</div>
                        <div style="font-weight:700;font-size:1rem;">#${String(order.id).padStart(6,'0')}</div>
                    </div>
                    ${statusBadge(order.status)}
                    <div>
                        <div style="font-size:.75rem;color:var(--text-muted);">Placed on</div>
                        <div style="font-weight:600;font-size:.875rem;">${formatDate(order.created_at)}</div>
                    </div>
                    <div>
                        <div style="font-size:.75rem;color:var(--text-muted);">${order.item_count} item(s)</div>
                        <div style="font-weight:700;color:var(--accent);font-size:1.05rem;">${formatPrice(order.total_amount)}</div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="viewOrder(${order.id})">View Details</button>
                </div>
            </div>
        `).join('');
    } catch {
        el.innerHTML = emptyState('⚠️', 'Failed to load orders', 'Please refresh the page.');
    }
}

async function viewOrder(orderId) {
    const overlay = document.getElementById('order-detail-overlay');
    const body = document.getElementById('order-detail-body');
    body.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;
    Modal.open('order-detail-overlay');

    try {
        const data = await Api.get(`/orders/${orderId}`);
        const o = data.data;

        body.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
                <div>
                    <h3 style="margin-bottom:4px;">Order #${String(o.id).padStart(6,'0')}</h3>
                    <div class="text-sm text-muted">Placed on ${formatDate(o.created_at)}</div>
                </div>
                ${statusBadge(o.status)}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                <div class="card" style="padding:16px;">
                    <div class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">Shipping Info</div>
                    <div style="font-size:.875rem;display:flex;flex-direction:column;gap:4px;">
                        <div><strong>${o.shipping_name}</strong></div>
                        <div>${o.shipping_address}</div>
                        <div>${o.shipping_city}</div>
                        <div>${o.shipping_phone}</div>
                    </div>
                </div>
                <div class="card" style="padding:16px;">
                    <div class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">Order Summary</div>
                    <div style="font-size:.875rem;display:flex;flex-direction:column;gap:6px;">
                        <div class="summary-line"><span>Items</span><span>${o.items.length}</span></div>
                        <div class="summary-line"><span>Shipping</span><span style="color:var(--success)">Free</span></div>
                        <div class="summary-line total"><span>Total</span><span>${formatPrice(o.total_amount)}</span></div>
                    </div>
                </div>
            </div>

            <div>
                <div class="text-xs text-muted font-bold" style="text-transform:uppercase;letter-spacing:.7px;margin-bottom:12px;">Items Ordered</div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${o.items.map(item => `
                        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-secondary);border-radius:10px;">
                            <img src="${item.image_url || ''}" alt="${item.name}"
                                style="width:56px;height:56px;object-fit:cover;border-radius:8px;background:var(--bg-card);"
                                onerror="this.style.display='none'">
                            <div style="flex:1;">
                                <div style="font-weight:600;margin-bottom:2px;">${item.name}</div>
                                <div class="text-sm text-muted">Qty: ${item.quantity} × ${formatPrice(item.price_at_purchase)}</div>
                            </div>
                            <div style="font-weight:700;color:var(--accent);">${formatPrice(item.quantity * item.price_at_purchase)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ${o.notes ? `<div style="margin-top:16px;padding:14px;background:var(--bg-secondary);border-radius:10px;font-size:.875rem;"><strong>Notes:</strong> ${o.notes}</div>` : ''}
        `;
    } catch {
        body.innerHTML = emptyState('⚠️', 'Failed to load order', '');
    }
}
