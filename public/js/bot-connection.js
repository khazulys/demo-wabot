window.BotConnection = {
    data: {
        phoneNumber: '',
        isConnecting: false,
        pairingCode: '',
        connectionStatus: 'disconnected', // disconnected, connecting, connected
        logs: []
    },
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.addLog('Selamat datang di Demo Koneksi Bot.', 'system');
        this.render();
    },

    addLog(message, type = 'system') {
        const colors = {
            system: 'text-gray-400',
            action: 'text-blue-400',
            event: 'text-purple-400',
            server: 'text-green-400',
            error: 'text-red-500'
        };
        if (this.data.logs.length > 200) this.data.logs.shift();
        this.data.logs.push({ message: `[${type.toUpperCase()}] ${message}`, color: colors[type] || colors.system, time: new Date().toLocaleTimeString() });
        this.render();
    },

    render() {
        const container = document.getElementById('bot-connection-page');
        if (!container) return;
        container.innerHTML = this.getHTML();
        this.setupEventListeners();
        lucide.createIcons();
        const terminal = document.getElementById('terminal-logs');
        if (terminal) terminal.scrollTop = terminal.scrollHeight;

        // Dispatch a custom event to notify other modules of the status change
        const event = new CustomEvent('bot-status-change', { 
            detail: { status: this.data.connectionStatus } 
        });
        document.dispatchEvent(event);
    },

    setupEventListeners() {
        const phoneInput = document.getElementById('phone-number');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.data.phoneNumber = e.target.value;
                // Re-render only the button to enable/disable it
                const buttonContainer = document.querySelector('.action-button-container');
                if(buttonContainer) buttonContainer.innerHTML = this.getActionButtonHTML();
                // Re-add listener to the new button
                document.getElementById('main-action-button')?.addEventListener('click', () => this.handleConnect());
            });
        }
        document.getElementById('main-action-button')?.addEventListener('click', () => {
            if (this.data.connectionStatus === 'connected') this.handleDisconnect();
            else this.handleConnect();
        });
    },
    
    handleConnect() {
        this.addLog(`Nomor ${this.data.phoneNumber} diterima. Memulai simulasi koneksi...`, 'action');
        this.data.connectionStatus = 'connecting';
        this.data.pairingCode = '';
        this.render();

        setTimeout(() => {
            this.addLog('Meminta kode pairing dari server simulasi...', 'server');
            this.data.pairingCode = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
            this.render();
        }, 2000);

        setTimeout(() => {
            this.addLog('Server simulasi mengonfirmasi koneksi berhasil!', 'server');
            this.data.connectionStatus = 'connected';
            this.data.pairingCode = '';
            this.render();
        }, 8000);
    },

    handleDisconnect() {
        this.addLog('Memutuskan koneksi...', 'action');
        this.data.connectionStatus = 'disconnected';
        this.data.pairingCode = '';
        this.render();
    },

    getHTML() {
        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div><h1 class="text-2xl font-bold text-gray-900 dark:text-white">Koneksi Bot</h1><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Simulasi untuk menghubungkan bot WhatsApp.</p></div>
                    <div class="mt-4 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${this.getStatusColor(this.data.connectionStatus)}">${this.getStatusIcon(this.data.connectionStatus)}<span class="ml-2">${this.getStatusText(this.data.connectionStatus)}</span></div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><i data-lucide="smartphone" class="h-5 w-5 mr-2"></i>Setup Koneksi</h3>
                        <div class="space-y-4">
                            <div>
                                <label for="phone-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Telepon Bot</label>
                                <input type="tel" id="phone-number" placeholder="Contoh: 628123456789" class="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" ${this.data.connectionStatus !== 'disconnected' ? 'disabled' : ''} value="${this.data.phoneNumber}"/>
                            </div>
                            <div class="space-y-2 action-button-container">${this.getActionButtonHTML()}</div>
                            ${this.data.pairingCode ? `<div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 rounded-lg"><h4 class="text-sm font-medium text-blue-900 dark:text-blue-300">Kode Pairing</h4><div class="text-center"><span class="text-2xl font-mono font-bold text-blue-700 dark:text-blue-400">${this.data.pairingCode}</span></div></div>` : ''}
                        </div>
                    </div>
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><i data-lucide="terminal" class="inline-block h-5 w-5 mr-2"></i>Log Koneksi</h3>
                        <div class="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm text-white">
                            <div id="terminal-logs" class="space-y-1">${this.data.logs.map(log => `<div class="flex items-start"><span class="text-gray-500 mr-2">${log.time}</span><span class="${log.color}">${log.message}</span></div>`).join('')}</div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    getActionButtonHTML() {
        const connectButton = `<button id="main-action-button" class="w-full inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50" ${!this.data.phoneNumber.trim() ? 'disabled' : ''}><i data-lucide="wifi" class="h-4 w-4 mr-2"></i><span>Hubungkan</span></button>`;
        const connectingButton = (text) => `<button id="main-action-button" class="w-full inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg bg-yellow-600 disabled:opacity-70" disabled><i data-lucide="loader-2" class="h-4 w-4 mr-2 animate-spin"></i><span>${text}</span></button>`;
        const disconnectButton = `<button id="main-action-button" class="w-full inline-flex items-center justify-center px-4 py-2 text-white text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700"><i data-lucide="x-circle" class="h-4 w-4 mr-2"></i><span>Putuskan</span></button>`;
        
        switch(this.data.connectionStatus) {
            case 'connecting': return connectingButton('Menghubungkan...');
            case 'connected': return disconnectButton;
            default: return connectButton;
        }
    },

    getStatusColor: (status) => {
        switch (status) { 
            case 'connected': return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30'; 
            case 'connecting': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30'; 
            default: return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30'; 
        }
    },

    getStatusText: (status) => {
        switch (status) { 
            case 'connected': return 'Terhubung'; 
            case 'connecting': return 'Menghubungkan...';
            default: return 'Terputus'; 
        }
    },

    getStatusIcon: (status) => {
        switch (status) { 
            case 'connected': return '<i data-lucide="check-circle" class="h-4 w-4"></i>'; 
            case 'connecting': return '<i data-lucide="loader-2" class="h-4 w-4 animate-spin"></i>';
            default: return '<i data-lucide="x-circle" class="h-4 w-4"></i>'; 
        }
    }
};
