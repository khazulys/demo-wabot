window.Modal = {
    show(htmlContent) {
        if (typeof Swal === 'undefined') {
            console.error('SweetAlert2 is not loaded.');
            return;
        }
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        Swal.fire({
            html: `<div class="bg-white dark:bg-gray-800 p-6 rounded-lg">${htmlContent}</div>`,
            showConfirmButton: false,
            showCloseButton: false,
            background: 'transparent',
            customClass: {
                popup: 'p-0 bg-transparent'
            },
            didOpen: () => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        });
    },

    close() {
        if (typeof Swal !== 'undefined') {
            Swal.close();
        }
    },
    
    confirm(options) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        return Swal.fire({
            title: options.title || 'Konfirmasi',
            text: options.text,
            icon: options.icon || 'warning',
            showCancelButton: true,
            confirmButtonText: options.confirmText || 'Ya',
            cancelButtonText: options.cancelText || 'Batal',
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#6B7280',
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#111827'
        });
    },
    
    toast(options) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#111827'
        });

        Toast.fire({
            icon: options.icon,
            title: options.title,
            text: options.text
        });
    }
};
