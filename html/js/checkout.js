// ============================================================
// checkout.js — Checkout Page
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAuth()) return;
    Navbar.render();
    Footer.render('footer');

    // Pre-fill from user profile
    const user = Auth.getUser();
    if (user) {
        setField('ship-name', user.name);
        setField('ship-phone', user.phone);
        setField('ship-address', user.address);
        setField('ship-city', user.city);
    }

    await loadOrderSummary();
    setupForm();
});

function setField(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
}

async function loadOrderSummary() {
    const el = document.getElementById('order-review');
    try {
        const data = await Api.get('/cart');
        const items = data.data;
        const summary = data.summary;

        if (items.length === 0) {
            Toast.warning('Your cart is empty!');
            setTimeout(() => window.location.href = '/index.html', 1500);
            return;
        }

        el.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
                ${items.map(item => `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img src="${item.image_url || ''}" alt="${item.name}"
                            style="width:52px;height:52px;object-fit:cover;border-radius:8px;background:var(--bg-secondary);"
                            onerror="this.style.display='none'">
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:600;font-size:.875rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                            <div style="font-size:.78rem;color:var(--text-muted);">Qty: ${item.quantity}</div>
                        </div>
                        <div style="font-weight:700;color:var(--accent);white-space:nowrap;">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="summary-line"><span>Items (${summary.total_items})</span><span>${formatPrice(summary.total_amount)}</span></div>
            <div class="summary-line"><span>Shipping</span><span style="color:var(--success)">Free 🚀</span></div>
            <div class="summary-line total">
                <span>Total</span>
                <span>${formatPrice(summary.total_amount)}</span>
            </div>
        `;

        document.getElementById('total-display').textContent = formatPrice(summary.total_amount);
    } catch {
        el.innerHTML = '<p class="text-muted text-sm">Unable to load cart.</p>';
    }
}

function setupForm() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('place-order-btn');

        const shipping_name    = document.getElementById('ship-name').value.trim();
        const shipping_address = document.getElementById('ship-address').value.trim();
        const shipping_city    = document.getElementById('ship-city').value.trim();
        const shipping_phone   = document.getElementById('ship-phone').value.trim();
        const notes            = document.getElementById('ship-notes').value.trim();

        if (!shipping_name || !shipping_address || !shipping_city || !shipping_phone) {
            Toast.error('Please fill in all required fields.');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = `${Spinner.html(true)} Placing order…`;

        try {
            const data = await Api.post('/orders', {
                shipping_name, shipping_address, shipping_city, shipping_phone, notes
            });

            Toast.success('Order placed successfully! 🎉');
            CartBadge.update();

            // Show success screen
            document.getElementById('checkout-form-wrap').classList.add('hidden');
            document.getElementById('order-success').classList.remove('hidden');
            document.getElementById('success-order-id').textContent = `#${String(data.order_id).padStart(6, '0')}`;
            document.getElementById('success-total').textContent = formatPrice(data.total_amount);
        } catch (err) {
            Toast.error(err.message || 'Failed to place order. Please try again.');
            btn.disabled = false;
            btn.innerHTML = '🎉 Place Order';
        }
    });
}
