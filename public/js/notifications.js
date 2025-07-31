window.Notifications = {
    data: {
        notifications: [],
        unreadCount: 0,
        isLoading: true,
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        await this.fetchNotifications();
        this.updateBadge();
    },

    async fetchNotifications() {
        this.data.isLoading = true;
        this.render();
        try {
            const response = await api.get('/api/notifications');
            this.data.notifications = response.notifications || [];
            this.data.unreadCount = response.unreadCount || 0;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            this.data.isLoading = false;
            this.render();
            this.updateBadge();
        }
    },

    updateBadge() {
        const badge = document.getElementById('sidebar-notification-badge');
        if (!badge) return;

        if (this.data.unreadCount > 0) {
            badge.textContent = this.data.unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    },

    render() {
        const container = document.getElementById('notifications-page');
        if (!container) return;
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
    },

    getHTML() {
        return `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
                    <button id="mark-all-read-btn" class="text-sm text-blue-600 dark:text-blue-400 hover:underline ${this.data.unreadCount === 0 ? 'opacity-50 pointer-events-none' : ''}">
                        Tandai semua dibaca
                    </button>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div id="notification-list" class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${this.data.isLoading ? '<p class="text-center py-12 text-gray-500 dark:text-gray-400">Memuat...</p>' :
                          this.data.notifications.length > 0 ? this.data.notifications.map(n => this.getNotificationItemHTML(n)).join('') :
                          '<p class="text-center text-gray-500 dark:text-gray-400 py-12">Tidak ada notifikasi.</p>'
                        }
                    </div>
                </div>
            </div>
        `;
    },
    
    getNotificationItemHTML(notification) {
        const icons = {
            order_success: { icon: 'check-circle', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
            order_pending: { icon: 'clock', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
            order_failed: { icon: 'x-circle', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
            bot_disconnected: { icon: 'zap-off', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
            new_customer: { icon: 'user-plus', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' }
        };
        const item = icons[notification.type] || { icon: 'bell', color: 'text-gray-500', bg: 'bg-gray-50' };
        const isUnread = !notification.read;

        return `
            <div class="relative flex items-start space-x-4 p-4 ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}">
                <div class="flex-shrink-0"><div class="h-10 w-10 rounded-full ${item.bg} flex items-center justify-center"><i data-lucide="${item.icon}" class="h-5 w-5 ${item.color}"></i></div></div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-800 dark:text-gray-200">${notification.message}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${new Date(notification.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                ${isUnread ? '<div class="absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-blue-500 rounded-full"></div>' : ''}
            </div>
        `;
    },

    setupEventListeners() {
        const markAllReadBtn = document.getElementById('mark-all-read-btn');
        if (markAllReadBtn && !markAllReadBtn.classList.contains('pointer-events-none')) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.markAllAsRead();
            });
        }
    },

    async markAllAsRead() {
        try {
            await api.post('/api/notifications/read');
            this.data.notifications.forEach(n => n.read = true);
            this.data.unreadCount = 0;
            this.render(); // Re-render to update the UI
            this.updateBadge();
            Modal.toast({ title: 'Berhasil', text: 'Semua notifikasi telah ditandai dibaca.', icon: 'success' });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            Modal.toast({ title: 'Error', text: 'Gagal menandai notifikasi.', icon: 'error' });
        }
    }
};