// ============================================================
// components.js — Shared UI: Theme, Icons, Toast, Navbar, Modal, Spinner
// ============================================================

/* ── Unified SVG Icons ───────────────────────────────────── */
const Icons = {
    bag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    cart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    sun: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    box: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    tag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
    store: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`,
    users: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    dollar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    clock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    sparkle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`
};

/* ── Theme Manager ───────────────────────────────────────── */
const Theme = (() => {
    const get = () => {
        return localStorage.getItem('luxestore-theme') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };

    const apply = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('luxestore-theme', theme);
        updateButtons(theme);
    };

    const toggle = () => {
        const next = get() === 'dark' ? 'light' : 'dark';
        apply(next);
    };

    const updateButtons = (theme) => {
        document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
            btn.innerHTML = theme === 'dark' ? Icons.sun : Icons.moon;
            btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        });
    };

    const init = () => {
        apply(get());
    };

    return { get, apply, toggle, updateButtons, init };
})();

// Initialize theme on script evaluation
Theme.init();

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

    const icons = {
        success: Icons.check,
        error:   Icons.x,
        warning: Icons.alert,
        info:    Icons.info
    };

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

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeAll();
    });
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
            { href: '/index.html',          label: 'Home', key: 'home' },
            { href: '/index.html#products', label: 'Shop', key: 'shop' },
        ];

        navbarEl.innerHTML = `
            <div class="navbar-inner">
                <a href="/index.html" class="navbar-logo">
                    <div class="navbar-logo-icon">${Icons.bag}</div>
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
                        <span class="search-icon">${Icons.search}</span>
                        <input type="text" id="navbar-search-input" placeholder="Search products..." autocomplete="off">
                    </div>

                    <!-- Theme Toggle -->
                    <button class="theme-toggle-btn" id="theme-toggle" aria-label="Toggle Theme">
                        ${Theme.get() === 'dark' ? Icons.sun : Icons.moon}
                    </button>

                    <a href="/cart.html" class="cart-btn" title="Shopping Cart">
                        ${Icons.cart}
                        <span class="cart-badge hidden" id="cart-badge">0</span>
                    </a>

                    ${isLoggedIn ? `
                        <div class="dropdown-wrap">
                            <button class="avatar-btn" style="background:${user?.avatar_color || 'var(--accent)'};" title="${user?.name}">
                                ${(user?.name || 'U').charAt(0).toUpperCase()}
                            </button>
                            <div class="dropdown">
                                <div style="padding:10px 12px 6px;">
                                    <div style="font-weight:700;font-size:0.875rem;">${user?.name || 'User'}</div>
                                    <div class="text-xs text-muted">${user?.email || ''}</div>
                                </div>
                                <div class="dropdown-divider"></div>
                                <a href="/orders.html" class="dropdown-item">${Icons.box} My Orders</a>
                                ${isAdmin ? `<a href="/admin/dashboard.html" class="dropdown-item">${Icons.settings} Admin Panel</a>` : ''}
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item danger" id="logout-btn">${Icons.logout} Logout</button>
                            </div>
                        </div>
                    ` : `
                        <a href="/login.html" class="btn btn-secondary btn-sm">Login</a>
                        <a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a>
                    `}
                </div>
            </div>
        `;

        // Theme Toggle Handler
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                Theme.toggle();
            });
        }

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

/* ── Admin Navbar Builder ────────────────────────────────── */
const AdminNav = (() => {
    const render = (active = '') => {
        const user = Auth.getUser();
        const navEl = document.getElementById('navbar');
        if (navEl) {
            navEl.innerHTML = `
                <div class="navbar-inner">
                    <a href="/admin/dashboard.html" class="navbar-logo">
                        <div class="navbar-logo-icon">${Icons.settings}</div>
                        <span>Luxe<span>Admin</span></span>
                    </a>
                    <div class="navbar-actions">
                        <button class="theme-toggle-btn" id="theme-toggle" aria-label="Toggle Theme">
                            ${Theme.get() === 'dark' ? Icons.sun : Icons.moon}
                        </button>
                        <a href="/index.html" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px;">
                            ${Icons.store} View Store
                        </a>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div class="avatar-btn" style="background:${user?.avatar_color || 'var(--accent)'};">
                                ${(user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <span style="font-size:.875rem;font-weight:600;">${user?.name || 'Admin'}</span>
                        </div>
                        <button class="btn btn-ghost btn-sm" id="admin-logout-btn" style="color:var(--danger);display:inline-flex;align-items:center;gap:6px;">
                            ${Icons.logout} Logout
                        </button>
                    </div>
                </div>
            `;

            const themeBtn = document.getElementById('theme-toggle');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => {
                    Theme.toggle();
                });
            }

            const logoutBtn = document.getElementById('admin-logout-btn');
            if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);
        }

        document.querySelectorAll('.sidebar-item').forEach(el => {
            el.classList.toggle('active', el.dataset.page === active);
        });
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
        pending:    ['badge-warning', 'Pending'],
        processing: ['badge-info',    'Processing'],
        shipped:    ['badge-info',    'Shipped'],
        delivered:  ['badge-success', 'Delivered'],
        cancelled:  ['badge-danger',  'Cancelled'],
    };
    const [cls, label] = map[status] || ['badge-muted', status];
    return `<span class="badge ${cls}"><span class="status-dot"></span>${label}</span>`;
};

/* ── Empty State ─────────────────────────────────────────── */
const emptyState = (icon, title, desc, btnHtml = '') => {
    const iconHtml = (typeof icon === 'string' && icon.startsWith('<svg'))
        ? icon
        : (Icons[icon] || `<span style="font-size:1.75rem;">${icon}</span>`);
    return `
        <div class="empty-state">
            <div class="empty-icon">${iconHtml}</div>
            <h3 class="empty-title">${title}</h3>
            <p class="empty-desc">${desc}</p>
            ${btnHtml}
        </div>
    `;
};

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

window.Icons    = Icons;
window.Theme    = Theme;
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
