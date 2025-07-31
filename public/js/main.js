/**
 * Utility function to escape HTML special characters.
 * This prevents XSS attacks by ensuring that any data rendered to the page
 * is treated as plain text, not as HTML.
 * @param {string | number | null | undefined} str The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHTML(str) {
    if (str === null || typeof str === 'undefined') return '';
    // Ensure the input is a string before calling replace
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let socket;
try {
    socket = io({ withCredentials: true });
} catch (error) {
    console.error('Failed to initialize socket:', error);
}

window.socket = socket;

window.addEventListener('error', (e) => console.error('Global Error:', e.error));
window.addEventListener('unhandledrejection', (e) => console.error('Unhandled Rejection:', e.reason));

class App {
    constructor() {
        console.log('App constructor: Initializing application state.');
        this.currentPage = 'dashboard';
        this.botConnectionStatus = 'disconnected';
        this.activeBotPhoneNumber = '';
        this.logoutModalOpen = false;
        this.notifications = [];
        this.unreadCount = 0;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        console.log('App.init(): Starting main application initialization.');
        this.isInitialized = true;

        this.loadUserProfile(); // Memuat profil pengguna saat inisialisasi
        this.setupEventListeners();
        this.initializeLucideIcons();
        this.listenForGlobalEvents();
        
        await this.fetchLatestNotifications();
        this.listenForSocketNotifications();
        
        if (Notification.permission === 'default') {
            setTimeout(() => this.requestNotificationPermission(), 5000);
        }

        this.handlePageNavigation();
        const initialPage = this.getCurrentPage();
        console.log(`App.init(): Initial page determined as: ${initialPage}`);
        this.navigateToPage(initialPage, true);
        console.log('App.init(): Main application initialization complete.');
    }

    loadUserProfile() {
        try {
            const userString = localStorage.getItem('currentUser');
            if (userString) {
                const user = JSON.parse(userString);
                // Pastikan fungsi updateAdminProfile ada di scope global
                if (typeof updateAdminProfile === 'function') {
                    updateAdminProfile(user);
                }
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateToPage(page);
                if (window.innerWidth < 1024) this.closeSidebar();
            });
        });

        document.getElementById('user-profile-button')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLogoutModal();
        });

        document.addEventListener('click', (e) => {
            const modal = document.getElementById('logout-modal');
            if (this.logoutModalOpen && !modal?.contains(e.target) && !e.target.closest('#user-profile-button')) {
                this.closeLogoutModal();
            }
        });

        document.getElementById('sidebar-toggle')?.addEventListener('click', () => this.openSidebar());
        document.getElementById('sidebar-close')?.addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
    }
    
    async fetchLatestNotifications() {
        try {
            const data = await api.get('./api/notifications/latest');
            this.notifications = data.latestNotifications || [];
            this.unreadCount = data.unreadCount || 0;
            this.updateNotificationBadge();
        } catch (error) {
            console.error('Error fetching latest notifications:', error);
        }
    }
    
    listenForSocketNotifications() {
        if (!socket) return;
        socket.on('new_notification', (notification) => {
            this.unreadCount++;
            this.notifications.unshift(notification);
            if (this.notifications.length > 5) this.notifications.pop();
            this.updateNotificationBadge();
            this.showDesktopNotification(notification);
            this.flashNotificationBadge();
        });
        
        socket.on('notification_updated', () => {
             this.fetchLatestNotifications();
        });
    }

    updateNotificationBadge() {
        const badge = document.getElementById('sidebar-notification-badge');
        if (!badge) return;
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    flashNotificationBadge() {
        const badge = document.getElementById('sidebar-notification-badge');
        if (badge) {
            badge.classList.add('notification-badge-pulse');
            setTimeout(() => badge.classList.remove('notification-badge-pulse'), 3000);
        }
    }

    requestNotificationPermission() {
        if (!('Notification' in window) || Notification.permission !== 'default') return;
        Modal.confirm({
            title: 'Izinkan Notifikasi',
            text: 'Dapatkan notifikasi real-time untuk pesan dan pesanan baru.',
            icon: 'info',
            confirmText: 'Izinkan',
            cancelText: 'Nanti'
        }).then(result => {
            if (result.isConfirmed) {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') Modal.toast({ title: 'Notifikasi Diizinkan!', icon: 'success' });
                });
            }
        });
    }

    showDesktopNotification(data) {
        Modal.toast({ title: data.title, text: data.body, icon: 'info' });
        if (Notification.permission !== 'granted') return;
        
        const notification = new Notification(data.title, {
            body: data.body,
            icon: '/dist/img/favicon.ico'
        });
        notification.onclick = () => {
            window.focus();
            this.navigateToPage('notifications');
        };
    }

    listenForGlobalEvents() {
        window.addEventListener('botStatusChanged', (e) => {
            this.botConnectionStatus = e.detail.status;
            this.activeBotPhoneNumber = e.detail.phoneNumber;
            if (window.Broadcast?.isInitialized) {
                window.Broadcast.updateBotStatus(this.botConnectionStatus);
            }
        });
    }

    toggleLogoutModal() {
        this.logoutModalOpen ? this.closeLogoutModal() : this.openLogoutModal();
    }
    
    openLogoutModal() {
        if (this.logoutModalOpen) return;
        const sidebar = document.getElementById('sidebar');
        const modalHTML = `<div id="logout-modal" class="absolute bottom-20 left-4 right-4 z-40"><div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"><button id="logout-button" class="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><i data-lucide="log-out" class="h-4 w-4 mr-3"></i>Logout</button></div></div>`;
        sidebar.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('logout-button').addEventListener('click', () => this.handleLogout());
        this.logoutModalOpen = true;
        lucide.createIcons();
    }

    closeLogoutModal() {
        if (!this.logoutModalOpen) return;
        document.getElementById('logout-modal')?.remove();
        this.logoutModalOpen = false;
    }

    async handleLogout() {
        this.closeLogoutModal();
        const result = await Modal.confirm({
            title: 'Konfirmasi Logout',
            text: 'Yakin ingin logout?',
            icon: 'warning',
            confirmText: 'Ya, Logout'
        });

        if (result.isConfirmed) {
            try {
                await api.post('./api/auth/logout');
                window.location.href = '/login';
            } catch (error) {
                window.location.href = '/login';
            }
        }
    }
    
    navigateToPage(page, isInitialLoad = false) {
        if (!page) page = 'dashboard';
        
        document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
        
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
        } else {
            document.getElementById('dashboard-page').style.display = 'block';
            page = 'dashboard';
        }
    
        this.updateNavigation(page);
        this.updatePageTitle(page);
        this.currentPage = page;
    
        if (!isInitialLoad) {
            history.pushState({ page }, '', `/${page}`);
        }
    
        this.initPageModule(page);
    }

    updateNavigation(activePage) {
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.getAttribute('data-page');
            const isActive = page === activePage;
            item.classList.toggle('bg-blue-50', isActive);
            item.classList.toggle('text-blue-700', isActive);
            item.classList.toggle('dark:bg-blue-900/30', isActive);
            item.classList.toggle('dark:text-blue-300', isActive);
            item.classList.toggle('border-r-2', isActive);
            item.classList.toggle('border-blue-600', isActive);
            item.classList.toggle('dark:border-blue-500', isActive);
        });
    }

    updatePageTitle(page) {
        const titles = {
            dashboard: 'Dashboard', products: 'Produk', customers: 'Pelanggan',
            orders: 'Pesanan', broadcast: 'Broadcast', admin: 'Admin',
            'bot-connection': 'Koneksi Bot', settings: 'Pengaturan', notifications: 'Notifikasi'
        };
        document.getElementById('page-title').textContent = titles[page] || 'Dashboard';
    }

    initPageModule(page) {
        console.log(`App.initPageModule(): Attempting to initialize module for page: '${page}'.`);
        const moduleName = page.charAt(0).toUpperCase() + page.slice(1).replace(/-(\w)/g, (_, l) => l.toUpperCase());
        const handler = window[moduleName];
        
        if (handler && typeof handler.init === 'function') {
            if (!handler.isInitialized) {
                try {
                    console.log(`App.initPageModule(): Found module '${moduleName}', calling init().`);
                    handler.init();
                } catch (error) {
                    console.error(`Error initializing module ${moduleName}:`, error);
                }
            } else {
                console.log(`App.initPageModule(): Module '${moduleName}' already initialized.`);
            }
        } else {
            console.warn(`App.initPageModule(): No valid module found for page '${page}'.`);
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(1);
        const validPages = ['dashboard', 'products', 'customers', 'orders', 'broadcast', 'admin', 'bot-connection', 'settings', 'notifications'];
        return validPages.includes(page) ? page : 'dashboard';
    }

    handlePageNavigation() {
        window.addEventListener('popstate', (event) => {
            const page = event.state ? event.state.page : this.getCurrentPage();
            this.navigateToPage(page, true);
        });
    }

    openSidebar() {
        document.getElementById('sidebar')?.classList.remove('-translate-x-full');
        document.getElementById('sidebar-overlay')?.classList.remove('hidden');
    }

    closeSidebar() {
        document.getElementById('sidebar')?.classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
    }

    initializeLucideIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed. Creating App instance.');
    window.app = new App();
    // The init is now called from index.html after all scripts are loaded
});
