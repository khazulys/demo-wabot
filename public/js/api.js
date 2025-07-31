/**
 * Mock API layer for the demo UI.
 * This file intercepts API calls and returns dummy data instead of making real network requests.
 * It simulates the behavior of the backend API, allowing the frontend to run standalone.
 * This version includes logic to add, update, and delete items from the dummy data arrays.
 */

// Enhance the dummyApi to include modification methods
window.dummyApi = {
    ...window.dummyApi, // Keep existing get methods

    _idCounter: 100, // Simple counter for new unique IDs

    addProduct: function(productData) {
        const newProduct = {
            ...productData,
            _id: `new${this._idCounter++}`
        };
        if (window.dummyData.products[productData.type]) {
            window.dummyData.products[productData.type].unshift(newProduct); // Add to the beginning
            return { success: true, product: newProduct };
        }
        return { success: false, message: "Invalid product type" };
    },

    updateProduct: function(productData) {
        const productList = window.dummyData.products[productData.type];
        if (productList) {
            const productIndex = productList.findIndex(p => p.name === productData.name && p.nominal === productData.nominal);
            if (productIndex !== -1) {
                productList[productIndex].harga = productData.harga;
                return { success: true, product: productList[productIndex] };
            }
        }
        return { success: false, message: "Product not found" };
    },

    deleteProduct: function(productData) {
        const productList = window.dummyData.products[productData.type];
        if (productList) {
            const initialLength = productList.length;
            window.dummyData.products[productData.type] = productList.filter(p => !(p.name === productData.name && p.nominal === productData.nominal));
            if (productList.length < initialLength) {
                return { success: true };
            }
        }
        return { success: false, message: "Product not found" };
    },

    deleteOrder: function(orderId) {
        const initialLength = window.dummyData.orders.length;
        window.dummyData.orders = window.dummyData.orders.filter(o => o._id !== orderId);
        if (window.dummyData.orders.length < initialLength) {
            return { success: true };
        }
        return { success: false, message: "Order not found" };
    },

    deleteCustomer: function(customerId) {
        const initialLength = window.dummyData.customers.length;
        window.dummyData.customers = window.dummyData.customers.filter(c => c._id !== customerId);
        if (window.dummyData.customers.length < initialLength) {
            return { success: true };
        }
        return { success: false, message: "Customer not found" };
    },

    getNotifications: function() {
        // Return all notifications, sorted by date
        const notifications = window.dummyData.notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const unreadCount = window.dummyData.notifications.filter(n => !n.read).length;
        return { notifications, unreadCount };
    },

    markNotificationsAsRead: function() {
        window.dummyData.notifications.forEach(n => n.read = true);
        return { success: true };
    },

    getBroadcastHistory: function() {
        const history = window.dummyData.broadcastHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // In a real app, this would be paginated. For the demo, we return all.
        return { history, currentPage: 1, totalPages: 1 };
    },

    sendBroadcast: function(payload) {
        const newBroadcast = {
            _id: `b${this._idCounter++}`,
            targetLabel: payload.target.label,
            message: payload.message,
            status: 'Terkirim',
            createdAt: new Date(),
            sentCount: payload.target.count,
            totalRecipients: payload.target.count
        };
        window.dummyData.broadcastHistory.unshift(newBroadcast);
        return { success: true, message: `Broadcast berhasil disimulasikan ke ${payload.target.count} pelanggan.` };
    }
};


const api = {
    _simulateNetworkDelay: (ms = 250) => new Promise(res => setTimeout(res, ms)),

    async _fetch(url, options = {}) {
        await this._simulateNetworkDelay();
        const method = options.method || 'GET';
        console.log(`[Mock API] Intercepted ${method} request to: ${url}`);

        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const path = url.split('?')[0];
        const body = options.body ? JSON.parse(options.body) : {};

        // --- AUTH ---
        if (path.includes('/api/auth/login')) {
            if (body.username === 'demo' && body.password === 'demo') return { success: true, message: 'Login successful' };
            throw new Error('Username atau password salah');
        }
        if (path.includes('/api/auth/logout')) return { success: true };

        // --- DASHBOARD ---
        if (path.includes('/api/dashboard/stats')) return window.dummyApi.getDashboardStats();

        // --- PRODUCTS ---
        if (path.includes('/api/products')) {
            if (method === 'POST') return window.dummyApi.addProduct(body);
            if (method === 'PUT') return window.dummyApi.updateProduct(body);
            if (method === 'DELETE') return window.dummyApi.deleteProduct(body);
            // GET
            const type = urlParams.get('type') || 'pulsa';
            const page = parseInt(urlParams.get('page') || '1');
            return window.dummyApi.getProducts(type, page);
        }

        // --- ORDERS ---
        const orderMatch = path.match(/\/api\/orders\/(o\d+)/);
        if (orderMatch) {
            if (method === 'DELETE') return window.dummyApi.deleteOrder(orderMatch[1]);
        }
        if (path.includes('/api/orders')) { // GET
            const page = parseInt(urlParams.get('page') || '1');
            const status = urlParams.get('status') || 'all';
            const search = urlParams.get('search') || '';
            return window.dummyApi.getOrders(status, search, page);
        }

        // --- CUSTOMERS ---
        const customerMatch = path.match(/\/api\/customers\/(c\d+)/);
        if (customerMatch) {
            const id = customerMatch[1];
            if (method === 'DELETE') return window.dummyApi.deleteCustomer(id);
            return window.dummyApi.getCustomerDetail(id); // GET
        }
        if (path.includes('/api/customers')) { // GET
            const page = parseInt(urlParams.get('page') || '1');
            const search = urlParams.get('search') || '';
            return window.dummyApi.getCustomers(search, page);
        }

        // --- NOTIFICATIONS ---
        if (path.includes('/api/notifications/read')) {
            if (method === 'POST') return window.dummyApi.markNotificationsAsRead();
        }
        if (path.includes('/api/notifications')) {
            return window.dummyApi.getNotifications();
        }

        // --- BROADCAST ---
        if (path.includes('/api/broadcast/send')) {
            if (method === 'POST') return window.dummyApi.sendBroadcast(body);
        }
        if (path.includes('/api/broadcast/history')) {
            return window.dummyApi.getBroadcastHistory();
        }
        // For targets, we'll just return the static data from the broadcast module itself for simplicity
        if (path.includes('/api/broadcast/targets')) {
            return []; // The data is now hardcoded in broadcast.js
        }

        console.warn(`[Mock API] No mock handler for URL: ${url}`);
        return {};
    },

    get(url) { return this._fetch(url, { method: 'GET' }); },
    post(url, data) { return this._fetch(url, { method: 'POST', body: JSON.stringify(data) }); },
    put(url, data) { return this._fetch(url, { method: 'PUT', body: JSON.stringify(data) }); },
    delete(url, data) { return this._fetch(url, { method: 'DELETE', body: JSON.stringify(data) }); },
};

window.api = api;