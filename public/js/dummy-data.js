
window.dummyData = {
    products: {
        pulsa: [
            { _id: 'p1', type: 'pulsa', name: 'Telkomsel', nominal: 5000, harga: 6500 },
            { _id: 'p2', type: 'pulsa', name: 'Telkomsel', nominal: 10000, harga: 11500 },
            { _id: 'p3', type: 'pulsa', name: 'XL', nominal: 10000, harga: 11000 },
            { _id: 'p4', type: 'pulsa', name: 'Indosat', nominal: 25000, harga: 25500 },
            { _id: 'p5', type: 'pulsa', name: 'Axis', nominal: 50000, harga: 50000 },
        ],
        ewallet: [
            { _id: 'e1', type: 'ewallet', name: 'GoPay', nominal: 20000, harga: 21000 },
            { _id: 'e2', type: 'ewallet', name: 'OVO', nominal: 50000, harga: 51000 },
            { _id: 'e3', type: 'ewallet', name: 'Dana', nominal: 100000, harga: 100500 },
            { _id: 'e4', type: 'ewallet', name: 'ShopeePay', nominal: 25000, harga: 26000 },
        ]
    },
    customers: [
        { _id: 'c1', nama: 'Budi Santoso', nomor_wa: '6281234567890@s.whatsapp.net', pertama_kali_order: new Date('2024-07-10T10:00:00Z'), jumlah_transaksi: 5 },
        { _id: 'c2', nama: 'Citra Lestari', nomor_wa: '6285678901234@s.whatsapp.net', pertama_kali_order: new Date('2024-07-11T11:30:00Z'), jumlah_transaksi: 2 },
        { _id: 'c3', nama: 'Ahmad Dahlan', nomor_wa: '6287712345678@s.whatsapp.net', pertama_kali_order: new Date('2024-07-12T14:00:00Z'), jumlah_transaksi: 8 },
        { _id: 'c4', nama: 'Dewi Sartika', nomor_wa: '6289987654321@s.whatsapp.net', pertama_kali_order: new Date('2024-07-13T09:00:00Z'), jumlah_transaksi: 1 },
        { _id: 'c5', nama: 'Eka Wijaya', nomor_wa: '6282111223344@s.whatsapp.net', pertama_kali_order: new Date('2024-07-14T16:45:00Z'), jumlah_transaksi: 12 },
    ],
    orders: [
        { _id: 'o1', nama_pelanggan: 'Budi Santoso', nomor_wa: '6281234567890@s.whatsapp.net', item_order: { produk: 'Telkomsel', nominal: 10000, harga: 11500 }, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), status: 'paid' },
        { _id: 'o2', nama_pelanggan: 'Citra Lestari', nomor_wa: '6285678901234@s.whatsapp.net', item_order: { produk: 'GoPay', nominal: 50000, harga: 51000 }, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), status: 'pending' },
        { _id: 'o3', nama_pelanggan: 'Ahmad Dahlan', nomor_wa: '6287712345678@s.whatsapp.net', item_order: { produk: 'XL', nominal: 10000, harga: 11000 }, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), status: 'paid' },
        { _id: 'o4', nama_pelanggan: 'Budi Santoso', nomor_wa: '6281234567890@s.whatsapp.net', item_order: { produk: 'OVO', nominal: 20000, harga: 21000 }, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'gagal' },
        { _id: 'o5', nama_pelanggan: 'Dewi Sartika', nomor_wa: '6289987654321@s.whatsapp.net', item_order: { produk: 'Dana', nominal: 100000, harga: 100500 }, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'paid' },
        { _id: 'o6', nama_pelanggan: 'Eka Wijaya', nomor_wa: '6282111223344@s.whatsapp.net', item_order: { produk: 'Indosat', nominal: 25000, harga: 25500 }, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'paid' },
    ],
    dashboard: {
        stats: {
            totalPendapatan: 150500,
            totalPesanan: 6,
            totalPelanggan: 5
        },
        pesananTerbaru: function() {
            return this.orders.slice(0, 5);
        }.bind(this),
        salesData: [
            { day: '4 hari lalu', revenue: 25500 },
            { day: '3 hari lalu', revenue: 0 },
            { day: '2 hari lalu', revenue: 100500 },
            { day: 'Kemarin', revenue: 0 },
            { day: 'Hari ini', revenue: 22500 },
        ]
    },
    notifications: [
        { _id: 'n1', type: 'order_success', message: 'Pesanan baru dari Budi Santoso (Telkomsel 10000) telah berhasil.', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), read: false },
        { _id: 'n2', type: 'order_pending', message: 'Pesanan dari Citra Lestari (GoPay 50000) menunggu pembayaran.', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), read: false },
        { _id: 'n3', type: 'bot_disconnected', message: 'Koneksi WhatsApp terputus. Harap hubungkan kembali.', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), read: false },
        { _id: 'n4', type: 'order_failed', message: 'Pesanan dari Budi Santoso (OVO 20000) gagal.', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), read: true },
        { _id: 'n5', type: 'new_customer', message: 'Pelanggan baru, Eka Wijaya, telah ditambahkan.', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), read: true },
    ],
    broadcastHistory: [
        { _id: 'b1', targetLabel: 'Semua Pelanggan', message: 'Promo spesial akhir pekan! Dapatkan diskon 10% untuk semua produk pulsa. Jangan sampai ketinggalan!', status: 'Terkirim', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), sentCount: 5, totalRecipients: 5 },
    ],
    admins: [
        { _id: 'a1', nama: 'Admin Utama', username: 'admin' },
        { _id: 'a2', nama: 'John Doe', username: 'johndoe' },
    ]
};

// Helper functions to simulate API interactions
window.dummyApi = {
    _paginate: (data, page, limit) => {
        const start = (page - 1) * limit;
        const end = page * limit;
        const paginatedData = data.slice(start, end);
        return {
            data: paginatedData,
            currentPage: page,
            totalPages: Math.ceil(data.length / limit)
        };
    },

    getProducts: function(type, page = 1, limit = 10) {
        const products = dummyData.products[type] || [];
        const paginated = this._paginate(products, page, limit);
        return {
            products: paginated.data,
            currentPage: paginated.currentPage,
            totalPages: paginated.totalPages
        };
    },

    getOrders: function(status = 'all', search = '', page = 1, limit = 10) {
        let orders = dummyData.orders;
        if (status !== 'all') {
            orders = orders.filter(o => o.status === status);
        }
        if (search) {
            const searchTerm = search.toLowerCase();
            orders = orders.filter(o => 
                o.nama_pelanggan.toLowerCase().includes(searchTerm) ||
                o.item_order.produk.toLowerCase().includes(searchTerm)
            );
        }
        const paginated = this._paginate(orders, page, limit);
        return {
            orders: paginated.data,
            currentPage: paginated.currentPage,
            totalPages: paginated.totalPages
        };
    },

    getCustomers: function(search = '', page = 1, limit = 10) {
        let customers = dummyData.customers;
        if (search) {
            const searchTerm = search.toLowerCase();
            customers = customers.filter(c => 
                c.nama.toLowerCase().includes(searchTerm) ||
                c.nomor_wa.includes(searchTerm)
            );
        }
        const paginated = this._paginate(customers, page, limit);
        return {
            customers: paginated.data,
            currentPage: paginated.currentPage,
            totalPages: paginated.totalPages
        };
    },
    
    getCustomerDetail: function(id) {
        const customer = dummyData.customers.find(c => c._id === id);
        if (!customer) return null;
        const history = dummyData.orders.filter(o => o.nomor_wa === customer.nomor_wa).slice(0, 5);
        return { pelanggan: customer, riwayat: history };
    },

    getDashboardStats: function() {
        return {
            stats: dummyData.dashboard.stats,
            pesananTerbaru: dummyData.orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
            salesData: dummyData.dashboard.salesData
        };
    }
};
