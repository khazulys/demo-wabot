
// Login Form Handler Module for DEMO
export class LoginForm {
    constructor(formValidation) {
        this.form = document.getElementById('loginForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.buttonContent = document.getElementById('buttonContent');
        this.loadingContent = document.getElementById('loadingContent');
        this.isLoading = false;
        this.formValidation = formValidation; // This is kept for potential future use, but is not strictly needed for the demo logic
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.isLoading) {
            return;
        }

        this.setLoadingState(true);
        const credentials = {
            username: this.form.elements.username.value,
            password: this.form.elements.password.value,
        };

        try {
            // Use the mock API object
            const result = await window.api.post('./api/auth/login', credentials);
            
            if (!result.success) {
                 throw new Error(result.message || 'Kredensial tidak valid.');
            }
            
            this.handleLoginSuccess(result);

        } catch (error) {
            this.handleLoginError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    handleLoginSuccess(result) {
        this.showSuccess(result.message || 'Login berhasil! Mengalihkan...');
        
        // In the demo, we just redirect to the static dashboard page.
        setTimeout(() => {
            window.location.href = '../public/index.html'; // Redirect to the demo dashboard
        }, 1500);
    }

    handleLoginError(error) {
        this.showError(error.message || 'Terjadi kesalahan.');
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        this.submitBtn.disabled = loading;
        this.buttonContent.classList.toggle('hidden', loading);
        this.loadingContent.classList.toggle('hidden', !loading);
    }

    getSweetAlertTheme() {
        const isDarkMode = document.documentElement.classList.contains('dark');
        return {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
        };
    }

    showError(message) {
        Swal.fire({
            title: 'Login Gagal',
            text: message,
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            ...this.getSweetAlertTheme(),
        });
    }

    showSuccess(message) {
        Swal.fire({
            title: 'Sukses',
            text: message,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            ...this.getSweetAlertTheme(),
        });
    }
}