
// ============== FORM VALIDATION ==============
class FormValidation {
    constructor() {
        this.form = null;
        this.usernameInput = null;
        this.passwordInput = null;
    }
    init() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
    }
    isFormValid() {
        // For the demo, we can simplify this to just check if fields are not empty.
        return this.usernameInput && this.passwordInput && this.usernameInput.value.trim() !== '' && this.passwordInput.value.trim() !== '';
    }
}

// ============== PASSWORD TOGGLE ==============
class PasswordToggle {
    constructor() {
        this.toggleBtn = document.getElementById('togglePassword');
        this.passwordInput = document.getElementById('password');
        this.eyeIcon = document.getElementById('eyeIcon');
        this.eyeOffIcon = document.getElementById('eyeOffIcon');
        this.isPasswordVisible = false;
    }
    init() {
        if (this.toggleBtn && this.passwordInput) {
            this.toggleBtn.addEventListener('click', () => this.togglePassword());
        }
    }
    togglePassword() {
        this.isPasswordVisible = !this.isPasswordVisible;
        this.passwordInput.type = this.isPasswordVisible ? 'text' : 'password';
        if (this.eyeIcon && this.eyeOffIcon) {
            this.eyeIcon.classList.toggle('hidden', !this.isPasswordVisible);
            this.eyeOffIcon.classList.toggle('hidden', this.isPasswordVisible);
        }
    }
}

// ============== LOGIN FORM ==============
class LoginForm {
    constructor(formValidation) {
        this.form = document.getElementById('loginForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.buttonContent = document.getElementById('buttonContent');
        this.loadingContent = document.getElementById('loadingContent');
        this.isLoading = false;
        this.formValidation = formValidation;
    }
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    async handleSubmit(event) {
        event.preventDefault();
        if (this.isLoading || !this.formValidation.isFormValid()) {
            this.showError('Username dan password tidak boleh kosong.');
            return;
        }
        this.setLoadingState(true);
        const credentials = {
            username: this.form.elements.username.value,
            password: this.form.elements.password.value,
        };
        try {
            const result = await window.api.post('/api/auth/login', credentials);
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
        setTimeout(() => {
            window.location.href = '../public/index.html';
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

// ============== MAIN INITIALIZATION ==============
document.addEventListener('DOMContentLoaded', function() {
    const formValidation = new FormValidation();
    const loginForm = new LoginForm(formValidation);
    const passwordToggle = new PasswordToggle();
    
    formValidation.init();
    loginForm.init();
    passwordToggle.init();
});
