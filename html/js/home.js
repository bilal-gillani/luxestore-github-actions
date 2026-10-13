// ============================================================
// home.js — Homepage: Hero, Categories, Products, Search
// ============================================================

let currentPage = 1;
let currentFilters = { category: '', search: '', sort: 'created_at', order: 'DESC' };

document.addEventListener('DOMContentLoaded', async () => {
    Navbar.render('home');
    Footer.render('footer');

    // Read URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('search')) currentFilters.search = params.get('search');
    if (params.get('category')) currentFilters.category = params.get('category');

    await Promise.all([
        loadCategories(),
        loadFeaturedProducts(),
        loadProducts(),
    ]);

    setupFilters();
    setupSearch();
});

async function loadCategories() {
    try {
        const data = await Api.get('/categories');
        renderCategories(data.data);
    } catch {
        document.getElementById('categories-grid').innerHTML = '';
    }
}

function renderCategories(cats) {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;
    grid.innerHTML = cats.map(c => `
        <div class="category-card" onclick="filterByCategory(${c.id}, '${c.name}')">
            <div class="category-icon">${c.icon}</div>
            <div class="category-name">${c.name}</div>
            <div class="category-count">${c.product_count} products</div>
        </div>
    `).join('');
}

async function loadFeaturedProducts() {
    try {
        const data = await Api.get('/products/featured');
        const section = document.getElementById('featured-section');
        const grid = document.getElementById('featured-grid');
        if (!grid) return;
        if (data.data.length === 0) { section.style.display = 'none'; return; }
        grid.innerHTML = data.data.map(renderProductCard).join('');
    } catch {
        document.getElementById('featured-section').style.display = 'none';
    }
}

async function loadProducts(page = 1) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = `<div class="loading-overlay" style="grid-column:1/-1">${Spinner.html()}</div>`;

    try {
        const q = new URLSearchParams({
            page,
            limit: CONFIG.ITEMS_PER_PAGE,
            ...Object.fromEntries(Object.entries(currentFilters).filter(([,v]) => v !== ''))
        });
        const data = await Api.get(`/products?${q}`);

        if (data.data.length === 0) {
            grid.innerHTML = emptyState('🔍', 'No products found', 'Try adjusting your search or filters.');
        } else {
            grid.innerHTML = data.data.map(renderProductCard).join('');
        }

        renderPagination(data.pagination);
    } catch {
        grid.innerHTML = emptyState('⚠️', 'Failed to load products', 'Please refresh the page.');
    }
}

function renderProductCard(p) {
    const outOfStock = p.stock_quantity <= 0;
    return `
        <div class="product-card" onclick="viewProduct(${p.id})">
            <div class="product-img-wrap">
                ${p.image_url
                    ? `<img class="product-img" src="${p.image_url}" alt="${p.name}" loading="lazy">`
                    : `<div class="product-img-placeholder">${p.category_icon || '📦'}</div>`
                }
                ${p.featured ? `<span class="product-badge badge-featured">⭐ Featured</span>` : ''}
                ${outOfStock ? `<span class="product-badge badge-out-of-stock">Out of Stock</span>` : ''}
            </div>
            <div class="product-body">
                <div class="product-category">${p.category_icon || ''} ${p.category_name || 'General'}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${formatPrice(p.price)}</div>
                <div class="product-stock">${outOfStock ? 'Out of stock' : `${p.stock_quantity} in stock`}</div>
            </div>
            <div class="product-footer">
                <button class="btn btn-primary btn-sm w-full" ${outOfStock ? 'disabled' : ''}
                    onclick="event.stopPropagation(); addToCart(${p.id}, '${p.name.replace(/'/g,"\\'")}')">
                    🛒 Add to Cart
                </button>
            </div>
        </div>
    `;
}

function viewProduct(id) {
    window.location.href = `/product.html?id=${id}`;
}

async function addToCart(productId, name) {
    if (!Auth.isLoggedIn()) {
        Toast.info('Please login to add items to your cart.');
        setTimeout(() => window.location.href = '/login.html', 1200);
        return;
    }
    try {
        await Api.post('/cart', { product_id: productId, quantity: 1 });
        Toast.success(`${name} added to cart! 🛒`);
        CartBadge.update();
    } catch (err) {
        Toast.error(err.message || 'Failed to add to cart.');
    }
}

function filterByCategory(id, name) {
    currentFilters.category = id;
    currentPage = 1;
    document.getElementById('active-filter-label').textContent = name;
    document.getElementById('active-filter-bar').classList.remove('hidden');
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    updateFilterChips();
    loadProducts(1);
}

function setupFilters() {
    // Sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const [sort, order] = sortSelect.value.split(':');
            currentFilters.sort = sort;
            currentFilters.order = order;
            loadProducts(1);
        });
    }

    // Clear filter
    const clearBtn = document.getElementById('clear-filter-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentFilters.category = '';
            document.getElementById('active-filter-bar').classList.add('hidden');
            updateFilterChips();
            loadProducts(1);
        });
    }

    // Filter chips (all categories)
    updateFilterChips();
}

function updateFilterChips() {
    document.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.cat == currentFilters.category);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('product-search');
    if (!searchInput) return;
    if (currentFilters.search) searchInput.value = currentFilters.search;

    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentFilters.search = searchInput.value.trim();
            currentPage = 1;
            loadProducts(1);
        }, 400);
    });
}

function renderPagination(pagination) {
    const el = document.getElementById('pagination');
    if (!el || !pagination) return;
    const { page, totalPages } = pagination;
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    let html = `<button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="changePage(${page-1})">◀</button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === page - 3 || i === page + 3) {
            html += `<span style="color:var(--text-muted);padding:0 4px;">…</span>`;
        }
    }
    html += `<button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="changePage(${page+1})">▶</button>`;
    el.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
    loadProducts(page);
}
