window.Dashboard = {
    data: {
        stats: { totalPendapatan: 0, totalPesanan: 0, totalPelanggan: 0 },
        pesananTerbaru: [],
        salesData: [],
        isLoading: true,
        chartInstance: null
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        console.log('Dashboard.init(): Initializing dashboard module.');
        this.isInitialized = true;
        
        this.render(); 
        await this.fetchStats();
        this.listenServerEvents();
        console.log('Dashboard.init(): Dashboard module initialization complete.');
    },

    async fetchStats() {
        console.log('Dashboard.fetchStats(): Fetching dashboard statistics.');
        this.data.isLoading = true;
        this.render();
        try {
            const data = await api.get('./api/dashboard/stats');
            console.log('Dashboard.fetchStats(): API response received:', data);
            this.data.stats = data.stats || { totalPendapatan: 0, totalPesanan: 0, totalPelanggan: 0 };
            this.data.pesananTerbaru = data.pesananTerbaru || [];
            this.data.salesData = data.salesData || [];
        } catch (error) {
            console.error('Gagal mengambil statistik dashboard:', error);
        } finally {
            this.data.isLoading = false;
            this.render();
        }
    },

    listenServerEvents() {
        if (socket) {
            socket.on('orders_updated', () => this.fetchStats());
            socket.on('customers_updated', () => this.fetchStats());
        }
    },

    render() {
        const container = document.getElementById('dashboard-page');
        if (!container) {
            console.error('Dashboard.render(): Could not find container element #dashboard-page.');
            return;
        }
        
        container.innerHTML = this.getHTML();
        
        if (!this.data.isLoading) {
            this.initializeChart();
        }
        
        this.setupEventListeners();
        lucide.createIcons();
    },
    
    setupEventListeners() {
        document.querySelectorAll('.quick-action-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                if (page && window.app) {
                    window.app.navigateToPage(page);
                }
            });
        });
    },

    initializeChart() {
        const ctx = document.getElementById('sales-chart-canvas');
        if (!ctx || !this.data.salesData || this.data.salesData.length === 0) return;
        
        if (this.data.chartInstance) {
            this.data.chartInstance.destroy();
        }

        const isDarkMode = document.documentElement.classList.contains('dark');
        const textColor = isDarkMode ? '#e5e7eb' : '#374151';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        this.data.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.salesData.map(d => d.day),
                datasets: [{
                    label: 'Total Pendapatan',
                    data: this.data.salesData.map(d => d.revenue),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: (context) => ` Rp ${context.raw.toLocaleString('id-ID')}` },
                        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor, callback: (value) => `Rp ${value/1000}k` },
                        grid: { color: gridColor }
                    },
                    x: { ticks: { color: textColor }, grid: { color: gridColor } }
                }
            }
        });
        
        document.removeEventListener('darkModeChanged', this.handleDarkModeChange);
        document.addEventListener('darkModeChanged', this.handleDarkModeChange.bind(this));
    },

    handleDarkModeChange() {
        this.initializeChart();
    },

    getHTML() {
        if (this.data.isLoading) {
            return `<div class="flex items-center justify-center py-12"><div class="text-center"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div><p class="text-gray-600 dark:text-gray-300">Memuat data dashboard...</p></div></div>`;
        }
        
        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div class="flex items-center justify-between"><div><p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pendapatan</p><p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">Rp ${escapeHTML(this.data.stats.totalPendapatan.toLocaleString('id-ID'))}</p></div><div class="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg"><i data-lucide="dollar-sign" class="h-6 w-6 text-green-600 dark:text-green-400"></i></div></div></div>
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div class="flex items-center justify-between"><div><p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pesanan</p><p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">${escapeHTML(this.data.stats.totalPesanan.toLocaleString('id-ID'))}</p></div><div class="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg"><i data-lucide="shopping-cart" class="h-6 w-6 text-orange-600 dark:text-orange-400"></i></div></div></div>
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"><div class="flex items-center justify-between"><div><p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pelanggan</p><p class="text-2xl font-bold text-gray-900 dark:text-white mt-2">${escapeHTML(this.data.stats.totalPelanggan.toLocaleString('id-ID'))}</p></div><div class="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg"><i data-lucide="users" class="h-6 w-6 text-purple-600 dark:text-purple-400"></i></div></div></div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Grafik Pendapatan (7 Hari Terakhir)</h2>
                    <div class="h-80"><canvas id="sales-chart-canvas"></canvas></div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">5 Pesanan Terbaru</h3>
                        <div class="space-y-3">
                            ${this.data.pesananTerbaru.length > 0 ? this.data.pesananTerbaru.map(order => `<div class="flex items-center justify-between py-2 border-b dark:border-gray-700 last:border-0"><div><p class="text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(order.nama_pelanggan)}</p><p class="text-xs text-gray-500 dark:text-gray-400">${escapeHTML(order.item_order.produk)} ${escapeHTML(order.item_order.nominal.toLocaleString('id-ID'))}</p></div><div class="text-right"><p class="text-xs text-gray-500 dark:text-gray-400">${escapeHTML(new Date(order.createdAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }))}</p><span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${this.getStatusBadge(order.status)}">${escapeHTML(this.getStatusText(order.status))}</span></div></div>`).join('') : '<p class="text-sm text-gray-500 dark:text-gray-400">Belum ada pesanan.</p>'}
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button data-page="products" class="quick-action-btn p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center transition-colors duration-150"><i data-lucide="shopping-bag" class="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2"></i><span class="text-sm font-medium text-gray-900 dark:text-white block">Kelola Produk</span></button>
                            <button data-page="orders" class="quick-action-btn p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center transition-colors duration-150"><i data-lucide="list-ordered" class="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2"></i><span class="text-sm font-medium text-gray-900 dark:text-white block">Lihat Pesanan</span></button>
                            <button data-page="customers" class="quick-action-btn p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center transition-colors duration-150"><i data-lucide="users" class="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2"></i><span class="text-sm font-medium text-gray-900 dark:text-white block">Data Pelanggan</span></button>
                            <button data-page="broadcast" class="quick-action-btn p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center transition-colors duration-150"><i data-lucide="radio" class="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2"></i><span class="text-sm font-medium text-gray-900 dark:text-white block">Kirim Broadcast</span></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    getStatusBadge(status) {
        const classes = {
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            gagal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    },
    getStatusText(status) {
        const texts = { paid: 'Berhasil', pending: 'Pending', failed: 'Gagal', gagal: 'Gagal' };
        return texts[status] || status;
    }
};
