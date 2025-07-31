window.Admin = {
    data: {
        admins: [],
        isLoading: true
    },
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.initializeData();
        this.fetchAdmins();
    },

    initializeData() {
        // Selalu reset localStorage dengan data dari file dummy untuk konsistensi
        localStorage.setItem('dummyAdmins', JSON.stringify(window.dummyData.admins));
    },

    fetchAdmins() {
        this.data.isLoading = true;
        this.render();
        try {
            // Ambil data dari localStorage
            const adminsFromStorage = localStorage.getItem('dummyAdmins');
            this.data.admins = adminsFromStorage ? JSON.parse(adminsFromStorage) : [];
        } catch (error) {
            console.error('Gagal mengambil data admin dari localStorage:', error);
            this.data.admins = [];
        } finally {
            this.data.isLoading = false;
            this.render();
        }
    },

    render() {
        const container = document.getElementById('admin-page');
        if (!container) return;
        
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
    },

    setupEventListeners() {
        document.getElementById('add-admin-btn')?.addEventListener('click', () => this.showAddModal());
        
        document.querySelectorAll('.edit-admin-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const adminData = JSON.parse(e.currentTarget.dataset.admin);
                this.showEditModal(adminData);
            });
        });
        
        document.querySelectorAll('.delete-admin-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const { adminId, adminName } = e.currentTarget.dataset;
                this.deleteAdmin(adminId, adminName);
            });
        });
    },

    getHTML() {
        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola pengguna admin sistem</p></div>
                    <button id="add-admin-btn" class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800">
                        <i data-lucide="plus" class="h-4 w-4 mr-2"></i>Tambah Admin
                    </button>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700"><tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nama</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Username</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Password</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                        </tr></thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            ${this.data.isLoading ? `<tr><td colspan="4" class="text-center py-12 text-gray-500 dark:text-gray-400">Memuat...</td></tr>` :
                              this.data.admins.length > 0 ? this.data.admins.map(admin => `
                                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center">
                                        <div class="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-medium text-purple-800 dark:text-purple-300">${escapeHTML(admin.nama.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase())}</div>
                                        <div class="ml-4 text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(admin.nama)}</div>
                                    </div></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${escapeHTML(admin.username)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">••••••••</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><div class="flex justify-end space-x-2">
                                        <button class="edit-admin-btn p-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300" data-admin='${escapeHTML(JSON.stringify(admin))}'><i data-lucide="pencil" class="h-4 w-4"></i></button>
                                        <button class="delete-admin-btn p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" data-admin-id="${escapeHTML(admin._id)}" data-admin-name="${escapeHTML(admin.nama)}"><i data-lucide="trash-2" class="h-4 w-4"></i></button>
                                    </div></td>
                                </tr>`).join('') :
                              `<tr><td colspan="4" class="text-center py-12 text-gray-500 dark:text-gray-400">Belum ada admin.</td></tr>`
                            }
                        </tbody>
                    </table></div>
                </div>
            </div>
        `;
    },
    
    showAddModal() {
        const modalHTML = `
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tambah Admin Baru</h3>
            <form id="admin-form" class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label><input type="text" name="nama" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label><input type="text" name="username" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label><input type="password" name="password" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancel-modal-btn" class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
                    <button type="submit" class="px-4 py-2 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800">Tambah</button>
                </div>
            </form>
        `;
        Modal.show(modalHTML);
        document.getElementById('admin-form').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('cancel-modal-btn').addEventListener('click', () => Modal.close());
    },

    showEditModal(admin) {
        const modalHTML = `
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Admin</h3>
            <form id="admin-edit-form" class="space-y-4">
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label><input type="text" name="nama" value="${escapeHTML(admin.nama)}" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div><label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label><input type="text" name="username" value="${escapeHTML(admin.username)}" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required></div>
                <div><p class="text-xs text-gray-500 dark:text-gray-400">Mengubah password tidak didukung saat ini.</p></div>
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" id="cancel-modal-btn" class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
                    <button type="submit" class="px-4 py-2 text-white bg-blue-600 dark:bg-blue-700 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800">Simpan</button>
                </div>
            </form>
        `;
        Modal.show(modalHTML);
        document.getElementById('admin-edit-form').addEventListener('submit', (e) => this.handleEditSubmit(e, admin._id));
        document.getElementById('cancel-modal-btn').addEventListener('click', () => Modal.close());
    },

    async deleteAdmin(id, name) {
        const result = await Modal.confirm({
            title: 'Konfirmasi Hapus',
            text: `Yakin ingin menghapus admin "${escapeHTML(name)}"?`,
            icon: 'warning',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal'
        });
        
        if (result.isConfirmed) {
            try {
                let admins = JSON.parse(localStorage.getItem('dummyAdmins') || '[]');
                admins = admins.filter(admin => admin._id !== id);
                localStorage.setItem('dummyAdmins', JSON.stringify(admins));
                this.fetchAdmins(); // Re-fetch and re-render
                Modal.toast({ title: 'Berhasil!', text: 'Admin berhasil dihapus', icon: 'success' });
            } catch (error) {
                Modal.toast({ title: 'Gagal!', text: `Gagal menghapus admin: ${error.message}`, icon: 'error' });
            }
        }
    },

    handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            let admins = JSON.parse(localStorage.getItem('dummyAdmins') || '[]');
            const newAdmin = {
                _id: `adm${Date.now()}`,
                ...data
            };
            admins.push(newAdmin);
            localStorage.setItem('dummyAdmins', JSON.stringify(admins));
            
            this.fetchAdmins(); // Re-fetch and re-render
            Modal.close();
            Modal.toast({ title: 'Berhasil!', text: 'Admin baru berhasil ditambahkan', icon: 'success' });
        } catch (error) {
            Modal.toast({ title: 'Gagal!', text: `Gagal menambah admin: ${error.message}`, icon: 'error' });
        }
    },

    handleEditSubmit(event, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const updatedData = {
            nama: formData.get('nama'),
            username: formData.get('username')
        };

        try {
            let admins = JSON.parse(localStorage.getItem('dummyAdmins') || '[]');
            const adminIndex = admins.findIndex(admin => admin._id === id);

            if (adminIndex > -1) {
                admins[adminIndex] = { ...admins[adminIndex], ...updatedData };
                localStorage.setItem('dummyAdmins', JSON.stringify(admins));
                this.fetchAdmins(); // Re-fetch and re-render
                Modal.close();
                Modal.toast({ title: 'Berhasil!', text: 'Data admin berhasil diperbarui', icon: 'success' });
            } else {
                throw new Error('Admin tidak ditemukan');
            }
        } catch (error) {
            Modal.toast({ title: 'Gagal!', text: `Gagal memperbarui admin: ${error.message}`, icon: 'error' });
        }
    }
};