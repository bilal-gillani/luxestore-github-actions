// ============================================================
// admin/categories.js — Admin Category Management
// ============================================================

let editingCatId = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.requireAdmin()) return;
    renderAdminNav('categories');
    await loadCategories();
    setupForm();
});

async function loadCategories() {
    const tbody = document.getElementById('categories-tbody');
    tbody.innerHTML = `<tr><td colspan="5"><div class="loading-overlay">${Spinner.html()}</div></td></tr>`;
    try {
        const data = await Api.get('/categories');
        if (data.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:40px;">No categories yet.</td></tr>`;
            return;
        }
        tbody.innerHTML = data.data.map(c => `
            <tr>
                <td style="font-size:1.5rem;">${c.icon}</td>
                <td style="font-weight:600;">${c.name}</td>
                <td class="text-muted text-sm">${c.description || '—'}</td>
                <td><span class="badge badge-info">${c.product_count} products</span></td>
                <td>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary btn-sm" onclick="editCategory(${c.id},'${c.name.replace(/'/g,"\\'")}','${(c.description||'').replace(/'/g,"\\'")}','${c.icon}')">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id},'${c.name.replace(/'/g,"\\'")}')">🗑</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--danger);padding:40px;">Failed to load.</td></tr>`;
    }
}

function openAddModal() {
    editingCatId = null;
    document.getElementById('cat-modal-title').textContent = 'Add Category';
    document.getElementById('cat-form').reset();
    Modal.open('cat-modal');
}

function editCategory(id, name, desc, icon) {
    editingCatId = id;
    document.getElementById('cat-modal-title').textContent = 'Edit Category';
    document.getElementById('cat-name').value = name;
    document.getElementById('cat-desc').value = desc;
    document.getElementById('cat-icon').value = icon;
    Modal.open('cat-modal');
}

async function deleteCategory(id, name) {
    if (!confirm(`Delete category "${name}"? Products will not be deleted.`)) return;
    try {
        await Api.delete(`/admin/categories/${id}`);
        Toast.success('Category deleted.');
        await loadCategories();
    } catch (err) {
        Toast.error(err.message || 'Failed to delete category.');
    }
}

function setupForm() {
    document.getElementById('cat-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-cat-btn');
        btn.disabled = true;
        btn.textContent = 'Saving…';

        const body = {
            name:        document.getElementById('cat-name').value.trim(),
            description: document.getElementById('cat-desc').value.trim(),
            icon:        document.getElementById('cat-icon').value.trim() || '📦',
        };

        try {
            if (editingCatId) {
                await Api.put(`/admin/categories/${editingCatId}`, body);
                Toast.success('Category updated.');
            } else {
                await Api.post('/admin/categories', body);
                Toast.success('Category created.');
            }
            Modal.close('cat-modal');
            await loadCategories();
        } catch (err) {
            Toast.error(err.message || 'Failed to save category.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Save Category';
        }
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
