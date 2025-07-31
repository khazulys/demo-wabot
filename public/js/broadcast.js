
window.Broadcast = {
    data: {
        selectedTag: 'all',
        message: '',
        broadcastHistory: [],
        isSending: false,
        botStatus: 'disconnected',
        customerTags: [
            { id: 'all', label: 'Semua Pelanggan', count: 0 }
        ]
    },
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        document.addEventListener('bot-status-change', (event) => {
            this.updateBotStatus(event.detail.status);
        });

        if (window.BotConnection && window.BotConnection.isInitialized) {
            this.updateBotStatus(window.BotConnection.data.connectionStatus);
        }

        this.updateCustomerCount();
        await this.fetchHistory();
    },

    updateBotStatus(status) {
        this.data.botStatus = status;
        this.render();
    },

    updateCustomerCount() {
        this.data.customerTags[0].count = window.dummyData?.customers?.length || 0;
    },

    async fetchHistory() {
        try {
            const data = await api.get('/api/broadcast/history');
            this.data.broadcastHistory = data.history;
        } catch (error) {
            console.error('Failed to fetch broadcast history:', error);
        } finally {
            this.render();
        }
    },
    
    render() {
        const container = document.getElementById('broadcast-page');
        if (!container) return;
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
    },

    getHTML() {
        const selectedTagInfo = this.data.customerTags.find(tag => tag.id === this.data.selectedTag);
        const isBotConnected = this.data.botStatus === 'connected';
        return `
            <div class="space-y-6">
                <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Broadcast</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Kirim pesan massal kepada pelanggan</p></div>
                
                ${!isBotConnected ? `
                <div class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div class="flex items-center">
                        <i data-lucide="alert-circle" class="h-5 w-5 text-red-500 dark:text-red-400 mr-2"></i>
                        <p class="text-sm text-red-600 dark:text-red-400">Bot WhatsApp tidak terhubung. <a href="#" id="go-to-connection-link" class="font-medium underline">Hubungkan bot</a> terlebih dahulu.</p>
                    </div>
                </div>` : ''}
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-1">
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Target Pelanggan</h3>
                            <div class="space-y-3">${this.data.customerTags.map(tag => `
                                <label class="flex items-center cursor-pointer">
                                    <input type="radio" name="customerTag" value="${escapeHTML(tag.id)}" ${this.data.selectedTag === tag.id ? 'checked' : ''} class="h-4 w-4 text-blue-600 dark:text-blue-500">
                                    <div class="ml-3 flex-1">
                                        <div class="flex justify-between">
                                            <span class="text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(tag.label)}</span>
                                            <span class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-800 dark:text-gray-300">${escapeHTML(tag.count)}</span>
                                        </div>
                                    </div>
                                </label>`).join('')}
                            </div>
                            ${selectedTagInfo ? `
                            <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <p class="text-sm text-blue-800 dark:text-blue-300"><strong>${escapeHTML(selectedTagInfo.count)}</strong> pelanggan akan menerima pesan ini</p>
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="lg:col-span-2">
                        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tulis Pesan</h3>
                            <div>
                                <textarea id="broadcast-message" rows="8" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Ketik pesan Anda..." ${!isBotConnected || this.data.isSending ? 'disabled' : ''}>${escapeHTML(this.data.message)}</textarea>
                            </div>
                            <div class="flex justify-end items-center pt-4">
                                <button id="broadcast-send-btn" class="inline-flex items-center px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed" ${!isBotConnected || this.data.isSending ? 'disabled' : ''}>
                                    ${this.data.isSending ? `<i data-lucide="loader-2" class="h-4 w-4 mr-2 animate-spin"></i><span>Mensimulasikan...</span>` : `<i data-lucide="send" class="h-4 w-4 mr-2"></i><span>Kirim Pesan</span>`}
                                </button>
                            </div>
                        </div>
                        <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Riwayat Broadcast</h3>
                            <div class="space-y-3">${this.data.broadcastHistory.length > 0 ? this.data.broadcastHistory.map(b => `
                                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <p class="text-sm font-medium text-gray-900 dark:text-white">${escapeHTML(b.targetLabel)}</p>
                                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${escapeHTML(new Date(b.createdAt).toLocaleString('id-ID'))} • ${escapeHTML(b.sentCount)}/${escapeHTML(b.totalRecipients)} terkirim</p>
                                        </div>
                                        <span class="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">${escapeHTML(b.status)}</span>
                                    </div>
                                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">${escapeHTML(b.message)}</p>
                                </div>`).join('') : '<p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Belum ada riwayat broadcast.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    setupEventListeners() {
        document.getElementById('broadcast-message')?.addEventListener('input', (e) => this.data.message = e.target.value);
        document.getElementById('broadcast-send-btn')?.addEventListener('click', () => this.handleSendBroadcast());
        document.getElementById('go-to-connection-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.app) window.app.navigateToPage('bot-connection');
        });
    },

    async handleSendBroadcast() {
        if (!this.data.message.trim()) return Modal.toast({ title: 'Pesan tidak boleh kosong!', icon: 'warning' });

        const selectedTagInfo = this.data.customerTags.find(tag => tag.id === this.data.selectedTag);
        if (!selectedTagInfo || selectedTagInfo.count === 0) return Modal.toast({ title: 'Tidak ada target!', text: 'Tidak ada pelanggan untuk dikirimi pesan.', icon: 'warning' });

        this.data.isSending = true;
        this.render();

        // Simulate a delay for sending
        await new Promise(resolve => setTimeout(resolve, 1500));

        const payload = {
            target: selectedTagInfo,
            message: this.data.message
        };

        try {
            const data = await api.post('/api/broadcast/send', payload);
            this.data.message = ''; // Clear message box
            Modal.toast({ title: 'Broadcast Terkirim!', text: data.message, icon: 'success' });
            await this.fetchHistory(); // This will also re-render
        } catch (error) {
            Modal.toast({ title: 'Gagal Mengirim', text: error.message, icon: 'error' });
        } finally {
            this.data.isSending = false;
            this.render();
        }
    }
};
