window.Settings = {
    data: {
        formData: {
            geminiToken: '',
            midtransToken: '',
            adminPhone: '',
            geminiPrompt: ''
        }
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        await this.fetchSettings();
    },

    async fetchSettings() {
        try {
            const settings = await api.get('./api/setting');
            this.data.formData = {
                geminiToken: settings.GEMINI_API_KEY || '',
                midtransToken: settings.MIDTRANS_KEY || '',
                adminPhone: settings.ADMIN_WHATSAPP_NUMBER || '',
                geminiPrompt: settings.SYSTEM_PROMPT || ''
            };
        } catch (error) {
            console.error('Error fetching settings:', error);
            Modal.toast({ title: 'Error', text: 'Gagal memuat pengaturan.', icon: 'error' });
        } finally {
            this.render();
        }
    },

    render() {
        const container = document.getElementById('settings-page');
        if (!container) return;
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
    },

    getHTML() {
        return `
            <div class="space-y-6">
                <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Pengaturan</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Konfigurasi API dan Prompt AI</p></div>
                <form id="settings-form" class="space-y-6">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><i data-lucide="key" class="h-5 w-5 mr-2"></i>Kunci API</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Token Gemini AI</label>
                                <div class="relative"><input type="password" id="geminiToken" name="geminiToken" value="${escapeHTML(this.data.formData.geminiToken)}" class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Masukkan token Gemini"/><span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer toggle-password" data-target="geminiToken"><i data-lucide="eye" class="h-5 w-5 text-gray-400"></i></span></div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Server Key Midtrans</label>
                                <div class="relative"><input type="password" id="midtransToken" name="midtransToken" value="${escapeHTML(this.data.formData.midtransToken)}" class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Masukkan server key Midtrans"/><span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer toggle-password" data-target="midtransToken"><i data-lucide="eye" class="h-5 w-5 text-gray-400"></i></span></div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><i data-lucide="bot" class="h-5 w-5 mr-2"></i>Konfigurasi Bot</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nomor Admin Utama</label>
                                <input type="tel" name="adminPhone" value="${escapeHTML(this.data.formData.adminPhone)}" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Contoh: 628123456789"/>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prompt Sistem Gemini AI</label>
                                <textarea name="geminiPrompt" rows="8" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white overflow-y-auto">${escapeHTML(this.data.formData.geminiPrompt)}</textarea>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end pt-4">
                        <button type="submit" class="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><i data-lucide="save" class="h-4 w-4 mr-2"></i>Simpan Pengaturan</button>
                    </div>
                </form>
            </div>
        `;
    },

    setupEventListeners() {
        document.getElementById('settings-form')?.addEventListener('submit', (event) => this.handleSubmit(event));
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                this.togglePasswordVisibility(targetId, button);
            });
        });
    },

    async handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const settingsData = {
            GEMINI_API_KEY: formData.get('geminiToken'),
            MIDTRANS_KEY: formData.get('midtransToken'),
            ADMIN_WHATSAPP_NUMBER: formData.get('adminPhone'),
            SYSTEM_PROMPT: formData.get('geminiPrompt')
        };
        
        try {
            await api.post('./api/setting', settingsData);
            Modal.toast({ title: 'Berhasil!', text: 'Pengaturan berhasil disimpan.', icon: 'success' });
        } catch (error) {
            Modal.toast({ title: 'Gagal!', text: 'Gagal menyimpan pengaturan.', icon: 'error' });
        }
    },
    
    togglePasswordVisibility(inputId, button) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.innerHTML = isPassword ? '<i data-lucide="eye-off" class="h-5 w-5 text-gray-400"></i>' : '<i data-lucide="eye" class="h-5 w-5 text-gray-400"></i>';
        lucide.createIcons();
    }
};