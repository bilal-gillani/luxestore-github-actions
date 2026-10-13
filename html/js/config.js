// ============================================================
// config.js — API Base URL Configuration
// UPDATE this with your Backend VM's private IP after deployment
// When using Nginx proxy on the Frontend VM, set to '/api'
// ============================================================

const CONFIG = {
    // Option A: Direct backend access (update IP to your Backend VM private IP)
    // API_BASE_URL: 'http://YOUR_BACKEND_VM_PRIVATE_IP:3000/api',

    // Option B: Via Nginx proxy on frontend VM (uncomment after setting up Nginx)
    API_BASE_URL: '/api',

    APP_NAME: 'LuxeStore',
    CURRENCY: '$',
    ITEMS_PER_PAGE: 12,
};

// Do not edit below this line
window.CONFIG = CONFIG;
