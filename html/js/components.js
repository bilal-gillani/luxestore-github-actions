// ============================================================
// components.js — Shared UI: Toast, Navbar, Modal, Spinner
// ============================================================

/* ── Toast Notifications ─────────────────────────────────── */
const Toast = (() => {
    let container;

    const init = () => {
        container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    };

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

    const show = (message, type = 'success', duration = 3500) => {
        if (!container) init();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-msg">${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    };

    return {
        success: (msg, d) => show(msg, 'success', d),
        error:   (msg, d) => show(msg, 'error', d),
        warning: (msg, d) => show(msg, 'warning', d),
        info:    (msg, d) => show(msg, 'info', d),
    };
})();

/* ── Modal Helper ────────────────────────────────────────── */
const Modal = (() => {
    const open = (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add('open');
    };
    const close = (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
    };
    const closeAll = () => {
        document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
    };

    // Close modal on overlay click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeAll();
    });
    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAll();
    });

    return { open, close, closeAll };
})();

/* ── Auth State ──────────────────────────────────────────── */
const Auth = (() => {
    const getUser = () => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    };
    const getToken = () => localStorage.getItem('token');
    const isLoggedIn = () => !!getToken();
    const isAdmin = () => { const u = getUser(); return u && u.role === 'admin'; };

    const setSession = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    };

    const requireAuth = () => {
        if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
        return true;
    };

    const requireAdmin = () => {
        if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
        if (!isAdmin()) { window.location.href = '/index.html'; return false; }
        return true;
    };

    return { getUser, getToken, isLoggedIn, isAdmin, setSession, logout, requireAuth, requireAdmin };
})();

/* ── Cart Count Badge ────────────────────────────────────── */
const CartBadge = (() => {
    const update = async () => {
        const badge = document.getElementById('cart-badge');
        if (!badge) return;
        if (!Auth.isLoggedIn()) { badge.classList.add('hidden'); return; }
        try {
            const data = await Api.get('/cart');
            const count = data.summary?.total_items || 0;
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.toggle('hidden', count === 0);
        } catch { badge.classList.add('hidden'); }
    };
    return { update };
})();

/* ── Navbar Builder ──────────────────────────────────────── */
const Navbar = (() => {
    const render = (activePage = '') => {
        const user = Auth.getUser();
        const isLoggedIn = Auth.isLoggedIn();
        const isAdmin = Auth.isAdmin();

        const navbarEl = document.getElementById('navbar');
        if (!navbarEl) return;

        const links = [
            { href: '/index.html',    label: 'Home',     key: 'home' },
            { href: '/index.html#products', label: 'Shop', key: 'shop' },
        ];

        navbarEl.innerHTML = `
            <div class="navbar-inner">
                <a href="/index.html" class="navbar-logo">
                    <div class="navbar-logo-icon">🛍️</div>
                    <span>Luxe<span>Store</span></span>
                </a>

                <nav class="navbar-links">
                    ${links.map(l => `
                        <a href="${l.href}" class="navbar-link ${activePage === l.key ? 'active' : ''}">${l.label}</a>
                    `).join('')}
                    ${isAdmin ? `<a href="/admin/dashboard.html" class="navbar-link">Admin Panel</a>` : ''}
                </nav>

                <div class="navbar-actions">
                    <div class="navbar-search">
                        <span class="search-icon">🔍</span>
                        <input type="text" id="navbar-search-input" placeholder="Search products..." autocomplete="off">
                    </div>

                    <a href="/cart.html" class="cart-btn" title="Cart">
                        🛒
                        <span class="cart-badge hidden" id="cart-badge">0</span>
                    </a>

                    ${isLoggedIn ? `
                        <div class="dropdown-wrap">
                            <button class="avatar-btn" style="background:${user?.avatar_color || '#F59E0B'};" title="${user?.name}">
                                ${(user?.name || 'U').charAt(0).toUpperCase()}
                            </button>
                            <div class="dropdown">
                                <div style="padding:10px 12px 6px;">
                                    <div style="font-weight:700;font-size:0.875rem;">${user?.name || 'User'}</div>
                                    <div class="text-xs text-muted">${user?.email || ''}</div>
                                </div>
                                <div class="dropdown-divider"></div>
                                <a href="/orders.html" class="dropdown-item">📦 My Orders</a>
                                ${isAdmin ? `<a href="/admin/dashboard.html" class="dropdown-item">⚙️ Admin Panel</a>` : ''}
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item danger" id="logout-btn">🚪 Logout</button>
                            </div>
                        </div>
                    ` : `
                        <a href="/login.html" class="btn btn-secondary btn-sm">Login</a>
                        <a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a>
                    `}
                </div>
            </div>
        `;

        // Logout handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);

        // Navbar search
        const searchInput = document.getElementById('navbar-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && searchInput.value.trim()) {
                    window.location.href = `/index.html?search=${encodeURIComponent(searchInput.value.trim())}`;
                }
            });
        }

        // Update cart badge
        CartBadge.update();
    };

    return { render };
})();

/* ── Spinners ────────────────────────────────────────────── */
const Spinner = {
    html: (small = false) => `<div class="spinner ${small ? 'spinner-sm' : ''}"></div>`,
    loading: (containerId) => {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = `<div class="loading-overlay">${Spinner.html()}</div>`;
    }
};

/* ── Price Formatter ─────────────────────────────────────── */
const formatPrice = (amount) => `${CONFIG.CURRENCY}${parseFloat(amount).toFixed(2)}`;

/* ── Date Formatter ──────────────────────────────────────── */
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

/* ── Status Badge ────────────────────────────────────────── */
const statusBadge = (status) => {
    const map = {
        pending:    ['badge-warning', '🕐 Pending'],
        processing: ['badge-info',    '⚙️ Processing'],
        shipped:    ['badge-info',    '🚚 Shipped'],
        delivered:  ['badge-success', '✅ Delivered'],
        cancelled:  ['badge-danger',  '❌ Cancelled'],
    };
    const [cls, label] = map[status] || ['badge-muted', status];
    return `<span class="badge ${cls}">${label}</span>`;
};

/* ── Empty State ─────────────────────────────────────────── */
const emptyState = (icon, title, desc, btnHtml = '') => `
    <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <h3 class="empty-title">${title}</h3>
        <p class="empty-desc">${desc}</p>
        ${btnHtml}
    </div>
`;

/* ── Footer ──────────────────────────────────────────────── */
const Footer = {
    render: (id = 'footer') => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = `
            <div class="footer-inner">
                <div class="footer-copy">© ${new Date().getFullYear()} LuxeStore. All rights reserved.</div>
                <div class="footer-links">
                    <a href="#" class="footer-link">Privacy Policy</a>
                    <a href="#" class="footer-link">Terms of Service</a>
                    <a href="#" class="footer-link">Contact</a>
                </div>
            </div>
        `;
    }
};

window.Toast    = Toast;
window.Modal    = Modal;
window.Auth     = Auth;
window.CartBadge= CartBadge;
window.Navbar   = Navbar;
window.Spinner  = Spinner;
window.formatPrice  = formatPrice;
window.formatDate   = formatDate;
window.statusBadge  = statusBadge;
window.emptyState   = emptyState;
window.Footer       = Footer;
