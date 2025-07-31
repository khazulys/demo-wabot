
/**
 * Utility function to escape HTML special characters.
 */
function escapeHTML(str) {
    if (str === null || typeof str === 'undefined') return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.Orders = {
    data: {
        orders: [],
        isLoading: true,
        currentPage: 1,
        totalPages: 1,
        filter: 'all',
        searchTerm: '',
        debounceTimer: null
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        await this.fetchOrders(1);
    },

    async fetchOrders(page = 1) {
        this.data.isLoading = true;
        this.render();
        try {
            const data = await api.get(`/api/orders?page=${page}&limit=10&status=${this.data.filter}&search=${this.data.searchTerm}`);
            this.data.orders = data.orders;
            this.data.currentPage = data.currentPage;
            this.data.totalPages = data.totalPages;
        } catch (error) {
            console.error('Gagal mengambil data pesanan:', error);
            this.data.orders = [];
        } finally {
            this.data.isLoading = false;
            this.render();
        }
    },

    render() {
        const container = document.getElementById('orders-page');
        if (!container) return;
        
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
    },

    getPaginationHTML() {
        if (this.data.totalPages <= 1) return '';
        let buttonsHTML = '';
        const { currentPage, totalPages } = this.data;

        buttonsHTML += `<button data-page="${currentPage - 1}" class="pagination-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50" ${currentPage === 1 ? 'disabled' : ''}><i data-lucide="chevron-left" class="h-5 w-5"></i></button>`;
        for (let i = 1; i <= totalPages; i++) {
            buttonsHTML += `<button data-page="${i}" class="pagination-btn relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${i === currentPage ? 'z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}">${i}</button>`;
        }
        buttonsHTML += `<button data-page="${currentPage + 1}" class="pagination-btn relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50" ${currentPage === totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" class="h-5 w-5"></i></button>`;
        
        return `<div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button data-page="${currentPage - 1}" class="pagination-btn relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                    <button data-page="${currentPage + 1}" class="pagination-btn ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div><p class="text-sm text-gray-700 dark:text-gray-300">Halaman <span class="font-medium">${currentPage}</span> dari <span class="font-medium">${totalPages}</span></p></div>
                    <div><nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">${buttonsHTML}</nav></div>
                </div>
            </div>`;
    },

    getHTML() {
        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pesanan</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola semua pesanan yang masuk</p></div>
                    <div class="mt-4 sm:mt-0 relative">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"></i>
                        <input type="text" id="order-search" value="${escapeHTML(this.data.searchTerm)}" placeholder="Cari nama atau produk..." class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="border-b border-gray-200 dark:border-gray-700">
                        <nav class="flex flex-wrap space-x-4 sm:space-x-8 px-4 sm:px-6">
                            <button data-filter="all" class="filter-btn py-4 px-1 border-b-2 font-medium text-sm ${this.data.filter === 'all' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}">Semua</button>
                            <button data-filter="paid" class="filter-btn py-4 px-1 border-b-2 font-medium text-sm ${this.data.filter === 'paid' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}">Berhasil</button>
                            <button data-filter="pending" class="filter-btn py-4 px-1 border-b-2 font-medium text-sm ${this.data.filter === 'pending' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}">Pending</button>
                            <button data-filter="gagal" class="filter-btn py-4 px-1 border-b-2 font-medium text-sm ${this.data.filter === 'gagal' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}">Gagal</button>
                        </nav>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700"><tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pelanggan</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Produk</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tanggal</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                            </tr></thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                ${this.data.isLoading ? `<tr><td colspan="5" class="text-center py-12 text-gray-500 dark:text-gray-400">Memuat...</td></tr>` : 
                                  this.data.orders.length > 0 ? this.data.orders.map(order => `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(order.nama_pelanggan)}</div><div class="text-xs text-gray-500 dark:text-gray-400">${escapeHTML(order.nomor_wa.replace('@s.whatsapp.net', ''))}</div></td>
                                        <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900 dark:text-white">${escapeHTML(order.item_order.produk)} ${escapeHTML(order.item_order.nominal.toLocaleString('id-ID'))}</div><div class="text-xs text-gray-500 dark:text-gray-400">Rp ${escapeHTML(order.item_order.harga.toLocaleString('id-ID'))}</div></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${escapeHTML(new Date(order.createdAt).toLocaleString('id-ID'))}</td>
                                        <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusBadge(order.status)}">${escapeHTML(this.getStatusText(order.status))}</span></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button class="view-detail-btn p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" data-order='${escapeHTML(JSON.stringify(order))}'><i data-lucide="eye" class="h-4 w-4"></i></button>
                                            ${['paid', 'gagal', 'pending'].includes(order.status) ? `<button class="delete-order-btn p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" data-order-id="${escapeHTML(order._id)}"><i data-lucide="trash-2" class="h-4 w-4"></i></button>` : ''}
                                        </td>
                                    </tr>`).join('') : 
                                  `<tr><td colspan="5" class="text-center py-12"><p class="text-gray-500 dark:text-gray-400">${this.data.searchTerm ? 'Pesanan tidak ditemukan' : 'Belum ada pesanan'}</p></td></tr>`
                                }
                            </tbody>
                        </table>
                    </div>
                    ${this.getPaginationHTML()}
                </div>
            </div>
        `;
    },

    setupEventListeners() {
        document.getElementById('order-search')?.addEventListener('input', (e) => {
            clearTimeout(this.data.debounceTimer);
            this.data.searchTerm = e.target.value;
            this.data.debounceTimer = setTimeout(() => this.fetchOrders(1), 500);
        });
        
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => this.filterBy(e.currentTarget.dataset.filter));
        });
        
        document.querySelectorAll('.view-detail-btn').forEach(button => {
            button.addEventListener('click', (e) => this.viewDetail(JSON.parse(e.currentTarget.dataset.order)));
        });

        document.querySelectorAll('.delete-order-btn').forEach(button => {
            button.addEventListener('click', (e) => this.deleteOrder(e.currentTarget.dataset.orderId));
        });
        
        document.querySelectorAll('.pagination-btn').forEach(button => {
            button.addEventListener('click', (e) => this.changePage(parseInt(e.currentTarget.dataset.page)));
        });
    },

    async deleteOrder(orderId) {
        const result = await Modal.confirm({
            title: 'Apakah Anda yakin?',
            text: "Anda tidak akan dapat mengembalikan ini!",
            icon: 'warning',
            confirmText: 'Ya, hapus!',
            cancelText: 'Batal'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/orders/${orderId}`);
                Modal.toast({ title: 'Dihapus!', text: 'Pesanan telah dihapus.', icon: 'success' });
                this.fetchOrders(this.data.currentPage);
            } catch (error) {
                console.error('Gagal menghapus pesanan:', error);
                Modal.toast({ title: 'Gagal!', text: 'Gagal menghapus pesanan. Silakan coba lagi.', icon: 'error' });
            }
        }
    },

    filterBy(status) {
        this.data.filter = status;
        this.fetchOrders(1);
    },

    changePage(page) {
        if (page < 1 || page > this.data.totalPages || page === this.data.currentPage || isNaN(page)) return;
        this.fetchOrders(page);
    },

    viewDetail(order) {
        const modalHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Detail Pesanan</h3>
                <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"><i data-lucide="x" class="h-5 w-5"></i></button>
            </div>
            <div class="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <dl class="space-y-3">
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">ID Pesanan</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(order._id)}</dd></div>
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Pelanggan</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(order.nama_pelanggan)}</dd></div>
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nomor WA</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(order.nomor_wa.replace('@s.whatsapp.net', ''))}</dd></div>
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Produk</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(order.item_order.produk)} ${escapeHTML(order.item_order.nominal.toLocaleString('id-ID'))}</dd></div>
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Harga</dt><dd class="text-sm text-gray-900 dark:text-white">Rp ${escapeHTML(order.item_order.harga.toLocaleString('id-ID'))}</dd></div>
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(new Date(order.createdAt).toLocaleString('id-ID'))}</dd></div>
                    <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt><dd class="text-sm text-gray-900 dark:text-white"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusBadge(order.status)}">${escapeHTML(this.getStatusText(order.status))}</span></dd></div>
                </dl>
            </div>`;
        Modal.show(modalHTML);
        document.getElementById('close-modal-btn').addEventListener('click', () => Modal.close());
    },

    getStatusBadge(status) {
        const classes = {
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            gagal: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
        return classes[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    },

    getStatusText(status) {
        const texts = { paid: 'Berhasil', pending: 'Pending', gagal: 'Gagal' };
        return texts[status] || status;
    }
};
