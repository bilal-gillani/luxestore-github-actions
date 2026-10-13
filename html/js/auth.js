// ============================================================
// auth.js — Login & Register Page Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (Auth.isLoggedIn()) {
        window.location.href = '/index.html';
        return;
    }

    /* ── LOGIN PAGE ─────────────────────────────────────── */
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            btn.textContent = 'Signing in…';
            btn.disabled = true;

            try {
                const data = await Api.post('/auth/login', { email, password });
                Auth.setSession(data.token, data.user);
                Toast.success('Welcome back, ' + data.user.name + '!');
                setTimeout(() => {
                    window.location.href = data.user.role === 'admin'
                        ? '/admin/dashboard.html'
                        : '/index.html';
                }, 600);
            } catch (err) {
                Toast.error(err.message || 'Login failed. Please try again.');
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }
        });
    }

    /* ── REGISTER PAGE ──────────────────────────────────── */
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('register-btn');
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            if (password !== confirm) {
                Toast.error('Passwords do not match.');
                return;
            }
            if (password.length < 6) {
                Toast.error('Password must be at least 6 characters.');
                return;
            }

            btn.textContent = 'Creating account…';
            btn.disabled = true;

            try {
                const data = await Api.post('/auth/register', { name, email, password });
                Auth.setSession(data.token, data.user);
                Toast.success('Account created! Welcome to LuxeStore 🎉');
                setTimeout(() => { window.location.href = '/index.html'; }, 800);
            } catch (err) {
                Toast.error(err.message || 'Registration failed. Please try again.');
                btn.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
    }
});
