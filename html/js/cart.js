// ============================================================
// cart.js — Shopping Cart Page
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAuth()) return;
    Navbar.render();
    Footer.render('footer');
    await loadCart();
});

let cartData = [];

async function loadCart() {
    const listEl = document.getElementById('cart-list');
    listEl.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;

    try {
        const data = await Api.get('/cart');
        cartData = data.data;
        renderCart(cartData, data.summary);
    } catch {
        listEl.innerHTML = emptyState('⚠️', 'Failed to load cart', 'Please refresh the page.');
    }
}

function renderCart(items, summary) {
    const listEl = document.getElementById('cart-list');
    const summaryEl = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (items.length === 0) {
        listEl.innerHTML = emptyState('🛒', 'Your cart is empty', 'Browse our products and add something you love!',
            `<a href="/index.html" class="btn btn-primary">Start Shopping</a>`);
        summaryEl.classList.add('hidden');
        return;
    }

    summaryEl.classList.remove('hidden');

    listEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;">
        ${items.map(item => `
            <div class="cart-item" id="cart-item-${item.id}">
                <img class="cart-item-img"
                    src="${item.image_url || ''}"
                    alt="${item.name}"
                    onerror="this.style.display='none'"
                    loading="lazy">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}<span style="color:var(--text-muted);font-size:.8rem;font-weight:400;"> / each</span></div>
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity - 1})">−</button>
                        <div class="qty-display">${item.quantity}</div>
                        <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <div style="font-size:.8rem;color:var(--text-muted);margin-top:6px;">
                        Stock: ${item.stock_quantity} available
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:12px;">
                    <div style="font-size:1.05rem;font-weight:700;color:var(--accent);">
                        ${formatPrice(item.price * item.quantity)}
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="removeItem(${item.id})">🗑 Remove</button>
                </div>
            </div>
        `).join('')}
    </div>`;

    // Summary
    document.getElementById('summary-items').textContent = summary?.total_items || 0;
    document.getElementById('summary-subtotal').textContent = formatPrice(summary?.total_amount || 0);
    document.getElementById('summary-total').textContent = formatPrice(summary?.total_amount || 0);
    document.getElementById('summary-shipping').textContent = 'Free 🚀';
    checkoutBtn.href = '/checkout.html';
}

async function updateQty(cartItemId, newQty) {
    if (newQty < 1) { await removeItem(cartItemId); return; }
    try {
        await Api.put(`/cart/${cartItemId}`, { quantity: newQty });
        await loadCart();
        CartBadge.update();
    } catch (err) {
        Toast.error(err.message || 'Failed to update quantity.');
    }
}

async function removeItem(cartItemId) {
    const el = document.getElementById(`cart-item-${cartItemId}`);
    if (el) { el.style.opacity = '0.5'; el.style.pointerEvents = 'none'; }
    try {
        await Api.delete(`/cart/${cartItemId}`);
        Toast.success('Item removed from cart.');
        await loadCart();
        CartBadge.update();
    } catch (err) {
        Toast.error(err.message || 'Failed to remove item.');
        if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
    }
}

async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
        await Api.delete('/cart');
        Toast.success('Cart cleared.');
        await loadCart();
        CartBadge.update();
    } catch (err) {
        Toast.error(err.message || 'Failed to clear cart.');
    }
}
