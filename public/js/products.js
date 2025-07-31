window.Products = {
    data: {
        activeTab: 'pulsa',
        products: [],
        isLoading: true,
        currentPage: 1,
        totalPages: 1
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        await this.fetchProducts(1);
        this.listenServerEvents();
    },

    listenServerEvents() {
        if (socket) {
            socket.on('products_updated', () => {
                this.fetchProducts(this.data.currentPage);
            });
        }
    },

    async fetchProducts(page = 1) {
        this.data.isLoading = true;
        this.data.currentPage = page;
        this.render();
        try {
            const data = await api.get(`./api/products?page=${page}&limit=10&type=${this.data.activeTab}`);
            this.data.products = data.products;
            this.data.currentPage = data.currentPage;
            this.data.totalPages = data.totalPages;
        } catch (error) {
            console.error('Gagal mengambil data produk:', error);
            this.data.products = [];
        } finally {
            this.data.isLoading = false;
            this.render();
        }
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

    render() {
        const container = document.getElementById('products-page');
        if (!container) return;
        
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
    },

    getHTML() {
        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Produk</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola produk pulsa dan e-wallet</p></div>
                    <button id="add-product-btn" class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"><i data-lucide="plus" class="h-4 w-4 mr-2"></i>Tambah Produk</button>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="border-b border-gray-200 dark:border-gray-700">
                        <nav class="flex space-x-8 px-6">
                            <button data-tab="pulsa" class="tab-button py-4 px-1 border-b-2 font-medium text-sm ${this.data.activeTab === 'pulsa' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"><div class="flex items-center"><i data-lucide="smartphone" class="h-4 w-4 mr-2"></i>Pulsa</div></button>
                            <button data-tab="ewallet" class="tab-button py-4 px-1 border-b-2 font-medium text-sm ${this.data.activeTab === 'ewallet' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"><div class="flex items-center"><i data-lucide="wallet" class="h-4 w-4 mr-2"></i>E-wallet</div></button>
                        </nav>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nama Produk</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nominal</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Harga</th>
                                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                ${this.data.isLoading ? `<tr><td colspan="4" class="text-center py-12 text-gray-500 dark:text-gray-400">Memuat...</td></tr>` : 
                                  this.data.products.length > 0 ? this.data.products.map(p => `
                                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(p.name)}</div></td>
                                        <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900 dark:text-white">Rp ${escapeHTML(p.nominal.toLocaleString('id-ID'))}</div></td>
                                        <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-gray-900 dark:text-white">Rp ${escapeHTML(p.harga.toLocaleString('id-ID'))}</div></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div class="flex justify-end space-x-2">
                                                <button class="edit-product-btn p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300" data-product='${escapeHTML(JSON.stringify(p))}'><i data-lucide="pencil" class="h-4 w-4"></i></button>
                                                <button class="delete-product-btn p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" data-product='${escapeHTML(JSON.stringify(p))}'><i data-lucide="trash-2" class="h-4 w-4"></i></button>
                                            </div>
                                        </td>
                                    </tr>`).join('') : 
                                  `<tr><td colspan="4" class="text-center py-12"><p class="text-gray-500 dark:text-gray-400">Belum ada produk.</p></td></tr>`
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
        document.getElementById('add-product-btn')?.addEventListener('click', () => this.showAddModal());
        
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });
        
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', (e) => this.showEditModal(JSON.parse(e.currentTarget.dataset.product)));
        });
        
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', (e) => this.deleteProduct(JSON.parse(e.currentTarget.dataset.product)));
        });
        
        document.querySelectorAll('.pagination-btn').forEach(button => {
            button.addEventListener('click', (e) => this.changePage(parseInt(e.currentTarget.dataset.page)));
        });
    },
    
    switchTab(tab) {
        this.data.activeTab = tab;
        this.fetchProducts(1);
    },
    
    changePage(page) {
        if (page < 1 || page > this.data.totalPages || page === this.data.currentPage || isNaN(page)) return;
        this.fetchProducts(page);
    },

    async saveProduct(data, isEdit = false) {
        try {
            const method = isEdit ? 'put' : 'post';
            await api[method]('/api/products', data);
            Modal.toast({ title: 'Berhasil!', text: 'Produk berhasil disimpan', icon: 'success' });
            // Fetch the products again to update the UI
            this.fetchProducts(isEdit ? this.data.currentPage : 1);
        } catch (error) {
            Modal.toast({ title: 'Gagal!', text: error.message || 'Gagal menyimpan produk', icon: 'error' });
        }
    },

    async deleteProduct(product) {
        const result = await Modal.confirm({
            title: 'Konfirmasi Hapus',
            text: `Yakin ingin menghapus ${escapeHTML(product.name)} nominal ${escapeHTML(product.nominal)}?`,
            icon: 'warning',
            confirmText: 'Ya, Hapus'
        });
        
        if (result.isConfirmed) {
            try {
                await api.delete('/api/products', { type: product.type, name: product.name, nominal: product.nominal });
                Modal.toast({ title: 'Berhasil!', text: 'Produk berhasil dihapus', icon: 'success' });
                // Fetch the products again to update the UI
                this.fetchProducts(this.data.currentPage);
            } catch (error) {
                Modal.toast({ title: 'Gagal!', text: `Gagal menghapus produk: ${error.message}`, icon: 'error' });
            }
        }
    },

    showAddModal() {
        const modalHTML = `
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tambah Produk Baru</h3>
            <form id="product-form" class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label><p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">${this.data.activeTab === 'pulsa' ? 'Pulsa' : 'E-Wallet'}</p></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Provider/E-wallet</label><input type="text" name="name" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nominal</label><input type="number" name="nominal" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Harga Jual</label><input type="number" name="harga" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancel-modal-btn" class="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800">Tambah</button>
                </div>
            </form>
        `;
        Modal.show(modalHTML);
        document.getElementById('product-form').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('cancel-modal-btn').addEventListener('click', () => Modal.close());
    },
    
    showEditModal(product) {
        const modalHTML = `
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Produk</h3>
            <form id="product-edit-form" class="space-y-4">
                <input type="hidden" name="name" value="${escapeHTML(product.name)}">
                <input type="hidden" name="nominal" value="${escapeHTML(product.nominal)}">
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label><input type="text" value="${escapeHTML(product.name)}" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" disabled></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nominal</label><input type="number" value="${escapeHTML(product.nominal)}" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400" disabled></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Harga Jual</label><input type="number" name="harga" value="${escapeHTML(product.harga)}" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" required></div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancel-modal-btn" class="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800">Simpan</button>
                </div>
            </form>
        `;
        Modal.show(modalHTML);
        document.getElementById('product-edit-form').addEventListener('submit', (e) => this.handleSubmit(e, true, product));
        document.getElementById('cancel-modal-btn').addEventListener('click', () => Modal.close());
    },

    handleSubmit(event, isEdit = false, oldProductData = {}) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const productData = {
            type: this.data.activeTab,
            name: formData.get('name'),
            nominal: parseInt(formData.get('nominal')),
            harga: parseInt(formData.get('harga'))
        };
        this.saveProduct(productData, isEdit);
        Modal.close();
    },
};
