// ============================================================
// product.js — Product Detail Page
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    Navbar.render();
    Footer.render('footer');

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) { window.location.href = '/index.html'; return; }

    await loadProduct(id);
});

async function loadProduct(id) {
    const main = document.getElementById('product-main');
    main.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;

    try {
        const data = await Api.get(`/products/${id}`);
        const p = data.data;

        document.title = `${p.name} — LuxeStore`;
        document.getElementById('breadcrumb-product').textContent = p.name;

        const outOfStock = p.stock_quantity <= 0;
        main.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-detail-img">
                    ${p.image_url
                        ? `<img src="${p.image_url}" alt="${p.name}">`
                        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:5rem;">${p.category_icon || '📦'}</div>`
                    }
                </div>
                <div class="product-detail-body">
                    <div>
                        <div class="product-category" style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--accent);margin-bottom:8px;">
                            ${p.category_icon || ''} ${p.category_name || 'General'}
                        </div>
                        <h1 style="font-size:1.75rem;margin-bottom:12px;">${p.name}</h1>
                        ${p.featured ? `<span class="badge badge-accent" style="margin-bottom:16px;">⭐ Featured Product</span>` : ''}
                    </div>

                    <div class="product-detail-price">${formatPrice(p.price)}</div>

                    <p class="product-detail-desc">${p.description || 'No description available.'}</p>

                    <div class="product-detail-meta">
                        <div class="meta-row">
                            <span>Category</span>
                            <span>${p.category_icon || ''} ${p.category_name || 'General'}</span>
                        </div>
                        <div class="meta-row">
                            <span>Availability</span>
                            <span class="${outOfStock ? 'text-danger' : 'text-success'}" style="color:${outOfStock ? 'var(--danger)' : 'var(--success)'}">
                                ${outOfStock ? '✗ Out of Stock' : `✓ ${p.stock_quantity} in Stock`}
                            </span>
                        </div>
                        <div class="meta-row">
                            <span>SKU</span>
                            <span>PRD-${String(p.id).padStart(5, '0')}</span>
                        </div>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <label style="font-size:.85rem;font-weight:600;color:var(--text-secondary);">Quantity</label>
                            <div class="quantity-control">
                                <button class="qty-btn" onclick="changeQty(-1)">−</button>
                                <div class="qty-display" id="qty-display">1</div>
                                <button class="qty-btn" onclick="changeQty(1)">+</button>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-lg" id="add-cart-btn"
                            ${outOfStock ? 'disabled' : ''}
                            onclick="addToCart(${p.id}, '${p.name.replace(/'/g,"\\'")}', ${p.stock_quantity})">
                            🛒 ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <a href="/index.html" class="btn btn-secondary btn-lg">← Continue Shopping</a>
                    </div>
                </div>
            </div>
        `;

        // Render related products
        if (data.related && data.related.length > 0) {
            document.getElementById('related-section').classList.remove('hidden');
            document.getElementById('related-grid').innerHTML = data.related.map(rp => `
                <div class="product-card" onclick="window.location.href='/product.html?id=${rp.id}'">
                    <div class="product-img-wrap">
                        ${rp.image_url
                            ? `<img class="product-img" src="${rp.image_url}" alt="${rp.name}" loading="lazy">`
                            : `<div class="product-img-placeholder">📦</div>`
                        }
                    </div>
                    <div class="product-body">
                        <div class="product-name">${rp.name}</div>
                        <div class="product-price">${formatPrice(rp.price)}</div>
                    </div>
                    <div class="product-footer">
                        <button class="btn btn-primary btn-sm w-full"
                            onclick="event.stopPropagation();addToCart(${rp.id},'${rp.name.replace(/'/g,"\\'")}',${rp.stock_quantity})">
                            🛒 Add to Cart
                        </button>
                    </div>
                </div>
            `).join('');
        }

    } catch (err) {
        main.innerHTML = emptyState('⚠️', 'Product not found', 'This product may have been removed.');
    }
}

let qty = 1;
let maxQty = 999;

function changeQty(delta) {
    qty = Math.max(1, Math.min(maxQty, qty + delta));
    document.getElementById('qty-display').textContent = qty;
}

async function addToCart(productId, name, stock) {
    if (!Auth.isLoggedIn()) {
        Toast.info('Please login to add items to your cart.');
        setTimeout(() => window.location.href = '/login.html', 1200);
        return;
    }
    maxQty = stock;
    if (qty > stock) {
        Toast.warning(`Only ${stock} items available.`);
        return;
    }
    const btn = document.getElementById('add-cart-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
    try {
        await Api.post('/cart', { product_id: productId, quantity: qty });
        Toast.success(`${qty} × ${name} added to cart! 🛒`);
        CartBadge.update();
    } catch (err) {
        Toast.error(err.message || 'Failed to add to cart.');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '🛒 Add to Cart'; }
    }
}
