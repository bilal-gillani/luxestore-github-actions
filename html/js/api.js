// ============================================================
// api.js — HTTP Client Wrapper
// ============================================================

const Api = (() => {
    const getToken = () => localStorage.getItem('token');

    const headers = (extra = {}) => ({
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...extra
    });

    const handleResponse = async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.message || `HTTP ${res.status}`);
            err.status = res.status;
            err.data = data;
            throw err;
        }
        return data;
    };

    return {
        get: (path) =>
            fetch(`${CONFIG.API_BASE_URL}${path}`, { headers: headers() }).then(handleResponse),

        post: (path, body) =>
            fetch(`${CONFIG.API_BASE_URL}${path}`, {
                method: 'POST', headers: headers(), body: JSON.stringify(body)
            }).then(handleResponse),

        put: (path, body) =>
            fetch(`${CONFIG.API_BASE_URL}${path}`, {
                method: 'PUT', headers: headers(), body: JSON.stringify(body)
            }).then(handleResponse),

        delete: (path) =>
            fetch(`${CONFIG.API_BASE_URL}${path}`, {
                method: 'DELETE', headers: headers()
            }).then(handleResponse),
    };
})();

window.Api = Api;
