// ============================================================
// admin/products.js — Admin Product Management
// ============================================================

let allCategories = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAdmin()) return;
    renderAdminNav('products');
    await Promise.all([loadCategories(), loadProducts()]);
    setupForm();
});

async function loadCategories() {
    try {
        const data = await Api.get('/categories');
        allCategories = data.data;
        const sel = document.getElementById('prod-category');
        sel.innerHTML = '<option value="">— Select Category —</option>' +
            allCategories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    } catch {}
}

async function loadProducts() {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = `<tr><td colspan="7"><div class="loading-overlay">${Spinner.html()}</div></td></tr>`;

    try {
        const data = await Api.get('/products?limit=100');
        if (data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:40px;">No products yet. Add your first product!</td></tr>`;
            return;
        }
        tbody.innerHTML = data.data.map(p => `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="${p.image_url||''}" alt="${p.name}"
                            style="width:44px;height:44px;object-fit:cover;border-radius:8px;background:var(--bg-secondary);"
                            onerror="this.style.display='none'">
                        <div>
                            <div style="font-weight:600;">${p.name}</div>
                            <div class="text-xs text-muted">#${String(p.id).padStart(5,'0')}</div>
                        </div>
                    </div>
                </td>
                <td>${p.category_icon||''} ${p.category_name||'—'}</td>
                <td style="font-weight:700;color:var(--accent);">${formatPrice(p.price)}</td>
                <td>
                    <span style="font-weight:600;color:${p.stock_quantity<=5?'var(--danger)':p.stock_quantity<=20?'var(--warning)':'var(--success)'};">
                        ${p.stock_quantity}
                    </span>
                </td>
                <td>${p.featured ? '<span class="badge badge-accent">Yes</span>' : '<span class="badge badge-muted">No</span>'}</td>
                <td class="text-sm text-muted">${formatDate(p.created_at)}</td>
                <td>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary btn-sm" onclick="editProduct(${p.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" style="display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;" onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g,"\\'")}')" title="Delete product">${Icons.trash}</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:40px;">Failed to load products.</td></tr>`;
    }
}

function openAddModal() {
    editingId = null;
    document.getElementById('modal-title').textContent = 'Add New Product';
    document.getElementById('prod-form').reset();
    Modal.open('product-modal');
}

async function editProduct(id) {
    editingId = id;
    document.getElementById('modal-title').textContent = 'Edit Product';
    try {
        const data = await Api.get(`/products/${id}`);
        const p = data.data;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-category').value = p.category_id || '';
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-stock').value = p.stock_quantity;
        document.getElementById('prod-image').value = p.image_url || '';
        document.getElementById('prod-description').value = p.description || '';
        document.getElementById('prod-featured').checked = !!p.featured;
        Modal.open('product-modal');
    } catch {
        Toast.error('Failed to load product.');
    }
}

async function deleteProduct(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
        await Api.delete(`/admin/products/${id}`);
        Toast.success('Product deleted.');
        await loadProducts();
    } catch (err) {
        Toast.error(err.message || 'Failed to delete product.');
    }
}

function setupForm() {
    const form = document.getElementById('prod-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-product-btn');
        btn.disabled = true;
        btn.textContent = 'Saving…';

        const body = {
            name:           document.getElementById('prod-name').value.trim(),
            category_id:    document.getElementById('prod-category').value || null,
            price:          document.getElementById('prod-price').value,
            stock_quantity: document.getElementById('prod-stock').value,
            image_url:      document.getElementById('prod-image').value.trim(),
            description:    document.getElementById('prod-description').value.trim(),
            featured:       document.getElementById('prod-featured').checked,
        };

        try {
            if (editingId) {
                await Api.put(`/admin/products/${editingId}`, body);
                Toast.success('Product updated successfully.');
            } else {
                await Api.post('/admin/products', body);
                Toast.success('Product created successfully.');
            }
            Modal.close('product-modal');
            await loadProducts();
        } catch (err) {
            Toast.error(err.message || 'Failed to save product.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Save Product';
        }
    });
}

function renderAdminNav(active) {
    AdminNav.render(active);
}
