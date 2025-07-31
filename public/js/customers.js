
window.Customers = {
    data: {
        searchTerm: '',
        customers: [],
        isLoading: true,
        currentPage: 1,
        totalPages: 1,
        debounceTimer: null
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        await this.fetchCustomers(1);
    },

    async fetchCustomers(page = 1) {
        this.data.isLoading = true;
        this.render();
        try {
            const data = await api.get(`/api/customers?page=${page}&limit=10&search=${this.data.searchTerm}`);
            this.data.customers = data.customers;
            this.data.currentPage = data.currentPage;
            this.data.totalPages = data.totalPages;
        } catch (error) {
            this.data.customers = [];
        } finally {
            this.data.isLoading = false;
            this.render();
        }
    },

    render() {
        const container = document.getElementById('customers-page');
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
                    <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pelanggan</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola data pelanggan Anda</p></div>
                    <div class="mt-4 sm:mt-0 relative">
                        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"></i>
                        <input type="text" id="customer-search" value="${escapeHTML(this.data.searchTerm)}" placeholder="Cari nama atau nomor..." class="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700"><tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nama</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nomor WA</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tanggal Daftar</th>
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                            </tr></thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                ${this.data.isLoading ? `<tr><td colspan="4" class="text-center py-12 text-gray-500 dark:text-gray-400">Memuat...</td></tr>` : 
                                  this.data.customers.length > 0 ? this.data.customers.map(customer => `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center">
                                            <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-800 dark:text-blue-300">${escapeHTML(customer.nama.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase())}</div>
                                            <div class="ml-4 text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(customer.nama)}</div>
                                        </div></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${escapeHTML(customer.nomor_wa.replace('@s.whatsapp.net', ''))}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${escapeHTML(new Date(customer.pertama_kali_order).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }))}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div class="flex justify-end space-x-2">
                                            <button class="view-detail-btn p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" data-id="${customer._id}"><i data-lucide="eye" class="h-4 w-4"></i></button>
                                            <button class="delete-customer-btn p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" data-id="${customer._id}" data-name="${escapeHTML(customer.nama)}"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
                                        </div></td>
                                    </tr>`).join('') : 
                                  `<tr><td colspan="4" class="text-center py-12"><p class="text-gray-500 dark:text-gray-400">${this.data.searchTerm ? 'Pelanggan tidak ditemukan' : 'Belum ada data pelanggan'}</p></td></tr>`
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
        document.getElementById('customer-search')?.addEventListener('input', (e) => {
            clearTimeout(this.data.debounceTimer);
            this.data.searchTerm = e.target.value;
            this.data.debounceTimer = setTimeout(() => this.fetchCustomers(1), 500);
        });
        
        document.querySelectorAll('.view-detail-btn').forEach(button => {
            button.addEventListener('click', (e) => this.viewDetail(e.currentTarget.dataset.id));
        });
        
        document.querySelectorAll('.delete-customer-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const { id, name } = e.currentTarget.dataset;
                this.deleteCustomer(id, name);
            });
        });

        document.querySelectorAll('.pagination-btn').forEach(button => {
            button.addEventListener('click', (e) => this.changePage(parseInt(e.currentTarget.dataset.page)));
        });
    },

    changePage(page) {
        if (page < 1 || page > this.data.totalPages || page === this.data.currentPage || isNaN(page)) return;
        this.fetchCustomers(page);
    },

    async viewDetail(id) {
        try {
            const { pelanggan, riwayat } = await api.get(`/api/customers/${id}`);
            const modalHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">Detail Pelanggan</h3>
                    <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"><i data-lucide="x" class="h-5 w-5"></i></button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"><span class="text-lg font-medium text-blue-800 dark:text-blue-300">${escapeHTML(pelanggan.nama.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase())}</span></div>
                        <div><h3 class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHTML(pelanggan.nama)}</h3><p class="text-sm text-gray-500 dark:text-gray-400">ID: ...${escapeHTML(pelanggan._id.slice(-6))}</p></div>
                    </div>
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4"><dl class="space-y-3">
                        <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nomor WhatsApp</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(pelanggan.nomor_wa.replace('@s.whatsapp.net', ''))}</dd></div>
                        <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Daftar</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(new Date(pelanggan.pertama_kali_order).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }))}</dd></div>
                        <div><dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Jumlah Transaksi</dt><dd class="text-sm text-gray-900 dark:text-white">${escapeHTML(pelanggan.jumlah_transaksi)} kali</dd></div>
                    </dl></div>
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">5 Transaksi Terakhir</h4>
                        <div class="space-y-2 max-h-40 overflow-y-auto">
                            ${riwayat.length > 0 ? riwayat.map(order => `<div class="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">${escapeHTML(order.item_order.produk)} ${escapeHTML(order.item_order.nominal.toLocaleString('id-ID'))} - ${escapeHTML(new Date(order.createdAt).toLocaleString('id-ID'))}</div>`).join('') : '<p class="text-xs text-gray-500 dark:text-gray-400">Belum ada riwayat transaksi.</p>'}
                        </div>
                    </div>
                </div>`;
            Modal.show(modalHTML);
            document.getElementById('close-modal-btn').addEventListener('click', () => Modal.close());
        } catch (error) {
            Modal.toast({ title: 'Error!', text: `Gagal memuat detail: ${error.message}`, icon: 'error' });
        }
    },

    async deleteCustomer(id, name) {
        const result = await Modal.confirm({
            title: 'Konfirmasi Hapus',
            text: `Yakin ingin menghapus pelanggan "${escapeHTML(name)}"?`,
            icon: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal'
        });
        
        if (result.isConfirmed) {
            try {
                await api.delete(`/api/customers/${id}`);
                Modal.toast({ title: 'Berhasil!', text: 'Pelanggan berhasil dihapus', icon: 'success' });
                this.fetchCustomers(this.data.currentPage);
            } catch (error) {
                Modal.toast({ title: 'Error!', text: 'Gagal menghapus pelanggan.', icon: 'error' });
            }
        }
    }
};
